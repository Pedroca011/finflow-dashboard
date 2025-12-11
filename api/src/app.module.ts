import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/core/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { SimulatorModule } from './modules/simulator/simulator.module';

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
  ],
})
export class AppModule {}
