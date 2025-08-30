import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';

const mockAuthService = {
  auth: 0,
  getHello() {
    return 'mock auth';
  },
};

@Module({
  imports: [UserModule],
  providers: [
    {
      provide: AuthService,
      useValue: mockAuthService,
      // useClass: AuthService,
    },
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
