import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageDto } from './dto/message-dto';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async getMessages() {
    try {
      const messages = await this.prisma.message.findMany({
        select: {
          id: true,
          createdAt: true,
          text: true,
          user: {
            select: {
							id: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      return messages;
    } catch {
      throw new ForbiddenException('Can\'t get messages');
    }
  }

  async createMessage(userId: number, dto: MessageDto) {
    console.log(dto);
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
						id: true,
            username: true,
          },
        },
      },
    });
    return message;
  }

	async editMessageById(
    userId: number,
    messageId: number,
    dto: MessageDto
  ) {
    // recupera a mensagem pelo id
    const message =
      await this.prisma.message.findUnique({
        where: {
          id: messageId,
        },
      });

    // confere se o usuário é autor da mensagem
    if (!message || message.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    return this.prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteMessageById(userId: number, messageId: number) {
    // recupera a mensagem pelo id
    const message = await this.prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    // confere se o usuário é autor da mensagem
    if (!message || message.userId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }

    // deleta mensagem
		await this.prisma.message.delete({
			where: {
				id: messageId,
			}
		});
  }
}