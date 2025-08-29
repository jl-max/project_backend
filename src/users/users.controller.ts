import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Redirect,
  Query,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(@Req() req: Request) {
    console.log(req.headers);
    return 'This action returns all users';
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return `This action returns a #${id} user`;
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() user: CreateUserDto) {
    this.usersService.create(user);
    return `User ${user.email} created`;
  }

  @Get('docs')
  @Redirect('https://docs.nestjs.com', 302)
  getDocs(@Query('version') version) {
    if (version && version === '5') {
      return { url: 'https://docs.nestjs.com/v5/' };
    }
  }
}
