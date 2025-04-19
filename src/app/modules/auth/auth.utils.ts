import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { IJwtPayload } from './auth.interface';

export const createToken = (
    jwtPayload: IJwtPayload,
    secret: Secret,
    expiresIn: string | number,
) => {
    return jwt.sign(jwtPayload, secret, {
        expiresIn: typeof expiresIn === 'string' ? parseInt(expiresIn, 10) : expiresIn,
    });
};

export const verifyToken = (token: string, secret: Secret) => {
    return jwt.verify(token, secret) as JwtPayload;
};