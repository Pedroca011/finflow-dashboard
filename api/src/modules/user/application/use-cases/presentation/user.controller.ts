import { Controller, Get, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../../../../shared/guards/supabase-auth.guard';
import { CurrentUser } from '../../../../../shared/decorators/current-user.decorator';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import type { Request } from 'express';

@Controller('user')
@UseGuards(SupabaseAuthGuard)
export class UserController {

  private getSupabaseClientWithToken(token: string) {
    return createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    );
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: User, @Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new BadRequestException('Missing authorization token');
    }

    const supabase = this.getSupabaseClientWithToken(token);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // Profile might not exist, return null
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new BadRequestException(`Failed to fetch profile: ${error.message}`);
    }

    return data;
  }

  @Get('subscription')
  async getSubscription(@CurrentUser() user: User, @Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new BadRequestException('Missing authorization token');
    }

    const supabase = this.getSupabaseClientWithToken(token);
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // Subscription might not exist, return null instead of throwing
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new BadRequestException(`Failed to fetch subscription: ${error.message}`);
    }

    return data;
  }
}

