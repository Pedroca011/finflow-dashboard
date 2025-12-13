import { Module } from '@nestjs/common';
import { BillingController } from './application/use-cases/infrastructure/stripe/presentation/billing.controller';
import { PrismaModule } from '../../shared/core/prisma/prisma.module';
import { SupabaseModule } from '../../shared/core/infra/supabase.module';
import { SupabaseService } from 'src/shared/core/infra/supabase/supabase.service';

@Module({
  imports: [PrismaModule, SupabaseModule],
  controllers: [BillingController],
  providers: [],
  exports: [],
})
export class BillingModule {}

