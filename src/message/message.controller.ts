import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message-dto';

@UseGuards(JwtGuard)
@Controller('messages')
export class MessageController {
    constructor(
        private messageService: MessageService,
    ) {}

    @Get()
    getMessages() {
        return this.messageService.getMessages();
    }

    @Post()
    createMessage(
        @GetUser('id') userId: number,
        @Body() dto: CreateMessageDto,
    ) {
        return this.messageService.createMessage(
            userId,
            dto,
        );
    }

}