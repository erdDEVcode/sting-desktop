import { Dapp } from "../../types/all"

export interface HandlerHelper {
  getDapp: () => (Dapp | undefined), 
  askUserToAllowDappToSeeTheirAccountAddress: Function,
}
