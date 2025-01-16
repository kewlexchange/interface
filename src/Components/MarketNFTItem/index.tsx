import React, { memo, useEffect, useMemo, useState } from 'react';
import ContentLoader from "react-content-loader"
import { useDiamondContract, useNFT1155Contract, useNFT721Contract } from "../../hooks/useContract";
import { deriveUniconAttributeIndices } from "../Unicon/utils";
import { NavLink } from "react-router-dom";
import useModal, { ModalError, ModalLoading, ModalNoProvider, ModalSellNFT, ModalSuccessTransaction } from "../../hooks/useModals";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "@ethersproject/bignumber";
import { formatEther } from "ethers/lib/utils";
import { getNativeCurrencyByChainId, isValidJSONObject, isValidJSONString, isValidURL, uriToHttp, uriToIMONProxy } from "../../utils";
import { ethers } from "ethers";
import {Button, Card, CardFooter, CardHeader, Image, Link, Skeleton} from "@nextui-org/react";
import { parseMetadata } from '../../utils/metadata';

const _MarketNFTItem = (props: { isActive?, item, contractAddress, tokenId, itemType, hidePrice? }) => {
    const [isLoaded, setLoaded] = useState(false);
    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const [svgImage, setSVGImage] = useState(null)
    const nftImage = useMemo(() => svgImage, [svgImage])
    const IMON_NFTContract = (props.itemType == "ERC-1155" ? useNFT1155Contract() : useNFT721Contract());
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isSell, toggle: toggleSell } = useModal();

    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const [isLocked, setLocked] = useState(false)
    const [isSVGImage, setIsSVGImage] = useState(false);
    const [metadata, setMetadata] = useState(null)


 

    const fetchImage = async () => {
        if (!props.tokenId) { return; }
        const NFTContract = await IMON_NFTContract(props.contractAddress, true);
        if (!ethers.utils.isAddress(NFTContract.address)) {
            return;
        }

        const assetURI = props.itemType === "ERC-1155" ? await NFTContract.uri(props.tokenId) : await NFTContract.tokenURI(props.tokenId)
        if (account) {
            const _hasAllowance = await NFTContract.isApprovedForAll(account, IMONDIAMOND.address);
            setLocked(_hasAllowance)
        }


        const parsedMetadata = await parseMetadata(props.contractAddress,props.tokenId,assetURI);        
        setMetadata(parsedMetadata?.metadata)
        setSVGImage(parsedMetadata?.image)
        setLoaded(parsedMetadata?.success)
        setIsSVGImage(parsedMetadata?.is_embedded);
            

        
    }
    useEffect(() => {
        if (!provider) { return; }
        if (!chainId) { return; }
        if (props.contractAddress) {
            fetchImage();
        }
    }, [props.contractAddress])
    // @ts-ignore
    return (
        <>   
            <Image
            alt="Intelligent Monsters"
            className="z-0 w-full min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px] object-fit"
            src={nftImage}
        />
            
      
            
        </>
    );
}
export const MarketNFTItem = memo(_MarketNFTItem)

