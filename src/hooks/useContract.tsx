import React, {useCallback, useRef} from 'react';
import { Contract } from '@ethersproject/contracts'
import { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { getContract } from '../utils/web3Provider'
import ERC20_ABI from "../contracts/abis/ERC20.json";
import PAIR_ABI from "../contracts/abis/PAIR.json";
import EXCHANGE_ABI from "../contracts/abis/EXCHANGEDIAMOND.json"
import IMONDIAMOND_ABI from "../contracts/abis/IMONDIAMOND.json";
import INTELLITRADE_ABI from "../contracts/abis/INTELLITRADEABI.json"
import IMONNFT_ABI from "../contracts/abis/IMONNFT.json";
import IMONNFT1155_ABI from "../contracts/abis/IMON1155NFT.json";
import IMONNFT721_ABI from "../contracts/abis/IMON721NFT.json";
import STANDARD721_ABI from "../contracts/abis/ERC721STD.json";
import WETH9_ABI from "../contracts/abis/WBITCI.json";
import AI_DIAMOND from "../contracts/abis/AIDIAMOND.json";
import CHILIMON_ABI from "../contracts/abis/CHILIMON.json";
import PLINKO_ABI from "../contracts/abis/PLINKO.json";
import DOMAIN_ABI from "../contracts/abis/DOMAIN.json";
import MOLENFT from "../contracts/abis/MOLE.json";
import IMON_MARKET_ABI from "../contracts/abis/IMONMARKET.json";
import IMON_NFT_LAUNCHPAD_ABI from "../contracts/abis/NFTLaunchpad.json";
import IMON_NFT_DISTRIBUTOR_ABI from "../contracts/abis/HOOPNFT.json";
import IMON_STAKE_ABI from "../contracts/abis/IMONSTAKE.json";
import IMON_LAUNCHPAD_ABI from "../contracts/abis/IMONLAUNCHPAD.json";
import NFT_SOCCER_GAMES_ABI from "../contracts/abis/NFTSOCCERNFT.json";
import IMON_404_TOKEN_ABI from "../contracts/abis/IMON404.json"
import FANTOKEN_WRAPPER_ABI from "../contracts/abis/FANTOKENWRAPPER.json"
import METAMORPH_TOKEN_ABI from "../contracts/abis/METAMORPH.json"
import CHILIATOR_TOKEN_ABI from "../contracts/abis/CHILIATORDIAMOND.json"
import JALASWAP_FACTORY_ABI from "../contracts/abis/JALAFACTORY.json"
import IMONBRIDGE from "../contracts/abis/IMONBRIDGE.json"
import KEWLMIGRATOR from "../contracts/abis/KEWLMIGRATOR.json"
import KEWLLISTING_ABI from "../contracts/abis/KEWLLISTING.json"
import KEWLVESTING_ABI from "../contracts/abis/KEWLVesting.json"
import PREDICTIONS_ABI from "../contracts/abis/PREDICTIONS.json"
import {CONTRACT_ADRESSES} from "../contracts/addresses";
import {BLOCKCHAINS, DEFAULT_CHAIN_INFO, isSupportedChain} from "../constants/chains";
import {BigNumber} from "@ethersproject/bignumber";
import { ethers } from 'ethers';
import { LogLevel } from '@ethersproject/logger';

// returns null on errors
export function useContract<T extends Contract = Contract>(
    addressOrAddressMap: string | { [chainId: number]: string } | undefined,
    ABI: any,
    withSignerIfPossible = true
): T | null {
    ethers.utils.Logger.setLogLevel(LogLevel.OFF);
    const { provider, account, chainId } = useWeb3React()

    return useMemo(() => {
        if (!addressOrAddressMap || !ABI || !provider || !chainId) return null
        let address: string | undefined
        if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
        else address = addressOrAddressMap[chainId]
        if (!address) return null
        try {
            return getContract(address, ABI, provider, withSignerIfPossible && account ? account : undefined)
        } catch (error) {
            console.error('Failed to get contract', error)
            return null
        }
    }, [addressOrAddressMap, ABI, provider, chainId, withSignerIfPossible, account]) as T
}

export function usePairContract(tokenAddress?: string, withSignerIfPossible?: boolean) {
    return useContract(tokenAddress, PAIR_ABI, withSignerIfPossible)
}

export function usePAIRContract() {
    const { account, provider } = useWeb3React()
    return useCallback(
        (address, withSignerIfPossible = true) => {
            if (!address || !PAIR_ABI.abi || !provider) return null
            try {
                return getContract(
                    address,
                    PAIR_ABI.abi,
                    provider,
                    withSignerIfPossible && account ? account : undefined
                )
            } catch (error) {
                console.log('Failed to get the contract:', error)
            }
        },
        [account, provider]
    )
}

export function useERC20Contract() {
    const { account, provider } = useWeb3React()
    return useCallback(
        (address, withSignerIfPossible = true) => {
            if (!address || !ERC20_ABI || !provider) return null
            try {
                return getContract(
                    address,
                    ERC20_ABI,
                    provider,
                    withSignerIfPossible && account ? account : undefined
                )
            } catch (error) {
                console.log('Failed to get the contract:', error)
            }
        },
        [account, provider]
    )
}



export const useFindChainSymbol = (chainId) => {
    var chainName : string;
    var networkName : string;
    var networkChainId : string;
    var contractInfo : any = null;
    chainName = "";
    networkName = "";
    if(!chainId){chainId = parseInt(DEFAULT_CHAIN_INFO.chainId);}
    networkChainId = "";
    Object.entries(BLOCKCHAINS).map(chain => {
        chainName = chain[0];
        Object.entries(chain[1]).map(network => {
            networkName = network[0];
            networkChainId = network[1].chainId;
            if (parseInt(networkChainId) === chainId){
                contractInfo = network[1].nativeCurrency?.symbol;
            }
        });
    });
    return contractInfo;
}

export const useFindNetworkByChainId = (chainId) => {
    if(!chainId){chainId = parseInt(DEFAULT_CHAIN_INFO.chainId);}


    for (const [CHAIN, NETWORKS] of Object.entries(BLOCKCHAINS)) {
        for (const [NETWORK,NETWORK_DATA] of Object.entries(NETWORKS)) {
            if (parseInt(NETWORK_DATA.chainId) === parseInt(chainId)){
               return {chain:CHAIN,network:NETWORK,networkData:NETWORK_DATA}
            }
        }
    }
}


export function useFindDiamondByChainId(chainId) {
    var chainName : string;
    var networkName : string;
    var networkChainId : string;
    var contractInfo : any = null;
    chainName = "";
    networkName = "";
    if(typeof chainId === undefined){chainId =  parseInt(DEFAULT_CHAIN_INFO.chainId); }
    if(!chainId){chainId = parseInt(DEFAULT_CHAIN_INFO.chainId);}
    if(!isSupportedChain(chainId)){chainId = parseInt(DEFAULT_CHAIN_INFO.chainId);}
    networkChainId = "";


    Object.entries(BLOCKCHAINS).map(chain => {
        chainName = chain[0];
        Object.entries(chain[1]).map(network => {
            networkName = network[0];
            networkChainId = network[1].chainId;
            if (parseInt(networkChainId) === chainId){
                contractInfo = CONTRACT_ADRESSES[chainName][networkName];
                return true
            }
            return false;
        });
        return true;
    });
    return contractInfo;
}

export function useDiamondContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {

    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.MARKET, IMONDIAMOND_ABI.abi, withSignerIfPossible)
}

