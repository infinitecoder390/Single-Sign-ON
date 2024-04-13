import { Test, TestingModule } from '@nestjs/testing';
import { RoleRepo } from './roles.repo';
import { getModelToken } from '@nestjs/mongoose';
import { Role } from '../schema/roles.schema';

describe('RoleRepo', () => {
  let repo: RoleRepo;
  let modelMock: any;

  beforeEach(async () => {
    modelMock = {
      find: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        RoleRepo,
        {
          provide: getModelToken(Role.name),
          useValue: modelMock,
        },
      ],
    }).compile();

    repo = module.get<RoleRepo>(RoleRepo);
  });

  it('should be defined', () => {
    expect(repo).toBeDefined();
  });

  describe('find Roles By Ids', () => {
    it('should return an array of roles for given roleIds', async () => {
      const roleIds = ['uuid-admin', 'society-admin'];
      const mockRoles = [
        { roleId: 'uuid-admin', platformName: 'DxP' },
        { roleId: 'society-admin', platformName: 'Sxp' },
      ];
      modelMock.exec.mockResolvedValueOnce(mockRoles);

      const result = await repo.findRolesByIds(roleIds);

      expect(result).toEqual(mockRoles);
      expect(modelMock.find).toHaveBeenCalledWith({ roleId: { $in: roleIds } });
      expect(modelMock.exec).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if model execution fails', async () => {
      const roleIds = ['uuid-admin', 'society-admin'];
      const error = new Error('Test error');
      modelMock.exec.mockRejectedValueOnce(error);

      await expect(repo.findRolesByIds(roleIds)).rejects.toThrow(error);
    });
  });
});
