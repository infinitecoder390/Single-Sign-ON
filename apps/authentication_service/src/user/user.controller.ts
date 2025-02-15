import { Controller } from '@nestjs/common';
import { UserService } from './service/user.service';

@Controller({
  version: '1',
  path: 'user',
})
export class UserController {
  constructor(private readonly userService: UserService) {}
}
