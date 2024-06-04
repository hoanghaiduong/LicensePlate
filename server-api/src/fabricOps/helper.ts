import path from "path";
import FabricCAServices from "fabric-ca-client";
import fs from "fs";
import log4js from "log4js";
import config from "../../general-config.json";
import { buildWallet } from "./wallet";

require("dotenv").config();

// Setting default environment type if not mentioned to local
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "local";
}

const logger = log4js.getLogger("fabric-helper");
logger.level = config.loglevel;

const ledgerOpsStatus = {
  success: "SUCCESS",
  error: "ERROR",
};

const enrollAdmin = async (orgName: string): Promise<void> => {
  try {
    const ccp = getCCP(orgName);
    const clientOrg = ccp.client.organization;

    const org = ccp.organizations[clientOrg];
    const mspId = org.mspid;

    const caClient = await getCAClientByOrg(orgName);

    // Create a new file system based wallet for managing identities.
    const wallet = await createWallet(orgName);
    const { adminUserId, adminUserPasswd } = await getAdminCreds(orgName);

    // Check to see if we've already enrolled the admin user.
    const identity = await wallet.get(adminUserId);
    if (identity) {
      console.log(
        "An identity for the admin user already exists in the wallet"
      );
      return;
    }

    // Enroll the admin user, and import the new identity into the wallet.
    const enrollment = await caClient.enroll({
      enrollmentID: adminUserId,
      enrollmentSecret: adminUserPasswd,
    });
    const x509Identity = await createIdentity(enrollment, org);
    await wallet.put(adminUserId, x509Identity);
    logger.info(
      "Successfully enrolled admin user and imported it into the wallet"
    );
  } catch (error: any) {
    console.error(`Failed to enroll admin user : ${error}`);
    throw new Error("Failed to enroll admin user: " + error.toString());
  }
};

const registerAndEnrollUser = async (
  username: string,
  secret: string,
  userOrg: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const ccp = getCCP(userOrg);
    const clientOrg = ccp.client.organization;

    const org = ccp.organizations[clientOrg];

    const { adminUserId } = await getAdminCreds(userOrg);

    const caClient = await getCAClientByOrg(userOrg);

    // Check to see if we've already enrolled the user
    const wallet = await createWallet(userOrg);

    const userIdentity = await wallet.get(username);

    if (userIdentity) {
      logger.info(
        `An identity for the user ${username} already exists in the wallet`
      );

      return {
        success: false,
        message: `An identity for the user ${username} already exists in the wallet`,
      };
    }

    // Must use an admin to register a new user
    const adminIdentity = await wallet.get(adminUserId);
    if (!adminIdentity) {
      logger.info(
        "An identity for the admin user does not exist in the wallet"
      );
      throw new Error(
        "An identity for the admin user does not exist in the wallet, enroll the admin user before retrying"
      );
    }

    // Build a user object for authenticating with the CA
    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, adminUserId);

    // Register the user, enroll the user, and import the new identity into the wallet.
    // If affiliation is specified by the client, the affiliation value must be configured in CA
    const affiliation = userOrg.toLowerCase() + ".department1";

    await caClient.register(
      {
        enrollmentID: username,
        enrollmentSecret: secret,
        role: "client",
        affiliation: "",
      },
      adminUser
    );

    const enrollment = await caClient.enroll({
      enrollmentID: username,
      enrollmentSecret: secret,
    });
    const x509Identity = await createIdentity(enrollment, org);

    await wallet.put(username, x509Identity);
    logger.info(
      `Successfully registered and enrolled user ${username} and imported it into the wallet`
    );
    const response = {
      success: true,
      message: username,
    };
    return response;
  } catch (err: any) {
    console.log(err);
    if (err.toString().includes("Calling register endpoint failed")) {
      return {
        success: false,
        message: "Fabric CA is busy/unreachable. Try again later",
      };
    }
    logger.error(`Failed to register user : ${err}`);
    throw err;
  }
};

