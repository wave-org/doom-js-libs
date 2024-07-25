import {
  LegacyTxData,
  LegacyTransaction,
  FeeMarketEIP1559Transaction,
} from "@ethereumjs/tx";
import { Common, Hardfork, Chain } from "@ethereumjs/common";
// import { BN } from "ethereumjs-util";
import { EthSignRequest, DataType } from "@keystonehq/bc-ur-registry-eth";
import { RLP } from "@ethereumjs/rlp";
import { v4 } from "uuid";

const mainnetCommon = new Common({
  chain: Chain.Mainnet,
  hardfork: Hardfork.Cancun,
});

export const constructEthLegacyRequest = (
  txData: LegacyTxData,
  derivationPath: string,
  address: string,
  common: Common = mainnetCommon
) => {
  const tx = new LegacyTransaction(txData, { common });
  const message = tx.getMessageToSign();
  const signData = Buffer.from(RLP.encode(message));
  return EthSignRequest.constructETHRequest(
    signData,
    DataType.transaction,
    derivationPath,
    "00000000",
    v4(),
    Number(tx.common.chainId()),
    address
  );
};

export const constructEthEIP1559Request = (
  txData: FeeMarketEIP1559Transaction,
  derivationPath: string,
  address: string,
  common: Common = mainnetCommon
) => {
  const tx = new FeeMarketEIP1559Transaction(txData, { common: mainnetCommon });
  const message = tx.getMessageToSign();
  const signData = Buffer.from(RLP.encode(message));
  return EthSignRequest.constructETHRequest(
    signData,
    DataType.transaction,
    derivationPath,
    "00000000",
    v4(),
    Number(tx.common.chainId()),
    address
  );
};

export const constructEthTypedDataRequest = (
  typedData: any,
  derivationPath: string,
  address: string,
  common: Common = mainnetCommon
) => {
  const signData = Buffer.from(JSON.stringify(typedData));
  return EthSignRequest.constructETHRequest(
    signData,
    DataType.typedData,
    derivationPath,
    "00000000",
    v4(),
    1,
    address
  );
};

export const constructEthPersonalMessageRequest = (
  message: string,
  derivationPath: string,
  address: string
) => {
  const signData = Buffer.from(message);
  return EthSignRequest.constructETHRequest(
    signData,
    DataType.personalMessage,
    derivationPath,
    "00000000",
    v4(),
    1,
    address
  );
};

// meed tp rewrite and test this function
export const constructEthTypedTransactionRequest = (
  typedData: any,
  derivationPath: string,
  address: string,
  common: Common = mainnetCommon
) => {
  const signData = Buffer.from(JSON.stringify(typedData));
  return EthSignRequest.constructETHRequest(
    signData,
    DataType.typedTransaction,
    derivationPath,
    "00000000",
    v4(),
    1,
    address
  );
};
