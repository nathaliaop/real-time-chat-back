import { Logger } from '@nestjs/common';
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
  id: number,
  username: string
}

type Payload = {
  text: string;
}

@WebSocketGateway({ cors: true })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{

  connectedUsers: any = [];

  // prisma
  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: Payload): void {

    let auth_token = client.handshake.headers.authorization;

    const decodedJwtAccessToken = this.jwtService.decode(auth_token.split(' ')[1]);

    const userId = decodedJwtAccessToken.sub

    // create message
    this.messageService.createMessage(
      userId,
      {
        text: payload.text
      }
    )
    .then((message) => {
      console.log(message)

      this.server.emit('msgToClient', message, client.id);
    })
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleConnection(client: Socket) {
    let auth_token = client.handshake.headers.authorization;

    const decodedJwtAccessToken = this.jwtService.decode(auth_token.split(' ')[1]);

      if (decodedJwtAccessToken) {
        const userId = decodedJwtAccessToken.sub

        this.userService.getUser(
          userId
        )
        .then((user: User) => {
          const userDto = {
            id: userId,
            username: user.username
          };
          this.connectedUsers = [...this.connectedUsers, userDto];
          this.logger.log(`Client connected: ${userDto.username}`);
          this.server.emit('users', this.connectedUsers);
        })
      }
  }

  handleDisconnect(client: Socket) {
    let auth_token = client.handshake.headers.authorization;

    const decodedJwtAccessToken = this.jwtService.decode(auth_token.split(' ')[1]);

      if (decodedJwtAccessToken) {
        const userId = decodedJwtAccessToken.sub

        this.userService.getUser(
          userId
        )
        .then((user: any) => {
          const userDto = {
            id: userId,
            createdAt: Date.now(),
            username: user.username
          };
          this.connectedUsers = this.connectedUsers.filter(connectedUser => connectedUser.id !== userId);
          this.logger.log(`Client disconnected: ${userDto.username}`);
          this.server.emit('users', this.connectedUsers);
        })
      }
  }
}