export function useIMONMarketContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {

    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.MARKET, IMON_MARKET_ABI.abi, withSignerIfPossible)
}


export function useExchangeContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.EXCHANGE, EXCHANGE_ABI.abi, withSignerIfPossible)
}

export function useOldExchangeContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.EXCHANGEOLD, EXCHANGE_ABI.abi, withSignerIfPossible)
}

export function useStakeContract(chainId?:any, withSignerIfPossible?:boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.STAKE, IMON_STAKE_ABI.abi, withSignerIfPossible)
}

export function useIntelliTradeContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.TRADE, INTELLITRADE_ABI.abi, withSignerIfPossible)
}

export function useCHILIMONContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.CHILIMON, CHILIMON_ABI.abi, withSignerIfPossible)
}

export function usePlinkoContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.PLINKO, PLINKO_ABI.abi, withSignerIfPossible)
}

export function useDomainContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.DOMAIN, DOMAIN_ABI.abi, withSignerIfPossible)
}

export function useBridgeContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.BRIDGE, IMONBRIDGE.abi, withSignerIfPossible)
}



export function useLaunchpadContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.LAUNCHPAD, IMON_LAUNCHPAD_ABI.abi, withSignerIfPossible)
}

export function useCHZINULaunchpadContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.CHZINULAUNCH, IMON_LAUNCHPAD_ABI.abi, withSignerIfPossible)
}

export function useCHZINUSECLaunchpadContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.CHZINULAUNCHSECOND, IMON_LAUNCHPAD_ABI.abi, withSignerIfPossible)
}

export function useCHILIZPEPELaunchpadContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.CHZPEPELAUNCH, IMON_LAUNCHPAD_ABI.abi, withSignerIfPossible)
}

export function useCHILIZPEPELaunchpadSecondContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.CHZPEPESECONDLAUNCH, IMON_LAUNCHPAD_ABI.abi, withSignerIfPossible)
}



export function useAngryHoopLaunchpadSecondContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.ANGRYHOOPLAUNCH, IMON_LAUNCHPAD_ABI.abi, withSignerIfPossible)
}

export function useTBTLaunchpadFirstContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.TBTLAUNCH_FIRST, IMON_LAUNCHPAD_ABI.abi, withSignerIfPossible)
}


export function useTBTLaunchpadSecondContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.TBTLAUNCH_SECOND, IMON_LAUNCHPAD_ABI.abi, withSignerIfPossible)
}

export function useTBTLaunchpadThirdContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.TBTLAUNCH_THIRD, IMON_LAUNCHPAD_ABI.abi, withSignerIfPossible)
}

export function useChilizShibaLaunchpadThirdContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.CHILIZ_SHIBA, IMON_LAUNCHPAD_ABI.abi, withSignerIfPossible)
}

export function useMRLLaunchpadContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.MRL_LAUNCH, IMON_LAUNCHPAD_ABI.abi, withSignerIfPossible)
}


export function useWWLaunchpadContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.WW_LAUNCH, IMON_LAUNCHPAD_ABI.abi, withSignerIfPossible)
}



export function useKEWLVestingContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.VESTING, KEWLVESTING_ABI.abi, withSignerIfPossible)
}


export function useKEWLPredictionContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.PREDICTIONS, PREDICTIONS_ABI.abi, withSignerIfPossible)
}



export function useIMONTokenContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.TOKEN, ERC20_ABI, withSignerIfPossible)
}


export function useFanTokenWrapperContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.FAN_TOKEN_WRAPPER, FANTOKEN_WRAPPER_ABI, withSignerIfPossible)
}


export function useMetamorphContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.METAMORPH, METAMORPH_TOKEN_ABI.abi, withSignerIfPossible)
}

export function useChiliatorGameContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.CHILIATOR, CHILIATOR_TOKEN_ABI.abi, withSignerIfPossible)
}
export function useJALASwapFactory(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    return useContract(CONTRACT_ADRESSES.CHZ.MAIN.JALASWAP_FACTORY, JALASWAP_FACTORY_ABI.abi, withSignerIfPossible)
}

export function useChilizSwapFactory(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    return useContract(CONTRACT_ADRESSES.CHZ.MAIN.CHILIZSWAP_FACTORY, JALASWAP_FACTORY_ABI.abi, withSignerIfPossible)
}

export function useKEWLMigratorContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.MIGRATOR, KEWLMIGRATOR.abi, withSignerIfPossible)
}

export function useKEWLListingContract(chainId?:any, withSignerIfPossible?: boolean): Contract | null {
    let contracts = useFindDiamondByChainId(chainId);
    return useContract(contracts?.LISTING, KEWLLISTING_ABI.abi, withSignerIfPossible)
}



export function useNFTLaunchpadContract() {
    const { account, provider } = useWeb3React()
    return useCallback(
        (address, withSignerIfPossible = true) => {
            if (!address || !IMON_NFT_LAUNCHPAD_ABI.abi || !provider) return null
            try {
                return getContract(
                    address,
                    IMON_NFT_LAUNCHPAD_ABI.abi,
                    provider,
                    withSignerIfPossible && account ? account : undefined
                )
            } catch (error) {
                console.log('Failed to get the contract:', error)
            }
        },
        [account, provider]
    )
}


