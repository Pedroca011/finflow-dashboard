import { Controller, Get, Post, Body, Query, Res, BadRequestException, UseGuards, Req } from '@nestjs/common';
import express from 'express';
import { SupabaseService } from 'src/shared/core/infra/supabase/supabase.service';
import { PrismaService } from 'src/shared/core/prisma/prisma.service';
import { SupabaseAuthGuard } from 'src/shared/guards/supabase-auth.guard';
import type { Request } from 'express';

class SignUpDto {
  email: string;
  password: string;
  fullName: string;
}

class SignInDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('google')
  async loginWithGoogle(@Res() res: express.Response) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback', //ajustar aqui dps para url certa
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.redirect(data.url);
  }

  @Get('callback')
  async handleCallback(
    @Query('access_token') token: string,
    @Res() res: express.Response,
  ) {
    const supabase = this.supabaseService.getClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(400).json({ error: 'Falha ao autenticar' });
    }

    // Salva ou atualiza usuário no Prisma
    await this.prisma.user.upsert({
      where: { supabaseId: user.id },
      update: {
        email: user.email!,
        name: user.user_metadata.full_name,
        avatarUrl: user.user_metadata.avatar_url,
      },
      create: {
        supabaseId: user.id,
        email: user.email!,
        name: user.user_metadata.full_name,
        avatarUrl: user.user_metadata.avatar_url,
      },
    });

    return res.redirect(`http://localhost:5173/dashboard`);
  }

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase.auth.signUp({
      email: signUpDto.email,
      password: signUpDto.password,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/`,
        data: { full_name: signUpDto.fullName },
      },
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    // Create profile in Supabase if user was created
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          email: data.user.email,
          full_name: signUpDto.fullName,
          balance: 10000,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      // Also create user in Prisma
      try {
        await this.prisma.user.upsert({
          where: { supabaseId: data.user.id },
          update: {
            email: data.user.email!,
            name: signUpDto.fullName,
          },
          create: {
            supabaseId: data.user.id,
            email: data.user.email!,
            name: signUpDto.fullName,
          },
        });
      } catch (prismaError) {
        console.error('Error creating user in Prisma:', prismaError);
      }
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  @Post('signin')
  async signIn(@Body() signInDto: SignInDto) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: signInDto.email,
      password: signInDto.password,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  @Post('signout')
  @UseGuards(SupabaseAuthGuard)
  async signOut(@Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new BadRequestException('Missing authorization token');
    }

    // Create a client with the user's token to sign them out
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
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

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { message: 'Signed out successfully' };
  }

  @Get('session')
  @UseGuards(SupabaseAuthGuard)
  async getSession(@Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new BadRequestException('Missing authorization token');
    }

    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new BadRequestException('Invalid or expired token');
    }

    // Get session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    return {
      user: data.user,
      session: sessionData.session,
    };
  }
}
