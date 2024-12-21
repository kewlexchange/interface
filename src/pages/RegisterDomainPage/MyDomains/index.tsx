import IPage from "@/interfaces/page";
import React, { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getNativeCurrencyByChainId, getNFTAPIURLByChainId } from "@/utils";
import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "ethers";
import BG_IMAGE from "@/assets/images/covers/account.jpeg"
import Identicon from "@/Components/Identicon";
import { useWeb3React } from "@web3-react/core";
import { Unicon } from "@/Components/Unicon";
import { updateSelectedWallet } from "@/state/user/reducer";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { NFT } from "@/Components/NFT";
import {
    useDiamondContract,
    useNFT1155Contract,
    useNFT721Contract,
    useStandardNFT721Contract
} from "@/hooks/useContract";
import useModal from "@/hooks/useModals";
import { AbiCoder, hexZeroPad } from "ethers/lib/utils";
import useBlockNumber from "@/hooks/useBlockNumber";
import { log } from "util";
import { DEFAULT_BITCI_CHAIN_NFT_URL, DEFAULT_CHAIN_ASSETS_URL, DEFAULT_CHAIN_NFT_URL } from "@/constants/chains";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import Moralis from "moralis/.";
import { MORALIS_API_KEY } from "../../../constants/ai";
import { useDomainContract } from "../../../hooks/useContract";
import { ChainId } from "../../../constants/chains";
import { DomainItem } from "../../../Components/DomainItem";

