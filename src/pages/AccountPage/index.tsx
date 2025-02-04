import IPage from "../../interfaces/page";
import React, { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getNativeCurrencyByChainId, getNFTAPIURLByChainId } from "../../utils";
import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "ethers";
import BG_IMAGE from "../../assets/images/covers/account.jpeg"
import Identicon from "../../Components/Identicon";
import { useWeb3React } from "@web3-react/core";
import { Unicon } from "../../Components/Unicon";
import { updateSelectedWallet } from "../../state/user/reducer";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { NFT } from "../../Components/NFT";
import {
    useDiamondContract,
    useNFT1155Contract,
    useNFT721Contract,
    useStandardNFT721Contract
} from "../../hooks/useContract";
import useModal from "../../hooks/useModals";
import { AbiCoder, hexZeroPad } from "ethers/lib/utils";
import useBlockNumber from "../../hooks/useBlockNumber";
import { ChainId, DEFAULT_BITCI_CHAIN_NFT_URL, DEFAULT_CHAIN_ASSETS_URL, DEFAULT_CHAIN_NFT_URL } from "../../constants/chains";
import { MORALIS_API_KEY } from "../../constants/ai";
import { useFetchAllTokenList } from "../../state/user/hooks";
import { TokenBalances } from "../../Components/AccountTabs/TokenBalances";
import { NFTBalances } from "../../Components/AccountTabs/NFTBalances";
import { WrapTab } from "../../Components/AccountTabs/WrapUnwrap";
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Tab, Tabs } from "@nextui-org/react";

const AccountPage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const dispatch = useAppDispatch()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isSell, toggle: toggleSell } = useModal();
    const blockNumber = useBlockNumber()
    const [activeTab, setActiveTab] = useState(0)
    useFetchAllTokenList(chainId, account)
    const navigate = useNavigate();

    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])

    const disconnect = useCallback(() => {
        if (connector && connector.deactivate) {
            connector.deactivate()
        }
        connector.resetState()
        dispatch(updateSelectedWallet({ wallet: undefined }))
    }, [connector, dispatch])

    const handleDisconnect = async () => {
        disconnect();
        navigate('/');


    }

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);

    useEffect(()=>{
        
    },[
        account,chainId
    ])
    return (
        <>
            <div className={"w-full px-2 py-5"}>
                <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5 my-5"}>

                     <Tabs
                     disableAnimation
                     radius="lg" 
                     fullWidth 
                     classNames={{
                         base: "w-full",
                         tabList: [
                             "relative",
                             "bg-white/[0.01] dark:bg-black/[0.01]",
                             "backdrop-blur-xl",
                             "border border-violet-500/10",
                             "p-1",
                             "rounded-2xl",
                             "flex",
                             "gap-1"
                         ].join(" "),
                         cursor: "hidden",
                         tab: [
                             "flex-1",
                             "h-9",
                             "px-4",
                             "rounded-xl",
                             "flex items-center justify-center",
                             "gap-2",
                             "text-xs font-medium",
                             "text-violet-600/50 dark:text-violet-400/50",
                             "group",
                             "relative",
                             "overflow-hidden",
                             "transition-all duration-200",
                             "data-[selected=true]:bg-violet-500/[0.02] dark:data-[selected=true]:bg-violet-400/[0.02]",
                             "data-[selected=true]:backdrop-blur-xl",
                             "data-[selected=true]:text-violet-500 dark:data-[selected=true]:text-violet-400",
                             "before:absolute",
                             "before:inset-0",
                             "before:rounded-xl",
                             "before:opacity-0",
                             "before:pointer-events-none",
                             "before:z-[-1]",
                             "data-[selected=true]:before:opacity-100",
                             "before:bg-gradient-to-r",
                             "before:from-violet-500/0",
                             "before:via-violet-500/[0.07]",
                             "before:to-violet-500/0",
                             "before:transition-opacity",
                             "data-[selected=true]:before:animate-shimmer",
                             "before:bg-[length:200%_100%]",
                             "hover:bg-violet-500/[0.01] dark:hover:bg-violet-400/[0.01]",
                             "hover:text-violet-500/70"
                         ].join(" "),
                         tabContent: "relative z-10",
                         panel: "pt-4"
                     }}
                     aria-label="Swap Tabs">
                        <Tab key="tokens" title="Tokens">
                            <TokenBalances account={account}/>
                        </Tab>
                        <Tab key="nfts" title="NFTs">
                            <NFTBalances account={account}/>
                        </Tab>
                        <Tab key="wchz" title="KCHZ">
                            <WrapTab account={account}/>
                        </Tab>
                    </Tabs>
           

             
                </div>
            </div>

        </>
    )
}


export default AccountPage;