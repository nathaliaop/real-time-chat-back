import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message-dto';

@Injectable()
export class MessageService {
    constructor(
        private prisma:PrismaService,
    ) {}

    async getMessages() {
        try {

            //mesage = [{message}]

            const messages = await this.prisma.message.findMany(
                {
                    select: {
                        createdAt: true,
                        text: true,
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            );
            return messages;
        }
        catch {
            return "Can't get messages"
        }
    }

    async createMessage(userId: number, dto: CreateMessageDto) {
        console.log(dto)
         //save the new message in the db
        const message = await this.prisma.message.create({
            data: {
                text: dto.text,
                userId,
            },
        })
        return message;
    }
}