import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    JoinColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Service } from '../../services/entities/service.entity';
import { BookingStatus } from '../../common/enums/booking-status.enum';

@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    customerName: string;

    @Column()
    customerEmail: string;

    @Column()
    customerPhone: string;

    @Column({
        type: 'date',
    })
    bookingDate: string;

    @Column()
    bookingTime: string;

    @Column({
        type: 'enum',
        enum: BookingStatus,
        default: BookingStatus.PENDING,
    })
    status: BookingStatus;

    @Column({
        type: 'text',
        nullable: true,
    })
    notes: string;

    @ManyToOne(() => Service, (service) => service.bookings, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({
        name: 'serviceId',
    })
    service: Service;

    @Column()
    serviceId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}