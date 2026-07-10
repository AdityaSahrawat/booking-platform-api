import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';

import { Booking } from './entities/booking.entity';
import { ServicesService } from '../services/services.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { BookingStatus } from '../common/enums/booking-status.enum';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,

    private readonly servicesService: ServicesService,
  ) {}

  async create(dto: CreateBookingDto) {
    await this.servicesService.findOne(dto.serviceId);

    const bookingDate = new Date(dto.bookingDate);
    const today = new Date();

    bookingDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      throw new BadRequestException(
        'Booking date cannot be in the past',
      );
    }

    const duplicate = await this.bookingRepository.findOne({
      where: {
        serviceId: dto.serviceId,
        bookingDate: dto.bookingDate,
        bookingTime: dto.bookingTime,
        status: Not(BookingStatus.CANCELLED),
      },
    });

    if (duplicate) {
      throw new ConflictException(
        'Time slot already booked',
      );
    }

    const booking = this.bookingRepository.create({
      ...dto,
      status: BookingStatus.PENDING,
    });

    return this.bookingRepository.save(booking);
  }

  async findAll(query: QueryBookingDto) {
    const { page, limit, search, status } = query;

    const qb = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.service', 'service');

    if (search) {
      qb.andWhere(
        '(booking.customerName ILIKE :search OR booking.customerEmail ILIKE :search OR booking.customerPhone ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (status) {
      qb.andWhere('booking.status = :status', {
        status,
      });
    }

    qb.skip((page - 1) * limit);

    qb.take(limit);

    qb.orderBy('booking.createdAt', 'DESC');

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const booking = await this.bookingRepository.findOne({
      where: {
        id,
      },
      relations: {
        service: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(
        'Booking not found',
      );
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
