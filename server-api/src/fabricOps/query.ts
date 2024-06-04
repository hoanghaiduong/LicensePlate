import { connect } from "@hyperledger/fabric-gateway";
import { newGrpcConnection, newConnectOptions } from "./connect";
import log4js from "log4js";

const logger = log4js.getLogger("query");

const utf8Decoder = new TextDecoder();

const queryChaincode = async (
  channelName: string,
  chaincodeName: string,
  args: string[] | null,
  fcn: string,
): Promise<any> => {
  const client = await newGrpcConnection();
  const connectOptions = await newConnectOptions(client);
  const gateway = connect(connectOptions);

  try {
    const network = gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    let results;

    if (args != null) {
      results = await contract.evaluate(fcn, {arguments:args});
    } else {
      results = await contract.evaluateTransaction(fcn);
    }
    if (results) {
      console.log(
        `Transaction has been evaluated, result is: ${JSON.parse(utf8Decoder.decode(results))}`
      );
   
      return JSON.parse(utf8Decoder.decode(results));
    } else {
      logger.error("results is null");
      return "results is null";
    }
  } catch (error: any) {
    console.log(error);
    if (
      error.message.includes("DiscoveryService has failed to return results") ||
      error.message.includes("REQUEST TIMEOUT") ||
      error.message.includes("UNAVAILABLE")
    ) {
      throw new Error("Peers are busy/unreachable. Try again later");
    }
    throw new Error(JSON.parse(error.message).detail);
  }
};

export { queryChaincode };
