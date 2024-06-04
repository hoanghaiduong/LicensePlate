
import * as grpc from "@grpc/grpc-js";
import {
  ConnectOptions,
  Identity,
  Signer,
  signers,
} from "@hyperledger/fabric-gateway";
import * as crypto from "crypto";
import { promises as fs } from "fs";
import * as path from "path";
import config from "../../config/constants.json";
import * as helper from "./helper";

export const channelName = config.channelName ?? "mychannel";
export const chaincodeName = config.chaincodeName ?? "basic";

require("dotenv").config();
const peerName = config.peerName;
const mspId = config.mspId;
const orgName = config.orgName;

// Path to crypto materials.
const cryptoPath = helper.getOrgCryptoPath(orgName);

// Path to user private key directory.
const keyDirectoryPath = path.resolve(
  path.resolve(cryptoPath, "users", "User1@" + orgName, "msp", "keystore")
);

// Path to user certificate.
const certPath = path.resolve(
  path.resolve(
    cryptoPath,
    "users",
    "User1@" + orgName,
    "msp",
    "signcerts",
    "cert.pem"
  )
);

// Path to peer tls certificate.
const tlsCertPath = path.resolve(
  path.resolve(cryptoPath, "peers", peerName, "tls", "ca.crt")
);

// Gateway peer endpoint.
const peerEndpoint = config.peerEndpoint;

// Gateway peer SSL host name override.
const peerHostAlias = peerName;

export async function newGrpcConnection(): Promise<grpc.Client> {
  const tlsRootCert = await fs.readFile(tlsCertPath);
  const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
  return new grpc.Client(peerEndpoint, tlsCredentials, {
    "grpc.ssl_target_name_override": peerHostAlias,
  });
}

export async function newConnectOptions(
  client: grpc.Client
): Promise<ConnectOptions> {
  return {
    client,
    identity: await newIdentity(),
    signer: await newSigner(),
    // Default timeouts for different gRPC calls
    evaluateOptions: () => {
      return { deadline: Date.now() + 5000 }; // 5 seconds
    },
    endorseOptions: () => {
      return { deadline: Date.now() + 15000 }; // 15 seconds
    },
    submitOptions: () => {
      return { deadline: Date.now() + 5000 }; // 5 seconds
    },
    commitStatusOptions: () => {
      return { deadline: Date.now() + 60000 }; // 1 minute
    },
  };
}

async function newIdentity(): Promise<Identity> {
  const credentials = await fs.readFile(certPath);
  return { mspId, credentials };
}

async function newSigner(): Promise<Signer> {
  const keyFiles = await fs.readdir(keyDirectoryPath);
  if (keyFiles.length === 0) {
    throw new Error(
      `No private key files found in directory ${keyDirectoryPath}`
    );
  }
  const keyPath = path.resolve(keyDirectoryPath, keyFiles[0]);
  const privateKeyPem = await fs.readFile(keyPath);
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  return signers.newPrivateKeySigner(privateKey);
}