const MyDomainsPage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const dispatch = useAppDispatch()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isSell, toggle: toggleSell } = useModal();
    const blockNumber = useBlockNumber()
    const [activeTab, setActiveTab] = useState(0)

    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])

    const IMON_1155NFTContract = useNFT1155Contract()
    const IMON_721NFTContract = useNFT721Contract();
    const STANDARD_721NFTContract = useStandardNFT721Contract();

    const [is721AssetsLoaded, set721AssetsLoaded] = useState(false);
    const [userNFTAssets, setUserNFTAssets] = useState([])
    const [statusMessage, setStatusMessage] = useState("Initializing...");
    const DOMAINS = useDomainContract(chainId, true)

    const disconnect = useCallback(() => {
        if (connector && connector.deactivate) {
            connector.deactivate()
        }
        connector.resetState()
        dispatch(updateSelectedWallet({ wallet: undefined }))
    }, [connector, dispatch])

    const handleDisconnect = () => {
        disconnect();
    }



    const fetchBalances = async () => {
        var _userNFTAssets = [];
        var erc1155Tokens = [];
        var erc721Tokens = [];

        const userAccount = account
        setStatusMessage("Loading NFTs...")
        const _defaultNFTs = await (
            await fetch(
                chainId === 88888 ? DEFAULT_CHAIN_NFT_URL : DEFAULT_BITCI_CHAIN_NFT_URL
            )
        ).json();
        const defaultNFTList = _defaultNFTs.nfts;

        const [_domains, _price,domainContract] = await DOMAINS.getTLDS();

        erc721Tokens.push({ name: "KEWL Name Servers", address: domainContract })

        const imon721TokenIDList = [];

        await Promise.all(erc721Tokens.map(async (token) => {
            const erc721Contract = await STANDARD_721NFTContract(token.address);
            setStatusMessage(`${token.name} ${token.address} is loading...`)
            const logs = await provider.getLogs({
                fromBlock: 0,
                toBlock: blockNumber,
                address: erc721Contract.address,
                topics: [[
                    ethers.utils.id("Transfer(address,address,uint256)"),
                    null,
                    hexZeroPad(userAccount, 32)]]
            })
            for await (const log of logs) {
                try {
                    const parsedLog = erc721Contract.interface.parseLog(log);
                    if (parsedLog.name === "Transfer") {
                        if (ethers.utils.getAddress(parsedLog.args.to.toString()) == ethers.utils.getAddress(userAccount)) {
                            const tokenId = `${parsedLog.args.tokenId}`;
                            const ownerOf = await erc721Contract.ownerOf(tokenId);
                            if (ethers.utils.getAddress(ownerOf) === ethers.utils.getAddress(userAccount)) {
                                _userNFTAssets.push({ name: token.name, contract: token.address, id: tokenId, type: 'ERC-721' })
                            }
                        }
                    }
                } catch (exception) {
                }
            }
        }));
        set721AssetsLoaded(true)


   
        setUserNFTAssets(_userNFTAssets);
    }

    const fetchUserNFTs = async() => {
        const [tldEntries,pricePerYear,domainContract] = await DOMAINS.getTLDS();
        var _userNFTAssets = [];
        setStatusMessage("Connecting to Routescan...")
        const urlAddress = `https://api.routescan.io/v2/network/mainnet/evm/${chainId}/etherscan/api?module=account&action=addresstokennftinventory&address=${account}&contractaddress=${domainContract}&page=1&offset=100&apikey=chiliz`
        const request = await fetch(urlAddress);
        const response = await request.json();
        if(response?.status === "1"){
            setStatusMessage("Connected... Fetching Domains...")
            response.result.map((tokenItem,tokenIndex)=>{
                if(tokenItem.TokenAddress === domainContract){
                    _userNFTAssets.push({ name: "CHZ Domains", contract: domainContract, id: tokenItem.TokenId, type: 'ERC-721' })
                }
            })
            setUserNFTAssets(_userNFTAssets);

        }
        setStatusMessage("NFTs Loaded Successfuly...")
        set721AssetsLoaded(true)
    }

    const fetchAssets = async () => {
        if (!account) { return; }
        setUserNFTAssets([]);
        set721AssetsLoaded(false);
        if ([ChainId.BITCI, ChainId.BITCI_TEST,ChainId.ABSTRACT_TESTNET].includes(chainId)) {
            fetchBalances();
        }else{
            fetchUserNFTs()
        }
        
    }

    useEffect(() => {
        fetchAssets();
    }, [provider,DOMAINS,account, chainId])
    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);
    return (

        <>
         

            <div className={"container mx-auto my-5 swap"}>

                <div className={"mx-auto w-[38%] sm:w-full"}>




                    <div className={"grid grid-cols-1 gap-5"}>
                        <div className={"border flex gap-2 flex-col  border-1 rounded-xl p-2 w-full content-background"}>
                       
                            <div className="w-full max-w-full">
                                <div className="block overflow-hidden">
                                <nav>
                                        <div role="tablist" className="flex flex-row gap-2 w-full relative p-1 h-10 w-auto  nav-border bg-white shadow-2xl shadow-blue-gray-500/40">
                                           
                                <NavLink to={"/cns"} role="tab" className={   ("" ) + " rounded-full grid place-items-center px-2 min-w-[100px] text-center h-full relative bg-transparent antialiased font-sans text-base leading-relaxed select-none cursor-pointer p-0 font-normal"} data-value="react">
                                                <div className="z-20 flex items-center justify-center">
                                                    <span translate={"no"} className="material-symbols-outlined">
                                                    app_registration
                                                    </span>
                                                    <span translate={"no"}>Register</span>
                                                </div>
                                              
                                            </NavLink>
                                            <NavLink to={"/cns/domains"} onClick={() => {
                                             
                                            }} role="tab" className={ ( "bg-gradient text-white shadow") +" rounded-full grid place-items-center px-2 min-w-[100px] text-center h-full relative bg-transparent antialiased font-sans text-base leading-relaxed select-none cursor-pointer p-0 font-normal"} data-value="html">
                                                <div className="z-20 flex items-center justify-center">
                                                    <span translate={"no"} className="material-symbols-outlined">
                                                    grain
                                                    </span>
                                                    <span translate={"no"}>My Names</span>
                                                </div>
                       
                                            </NavLink>
                                            <NavLink to={"/cns/manage"} onClick={() => {
                                             
                                            }} role="tab" className={ ( "") +" rounded-full grid place-items-center px-2 min-w-[100px] text-center h-full relative bg-transparent antialiased font-sans text-base leading-relaxed select-none cursor-pointer p-0 font-normal"} data-value="html">
                                                <div className="z-20 flex items-center justify-center">
                                                    <span translate={"no"} className="material-symbols-outlined">
                                                    deployed_code_account
                                                    </span>
                                                    <span translate={"no"}>Manage</span>
                                                </div>
                       
                                            </NavLink>
                                            </div>
                                            </nav> 
                                </div>
                               
                            </div>
                           
                            <div className="w-full">
                            <div className={"w-full"}>
                                   
                                            

                                            {
                                                is721AssetsLoaded ? <>
                                                    {
                                                        userNFTAssets.length === 0 && <div className={"w-full flex flex-col items-center justify-center"}>
                                                            <span className={"text-2xl"}>No NFTs found!</span>
                                                        </div>
                                                    }
                                                </> : <>
                                                    <div className={"w-full flex flex-col start-center justify-start"}>
                                                        <span className={"text-2xl"}>Please wait...</span>
                                                        <span className={"text-xs whitespace-wrap"}>{statusMessage}</span>
                                                    </div>
                                                </>
                                            }
                                       
                                    </div>
                            </div>

                           
                        
                                <div className="w-full">
                                
                                    <div className={"w-full text-center"}>



                                        <div className={"w-full col-span-2 p-2"}>

                                            {
                                                userNFTAssets.length > 0 ? <>
                                                    <div className={"grid grid-cols-1 gap-2"}>
                                                        {
                                                            userNFTAssets.length > 0 && userNFTAssets.slice().reverse().map((nftItem, index) => {
                                                                return ["ERC-1155", "ERC-721"].includes(nftItem["type"]) && nftItem["id"] && <NFT reloadFunction={fetchAssets} showMetadata={true} canSell={true} key={`nftItemIndex${index}`} itemType={nftItem.type} contractAddress={nftItem.contract} tokenId={nftItem.id} />
                                                            })
                                                        }
                                                    </div>
                                                </> :
                                                    <>


                                                    </>


                                            }

                                        </div>

                                    </div>
                                </div>
                           



                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}


export default MyDomainsPage;
