import { Test, TestingModule } from '@nestjs/testing';

import { createMock } from '@golevelup/ts-jest';
import { BulkUserController } from './bulk-user.controller';
import { BulkUserService } from './bulk-user.service';
import { UserRoleRepo } from '../repository/user-role.repo';
import { InputBulkUserReqDto } from '../dto/society-user.dto';
import { RolesService } from '../service/roles.service';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';

const inputBulkUserReqDto: InputBulkUserReqDto = {
  data: [
    {
      permissionEntity: { societyId: 'ss1' },
      userHash: 'hash1',
      roleId: 'society-admin',
      platformName: 'SxP',
    },
    {
      permissionEntity: { societyId: 'ss2' },
      userHash: 'hash2',
      roleId: 'society-admin',
      platformName: 'SxP',
    },
  ],
};

describe('Bulk User Controller', () => {
  let controller: BulkUserController;
  let service: BulkUserService;

  const client_id = '4999c9f1-93d3-43c9-9958-53974df7ad32';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BulkUserController],
      providers: [
        RolesService,
        {
          provide: BulkUserService,
          useValue: {
            createBulkUserRole: jest
              .fn()
              .mockResolvedValue(
                'any value, since we expect not to reach this',
              ),
          },
        },
        {
          provide: UserRoleRepo,
          useFactory: () => ({
            upsertUser: jest.fn(() => Promise.resolve(inputBulkUserReqDto)),
          }),
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    controller = module.get<BulkUserController>(BulkUserController);
    service = module.get<BulkUserService>(BulkUserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an user and role', async () => {
      const result = await controller.createBulkUserRole(
        client_id,
        inputBulkUserReqDto,
      );
      expect(result.message).toEqual(
        'User roles created and updated successfully.',
      );
    });

    it('should handle validation error', async () => {
      try {
        // Manually apply the ValidationPipe to simulate how NestJS applies it in real requests
        inputBulkUserReqDto.data[0].roleId = '';
        await new ValidationPipe().transform(inputBulkUserReqDto, {
          type: 'body',
          metatype: InputBulkUserReqDto,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(e.getResponse()).toHaveProperty('message', expect.any(Array));
        // Ensure the service method is not called due to validation failure
        expect(service.createBulkUserRole).not.toHaveBeenCalled();
      }
    });
  });
});
