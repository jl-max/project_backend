import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IUser, SafeUser } from 'src/user/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<SafeUser | null> {
    const user = await this.usersService.findOneByEmail(email);

    if (
      user &&
      user.credential &&
      user.isActive &&
      (await bcrypt.compare(pass, user.credential.passwordHash))
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { credential: _, ...result } = user;
      return result;
    }
    return null;
  }

  login(user: IUser) {
    const roles = user.roles.map((role) => role.name);
    const payload = {
      email: user.email,
      sub: user.id,
      roles: roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
