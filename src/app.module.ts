import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MessagesModule } from './messages/message.module';

@Module({
  imports: [UsersModule, AuthModule, MessagesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
