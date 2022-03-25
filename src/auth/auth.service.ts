import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable({})
export class AuthService {
    constructor(
        private prisma:PrismaService,
        private jwt: JwtService,
        private config: ConfigService,
    ) {}
    async signup (dto: AuthDto) {
        // generate the password hash
        const hash = await argon.hash(dto.password);

        //save the new user in the db
        try {
            const user = await this.prisma.user.create({
                data: {
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    email: dto.email,
                    hash,
                },

            })
            return this.signToken(user.id, user.email, user.firstName, user.lastName);
        } catch(error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException(
                        'User already taken',
                    )
                }
            }
            throw error;
        }
    }

    async signin (dto: AuthDto) {
        // find the user by email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });
        // if user does not exist throw exception
        if (!user)
            throw new ForbiddenException('Email incorrect')
        //compare password
        const pwMatches = await argon.verify(
            user.hash,
            dto.password,
        )
        // if passsword incorrect throw exception
        if (!pwMatches)
            throw new ForbiddenException(
                'Password incorret',
            )
        return this.signToken(user.id, user.email, user.firstName, user.lastName)
    }

    async signToken(
        userId: number,
        email: string,
        firstName: string,
        lastName: string
    ): Promise<{ token: string, userId: number, firstName: string, lastName: string }> {
        const payload = {
            sub: userId,
            email
        };
        const secret = this.config.get('JWT_SECRET')

        const token = await this.jwt.signAsync(
            payload,
            {
                expiresIn: '1h',
                secret: secret,
            },
        );
        return {
            token,
            userId,
            firstName,
            lastName
        };
    }
}