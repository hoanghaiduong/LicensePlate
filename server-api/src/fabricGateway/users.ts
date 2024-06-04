import * as query from '../fabricOps/query';
import * as helper from '../fabricOps/helper';
import * as invoke from '../fabricOps/invoke';
import * as bcrypt from 'bcryptjs';
import config from '../../config/constants.json';
import * as util from '../utils/util';
import moment from 'moment';
import log4js from 'log4js';
import jwt from 'jsonwebtoken';
import { UserObject } from '../types/types';

const logger = log4js.getLogger('users');
require('dotenv').config();

const authenticateUser = async (userName: string, password: string, org: string): Promise<string> => {
    let payload = [userName];
    try {
        let resp = await query.queryChaincode(config.channelName, config.chaincodeName, payload, "GetUserDetails");
        let chainData;

        if (resp && resp.status === helper.ledgerOpsStatus.success) {
            chainData = resp.objectBytes ? JSON.parse(resp.objectBytes) : null;
        } else {
            throw new Error(JSON.parse(resp.description));
        }

        if (!bcrypt.compareSync(password, chainData.password)) {
            throw new Error('Invalid password.');
        }

        let token = generateJwtToken(userName, org);
        const ret = JSON.stringify({ username: userName, org: org, jwt: token, name: chainData.name });
        return ret;

    } catch (err) {
        throw err;
    }
};

const register = async (reqBody: UserObject): Promise<void> => {
    try {
        let password = reqBody.password;
        reqBody.password = util.hashPassword(password);
        reqBody.timeStamp = moment.utc().format(config.dateFormat);
        await invoke.invokeTransaction(config.channelName, config.chaincodeName, "CreateUser", reqBody);
        return;
    } catch (error) {
        throw error;
    }
};

const generateJwtToken = (userName: string, org: string): string => {
    return jwt.sign({
        exp: Math.floor(Date.now() / 1000) + parseInt(config.jwt_expiretime),
        username: userName,
        orgname: org
    }, process.env.JWT_SECRET as string);
};

const respObj = (userName: string, token: string): { accessToken: string; username: string } => {
    return {
        accessToken: token,
        username: userName,
    };
};

export {
    authenticateUser,
    register,
    generateJwtToken,
    respObj
};