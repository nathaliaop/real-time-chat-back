import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { MessageModule } from './message/message.module';
import { ChatGateway } from './chat.gateway';
import { MessageService } from './message/message.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserService } from './user/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    MessageModule,
    JwtModule.register({})
  ],
  providers: [ChatGateway, MessageService, UserService]
})
export class AppModule {}