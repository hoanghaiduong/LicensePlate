import log4js from 'log4js';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config as dotenvConfig } from 'dotenv';
require('dotenv').config()

dotenvConfig();

const logger = log4js.getLogger('auth');

const authenticate = (req: Request, res: Response, next: NextFunction): any => {
    console.log('New req for %s', req.originalUrl);

    if (req.originalUrl.includes('user/login') || req.originalUrl.includes('user/register')) {
        return next();
    }

    const token = req.body?.token || req.headers.authorization;
    
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET as string, (err: Error | null, decoded: any) => {
            if (err) {
                return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                return next();
            }
        });
    } else {
        return res.status(401).send({
            success: false,
            message: 'No token provided.'
        });
    }
};

export {
    authenticate
};