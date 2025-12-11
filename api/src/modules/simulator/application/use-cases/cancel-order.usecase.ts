import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SimulatorRepository } from '../../infrastructure/supabase/simulator.repository';

@Injectable()
export class CancelOrderUseCase {
  constructor(private readonly simulatorRepository: SimulatorRepository) {}

  async execute(userId: string, orderId: string, deleteOrder = false) {
    const order = await this.simulatorRepository.getOrderById(orderId);

    if (!order) {
      throw new NotFoundException('Ordem não encontrada');
    }

    if (order.userId !== userId) {
      throw new BadRequestException(
        'Você não tem permissão para cancelar esta ordem',
      );
    }

    if (order.status !== 'OPEN') {
      throw new BadRequestException(
        'Apenas ordens abertas podem ser canceladas',
      );
    }

    if (deleteOrder) {
      await this.simulatorRepository.deleteOrder(orderId);
      return { success: true, message: 'Ordem deletada com sucesso' };
    }

    const cancelledOrder = await this.simulatorRepository.updateOrderStatus(
      orderId,
      'CANCELLED',
    );

    return {
      success: true,
      order: cancelledOrder,
    };
  }
}
