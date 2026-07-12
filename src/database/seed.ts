import dataSource from './data-source';
import { Service } from '../services/entities/service.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { BookingStatus } from '../common/enums/booking-status.enum';
import * as bcrypt from 'bcrypt';

async function run() {
  console.log('Initializing connection...');
  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);
  const serviceRepository = dataSource.getRepository(Service);
  const bookingRepository = dataSource.getRepository(Booking);

  // Check if database is already seeded
  const usersCount = await userRepository.count();
  if (usersCount > 0) {
    console.log("Database already seeded.");
    await dataSource.destroy();
    process.exit(0);
  }

  // Clear tables for fresh seed
  await dataSource.query('TRUNCATE TABLE "bookings" CASCADE');
  await dataSource.query('TRUNCATE TABLE "services" CASCADE');
  await dataSource.query('TRUNCATE TABLE "users" CASCADE');

  console.log('Seeding admin user...');
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  const adminUser = userRepository.create({
    name: 'Admin',
    email: 'admin@booking.com',
    password: hashedPassword,
  });
  await userRepository.save(adminUser);
  console.log('Admin user seeded.');

  console.log('Seeding services...');
  const servicesData = [
    {
      title: "Himalayan Hot Stone Therapy",
      description: "A luxurious hot stone massage designed to relieve stress and improve circulation.",
      duration: 90,
      price: 2499,
      isActive: true
    },
    {
      title: "Royal Aromatherapy Escape",
      description: "Relaxing aromatherapy session using premium essential oils.",
      duration: 60,
      price: 1799,
      isActive: true
    },
    {
      title: "Luxury Deep Tissue Massage",
      description: "Intensive massage for muscle recovery and tension relief.",
      duration: 75,
      price: 2199,
      isActive: true
    },
    {
      title: "Glow Facial Rejuvenation",
      description: "Premium facial treatment for healthy and radiant skin.",
      duration: 60,
      price: 1599,
      isActive: true
    },
    {
      title: "Couples Serenity Retreat",
      description: "Private spa experience for couples with massage and aromatherapy.",
      duration: 120,
      price: 4999,
      isActive: true
    },
    {
      title: "Reflexology Foot Therapy",
      description: "Pressure-point foot massage for relaxation and wellness.",
      duration: 45,
      price: 999,
      isActive: true
    },
    {
      title: "Detox Body Polish",
      description: "Full-body exfoliation treatment for smoother and healthier skin.",
      duration: 60,
      price: 1899,
      isActive: true
    },
    {
      title: "Signature Head Spa",
      description: "Scalp cleansing, massage, and hydration therapy.",
      duration: 50,
      price: 1299,
      isActive: true
    },
    {
      title: "Luxury Chocolate Body Wrap",
      description: "Nourishing body wrap enriched with cocoa extracts.",
      duration: 80,
      price: 2699,
      isActive: true
    },
    {
      title: "VIP Wellness Experience",
      description: "Complete premium spa package including massage, facial, and body therapy.",
      duration: 180,
      price: 7999,
      isActive: true
    }
  ];

  const savedServices: Service[] = [];
  for (const s of servicesData) {
    const service = serviceRepository.create(s);
    const saved = await serviceRepository.save(service);
    savedServices.push(saved);
  }
  console.log(`Seeded ${savedServices.length} services.`);

  console.log('Seeding bookings...');
  const bookingsData = [
    {
      customerName: "Aditya Sharma",
      customerEmail: "aditya.sharma@gmail.com",
      customerPhone: "9876543210",
      serviceId: 1,
      bookingDate: "2026-07-15",
      bookingTime: "10:00",
      notes: "Window-side room preferred."
    },
    {
      customerName: "Priya Verma",
      customerEmail: "priya.verma@gmail.com",
      customerPhone: "9876543211",
      serviceId: 2,
      bookingDate: "2026-07-15",
      bookingTime: "11:30",
      notes: "Sensitive to strong fragrances."
    },
    {
      customerName: "Rahul Mehta",
      customerEmail: "rahul.mehta@gmail.com",
      customerPhone: "9876543212",
      serviceId: 3,
      bookingDate: "2026-07-16",
      bookingTime: "14:00",
      notes: "Focus on shoulder pain."
    },
    {
      customerName: "Sneha Kapoor",
      customerEmail: "sneha.kapoor@gmail.com",
      customerPhone: "9876543213",
      serviceId: 4,
      bookingDate: "2026-07-16",
      bookingTime: "16:30",
      notes: "First-time customer."
    },
    {
      customerName: "Arjun Singh",
      customerEmail: "arjun.singh@gmail.com",
      customerPhone: "9876543214",
      serviceId: 5,
      bookingDate: "2026-07-17",
      bookingTime: "12:00",
      notes: "Anniversary booking."
    },
    {
      customerName: "Neha Gupta",
      customerEmail: "neha.gupta@gmail.com",
      customerPhone: "9876543215",
      serviceId: 6,
      bookingDate: "2026-07-17",
      bookingTime: "15:00",
      notes: "No additional requests."
    },
    {
      customerName: "Karan Malhotra",
      customerEmail: "karan.m@gmail.com",
      customerPhone: "9876543216",
      serviceId: 7,
      bookingDate: "2026-07-18",
      bookingTime: "09:30",
      notes: "Birthday gift voucher."
    },
    {
      customerName: "Ananya Rao",
      customerEmail: "ananya.rao@gmail.com",
      customerPhone: "9876543217",
      serviceId: 8,
      bookingDate: "2026-07-18",
      bookingTime: "13:00",
      notes: "Hair spa only."
    },
    {
      customerName: "Vikram Joshi",
      customerEmail: "vikram.j@gmail.com",
      customerPhone: "9876543218",
      serviceId: 9,
      bookingDate: "2026-07-19",
      bookingTime: "17:00",
      notes: "Please confirm by email."
    },
    {
      customerName: "Isha Nair",
      customerEmail: "isha.nair@gmail.com",
      customerPhone: "9876543219",
      serviceId: 10,
      bookingDate: "2026-07-20",
      bookingTime: "10:30",
      notes: "VIP package for two guests."
    }
  ];

  for (const b of bookingsData) {
    const serviceIndex = b.serviceId - 1;
    const actualServiceId = savedServices[serviceIndex]?.id;

    if (!actualServiceId) {
      console.warn(`No service found at index ${serviceIndex} for customer ${b.customerName}`);
      continue;
    }

    const booking = bookingRepository.create({
      customerName: b.customerName,
      customerEmail: b.customerEmail,
      customerPhone: b.customerPhone,
      serviceId: actualServiceId,
      bookingDate: b.bookingDate,
      bookingTime: b.bookingTime,
      notes: b.notes,
      status: BookingStatus.PENDING
    });

    await bookingRepository.save(booking);
  }

  console.log('Seeding completed successfully!');
  await dataSource.destroy();
}

run().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
