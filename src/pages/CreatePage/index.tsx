import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { ethers } from "ethers";
import useFilePreview from "../../hooks/useFilePreview";
import { useWeb3React } from "@web3-react/core";
import {
    useDiamondContract,
    useNFT1155Contract,
    useNFT721Contract,
    useStandardNFT721Contract
} from "../../hooks/useContract";
import {convertToBase64,utf8ToBase64,uriToHttp,convertURLToIPFS} from "../../utils/index"
import useModal, {ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction} from "../../hooks/useModals";
import Moralis from "moralis";
import {EvmChain} from "@moralisweb3/common-evm-utils";
import { NFT_MARKET_COLLECTION_TAB } from "../../Components/NFTMarketTabs/Collections";
import { NFT_MARKET_CREATECOLLECTION_TAB } from "../../Components/NFTMarketTabs/CreateCollection";

const CreatePage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId,true);
    const {state:isTransactionSuccess, toggle:toggleTransactionSuccess } = useModal();
    const {state:isShowLoading, toggle:toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({hash: '',summary: '',error: null})
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const [statusText,setStatusText] = useState("Waiting for confirmation...")

   
    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);
    return (

   <>
    <NFT_MARKET_CREATECOLLECTION_TAB/>
   </>
    )
}


export default CreatePage;

