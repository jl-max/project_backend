import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseArrayPipe,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { ApiBody, ApiExtraModels } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createUserDto: CreateUserDto) {
    this.userService.create(createUserDto);
  }

  @Post('bulk')
  @ApiBody({
    type: [CreateUserDto],
    examples: {
      example1: {
        value: [
          {
            email: 'user1@example.com',
            name: 'Jane',
            password: 'password123',
            role: 'user',
          },
          {
            email: 'user2@example.com',
            name: 'John',
            password: 'password456',
            role: 'guest',
          },
        ],
      },
    },
  })
  createBulk(
    @Body(new ParseArrayPipe({ items: CreateUserDto })) users: CreateUserDto[],
  ) {
    return 'This action adds new users';
  }

  @ApiExtraModels(QueryUserDto)
  @Get()
  findAll(@Query() query: QueryUserDto) {
    if (query.ids) return this.userService.findByIds(query.ids);
    if (query.role) return this.userService.findAllByRole(query.role);
    if (query.email) return this.userService.findAllByEmail(query.email);
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
