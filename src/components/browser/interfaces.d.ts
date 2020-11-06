import { Dapp, Transaction } from "../../types/all"

export interface HandlerHelper {
  getDapp: () => (Dapp | undefined), 
  askUserToAllowDappToSeeTheirWalletAddress: (address: string) => Promise<any>,
  signAndSendTransaction: (tx: Transaction) =>  Promise<any>,
}