export function useNFTSoccerGameContract() {
    const { account, provider } = useWeb3React()
    return useCallback(
        (address, withSignerIfPossible = true) => {
            if (!address || !NFT_SOCCER_GAMES_ABI.abi || !provider) return null
            try {
                return getContract(
                    address,
                    NFT_SOCCER_GAMES_ABI.abi,
                    provider,
                    withSignerIfPossible && account ? account : undefined
                )
            } catch (error) {
                console.log('Failed to get the contract:', error)
            }
        },
        [account, provider]
    )
}


export function useNFTDistributorContract() {
    const { account, provider } = useWeb3React()
    return useCallback(
        (address, withSignerIfPossible = true) => {
            if (!address || !IMON_NFT_DISTRIBUTOR_ABI.abi || !provider) return null
            try {
                return getContract(
                    address,
                    IMON_NFT_DISTRIBUTOR_ABI.abi,
                    provider,
                    withSignerIfPossible && account ? account : undefined
                )
            } catch (error) {
                console.log('Failed to get the contract:', error)
            }
        },
        [account, provider]
    )
}

export function useMoleContract() {
    const { account, provider } = useWeb3React()
    return useCallback(
        (address, withSignerIfPossible = true) => {
            if (!address || !MOLENFT.abi || !provider) return null
            try {
                return getContract(
                    address,
                    MOLENFT.abi,
                    provider,
                    withSignerIfPossible && account ? account : undefined
                )
            } catch (error) {
                console.log('Failed to get the contract:', error)
            }
        },
        [account, provider]
    )
}

export function useIMON404Contract() {
    const { account, provider } = useWeb3React()
    return useCallback(
        (address, withSignerIfPossible = true) => {
            if (!address || !IMON_404_TOKEN_ABI.abi || !provider) return null
            try {
                return getContract(
                    address,
                    IMON_404_TOKEN_ABI.abi,
                    provider,
                    withSignerIfPossible && account ? account : undefined
                )
            } catch (error) {
                console.log('Failed to get the contract:', error)
            }
        },
        [account, provider]
    )
}


export function useNFTContract() {
    const { account, provider } = useWeb3React()
    return useCallback(
        (address, withSignerIfPossible = true) => {
            if (!address || !IMONNFT_ABI.abi || !provider) return null
            try {
                return getContract(
                    address,
                    IMONNFT_ABI.abi,
                    provider,
                    withSignerIfPossible && account ? account : undefined
                )
            } catch (error) {
                console.log('Failed to get the contract:', error)
            }
        },
        [account, provider]
    )
}

export function useNFT1155Contract() {
    const { account, provider } = useWeb3React()
    return useCallback(
        (address, withSignerIfPossible = true) => {
            if (!address || !IMONNFT1155_ABI.abi || !provider) return null
            try {
                return getContract(
                    address,
                    IMONNFT1155_ABI.abi,
                    provider,
                    withSignerIfPossible && account ? account : undefined
                )
            } catch (error) {
                console.log('Failed to get the contract:', error)
            }
        },
        [account, provider]
    )
}


export function useNFT721Contract() {
    const { account, provider } = useWeb3React()
    return useCallback(
        (address, withSignerIfPossible = true) => {
            if (!address || !IMONNFT721_ABI.abi || !provider) return null
            try {
                return getContract(
                    address,
                    IMONNFT721_ABI.abi,
                    provider,
                    withSignerIfPossible && account ? account : undefined
                )
            } catch (error) {
                console.log('Failed to get the contract:', error)
            }
        },
        [account, provider]
    )
}


export function useStandardNFT721Contract() {
    const { account, provider } = useWeb3React()
    return useCallback(
        (address, withSignerIfPossible = true) => {
            if (!address || !STANDARD721_ABI || !provider) return null
            try {
                return getContract(
                    address,
                    STANDARD721_ABI,
                    provider,
                    withSignerIfPossible && account ? account : undefined
                )
            } catch (error) {
                console.log('Failed to get the contract:', error)
            }
        },
        [account, provider]
    )
}


export function useWETH9Contract() {
    const { account, provider } = useWeb3React()
    return useCallback(
        (address, withSignerIfPossible = true) => {
            if (!address || !WETH9_ABI.abi || !provider) return null
            try {
                return getContract(
                    address,
                    WETH9_ABI.abi,
                    provider,
                    withSignerIfPossible && account ? account : undefined
                )
            } catch (error) {
                console.log('Failed to get the contract:', error)
            }
        },
        [account, provider]
    )
}
