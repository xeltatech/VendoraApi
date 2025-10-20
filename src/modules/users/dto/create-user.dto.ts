import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsUUID, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ enum: UserRole, default: UserRole.SELLER })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ description: 'Organization ID' })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Factory ID (for factory_viewer role)' })
  @IsOptional()
  @IsUUID()
  factoryId?: string;
}
