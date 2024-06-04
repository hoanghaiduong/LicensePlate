import { connect } from "@hyperledger/fabric-gateway";
import { newGrpcConnection, newConnectOptions } from "./connect";
import log4js from "log4js";
import util from "util";

const logger = log4js.getLogger("Hospital-sample");
const utf8Decoder = new TextDecoder();

let event_response: any[] = [];

const invokeTransaction = async (channelName: string, chaincodeName: string,
  fcn: string, args: any): Promise<any> => {
  logger.info(
    util.format(
      "\n============ invoke transaction on channel %s ============\n",
      channelName
    )
  );

  const client = await newGrpcConnection();
  const connectOptions = await newConnectOptions(client);
  const gateway = connect(connectOptions);
  let payload: string[] = [JSON.stringify(args)];

  try {
    const network = gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    let invokeResponse
    // Need to treat public and private data separately
    if (args.isPrivate) {
      delete args["isPrivate"];
      invokeResponse = await contract.submit(fcn, {
        transientData: { patient_pvt_properties: JSON.stringify(args) },
      });
    } else {
      // invoke transaction
      invokeResponse = await contract.submit(fcn, { arguments: payload });
      console.log(
        "Transaction successfully submitted at " + new Date().toISOString()
      );
    }

    return JSON.parse(utf8Decoder.decode(invokeResponse));

  } catch (err: any) {
    logger.error("Error in submitting transaction" + err);
    if (
      err.message.includes("DiscoveryService has failed to return results") ||
      err.message.includes("REQUEST TIMEOUT") ||
      err.message.includes("UNAVAILABLE")
    ) {
      throw new Error("Peers are busy/unreachable. Try again later");
    }
    throw new Error(err);
  }
};

export { invokeTransaction };
