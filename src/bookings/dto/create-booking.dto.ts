import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
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
  @Matches(/^\d{10}$/, { message: 'Phone number must be exactly 10 digits' })
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
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Time must be in HH:MM format' })
  bookingTime: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
