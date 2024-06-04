import * as invoke from '../fabricOps/invoke';
import * as query from '../fabricOps/query';
import config from '../../config/constants.json';
import { Encrypter } from '../utils/cryptography';
import * as ipfs_service from '../utils/ipfs_service'
import { Request } from 'express';

const add = async (req: Request) => {
  try {
    const result = await invoke.invokeTransaction(
      config.channelName,
      config.chaincodeName,
      'AddPatient',
      req.body
    );
    return result;
  } catch (error: any) {
    throw error.message.toString();
  }
};

const search = async (req: Request) => {
  try {
    let payloadForSmartcontract = [JSON.stringify(req.body)];
    const result = await query.queryChaincode(
      config.channelName,
      config.chaincodeName,
      payloadForSmartcontract,
      'QueryByPartialKey'
    );
    return result;
  } catch (error: any) {
    throw error.message.toString();
  }
};

const update = async (req: Request) => {
  try {
    const result = await invoke.invokeTransaction(
      config.channelName,
      config.chaincodeName,
      'UpdatePatient',
      req.body
    );
    return result;
  } catch (error: any) {
    throw error.message.toString();
  }
};

const getOne = async (req: Request) => {
  try {
    let payloadForSmartcontract: string[] = [];
    payloadForSmartcontract.push(JSON.stringify(req.body));
    const result = await query.queryChaincode(
      config.channelName,
      config.chaincodeName,
      payloadForSmartcontract,
      'ReadPatient'
    );
    return result;
  } catch (error: any) {
    throw error.message.toString();
  }
};

const deleteRecord = async (req: Request) => {
  try {
    const result = await invoke.invokeTransaction(
      config.channelName,
      config.chaincodeName,
      'DeletePatient',
      req.body
    );
    return result;
  } catch (error: any) {
    throw error.message.toString();
  }
};

const getAll = async (req: Request) => {
  try {
    const result = await query.queryChaincode(
      config.channelName,
      config.chaincodeName,
      null,
      'GetAllPatients'
    );
    return result;
  } catch (error: any) {
    throw error.message.toString();
  }
};

const addPrivate = async (req: Request) => {
  try {
    const payload = await processPvtDataRequest(req);
    const result = await invoke.invokeTransaction(
      config.channelName,
      config.chaincodeName,
      'AddPatientPvtData',
      payload
    );
    return result;
  } catch (error: any) {
    throw error.message.toString();
  }
};

const processPvtDataRequest = async (req: any) => {
  const params = JSON.parse(req.body.params as string);
  var payload = params;

  if (req.files) {
    const files = req.files.file;

    if (files.length) {
      for (var i = 0; i < files.length; i++) {
        files[i].data = Encrypter.encrypt(files[i].data);
      }
    } else {
      files.data = Encrypter.encrypt(files.data);
    }

    const ipfs_json = await ipfs_service.uploadToIPFS(files);
    payload = { ...params, fileLocations: ipfs_json };
  }

  return payload;
};

const getPvtData = async (req: Request) => {
  try {
    let payload: string[] = [];
    payload.push(JSON.stringify(req.body));
    const result = await query.queryChaincode(
      config.channelName,
      config.chaincodeName,
      payload,
      'QueryPatientPvtRecordById'
    );
    return result;
  } catch (error: any) {
    throw error.message.toString();
  }
};

const readIpfsFile = async (req: Request) => {
  try {
    const file_buffer = await ipfs_service.getIpfsFile(req.body.props.cid as string);
    const decrypt_buffer = Encrypter.decrypt(file_buffer.data);
    return decrypt_buffer;
  } catch (error: any) {
    throw error.message.toString();
  }
};

export {
  add,
  search,
  update,
  getOne,
  deleteRecord,
  getAll,
  addPrivate,
  getPvtData,
  readIpfsFile,
};
