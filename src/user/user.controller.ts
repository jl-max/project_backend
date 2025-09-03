import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseArrayPipe,
  ValidationPipe,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/decorators/roles.decorator';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBody, ApiSecurity } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiSecurity('jwt')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Post('bulk')
  @ApiSecurity('jwt')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
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

  @Get()
  @ApiSecurity('basic-auth')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiSecurity('jwt')
  @UseGuards(JwtAuthGuard)
  findOneById(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Get(':email')
  @ApiSecurity('jwt')
  @UseGuards(JwtAuthGuard)
  findOneByEmail(@Param('email') email: string) {
    return this.userService.findOneByEmail(email);
  }

  @Patch(':id')
  @ApiSecurity('jwt')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateById(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    // return this.userService.updateById(id, updateUserDto);
  }

  @Delete(':id')
  @ApiSecurity('jwt')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
