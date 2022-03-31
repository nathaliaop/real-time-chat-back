<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Descrição

[Nest](https://github.com/nestjs/nest) framework TypeScript repositório inicial.

## Deploy
[Deploy do back](https://real-time-chat-socket-back.herokuapp.com)

## Instalação

```bash
$ yarn install
```

## Docker

```bash
$ docker compose up
```

## Iniciando o servidor (acesso na porta [5050](https://localhost:5050))

```bash
# watch mode
$ yarn start:dev
```

## Testes

```bash
$ yarn test:e2e
```

## Eventos Pub/Sub
Documentação dos eventos entre cliente e servidor
## Types
```js
type User = {
  id: number;
  username: string;
}

type Message = {
  id: number;
  createdAt: Date;
  text: string;
  user: {
      username: string;
  }
}

type DeleteMessage = {
  messageId: number;
}

type EditMessage = {
  messageId: number;
  text: string;
}
```

## Eventos emitidos do servidor e acessados pelo cliente
```js
// recebe um usuário quando ele se conecta ao chat
socket.on('connectUser', User);

// recebe um usuário quando ele se desconecta do chat
socket.on('disconnectUser', User);

// recebe uma mensagem recebida no chat
socket.on('receivedMessage', Message);

// recebe o id da mensagem deletada do chat
socket.on('messageDeleted', DeleteMessage)

// recebe o id e o conteúdo de uma mensagem editada no chat
socket.on('messageDeleted', EditMessage)
```

## Eventos emitidos do cliente para o servidor
```js
// envia uma lista de todos os usuários online quando um usuário se conecta pela primeira vez ao chat
socket.emit('firstConnection', User[])

// envia uma mensagem submetida no chat
socket.emit('sentMessage', Message)

// envia o id de uma mensagem deletada do chat
socket.emit('messageDelete', DeleteMessage)
  
// envia o id e o conteúdo de uma mensagem editada no chat
socket.emit('messageEdit', EditMessage)
```

## Documentação

[Nest Documentation](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
