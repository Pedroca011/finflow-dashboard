import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/core/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { SimulatorModule } from './modules/simulator/simulator.module';
import { UserModule } from './modules/user/user.module';
import { BillingModule } from './modules/billing/billing.module';
import { SupabaseModule } from './shared/core/infra/supabase.module';

@Module({
  controllers: [AppController],
  providers: [],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    SimulatorModule,
    UserModule,
    BillingModule,
    SupabaseModule,
  ],
})
export class AppModule {}
