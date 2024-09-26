import React, { memo, useEffect, useMemo, useState } from 'react';
import ContentLoader from "react-content-loader"
import { useWeb3React } from "@web3-react/core";
import { useDiamondContract, useNFT1155Contract, useNFT721Contract, useNFTContract } from "../../hooks/useContract";
import { base64 } from "ethers/lib.esm/utils";
import { deriveUniconAttributeIndices } from "../Unicon/utils";
import { BigNumber, ethers } from "ethers";
import useModal, {
    ModalError,
    ModalLoading,
    ModalNoProvider,
    ModalSellNFT,
    ModalSuccessTransaction,
    ModalTransferNFT
} from "../../hooks/useModals";
import { Simulate } from "react-dom/test-utils";
import toggle = Simulate.toggle;
import { parseEther } from "ethers/lib/utils";
import { MetadataItem } from "../MetadataItem";
import { getNFTItemType, uriToHttp, uriToIMONProxy } from "../../utils";
import { Button, Card, Input, Skeleton, Snippet } from '@nextui-org/react';
import Identicon from '../Identicon';
import {Badge} from "@nextui-org/react";
import { parseMetadata } from '../../utils/metadata';
const _NFT = (props: { itemType, contractAddress, tokenId, showMetadata, canSell, canStake, reloadFunction, canView?,tokenAmount?}) => {
    const [isLoaded, setLoaded] = useState(false);
    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const [svgImage, setSVGImage] = useState(null)
    const nftImage = useMemo(() => svgImage, [svgImage])
    const [isSVGImage, setIsSVGImage] = useState(false);
    const IMON_NFTContract = (props.itemType === "ERC-1155" ? useNFT1155Contract() : useNFT721Contract());
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isSell, toggle: toggleSell } = useModal();
    const { state: isTransfer, toggle: toggleTransfer } = useModal();
    const { state: isMetadata, toggle: toggleMetadata } = useModal();

    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const [isLocked, setLocked] = useState(false)
    const [metadata, setMetadata] = useState(null)
    const [contractInfo, setContractInfo] = useState(null)

    const handleSell = async (price, amount) => {
        let _userBalance = parseFloat(price ? price : "0");
        let _defaultPrice = parseFloat(amount ? amount : "0");

        if (_userBalance === 0) {
            console.log("Yetersiz Bakiye!")
            return }

        if (_defaultPrice === 0) {
            console.log("Geçersiz Fiyat!")
            return }

        toggleLoading();
        let sellParams = [{
            assetType: props.itemType === "ERC-1155" ? 3 : 2,
            contractAddress: props.contractAddress,
            tokenId: props.tokenId,
            amount: amount,
            price: parseEther(price)
        }]
        await IMONDIAMOND.sell(sellParams).then(async (tx) => {
            await tx.wait();
            const summary = `Selling NFT's for: ${IMONDIAMOND.address}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            await provider.getTransactionReceipt(tx.hash).then(() => {
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            toggleSell()
            if (props.reloadFunction) {
                props.reloadFunction()
            }
            fetchImage()
        });
    }
    const handleUnlock = async () => {
        toggleLoading();
        const NFTContract = await IMON_NFTContract(props.contractAddress, true);
        await NFTContract.setApprovalForAll(IMONDIAMOND.address, true).then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking NFT's for: ${IMONDIAMOND.address}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            await provider.getTransactionReceipt(tx.hash).then(() => {
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            if (props.reloadFunction) {
                props.reloadFunction()
            }
            fetchImage();
        });
    }

    const handleTransfer = async (amount, receiver) => {

        if (props.itemType === "ERC-1155") {
            if (parseInt(amount) === 0) {
                setTransaction({ hash: '', summary: '', error: { "message": "Invalid Amount" } });
                toggleError();
                return;
            }
            if (!ethers.utils.isAddress(receiver)) {
                setTransaction({ hash: '', summary: '', error: { "message": "Invalid Address" } });
                toggleError();
                return;
            }
            toggleLoading();
            const NFTContract = await IMON_NFTContract(props.contractAddress, true);
            await NFTContract.safeTransferFrom(account, receiver, props.tokenId, amount, receiver).then(async (tx) => {
                await tx.wait();
                const summary = `Transferring NFT's for: ${receiver}`
                setTransaction({ hash: tx.hash, summary: summary, error: null });
                await provider.getTransactionReceipt(tx.hash).then(() => {
                    toggleTransactionSuccess();
                });
            }).catch((error: Error) => {
                setTransaction({ hash: '', summary: '', error });
                toggleError();
            }).finally(async () => {
                toggleLoading();
            });
        } else if (props.itemType === "ERC-721") {
            toggleLoading();
            const NFTContract = await IMON_NFTContract(props.contractAddress, true);
            console.log(NFTContract)
            await NFTContract.transferFrom(account, receiver, props.tokenId).then(async (tx) => {
                await tx.wait();
                const summary = `Transferring NFT's for: ${receiver}`
                setTransaction({ hash: tx.hash, summary: summary, error: null });
                await provider.getTransactionReceipt(tx.hash).then(() => {
                    toggleTransactionSuccess();
                });
            }).catch((error: Error) => {
                setTransaction({ hash: '', summary: '', error });
                toggleError();
            }).finally(async () => {
                toggleLoading();
            });
        }


    }



    const fetchImage = async () => {
        if (!props.tokenId) { return; }

        console.log("ASSET_URI", props.contractAddress,props.itemType )


        const NFTContract = await IMON_NFTContract(props.contractAddress, true);
        const assetURI = props.itemType === "ERC-1155" ? await NFTContract.uri(props.tokenId) : await NFTContract.tokenURI(props.tokenId)
       
        let _contractInfo = {
            itemType: getNFTItemType(props.itemType),
            contractAddress: props.contractAddress,
            tokenId: `${props.tokenId}`
        }

        setContractInfo(_contractInfo)
        if (account) {
            var _hasAllowance = false;
            try {
                _hasAllowance = await NFTContract.isApprovedForAll(account, IMONDIAMOND.address);
            } catch (exception) {
                _hasAllowance = false;
            } finally {
                setLocked(_hasAllowance)
            }
        }
        const parsedMetadata = await parseMetadata(props.contractAddress,props.tokenId,assetURI);        
        setMetadata(parsedMetadata?.metadata)
        setSVGImage(parsedMetadata?.image)
        setLoaded(parsedMetadata?.success)
        setIsSVGImage(parsedMetadata?.is_embedded);
    }

    const handleImageError = (event, url) => {
        event.target.src = `${url}`;
    };

    useEffect(() => {
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

            <ModalSellNFT handleSell={handleSell} isShowing={isSell} hide={toggleSell} contractAddress={props.contractAddress} tokenId={props.tokenId} tokenType={props.itemType} />
            <ModalTransferNFT handleTransfer={handleTransfer} isShowing={isTransfer} hide={toggleTransfer} contractAddress={props.contractAddress} tokenId={props.tokenId} tokenType={props.itemType} />


            {

                <Card className='w-full'>
                    <div className='grid grid-cols-4 gap-2 p-2 rounded-lg'>
                        <div className='w-full flex items-center justify-center col-span-3'>

                            {
                                isLoaded ? isMetadata ? metadata && <MetadataItem contractInfo={contractInfo} metadataJSON={metadata} /> :  
                                <div className='w-full h-full rounded-lg'>   
                                <Badge content={props.tokenAmount} color="secondary">
                                <img alt='imon' className={"w-full h-full rounded-lg"} src={nftImage} />
                                </Badge>
                                </div>
                                : <></>
                            }
                        </div>

                        <div className={"w-full flex flex-col gap-2 col-span-1"}>
                            {
                                isLoaded&& <>
                                {
                                !isLocked ? <Button size='sm' className='w-full' color='default' onClick={() => {
                                    handleUnlock()
                                }}>Unlock to Sell</Button> :
                                    <Button size='sm' color='default'  onClick={() => {
                                        toggleSell()
                                    }} className={"w-full"}>Sell</Button>
                            }
                            <Button size='sm' color='default' onClick={() => {
                                toggleTransfer()
                            }} className={"w-full"}>Transfer</Button>
                            <Button size='sm' color='default' onClick={() => {
                                toggleMetadata()
                            }} className={"w-full"}>{!isMetadata ? "Metadata" : "Image"}</Button>
                                </>
                            }
                        </div>

                        <div className='w-full flex flex-col col-span-4 gap-2'>
                        <div className={"flex flex-row items-start justify-start gap-2"}>
                            <div className='flex flex-col w-full gap-2'>
                            <Input size='sm' className='w-full' type="text" variant={"faded"} label="Contract" value={props.contractAddress} />
                            <Input  size='sm' className='w-full' type="text" variant={"faded"} label="TokenID" value={props.tokenId} />
                            </div>
                        </div>
                    </div>
                    </div>
                </Card>

            }
        </>
    );
}
export const AccountNFTItem = memo(_NFT)

