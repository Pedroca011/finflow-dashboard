import { Global, Module } from '@nestjs/common';
import { AuthController } from './presentation/auth.controller';

@Global()
@Module({
  providers: [],
  controllers: [AuthController],
  exports: [],
})
export class AuthModule {}
