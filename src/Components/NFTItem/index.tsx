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
import {Button, Card, CardBody, CardFooter, CardHeader, Image, Link, Skeleton} from "@nextui-org/react";
import { parseMetadata } from '../../utils/metadata';

const _NFTItem = (props: { isActive?, item, contractAddress, tokenId, itemType, hidePrice? }) => {
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
            <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />
            <ModalError
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading} isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess} isShowing={isTransactionSuccess} />


    
    
            
                <div className={(props.isActive ? "bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-pink-900 via-pink-100 to-pink-960 p-2 " : " ") + "  overflow-hidden w-full h-full min-h-[160px] flex flex-col rounded-xl hover:bg-white/30"}>
                <Card isFooterBlurred>
                    <CardBody  className="w-full z-0 h-full overflow-hidden">
            
                        <Image
                        removeWrapper
                        isBlurred
                        isZoomed
                        alt="Intelligent Monsters"
                        className="z-0 w-full h-full object-cover"
                        src={nftImage}
                    />
                  
                    </CardBody>
                    {
                        !props.hidePrice &&  <CardFooter className="absolute bg-white/30 bottom-0 flex flex-row items-center border-t-1 border-zinc-100/50 z-10 justify-between">
                        <div>
                        <p className="text-black text-tiny">
                        <span className={"whitespace-nowrap sm:text-xs"} translate={"no"}>Price : {formatEther(props.item.price_per_token)} {getNativeCurrencyByChainId(chainId)}</span>
                        </p>
                        <p className="text-black text-tiny">
                            <span className={"sm:text-xs sm:text-right"} translate={"no"}>Quantity : {BigNumber.from(props.item.remaining_amount).toNumber()}</span>
                        </p>
                        </div>
                        <Button as={NavLink} to={`/nfts/${props.item.collectionId}/${props.item.itemId}`} className="text-tiny text-white bg-black/20" color="default" variant='flat' radius="full" size="sm">
                            View
                        </Button>
                    </CardFooter>
                    }
              
                </Card>   
                </div>
            
        </>
    );
}
export const NFTItem = memo(_NFTItem)

