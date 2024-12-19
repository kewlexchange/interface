import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { ETHER_ADDRESS, TradeType } from "../../../constants/misc";
import { BigNumber, ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import JSBI from "jsbi";
import moment from "moment";
import { Route as ReactRoute, NavLink } from "react-router-dom";
import {
    ChainId,
    DEFAULT_BITCI_CHAIN_NFT_URL,
    DEFAULT_CHAIN_NFT_URL,
    isSupportedChain,
} from "../../../constants/chains";
import {
    WETH9,
    Token,
    CurrencyAmount,
    Pair,
    Price,
    Trade,
    Currency,
    Percent,
    Route,
} from "../../../entities";
import {
    useDiamondContract,
    useExchangeContract,
    useERC20Contract,
    usePAIRContract,
    useDomainContract,
    useNFT1155Contract,
    useNFT721Contract,
    useStandardNFT721Contract,
} from "../../../hooks/useContract";
import useModal, {
    ModalNoProvider,
    ModalSelectToken,
    ModalConnect,
    ModalError,
    ModalLoading,
    ModalSuccessTransaction,
    ModalInfo,
} from "../../../hooks/useModals";
import { useAppDispatch, useAppSelector } from "../../../state/hooks";
import { useFetchAllTokenList } from "../../../state/user/hooks";
import {
    getNativeCurrencyByChainId,
    parseFloatWithDefault,
} from "../../../utils";
import { DoubleCurrencyIcon } from "../../DoubleCurrency";
import UniwalletModal from "../../Modal/UniwalletModal";
import {
    updateSelectedWallet,
    updateUserDeadline,
    updateUserSlippageTolerance,
} from "../../../state/user/reducer";
import { Button } from "@nextui-org/react";
import { formatEther } from "@ethersproject/units";
import { getChainInfoOrDefault } from "../../../constants/chainInfo";
import { DomainItem } from "../../DomainItem";
import useBlockNumber from "../../../hooks/useBlockNumber";
import { hexZeroPad } from "ethers/lib/utils";
import { NFT } from "../../NFT";
import { AccountNFTItem } from "../../AccountNFTItem";
import { MORALIS_API_KEY } from "../../../constants/ai";

const _DOMAIN_MY_DOMAINS = () => {
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

        const [_domains, _price, domainContract] = await DOMAINS.getTLDS();

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



    const fetchNFTsMoralis = async ()=>{
        const [tldEntries, pricePerYear, domainContract] = await DOMAINS.getTLDS();

        var _userNFTAssets = [];
        if(!account){
            return
        }
        let url = ""
        if(chainId === ChainId.CHILIZ_SPICY_TESTNET){
            url = `https://deep-index.moralis.io/api/v2.2/${account}/nft?chain=chiliz%20testnet&format=decimal&media_items=false`
        }else if (chainId === ChainId.CHILIZ_MAINNET){
            url = `https://deep-index.moralis.io/api/v2.2/${account}/nft?chain=chiliz&format=decimal&media_items=false`
        }else if (chainId === ChainId.ARBITRUM_ONE){
            url = `https://deep-index.moralis.io/api/v2.2/${account}/nft?chain=arbitrum&format=decimal&media_items=false`
        }else{
            return;
        }
        const options = {
            method: 'GET', // or 'POST', 'PUT', etc.
            headers: {
              'X-Moralis-Application-Id': "IMON",
              'X-API-Key': MORALIS_API_KEY,
              'Content-Type': 'application/json',
            },
          };
        fetch(url, options)
        .then(response => response.json())
        .then(data => {
            if(!data){return}

            console.log("API_ REUSLTS",data)
            for (const token of data.result) {
    
                if (ethers.utils.getAddress(token.token_address) === ethers.utils.getAddress(domainContract)) {
                    _userNFTAssets.push({ name: "IMON Domains", contract: domainContract, id: token.token_id, type: 'ERC-721' })
                }
            }
         
            setUserNFTAssets(_userNFTAssets);
            set721AssetsLoaded(true)
        })
        .catch(error => console.error('Error:', error));
        }
    const fetchUserNFTs = async () => {
        const [tldEntries, pricePerYear, domainContract] = await DOMAINS.getTLDS();
        var _userNFTAssets = [];
        setStatusMessage("Connecting to Routescan...")
        let chainType = ""
        if(chainId === ChainId.CHILIZ_MAINNET){
            chainType = "mainnet"
        }else if(chainId === ChainId.CHILIZ_SPICY_TESTNET){
            chainType = "testnet"
        }
        const urlAddress = `https://api.routescan.io/v2/network/${chainType}/evm/${chainId}/etherscan/api?module=account&action=addresstokennftinventory&address=${account}&contractaddress=${domainContract}&page=1&offset=100&apikey=chiliz`
        const request = await fetch(urlAddress);
        const response = await request.json();
        if (response?.status === "1") {
            setStatusMessage("Connected... Fetching Domains...")
            response.result.map((tokenItem, tokenIndex) => {
                if (tokenItem.TokenAddress === domainContract) {
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
        } else if ([ChainId.CHILIZ_MAINNET, ChainId.CHILIZ_SPICY_TESTNET].includes(chainId))  {
            fetchUserNFTs()
        }else if ([ChainId.ARBITRUM_ONE].includes(chainId))  {
            fetchNFTsMoralis()
        }

    }

    useEffect(() => {
        fetchAssets();
    }, [provider, DOMAINS, account, chainId])
    return (
        <>
            <ModalInfo
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading
                text={"Waiting for confirmation..."}
                isClosable={true}
                hide={toggleLoading}
                isShowing={isShowLoading}
            />
            <ModalSuccessTransaction
                transaction={transaction}
                hide={toggleTransactionSuccess}
                isShowing={isTransactionSuccess}
            />

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



                    <div className={"w-full col-span-2"}>

                        {
                            userNFTAssets.length > 0 ? <>
                                <div className={"grid grid-cols-1 gap-2"}>
                                    {
                                        userNFTAssets.length > 0 && userNFTAssets.slice().reverse().map((nftItem, index) => {
                                            return ["ERC-1155", "ERC-721"].includes(nftItem["type"]) && nftItem["id"] && <AccountNFTItem reloadFunction={fetchAssets} showMetadata={true} canSell={true} key={`nftItemIndex${index}`} itemType={nftItem.type} contractAddress={nftItem.contract} tokenId={nftItem.id} />
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

        </>
    );
};
export const DOMAIN_MY_DOMAINS = memo(_DOMAIN_MY_DOMAINS);
