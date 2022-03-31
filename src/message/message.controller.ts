import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { MessageService } from './message.service';
import { MessageDto } from './dto/message-dto';

@UseGuards(JwtGuard)
@Controller('messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get()
  getMessages() {
    return this.messageService.getMessages();
  }

  @Post()
  createMessage(@GetUser('id') userId: number, @Body() dto: MessageDto) {
    return this.messageService.createMessage(userId, dto);
  }

  @Patch(':userId/:messageId')
  editMessageById(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() dto: MessageDto,
  ) {
    return this.messageService.editMessageById(userId, messageId, dto);
  }

  @Delete(':userId/:messageId')
  deleteMessageById(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    return this.messageService.deleteMessageById(userId, messageId);
  }
}
