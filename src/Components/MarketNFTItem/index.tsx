import React, { memo, useEffect, useMemo, useState } from 'react';
import { useDiamondContract, useNFT1155Contract, useNFT721Contract } from "../../hooks/useContract";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "@ethersproject/bignumber";
import { formatEther } from "ethers/lib/utils";
import { ethers } from "ethers";
import { Button, Card, CardFooter, CardHeader, Image, Link, Skeleton } from "@nextui-org/react";
import { parseMetadata } from '../../utils/metadata';
import { NFTCard } from '../NFTCard';

const _MarketNFTItem = (props: {viewMode?,collectionInfo?, isActive?, item, contractAddress, tokenId, itemType, hidePrice?}) => {
    const [isLoaded, setLoaded] = useState(false);
    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const [svgImage, setSVGImage] = useState(null)
    const nftImage = useMemo(() => svgImage, [svgImage])
    const IMON_NFTContract = (props.itemType == "ERC-1155" ? useNFT1155Contract() : useNFT721Contract());

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


        const parsedMetadata = await parseMetadata(props.contractAddress, props.tokenId, assetURI);
        setMetadata(parsedMetadata?.metadata)
        setSVGImage(parsedMetadata?.image)
        setLoaded(parsedMetadata?.success)
        setIsSVGImage(parsedMetadata?.is_embedded);

        console.log("parsedMetadata",parsedMetadata)



    }
    useEffect(() => {
        console.log("props.contractAddress",props.contractAddress)
        if (!provider) { return; }
        if (!chainId) { return; }
        if (props.contractAddress) {
            fetchImage();
        }
    }, [props.contractAddress])
    // @ts-ignore
    return (
        <>
      <NFTCard 
                  key={props.collectionInfo.id} 
                  collection={props.collectionInfo}
                  viewMode={props.viewMode}
                  image={nftImage}
                />
        



        </>
    );
}
export const MarketNFTItem = memo(_MarketNFTItem)

