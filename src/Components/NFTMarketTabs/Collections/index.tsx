import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ETHER_ADDRESS, TradeType } from '../../../constants/misc';
import { BigNumber, ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import moment from 'moment';
import { Route as ReactRoute, NavLink, useNavigate } from 'react-router-dom';
import { ChainId, isSupportedChain } from '../../../constants/chains';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract, useStakeContract, useDomainContract, useIMONMarketContract, useNFT721Contract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalInfo, ModalSelectExchangePair } from '../../../hooks/useModals';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { useFetchAllTokenList } from '../../../state/user/hooks';
import { getAssetIconByChainIdFromTokenList, getNativeCurrencyByChainId, parseFloatWithDefault, unixTimeToDateTime } from '../../../utils';
import { Accordion, AccordionItem, Avatar, Button, Card, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import { formatEther, formatUnits, parseEther, parseUnits } from '@ethersproject/units';
import { Pair, WETH9 } from '../../../entities';
import { DoubleCurrencyIcon } from '../../DoubleCurrency';
import { MarketNFTItem } from '../../MarketNFTItem';
import useDebounce from '../../../hooks/useDebounce';

const _NFT_MARKET_COLLECTION_TAB = () => {
   
    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useIMONMarketContract(chainId, true);
    const [collections, setCollections] = useState([])
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const [isLoaded, setIsLoaded] = useState(false)
    const debounceChainId = useDebounce(chainId, 1000)

    const NFTContract = useNFT721Contract();
    const navigate = useNavigate();

    const initDefaults = async () => {
        try {
            setIsLoaded(false)
            if (!IMONDIAMOND) { return; }
            const allCollections = await IMONDIAMOND.fetchCollections();

            const updatedCollections = await Promise.all(allCollections.slice().reverse().map(async (collection) => {
                const collectionItems = await IMONDIAMOND.fetch(collection.collectionId);

                const nftContract = await NFTContract(collection.collection);
                const collectionName = await nftContract.name();

                let floorPrice = ethers.constants.MaxUint256;
                let itemsCount = 0;
                const liveItems = collectionItems.filter(collectionItem => {
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

            setCollections(sortedCollections)
            setIsLoaded(true)
        } catch (e) {
            setIsLoaded(false)
        }
    }

    useEffect(() => {
        setIsLoaded(false)
        setCollections([])
        console.log("DEB", chainId, "DEB2", debounceChainId)
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
        <Table
        removeWrapper
        isHeaderSticky
        color={"default"}
        disallowEmptySelection
        selectionMode="single"
        topContentPlacement="outside"
        aria-label="Example static collection table"
        onRowAction={(key) => {
            navigate(key);
        }

        }


    >
        <TableHeader>
            <TableColumn>Collection</TableColumn>
            <TableColumn>Floor Price</TableColumn>
            <TableColumn>Volume</TableColumn>
            <TableColumn>Available Items</TableColumn>
        </TableHeader>
        <TableBody
            emptyContent={isLoaded ? "No NFTs Found!" : "Loading... Please Wait!"}
            isLoading={!isLoaded}
            items={collections ? collections : []}
            loadingContent={<Spinner color="default" />}
            className="flex flex-col gap-2">
            {(collection) => (
                collection.items.length > 0 &&
                <TableRow key={`/nfts/${collection.collectionId}`}>
                    <TableCell>
                        <div className="flex flex-row gap-2 items-center justify-start">
                            {
                                collection.items.length > 0 && collection.items.map((item, index) => {

                                    return (
                                        <div key={`nftImage${index}`} className="w-full max-w-[64px] max-h-[64px]">
                                            <MarketNFTItem hidePrice={true} item={item} key={`nftItem${collection.collection}${index}`} itemType={item.assetType == 3 ? "ERC-1155" : "ERC-721"} contractAddress={item.contract_address} tokenId={item.tokenId} />
                                        </div>

                                    )

                                })
                            }
                            <span>{collection.name}</span>
                        </div>

                    </TableCell>
                    <TableCell>{formatEther(collection.floorPrice)} {getNativeCurrencyByChainId(chainId)}</TableCell>
                    <TableCell>{formatEther(collection.totalVolume)} {getNativeCurrencyByChainId(chainId)}</TableCell>
                    <TableCell>{collection.itemsCount}</TableCell>

                </TableRow>
            )}

        </TableBody>
    </Table>
    );
}
export const NFT_MARKET_COLLECTION_TAB = memo(_NFT_MARKET_COLLECTION_TAB)

