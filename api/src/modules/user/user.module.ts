import { Module } from '@nestjs/common';
import { UserController } from './application/use-cases/presentation/user.controller';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [],
  exports: [],
})
export class UserModule {}

