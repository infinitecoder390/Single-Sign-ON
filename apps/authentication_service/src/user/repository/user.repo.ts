import { IUser } from '@app/common/interfaces/user.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserRepo {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<IUser>,
  ) {}

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email, isActive: true }).exec();
    return user;
  }

  async findByPhone(phone: string, countryCode: string): Promise<IUser> {
    return await this.userModel
      .findOne({ phone, countryCode, isActive: true })
      .exec();
  }

  async findById(id: string): Promise<IUser> {
    return await this.userModel.findById(id).exec();
  }

  async createUser(createUserDto: CreateUserDto): Promise<IUser> {
    const newUser = await new this.userModel(createUserDto);
    return newUser.save();
  }
  async saveUser(userId: string, updateUserDto: Partial<IUser>) {
    const existingUser = await this.userModel.findByIdAndUpdate(
      userId,
      updateUserDto,
      { new: true },
    );

    return existingUser;
  }
}
