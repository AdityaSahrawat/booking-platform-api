import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty()
  @IsEmail()
  customerEmail: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiProperty()
  @IsInt()
  serviceId: number;

  @ApiProperty({
    example: '2026-08-10',
  })
  @IsDateString()
  bookingDate: string;

  @ApiProperty({
    example: '10:00',
  })
  @IsString()
  bookingTime: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
