import { UserRoleRepo } from './user-role.repo';

describe('User Repo', () => {
  let userRepo: UserRoleRepo;
  let userModelMock: any;

  beforeEach(async () => {
    userModelMock = {
      findOne: jest.fn(),
      bulkWrite: jest.fn(),
      find: jest.fn(),
      exec: jest.fn(),
    };

    userRepo = new UserRoleRepo(userModelMock);
  });

  it('should update an existing user', async () => {
    const createUserDto = [
      {
        permissionEntity: { societyId: 'ss1' },
        userHash: 'hash1',
        roleId: 'society-admin',
        __v: 0,
        createdAt: '2024-02-20T13:20:55.002Z',
        platformName: 'SxP',
        updatedAt: '2024-02-20T13:24:19.123Z',
      },
      {
        permissionEntity: { societyId: 'ss2' },
        userHash: 'hash2',
        roleId: 'society-admin',
        __v: 0,
        createdAt: '2024-02-20T13:20:55.002Z',
        platformName: 'SxP',
        updatedAt: '2024-02-20T13:24:19.123Z',
      },
    ];

    const bulkWriteResult = {
      insertedCount: 0,
      matchedCount: 2,
      modifiedCount: 2,
      deletedCount: 0,
      upsertedCount: 0,
      upsertedIds: {},
      insertedIds: {},
    };

    // Mock the implementation of bulkWrite and find methods
    (userModelMock.bulkWrite as jest.Mock).mockResolvedValueOnce(
      bulkWriteResult,
    );
    (userModelMock.find as jest.Mock).mockResolvedValueOnce(updatedRecords);

    const result = await userRepo.upsertUser(createUserDto);
    expect(userModelMock.bulkWrite).toHaveBeenCalledTimes(1);
    expect(userModelMock.find).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject(createUserDto);
  });
});

export const updatedRecords = [
  {
    _id: '44adb62d-1fb3-4534-a06e-f716ea4502b9',
    permissionEntity: { societyId: 'ss1' },
    userHash: 'hash1',
    roleId: 'society-admin',
    __v: 0,
    createdAt: '2024-02-20T13:20:55.002Z',
    platformName: 'SxP',
    updatedAt: '2024-02-20T13:24:19.123Z',
  },
  {
    _id: '9fa93e2e-e549-4fc9-9f0d-3dcb2f28cc20',
    permissionEntity: { societyId: 'ss2' },
    userHash: 'hash2',
    roleId: 'society-admin',
    __v: 0,
    createdAt: '2024-02-20T13:20:55.002Z',
    platformName: 'SxP',
    updatedAt: '2024-02-20T13:24:19.123Z',
  },
];
