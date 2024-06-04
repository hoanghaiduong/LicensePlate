import express, { Request, Response } from 'express';
import log4js from 'log4js';
import config from '../../config/constants.json';
import * as patientService from '../fabricGateway/patients';

const logger = log4js.getLogger('user');
logger.level = config.logLevel;

const router = express.Router();

router.post('/add', async (req: Request, res: Response) => {
  try {
    const response = await patientService.add(req);
    if (response.status === 'SUCCESS') {
      return res.status(200).send(response);
    } else if (response.status === 'DUPLICATE') {
      return res.status(409).send(response);
    } else if (response.status === 'ERROR') {
      return res.status(422).send(response);
    } else {
      return res.status(400).send(response);
    }
  } catch(error:any) {
    return res.status(401).send(error.toString());
  }
});

router.post('/search', async (req: Request, res: Response) => {
  try {
    const response = await patientService.search(req);
    if (response.status === 'SUCCESS') {
      return res.status(200).send(response);
    } else if (response.status === 'ERROR') {
      return res.status(502).send(response);
    } else {
      return res.status(400).send(response);
    }
  } catch(error: any){
    return res.status(401).send(error.toString());
  }
});

router.post('/update', async (req: Request, res: Response) => {
  try {
    const response = await patientService.update(req);
    return res.status(200).send(response);
  } catch (error: any) {
    return res.status(401).send(error.toString());
  }
});

router.post('/getone', async (req: Request, res: Response) => {
  try {
    const response = await patientService.getOne(req);
    return res.status(200).send(response);
  } catch (error: any) {
    return res.status(401).send(error.toString());
  }
});

router.post('/deleterecord', async (req: Request, res: Response) => {
  try {
    const response = await patientService.deleteRecord(req);
    return res.status(200).send(response);
  } catch (error: any) {
    return res.status(401).send(error.toString());
  }
});

router.get('/getall', async (req: Request, res: Response) => {
  try {
    const response = await patientService.getAll(req);
    return res.status(200).send(response);
  } catch (error: any) {
    return res.status(401).send(error.toString());
  }
});

router.post('/addprivate', async (req: Request, res: Response) => {
  try {
    const response = await patientService.addPrivate(req);
    return res.status(200).send(response);
  } catch (error: any) {
    return res.status(401).send(error.toString());
  }
});

router.post('/getpvtdata', async (req: Request, res: Response) => {
  try {
    const response = await patientService.getPvtData(req);
    return res.status(200).send(response);
  } catch (error: any) {
    return res.status(401).send(error.toString());
  }
});

router.post('/getipfsfile', async (req: Request, res: Response) => {
  try {
    const response = await patientService.readIpfsFile(req);
    return res.status(200).send(response);
  } catch (error: any) {
    return res.status(401).send(error.toString());
  }
});

export default router;
