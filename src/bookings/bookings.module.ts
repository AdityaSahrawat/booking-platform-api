import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Booking } from './entities/booking.entity';

import { ServicesModule } from '../services/services.module';

import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    ServicesModule,
  ],

  controllers: [BookingsController],

  providers: [BookingsService],
})
export class BookingsModule {}