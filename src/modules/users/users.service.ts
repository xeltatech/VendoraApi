import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/services/prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.authService.hashPassword(createUserDto.password);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      include: {
        organization: true,
        factory: true,
      },
    });

    // Don't return password
    const { password, ...result } = user;
    return result;
  }

  async findAll(skip = 0, take = 50) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        include: {
          organization: true,
          factory: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count(),
    ]);

    const sanitizedUsers = users.map(({ password, refreshToken, ...user }) => user);

    return {
      data: sanitizedUsers,
      meta: { total, skip, take },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        organization: true,
        factory: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, refreshToken, ...result } = user;
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        organization: true,
        factory: true,
      },
    });

    const { password, refreshToken, ...result } = user;
    return result;
  }

  async remove(id: string) {
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}
