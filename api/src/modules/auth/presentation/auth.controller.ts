import { Controller, Get, Query, Res } from '@nestjs/common';
import express from 'express';
import { SupabaseService } from 'src/shared/core/infra/supabase/supabase.service';
import { PrismaService } from 'src/shared/core/prisma/prisma.service';

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
}
