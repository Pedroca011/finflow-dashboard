import { IsString, IsNumber, IsEnum, Min } from 'class-validator';

export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export class CreateOrderDto {
  @IsString()
  ticker: string;

  @IsEnum(OrderType)
  orderType: OrderType;

  @IsNumber()
  @Min(0.01)
  price: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}
