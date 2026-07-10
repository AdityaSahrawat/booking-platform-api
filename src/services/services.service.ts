import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  create(createServiceDto: CreateServiceDto) {
    const service = this.serviceRepository.create(createServiceDto);

    return this.serviceRepository.save(service);
  }

  findAll() {
    return this.serviceRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const service = await this.serviceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    const service = await this.findOne(id);

    Object.assign(service, updateServiceDto);

    return this.serviceRepository.save(service);
  }

  async remove(id: number) {
    const service = await this.findOne(id);

    await this.serviceRepository.remove(service);

    return {
      message: 'Service deleted successfully',
    };
  }
}
