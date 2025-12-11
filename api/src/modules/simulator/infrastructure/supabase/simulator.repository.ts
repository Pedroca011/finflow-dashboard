import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/core/prisma/prisma.service';

interface CreateOrderInput {
  userId: string;
  stockSymbol: string;
  type: string;
  price: number;
  quantity: number;
}

interface UpdatePortfolioInput {
  stockSymbol: string;
  quantity: number;
  price: number;
  type: 'BUY' | 'SELL';
}

@Injectable()
export class SimulatorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(input: CreateOrderInput) {
    return this.prisma.trade.create({
      data: {
        userId: input.userId,
        stockSymbol: input.stockSymbol,
        type: input.type as any,
        price: input.price,
        quantity: input.quantity,
        status: 'OPEN',
      },
    });
  }

  async getOrderById(orderId: string) {
    return this.prisma.trade.findUnique({
      where: { id: orderId },
    });
  }

  async getOrdersByUser(userId: string) {
    return this.prisma.trade.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.prisma.trade.update({
      where: { id: orderId },
      data: {
        status: status as any,
        executedAt: status === 'EXECUTED' ? new Date() : null,
      },
    });
  }

  async deleteOrder(orderId: string) {
    return this.prisma.trade.delete({
      where: { id: orderId },
    });
  }

  async getUserBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });
    return user || { balance: 10000 };
  }

  async updateUserBalance(userId: string, newBalance: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance },
    });
  }

  async getPortfolio(userId: string) {
    return this.prisma.portfolio.findMany({
      where: { userId },
    });
  }

  async getPortfolioPosition(userId: string, stockSymbol: string) {
    return this.prisma.portfolio.findUnique({
      where: {
        userId_stockSymbol: {
          userId,
          stockSymbol: stockSymbol.toUpperCase(),
        },
      },
    });
  }

  async updatePortfolioPosition(userId: string, input: UpdatePortfolioInput) {
    const existing = await this.getPortfolioPosition(userId, input.stockSymbol);

    if (input.type === 'BUY') {
      if (existing) {
        // Update existing position
        const newQuantity = existing.quantity + input.quantity;
        const newTotalInvested =
          existing.totalInvested + input.price * input.quantity;
        const newAveragePrice = newTotalInvested / newQuantity;

        return this.prisma.portfolio.update({
          where: { id: existing.id },
          data: {
            quantity: newQuantity,
            averagePrice: newAveragePrice,
            totalInvested: newTotalInvested,
          },
        });
      } else {
        // Create new position
        return this.prisma.portfolio.create({
          data: {
            userId,
            stockSymbol: input.stockSymbol.toUpperCase(),
            quantity: input.quantity,
            averagePrice: input.price,
            totalInvested: input.price * input.quantity,
          },
        });
      }
    } else {
      // SELL
      if (!existing) {
        throw new Error('Posição não encontrada');
      }

      const newQuantity = existing.quantity - input.quantity;

      if (newQuantity <= 0) {
        // Remove position entirely
        return this.prisma.portfolio.delete({
          where: { id: existing.id },
        });
      } else {
        // Reduce position
        const newTotalInvested =
          existing.averagePrice * (existing.quantity - input.quantity);

        return this.prisma.portfolio.update({
          where: { id: existing.id },
          data: {
            quantity: newQuantity,
            totalInvested: newTotalInvested,
          },
        });
      }
    }
  }

  async getExecutedTrades(userId: string) {
    return this.prisma.trade.findMany({
      where: {
        userId,
        status: 'EXECUTED',
      },
      orderBy: { executedAt: 'desc' },
    });
  }
}
