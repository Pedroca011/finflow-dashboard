import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CreateSimulatedOrderUseCase } from '../application/use-cases/create-simulated-order.usecase';
import { GetSimulatedPortfolioUseCase } from '../application/use-cases/get-simulated-portfolio.usecase';
import { ExecuteOrderUseCase } from '../application/use-cases/execute-order.usecase';
import { CancelOrderUseCase } from '../application/use-cases/cancel-order.usecase';
import { GetOrdersUseCase } from '../application/use-cases/get-orders.usecase';
import { SupabaseAuthGuard } from '../../../shared/guards/supabase-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { CreateOrderDto } from '../application/dtos/create-order.dto';

@Controller('simulator')
@UseGuards(SupabaseAuthGuard)
export class SimulatorController {
  constructor(
    private readonly createOrderUseCase: CreateSimulatedOrderUseCase,
    private readonly getPortfolioUseCase: GetSimulatedPortfolioUseCase,
    private readonly executeOrderUseCase: ExecuteOrderUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase,
    private readonly getOrdersUseCase: GetOrdersUseCase,
  ) {}

  @Post('orders')
  async createOrder(
    @CurrentUser() user: { id: string },
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.createOrderUseCase.execute({
      userId: user.id,
      ...createOrderDto,
    });
  }

  @Get('orders')
  async getOrders(@CurrentUser() user: { id: string }) {
    return this.getOrdersUseCase.execute(user.id);
  }

  @Put('orders/:id/execute')
  async executeOrder(
    @CurrentUser() user: { id: string },
    @Param('id') orderId: string,
  ) {
    return this.executeOrderUseCase.execute(user.id, orderId);
  }

  @Put('orders/:id/cancel')
  async cancelOrder(
    @CurrentUser() user: { id: string },
    @Param('id') orderId: string,
  ) {
    return this.cancelOrderUseCase.execute(user.id, orderId);
  }

  @Delete('orders/:id')
  async deleteOrder(
    @CurrentUser() user: { id: string },
    @Param('id') orderId: string,
  ) {
    return this.cancelOrderUseCase.execute(user.id, orderId, true);
  }

  // @Get('portfolio')
  // async getPortfolio(@CurrentUser() user: { id: string }) {
  //   return this.getPortfolioUseCase.execute(user.id);
  // }
}