const getRegisteredUser = async (username: string, userOrg: string) => {
  try {
    const wallet = await createWallet(userOrg);
    const userIdentity = await wallet.get(username);
    if (!userIdentity) {
      logger.error(
        `An identity for the user ${username} does not exists in the wallet`
      );
      throw "User does not exist";
    }

    // build a user object
    let provider = wallet.getProviderRegistry().getProvider(userIdentity.type);
    const user = await provider.getUserContext(userIdentity, username);

    if (user && user.isEnrolled()) {
      logger.info(
        'Successfully loaded "%s" of org "%s" from persistence',
        username,
        userOrg
      );
      return user;
    } else {
      throw "username or password incorrect";
    }
  } catch (err: any) {
    throw new Error(err);
  }
};

const createWallet = async (orgName: string) => {
  let walletPath = path.join(
    __dirname,
    `../../../network/${process.env.NODE_ENV}/identities/${orgName}/wallet`
  );
  const wallet = await buildWallet(walletPath);
  return wallet;
};

const createIdentity = async (enrollment: any, orgName: any) => {
  let x509Identity;
  x509Identity = {
    credentials: {
      certificate: enrollment.certificate,
      privateKey: enrollment.key.toBytes(),
    },
    mspId: orgName.mspid,
    type: "X.509",
  };
  return x509Identity;
};

const getCCP = (org: string) => {
  // load the common connection configuration file
  const ccpPath = path.resolve(
    __dirname,
    "../../../network/" +
      process.env.NODE_ENV +
      "/network-config/network-config-" +
      org +
      ".json"
  );
  const fileExists = fs.existsSync(ccpPath);
  if (!fileExists) {
    throw new Error(`no such file or directory: ${ccpPath}`);
  }
  const contents = fs.readFileSync(ccpPath, "utf8");

  // build a JSON object from the file contents
  const ccp = JSON.parse(contents);

  logger.debug(`Loaded the network configuration located at ${ccpPath}`);
  return ccp;
};

const getCAClientByOrg = async (orgName: string) => {
  const ccp = getCCP(orgName);
  const clientOrg = ccp.client.organization;
  logger.debug("Client Org -> ", clientOrg);
  const org = ccp.organizations[clientOrg];
  logger.debug("Org -> ", org);
  const orgCAKey = org.certificateAuthorities[0];
  logger.debug("Org CA Key -> ", orgCAKey);
  const caURL = ccp.certificateAuthorities[orgCAKey].url;
  logger.debug("Org CA URL -> ", caURL);
  const caName = ccp.certificateAuthorities[orgCAKey].caName;
  logger.debug("Org CA Name -> ", caName);
  const caTLSCACerts = ccp.certificateAuthorities[orgCAKey].tlsCACerts.pem;
  const mspId = org.mspid;
  logger.debug("MSP Id -> ", mspId);

  // enroll user with certificate authority for orgName
  const tlsOptions = {
    trustedRoots: caTLSCACerts,
    verify: false,
  };
  const caClient = new FabricCAServices(caURL, tlsOptions, caName);
  return caClient;
};

const getAdminCreds = async (orgName: string) => {
  let admin = config.adminList.filter((admin) => admin.org == orgName)[0];
  let adminUserId = admin.username;
  let adminUserPasswd = admin.password;
  return { adminUserId, adminUserPasswd };
};

const getOrgCryptoPath = (orgName: string) => {
  return path.join(
    __dirname,
    `../../../network/${process.env.NODE_ENV}/organizations/peerOrganizations/${orgName}`
  );
};

export {
  enrollAdmin,
  registerAndEnrollUser,
  getRegisteredUser,
  createIdentity,
  getCAClientByOrg,
  getAdminCreds,
  getCCP,
  ledgerOpsStatus,
  createWallet,
  getOrgCryptoPath,
};
