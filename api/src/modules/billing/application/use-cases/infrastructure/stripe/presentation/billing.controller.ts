import { Controller, Post, UseGuards, Req, Body, BadRequestException } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../../../../../../shared/guards/supabase-auth.guard';
import { CurrentUser } from '../../../../../../../shared/decorators/current-user.decorator';
import type { User } from '@supabase/supabase-js';
import type { Request } from 'express';
import Stripe from 'stripe';
import { PrismaService } from '../../../../../../../shared/core/prisma/prisma.service';
import { SupabaseService } from '../../../../../../../shared/core/infra/supabase/supabase.service';

class CreateCheckoutDto {
  priceId: string;
}

@Controller('billing')
@UseGuards(SupabaseAuthGuard)
export class BillingController {
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-11-17.clover',
    });
  }

  @Post('create-checkout')
  async createCheckoutSession(
    @CurrentUser() user: User,
    @Body() createCheckoutDto: CreateCheckoutDto,
  ) {
    try {
      // Get user from Prisma
      const prismaUser = await this.prisma.user.findUnique({
        where: { supabaseId: user.id },
      });

      if (!prismaUser) {
        throw new BadRequestException('User not found');
      }

      const session = await this.stripe.checkout.sessions.create({
        customer_email: user.email,
        payment_method_types: ['card'],
        line_items: [
          {
            price: createCheckoutDto.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing/cancel`,
        metadata: {
          userId: prismaUser.id,
          supabaseUserId: user.id,
        },
      });

      return { url: session.url };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Failed to create checkout session');
    }
  }

  @Post('customer-portal')
  async createCustomerPortalSession(@CurrentUser() user: User) {
    try {
      // Get subscription from Supabase
      const supabase = this.supabaseService.getClient();
      const { data: subscriptionData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (subError || !subscriptionData?.stripe_subscription_id) {
        throw new BadRequestException('No active subscription found');
      }

      // Get customer from Stripe subscription
      const subscription = await this.stripe.subscriptions.retrieve(
        subscriptionData.stripe_subscription_id,
      );
      const customerId = subscription.customer as string;

      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing`,
      });

      return { url: session.url };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Failed to create customer portal session');
    }
  }
}

