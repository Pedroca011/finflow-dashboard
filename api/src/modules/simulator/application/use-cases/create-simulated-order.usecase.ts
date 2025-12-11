import { Injectable, BadRequestException } from '@nestjs/common';
import { SimulatorRepository } from '../../infrastructure/supabase/simulator.repository';
import { OrderType } from '../dtos/create-order.dto';

interface CreateOrderInput {
  userId: string;
  ticker: string;
  orderType: OrderType;
  price: number;
  quantity: number;
}

@Injectable()
export class CreateSimulatedOrderUseCase {
  constructor(private readonly simulatorRepository: SimulatorRepository) {}

  async execute(input: CreateOrderInput) {
    const { userId, ticker, orderType, price, quantity } = input;

    // Validate user has enough balance for buy orders
    if (orderType === OrderType.BUY) {
      const user = await this.simulatorRepository.getUserBalance(userId);
      const totalCost = price * quantity;

      if (user.balance < totalCost) {
        throw new BadRequestException('Saldo insuficiente para esta operação');
      }
    }

    // For sell orders, validate user has enough shares
    if (orderType === OrderType.SELL) {
      const portfolio = await this.simulatorRepository.getPortfolioPosition(
        userId,
        ticker,
      );

      if (!portfolio || portfolio.quantity < quantity) {
        throw new BadRequestException(
          'Quantidade de ações insuficiente para venda',
        );
      }
    }

    const order = await this.simulatorRepository.createOrder({
      userId,
      stockSymbol: ticker.toUpperCase(),
      type: orderType,
      price,
      quantity,
    });

    return {
      success: true,
      order,
    };
  }
}
