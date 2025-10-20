import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsArray, IsBoolean, IsUrl } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Product SKU', example: 'PROD-001' })
  @IsString()
  sku: string;

  @ApiProperty({ description: 'Product name', example: 'Premium Cotton T-Shirt' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Product category', example: 'Textiles' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Product tags', example: ['cotton', 'summer'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Product image URL' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ description: 'Factory ID' })
  @IsUUID()
  factoryId: string;

  @ApiPropertyOptional({ description: 'Is product active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
