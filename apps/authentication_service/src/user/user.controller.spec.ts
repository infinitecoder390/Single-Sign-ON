import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './service/user.service';
import { createMock } from '@golevelup/ts-jest';
import { UserRepo } from './repository/user.repo';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserController', () => {
  let controller: UserController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: UserRepo,
          useFactory: () => ({
            createUser: jest.fn(() => Promise.resolve(newUser)),
            findByEmail: jest.fn(() => Promise.resolve(newUser)),
            findByPhone: jest.fn(() => Promise.resolve(newUser)),
          }),
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

const newUser = new CreateUserDto();
newUser.email = 'test@test.com';
newUser._id = '123456';
newUser.phone = '123456789';
newUser.password = 'password';

const existingUser = new CreateUserDto();
existingUser.email = 'test@test.com';
existingUser.phone = '123456789';
existingUser.password = 'password';
existingUser.emailVerified = true;
existingUser.phoneVerified = true;
