import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SimulatorRepository } from '../../infrastructure/supabase/simulator.repository';

@Injectable()
export class ExecuteOrderUseCase {
  constructor(private readonly simulatorRepository: SimulatorRepository) {}

  async execute(userId: string, orderId: string) {
    const order = await this.simulatorRepository.getOrderById(orderId);

    if (!order) {
      throw new NotFoundException('Ordem não encontrada');
    }

    if (order.userId !== userId) {
      throw new BadRequestException(
        'Você não tem permissão para executar esta ordem',
      );
    }

    if (order.status !== 'OPEN') {
      throw new BadRequestException('Esta ordem já foi processada');
    }

    const totalValue = order.price * order.quantity;

    // Execute the order based on type
    if (order.type === 'BUY') {
      // Deduct balance
      const user = await this.simulatorRepository.getUserBalance(userId);
      if (user.balance < totalValue) {
        throw new BadRequestException('Saldo insuficiente');
      }

      await this.simulatorRepository.updateUserBalance(
        userId,
        user.balance - totalValue,
      );

      // Add to portfolio
      await this.simulatorRepository.updatePortfolioPosition(userId, {
        stockSymbol: order.stockSymbol,
        quantity: order.quantity,
        price: order.price,
        type: 'BUY',
      });
    } else {
      // SELL
      // Add balance
      const user = await this.simulatorRepository.getUserBalance(userId);
      await this.simulatorRepository.updateUserBalance(
        userId,
        user.balance + totalValue,
      );

      // Remove from portfolio
      await this.simulatorRepository.updatePortfolioPosition(userId, {
        stockSymbol: order.stockSymbol,
        quantity: order.quantity,
        price: order.price,
        type: 'SELL',
      });
    }

    // Update order status
    const executedOrder = await this.simulatorRepository.updateOrderStatus(
      orderId,
      'EXECUTED',
    );

    return {
      success: true,
      order: executedOrder,
    };
  }
}
