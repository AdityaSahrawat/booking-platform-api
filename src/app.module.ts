import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServicesModule } from './services/services.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',

        host: config.get('DATABASE_HOST'),
        port: Number(config.get('DATABASE_PORT')),

        username: config.get('DATABASE_USERNAME'),
        password: config.get('DATABASE_PASSWORD'),

        database: config.get('DATABASE_NAME'),

        autoLoadEntities: true,

        synchronize: true,
      }),
    }),

    AuthModule,
    UsersModule,
    ServicesModule,
    BookingsModule,
  ],
})
export class AppModule { }