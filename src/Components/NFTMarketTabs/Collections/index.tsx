import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { Route as ReactRoute, NavLink, useNavigate } from 'react-router-dom';
import useDebounce from '../../../hooks/useDebounce';
import { useIMONMarketContract, useNFT721Contract } from '@/hooks/useContract';
import { MarketNFTItem } from '@/Components/MarketNFTItem';

const _NFT_MARKET_COLLECTION_TAB = (props: { viewMode: any, className: any }) => {

    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useIMONMarketContract(chainId, true);
    const [collections, setCollections] = useState([])

    const [isLoaded, setIsLoaded] = useState(false)
    const debounceChainId = useDebounce(chainId, 1000)

    const NFTContract = useNFT721Contract();
    const navigate = useNavigate();

    const initDefaults = async () => {
        try {
            setIsLoaded(false)
            if (!IMONDIAMOND) { return; }
            const allCollections = await IMONDIAMOND.fetchCollections();

            const updatedCollections = await Promise.all(allCollections.slice().reverse().map(async (collection: any) => {
                const collectionItems = await IMONDIAMOND.fetch(collection.collectionId);

                const nftContract = await NFTContract(collection.collection);
                const collectionName = await nftContract.name();

                let floorPrice = ethers.constants.MaxUint256;
                let itemsCount = 0;
                const liveItems = collectionItems.filter((collectionItem: any) => {
                    if (collectionItem.is_cancelled === false && collectionItem.is_completed === false) {
                        if (floorPrice.gte(collectionItem.price_per_token)) {
                            floorPrice = collectionItem.price_per_token;
                        }
                        itemsCount += BigNumber.from(collectionItem.remaining_amount).toNumber();
                    }
                    return collectionItem.is_cancelled === false && collectionItem.is_completed === false;
                }).slice().reverse().slice(0, 1);

                if (!Object.isExtensible(collection)) {
                    return { ...collection, name: collectionName, items: liveItems, floorPrice: floorPrice, itemsCount: itemsCount };
                }


                collection.items = liveItems;
                return collection;
            }));

            const sortedCollections = updatedCollections.sort((a, b) => b.itemsCount - a.itemsCount);
            console.log("sortedCollections", sortedCollections)
            setCollections(sortedCollections)
            setIsLoaded(true)
        } catch (e) {
            setIsLoaded(false)
        }
    }

    useEffect(() => {
        setIsLoaded(false)
        setCollections([])
        if (chainId !== debounceChainId) {
            return
        }
        if (!connector) {
            return
        }
        if (!provider) {
            return
        }
        if (!chainId) {
            return
        }
        if (!IMONDIAMOND) {
            return
        }
        if (chainId) {
            initDefaults();
        }
    }, [debounceChainId, account])

    return (
        <div className={"w-full " + props.className}>


{collections.length > 0 &&
  collections.map((collection: any, index: number) =>
    collection.items.length > 0 &&
    collection.items.map((item: any, itemIndex: number) => (
      <MarketNFTItem
        viewMode={props.viewMode}
        collectionInfo={collection}
        key={`nftItem${collection.collection}${itemIndex}`}
        hidePrice
        item={item}
        itemType={item.assetType === 3 ? "ERC-1155" : "ERC-721"}
        contractAddress={item.contract_address}
        tokenId={item.tokenId}
      />
    ))
  )}
        </div>
    );
}
export const NFT_MARKET_COLLECTION_TAB = memo(_NFT_MARKET_COLLECTION_TAB)

