import { Contract } from '@ethersproject/contracts'
import { AddressZero } from '@ethersproject/constants'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { getAddress } from '@ethersproject/address'
import { hexStripZeros } from '@ethersproject/bytes'
import { BigNumber } from '@ethersproject/bignumber'
import {BLOCKCHAINS, isSupportedChain } from "../constants/chains";
import {FALLBACK_URLS} from "../constants/networks"

export function isAddress(value: any): string | false {
    try {
        return getAddress(value)
    } catch {
        return false
    }
}

export function getSigner(
    library: Web3Provider,
    account: string
): JsonRpcSigner {
    return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(
    library: Web3Provider,
    account?: string
): Web3Provider | JsonRpcSigner {
    return account ? getSigner(library, account) : library
}

export function getContract(
    address: string,
    ABI: any,
    library: Web3Provider,
    account?: string
): Contract {
    if (!isAddress(address) || address === AddressZero) {
        throw Error(`Invalid 'address' parameter '${address}'.`)
    }

    return new Contract(
        address,
        ABI,
        getProviderOrSigner(library, account) as any
    )
}




interface SwitchNetworkArguments {
    library: Web3Provider
    chainId?: number
}

// provider.request returns Promise<any>, but wallet_switchEthereumChain must return null or throw
// see https://github.com/rekmarks/EIPs/blob/3326-create/EIPS/eip-3326.md for more info on wallet_switchEthereumChain
export async function switchToNetwork({ library, chainId }: SwitchNetworkArguments): Promise<null | void> {
    if (!library?.provider?.request) {
        return
    }
    if (!chainId && library?.getNetwork) {
        ;({ chainId } = await library.getNetwork())
    }
    const formattedChainId = hexStripZeros(BigNumber.from(chainId).toHexString())

    try {
        await library?.provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: formattedChainId }],
        })
    } catch (error) {
        // 4902 is the error code for attempting to switch to an unrecognized chainId
        // @ts-ignore
        if (error.code === 4902 && chainId !== undefined) {
            //const info = CHAIN_INFO[chainId]

            // metamask (only known implementer) automatically switches after a network is added
            // the second call is done here because that behavior is not a part of the spec and cannot be relied upon in the future
            // metamask's behavior when switching to the current network is just to return null (a no-op)
           // await addNetwork({ library, chainId, info })
           // await switchToNetwork({ library, chainId })
        } else {
            throw error
        }
    }
}


export const changeActiveNetwork =  async (provider,callback,chainId) => {
    for (const [CHAIN, NETWORKS] of Object.entries(BLOCKCHAINS)) {
        for (const [NETWORK,NETWORK_DATA] of Object.entries(NETWORKS)) {
            if(BigNumber.from(NETWORK_DATA.chainId).toNumber() === BigNumber.from(chainId).toNumber()){
                delete NETWORK_DATA["enabled"];
                await addBlockchain(provider,NETWORK_DATA,callback,chainId);
            }
        }
    }
}


export  const addBlockchain  = async (connector, network:any,callback,chainId)  => {
    // let response = false;
    // if (!isSupportedChain(parseInt(chainId))) {
    //     throw new Error(`Chain ${chainId} not supported for connector (${typeof connector})`)
    // } else if (connector === walletConnectConnection.connector || connector === networkConnection.connector) {
    //     await connector.activate(chainId)
    // } else {
    //     const addChainParameter = {
    //         chainId,
    //         chainName: network.chainName,
    //         rpcUrls: [FALLBACK_URLS[chainId][0]],
    //         nativeCurrency: network.nativeCurrency,
    //         blockExplorerUrls: network.blockExplorerUrls,
    //     }
    //     await connector.activate(addChainParameter)
    // }
}

export function getCurrentChainBlockExplorer(chainId){
    var explorer = "";
    for (const [CHAIN, NETWORKS] of Object.entries(BLOCKCHAINS)) {
        for (const [NETWORK,NETWORK_DATA] of Object.entries(NETWORKS)) {
            if (parseInt(NETWORK_DATA.chainId) === chainId){
                explorer = NETWORK_DATA.blockExplorerUrls[0];
            }
        }
    }
    return explorer;
}

export function generateTxLink(chainId:any,tx:any){
    return getCurrentChainBlockExplorer(chainId) + "/tx/" + tx;
}
