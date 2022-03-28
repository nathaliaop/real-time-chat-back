import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message-dto';

@Injectable()
export class MessageService {
    constructor(
        private prisma:PrismaService,
    ) {}

    async getMessages() {
        try {

            const messages = await this.prisma.message.findMany(
                {
                    select: {
                        id: true,
                        createdAt: true,
                        text: true,
                        user: {
                            select: {
                                username: true
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
            throw new ForbiddenException('Can\'t get messages')
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
            select: {
                id: true,
                createdAt: true,
                text: true,
                user: {
                    select: {
                        username: true
                    }
                }
            }
        })
        return message;
    }
}