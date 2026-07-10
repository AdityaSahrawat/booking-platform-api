import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Booking } from './entities/booking.entity';
import { ServicesService } from '../services/services.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingStatus } from '../common/enums/booking-status.enum';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,

    private readonly servicesService: ServicesService,
  ) {}

  async create(createBookingDto: CreateBookingDto) {
    await this.servicesService.findOne(createBookingDto.serviceId);

    const bookingDate = new Date(createBookingDto.bookingDate);
    const today = new Date();

    bookingDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      throw new BadRequestException(
        'Booking date cannot be in the past',
      );
    }

    const booking = this.bookingRepository.create({
      ...createBookingDto,
      status: BookingStatus.PENDING,
    });

    return this.bookingRepository.save(booking);
  }

  findAll() {
    return this.bookingRepository.find({
      relations: {
        service: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: {
        service: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async updateStatus(
    id: number,
    dto: UpdateBookingStatusDto,
  ) {
    const booking = await this.findOne(id);

    if (
      booking.status === BookingStatus.CANCELLED &&
      dto.status === BookingStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Cancelled booking cannot be completed',
      );
    }

    booking.status = dto.status;

    return this.bookingRepository.save(booking);
  }

  async cancel(id: number) {
    const booking = await this.findOne(id);

    booking.status = BookingStatus.CANCELLED;

    return this.bookingRepository.save(booking);
  }
}
