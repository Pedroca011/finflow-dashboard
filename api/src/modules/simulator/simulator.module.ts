import { Module } from '@nestjs/common';
import { SimulatorController } from './presentation/simulator.controller';
import { CreateSimulatedOrderUseCase } from './application/use-cases/create-simulated-order.usecase';
import { GetSimulatedPortfolioUseCase } from './application/use-cases/get-simulated-portfolio.usecase';
import { ExecuteOrderUseCase } from './application/use-cases/execute-order.usecase';
import { CancelOrderUseCase } from './application/use-cases/cancel-order.usecase';
import { GetOrdersUseCase } from './application/use-cases/get-orders.usecase';
import { SimulatorRepository } from './infrastructure/supabase/simulator.repository';

@Module({
  controllers: [SimulatorController],
  providers: [
    CreateSimulatedOrderUseCase,
    GetSimulatedPortfolioUseCase,
    ExecuteOrderUseCase,
    CancelOrderUseCase,
    GetOrdersUseCase,
    SimulatorRepository,
  ],
  exports: [SimulatorRepository],
})
export class SimulatorModule {}
