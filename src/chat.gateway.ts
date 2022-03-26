import { Logger, UseGuards } from '@nestjs/common';
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

type Payload = {
  name: string;
  text: string;
}

@WebSocketGateway({ cors: true })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  // prisma
  constructor(
    private messageService: MessageService,
    private jwtService: JwtService,
  ) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: Payload): void {

    let auth_token = client.handshake.headers.authorization;

    const decodedJwtAccessToken = this.jwtService.decode(auth_token.split(' ')[1]);

    const userId = decodedJwtAccessToken.sub
    //name text
    console.log(decodedJwtAccessToken)

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
    const message = {
      name: client.id,
      text: 'O usuário se conectou :D',
    };

    this.server.emit('msgToClient', message);
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const message = {
      name: client.id,
      text: 'O usuário se desconectou :(',
    };

    this.server.emit('msgToClient', message);
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
