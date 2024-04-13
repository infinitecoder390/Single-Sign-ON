import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRepo } from './repository/user.repo';
import { UserSchema } from './schema/user.schema';
import { LoggerService } from '../logger/logger.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [UserController],
  providers: [UserService, LoggerService, UserRepo],
  exports: [UserService, UserRepo],
})
export class UserModule {}
