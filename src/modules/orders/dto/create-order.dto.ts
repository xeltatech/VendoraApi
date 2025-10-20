import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({ description: 'Product variant ID' })
  @IsUUID()
  variantId: string;

  @ApiProperty({ description: 'Quantity', example: 10 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Item notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Factory ID' })
  @IsUUID()
  factoryId: string;

  @ApiPropertyOptional({ description: 'Price list ID' })
  @IsOptional()
  @IsUUID()
  priceListId?: string;

  @ApiProperty({ description: 'Order items', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ description: 'Order notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
