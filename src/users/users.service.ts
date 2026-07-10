import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    findByEmail(email: string) {
        return this.userRepository.findOne({
            where: { email },
        });
    }

    create(user: Partial<User>) {
        return this.userRepository.save(user);
    }
}