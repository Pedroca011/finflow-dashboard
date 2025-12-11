import { Injectable } from '@nestjs/common';
import { SimulatorRepository } from '../../infrastructure/supabase/simulator.repository';

@Injectable()
export class GetOrdersUseCase {
  constructor(private readonly simulatorRepository: SimulatorRepository) {}

  async execute(userId: string) {
    const orders = await this.simulatorRepository.getOrdersByUser(userId);

    return {
      orders: orders.map((order) => ({
        id: order.id,
        ticker: order.stockSymbol,
        orderType: order.type.toLowerCase(),
        price: order.price,
        quantity: order.quantity,
        status: order.status.toLowerCase(),
        createdAt: order.createdAt,
        executedAt: order.executedAt,
      })),
    };
  }
}
