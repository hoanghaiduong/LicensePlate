import express, { Request, Response } from 'express';
import log4js from 'log4js';
import config from '../../config/constants.json';
import * as userService from '../fabricGateway/users';
import * as helper from '../fabricOps/helper'
import * as auth from './auth';

const router = express.Router();
const logger = log4js.getLogger('user');
logger.level = config.logLevel;

router.post('/register', async (req: Request, res: Response) => {
    try {
        const username = req.body.data.userID;
        const password = req.body.data.password;
        const orgName = req.body.data.org;

        await helper.enrollAdmin(orgName);
        let user = await helper.registerAndEnrollUser(username, password, orgName);

        if (user?.success===false) {
            return res.status(409).send(user.message);
        }

        await userService.register(req.body.data);
        return res.status(200).send(user);
    } catch (error: any) {
        if (error.toString().includes('already exists')) {
            return res.status(409).send(error.toString());
        } else {
            return res.status(500).send(error.toString());
        }
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const username = req.body.data.userID;
        const password = req.body.data.password;
        const orgName = req.body.data.org;

        const user = await helper.getRegisteredUser(username, orgName);

        if (!user) {
            return res.status(401).send("Unable to find the user");
        }

        let userResponse = await userService.authenticateUser(username, password, orgName);
        return res.status(200).send(userResponse);
    } catch (error: any) {
        return res.status(401).send(error.toString());
    }
});

router.get('/authenticate', async (req: Request, res: Response) => {
    try {
        return auth.authenticate(req, res, () => {});
    } catch (error: any) {
        console.log(error);
        return res.status(401).send(error.toString());
    }
});

export default router;