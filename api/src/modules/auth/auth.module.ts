import { Global, Module } from '@nestjs/common';
import { AuthController } from './presentation/auth.controller';
import { PrismaModule } from 'src/shared/core/prisma/prisma.module';
import { DatabaseModule } from 'src/shared/core/infra/database.module';

@Global()
@Module({
  imports: [PrismaModule, DatabaseModule],
  providers: [],
  controllers: [AuthController],
  exports: [],
})
export class AuthModule {}
