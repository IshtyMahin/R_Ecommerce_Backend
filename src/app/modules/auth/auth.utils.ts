import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { IJwtPayload } from './auth.interface';
import { SignOptions } from 'jsonwebtoken';

export const createToken = (
  jwtPayload: IJwtPayload,
  secret: Secret,
  expiresIn: string | number,
) => {
  const signOptions: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'], 
  };

  return jwt.sign(jwtPayload, secret, signOptions);
};


export const verifyToken = (token: string, secret: Secret) => {
    
    
    return jwt.verify(token, secret) as JwtPayload;
};