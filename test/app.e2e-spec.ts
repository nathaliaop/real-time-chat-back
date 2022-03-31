import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { MessageDto } from 'src/message/dto/message-dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(5050);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:5050');

    await prisma.cleanDb();
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'nathalia@gmail.com',
      password: '123',
    };
    describe('Signup', () => {
      it('should throw if body empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({})
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('should throw if body empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({})
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userToken', 'token')
          .stores('userId', 'userId');
      });
    });
  });
  describe('User', () => {
    it('should get user by id', () => {
      return pactum
        .spec()
        .get('/users/$S{userId}')
        .withHeaders({
          Authorization: 'Bearer $S{userToken}',
        })
        .expectStatus(200);
    });
  });

  describe('Message', () => {
    const dto: MessageDto = {
      text: 'Eu sou uma mensagem elegante',
    };
    it('should get no messages', () => {
      return pactum
        .spec()
        .get('/messages')
        .withHeaders({
          Authorization: 'Bearer $S{userToken}',
        })
        .expectStatus(200)
        .expectBodyContains([]);
    });

    it('should create a message', () => {
      return pactum
        .spec()
        .post('/messages')
        .withHeaders({
          Authorization: 'Bearer $S{userToken}',
        })
        .withBody(dto)
        .expectStatus(201)
        .stores('messageId', 'id')
        .expectBodyContains(dto.text);
    });

    it('should get all messages', () => {
      return pactum
        .spec()
        .get('/messages')
        .withHeaders({
          Authorization: 'Bearer $S{userToken}',
        })
        .expectStatus(200)
        .expectBodyContains(dto.text);
    });

    it('should edit a message', () => {
      return pactum
        .spec()
        .patch('/messages/$S{messageId}')
        .withHeaders({
          Authorization: 'Bearer $S{userToken}',
        })
        .withBody(dto)
        .expectStatus(200)
        .expectBodyContains(dto.text);
    });

    it('should delete a message', () => {
      return pactum
        .spec()
        .delete('/messages/$S{messageId}')
        .withHeaders({
          Authorization: 'Bearer $S{userToken}',
        })
        .expectStatus(200);
    });

    it('should get no messages', () => {
      return pactum
        .spec()
        .get('/messages')
        .withHeaders({
          Authorization: 'Bearer $S{userToken}',
        })
        .expectStatus(200)
        .expectBodyContains([]);
    });
  });
});
