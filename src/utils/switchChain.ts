import { Connector } from '@web3-react/types'
import { networkConnection, uniwalletWCV2ConnectConnection, walletConnectV2Connection } from '../connection'
import {BLOCKCHAINS, isSupportedChain, ChainId as SupportedChainId} from '../constants/chains'
import {FALLBACK_URLS,RPC_URLS} from "../constants/networks"
import { useFindNetworkByChainId } from '../hooks/useContract'

function getRpcUrl(chainId: SupportedChainId): string {
  switch (chainId) {
    case SupportedChainId.MAINNET:
    case SupportedChainId.GOERLI:
      return RPC_URLS[chainId][0]
    // Attempting to add a chain using an infura URL will not work, as the URL will be unreachable from the MetaMask background page.
    // MetaMask allows switching to any publicly reachable URL, but for novel chains, it will display a warning if it is not on the "Safe" list.
    // See the definition of FALLBACK_URLS for more details.
    default:
      return FALLBACK_URLS[chainId][0]
  }
}

export const switchChain = async (connector: Connector, chainId: SupportedChainId) => {
  if (!isSupportedChain(chainId)) {
    throw new Error(`Chain ${chainId} not supported for connector (${typeof connector})`)
  } else if (
    connector === walletConnectV2Connection.connector ||
    connector === uniwalletWCV2ConnectConnection.connector ||
    connector === networkConnection.connector
  ) {
    await connector.activate(chainId)
  } else {
    const info = useFindNetworkByChainId(chainId).networkData;
    const addChainParameter = {
      chainId,
      chainName: info.chainName,
      rpcUrls: [getRpcUrl(chainId)],
      nativeCurrency: info.nativeCurrency,
      blockExplorerUrls: info.blockExplorerUrls,
    }

    delete info?.enabled;

    console.log("chainInfo",info)
    const switchChainParameter = {
      chainId:info.chainId,
      chainName: info.chainName,
      rpcUrls: [getRpcUrl(chainId)],
      nativeCurrency: info.nativeCurrency,
      blockExplorerUrls: info.blockExplorerUrls,
    }

    await connector.provider?.request({
      method: "wallet_addEthereumChain",
      params: [{ ...info, chainId: info.chainId }],
    });
    await connector.activate(addChainParameter)
  }
}
