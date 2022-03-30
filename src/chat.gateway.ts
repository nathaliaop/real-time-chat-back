import { ForbiddenException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message/message.service';
import { UserService } from './user/user.service';

type User = {
  id: number;
  username: string;
};

type Payload = {
  text: string;
};

type PayloadMessageDelete = {
  messageId: number;
};

type PayloadMessageEdit = {
  messageId: number;
  text: string;
};

@WebSocketGateway({ cors: true })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private connectedUsers: any = [];

  // prisma
  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async getUserFromClient(client: Socket): Promise<User> {
    try {
      let auth_token = client.handshake.headers.authorization;
      const decodedJwtAccessToken = this.jwtService.decode(
        auth_token.split(' ')[1],
      );

      const userId = decodedJwtAccessToken.sub;

      const user = await this.userService.getUser(userId);
      return user;
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  @SubscribeMessage('sentMessage')
  handleMessage(client: Socket, payload: Payload): void {
    let auth_token = client.handshake.headers.authorization;

    const decodedJwtAccessToken = this.jwtService.decode(
      auth_token.split(' ')[1],
    );

    const userId = decodedJwtAccessToken.sub;

    // create message
    this.messageService
      .createMessage(userId, {
        text: payload.text,
      })
      .then((message) => {
        console.log(message);

        this.server.emit('receivedMessage', message, client.id);
      });
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  @SubscribeMessage('messageDelete')
  handleMessageDelete(client: Socket, payload: PayloadMessageDelete) {
    this.logger.log(payload.messageId);

    this.getUserFromClient(client)
      .then((user) => {
        this.messageService.deleteMessageById(user.id, payload.messageId)
          .then(() => {
            this.server.emit('messageDeleted', payload.messageId);
          })
          .catch((error) => {
            this.logger.error(error);
          });
      })
      .catch((error) => {
        this.logger.error(error);
      });
  }

  @SubscribeMessage('messageEdit')
  handleMessageEdit(client: Socket, payload: PayloadMessageEdit) {
    this.logger.log(payload.messageId);

    this.getUserFromClient(client)
      .then((user) => {
        this.messageService.editMessageById(user.id, payload.messageId, { text: payload.text })
          .then(() => {
            this.server.emit('messageEdited', payload.messageId, payload.text);
            this.logger.log('mensagem editada com sucesso');
          })
          .catch((error) => {
            this.logger.error(error);
          });
      })
      .catch((error) => {
        this.logger.error(error);
      });
  }

  @SubscribeMessage('firstConnection')
  handleFirstConnection(client: Socket) {
    // Filtra valores únicos
    return this.connectedUsers.filter(
      (value: User, index: number, array: User[]) =>
        array.findIndex(
          (connectedUser: User) => connectedUser.id === value.id,
        ) === index,
    );
  }

  handleConnection(client: Socket) {
    this.getUserFromClient(client)
      .then((user: User) => {
        const userDto = {
          id: user.id,
          username: user.username,
        };

        this.logger.log(`Client connected: ${userDto.username}`);

        // Trata instância do mesmo usuário logando duas vezes
        // Verifica se o usuário já está em connectedUsers
        if (
          this.connectedUsers.findIndex(
            (connectedUser) => connectedUser.id === user.id,
          ) === -1
        ) {
          this.server.emit('connectUser', userDto);
        }
        this.connectedUsers = [...this.connectedUsers, userDto];
      })
      .catch((error) => {
        this.logger.error(error);
      });
  }

  handleDisconnect(client: Socket) {
    this.getUserFromClient(client)
      .then((user: any) => {
        const userDto = {
          id: user.id,
          username: user.username,
        };

        this.logger.log(`Client disconnected: ${userDto.username}`);

        // Trata instância do mesmo usuário logando duas vezes
        const indexOfUser = this.connectedUsers.findIndex(
          (connectedUser: User) => connectedUser.id === user.id,
        );
        // Remove a primeira ocorrência do usuário
        this.connectedUsers.splice(indexOfUser, 1);
        // Verifica se o usuário ainda está em connectedUsers
        if (
          this.connectedUsers.findIndex(
            (connectedUser: User) => connectedUser.id === user.id,
          ) === -1
        ) {
          this.server.emit('disconnectUser', userDto);
        }
      })
      .catch((error) => {
        this.logger.error(error);
      });
  }
}
