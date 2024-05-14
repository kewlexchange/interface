import React, {memo, useEffect, useMemo, useState} from 'react';
import ContentLoader from "react-content-loader"
import {useWeb3React} from "@web3-react/core";
import {useDiamondContract, useNFT1155Contract, useNFT721Contract, useNFTContract} from "../../hooks/useContract";
import {base64} from "ethers/lib.esm/utils";
import {deriveUniconAttributeIndices} from "../Unicon/utils";
import {BigNumber, ethers} from "ethers";
import useModal, {
    ModalError,
    ModalLoading,
    ModalNoProvider,
    ModalSellNFT,
    ModalSuccessTransaction,
    ModalTransferNFT
} from "../../hooks/useModals";
import {Simulate} from "react-dom/test-utils";
import toggle = Simulate.toggle;
import {parseEther} from "ethers/lib/utils";
import {MetadataItem} from "../MetadataItem";
import {getNFTItemType, uriToHttp, uriToIMONProxy} from "../../utils";
import {Card, Image} from "@nextui-org/react";
import { parseMetadata } from '../../utils/metadata';
const _NFT = (props: {itemType,contractAddress,tokenId,showMetadata,canSell,canStake ,reloadFunction,canView?}) => {
    const [isLoaded,setLoaded] = useState(false);
    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId,true);
    const [svgImage,setSVGImage] = useState(null)
    const nftImage = useMemo(() => svgImage, [svgImage])
    const [isSVGImage,setIsSVGImage] = useState(false);
    const IMON_NFTContract = (props.itemType === "ERC-1155" ? useNFT1155Contract() : useNFT721Contract());
    const {state: isTransactionSuccess, toggle: toggleTransactionSuccess} = useModal();
    const {state: isShowLoading, toggle: toggleLoading} = useModal();
    const {state: isSell, toggle: toggleSell} = useModal();
    const {state: isTransfer, toggle: toggleTransfer} = useModal();

    const {state: isErrorShowing, toggle: toggleError} = useModal()
    const [transaction, setTransaction] = useState({hash: '', summary: '', error: null})
    const {state: isNoProvider, toggle: toggleNoProvider} = useModal()
    const [isLocked,setLocked] = useState(false)
    const [metadata,setMetadata] = useState(null)
    const [contractInfo,setContractInfo] = useState(null)
    const [isAnimated,setIsAnimated] = useState(false);
    const [animationURL,setAnimationURL] = useState(null);


    useEffect(()=>{
        if(metadata){
            if(typeof metadata === 'object'){
                try{
                    let animURI = metadata.animation_url;
                    if(animURI){
                        setAnimationURL(animURI)
                        setIsAnimated(true)
                    }
                }catch(e){
                    setAnimationURL(null)
                    setIsAnimated(false)
                }
            }
        }
    },[metadata])

    const handleSell = async(price,amount) =>{
        let _userBalance = parseInt(price ? price : "0");
        let _defaultPrice = parseInt(amount ? amount : "0");

        if(_userBalance === 0){return}
        if(_defaultPrice === 0){return}

        toggleLoading();
        let sellParams = [{
            assetType:props.itemType === "ERC-1155" ? 3 : 2,
            contractAddress:props.contractAddress,
            tokenId:props.tokenId,
            amount:amount,
            price:parseEther(price)
        }]
        await IMONDIAMOND.sell(sellParams).then(async (tx) => {
            await tx.wait();
            const summary = `Selling NFT's for: ${IMONDIAMOND.address}`
            setTransaction({ hash: tx.hash, summary: summary, error:null});
            await provider.getTransactionReceipt(tx.hash).then(()=>{
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error });
            toggleError();
        }).finally(async ()=>{
            toggleLoading();
            toggleSell()
            if(props.reloadFunction){
                props.reloadFunction()
            }
            fetchImage()
        });
    }
    const handleUnlock = async () => {
        toggleLoading();
        const NFTContract = await IMON_NFTContract(props.contractAddress,true);
        await NFTContract.setApprovalForAll(IMONDIAMOND.address,true).then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking NFT's for: ${IMONDIAMOND.address}`
            setTransaction({ hash: tx.hash, summary: summary, error:null});
            await provider.getTransactionReceipt(tx.hash).then(()=>{
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error });
            toggleError();
        }).finally(async ()=>{
            toggleLoading();
            if(props.reloadFunction){
                props.reloadFunction()
            }
            fetchImage();
        });
    }

    const handleTransfer = async(amount,receiver) => {
     
        if(props.itemType === "ERC-1155"){
            if(parseInt(amount) === 0){
                setTransaction({ hash: '', summary: '', error:{"message":"Invalid Amount"} });
                toggleError();
                return;
            }
            if(!ethers.utils.isAddress(receiver)){
                setTransaction({ hash: '', summary: '', error:{"message":"Invalid Address"} });
                toggleError();
                return;
            }
            toggleLoading();
            const NFTContract = await IMON_NFTContract(props.contractAddress,true);
            await NFTContract.safeTransferFrom(account,receiver,props.tokenId,amount,receiver).then(async (tx) => {
                await tx.wait();
                const summary = `Transferring NFT's for: ${receiver}`
                setTransaction({ hash: tx.hash, summary: summary, error:null});
                await provider.getTransactionReceipt(tx.hash).then(()=>{
                    toggleTransactionSuccess();
                });
            }).catch((error: Error) => {
                setTransaction({ hash: '', summary: '', error });
                toggleError();
            }).finally(async ()=>{
                toggleLoading();
            });
        }else if(props.itemType === "ERC-721"){
            toggleLoading();
            const NFTContract = await IMON_NFTContract(props.contractAddress,true);
            console.log(NFTContract)
            await NFTContract.transferFrom(account,receiver,props.tokenId).then(async (tx) => {
                await tx.wait();
                const summary = `Transferring NFT's for: ${receiver}`
                setTransaction({ hash: tx.hash, summary: summary, error:null});
                await provider.getTransactionReceipt(tx.hash).then(()=>{
                    toggleTransactionSuccess();
                });
            }).catch((error: Error) => {
                setTransaction({ hash: '', summary: '', error });
                toggleError();
            }).finally(async ()=>{
                toggleLoading();
            });
        }

    
    }

    

    const fetchImage = async() => {
        if(!props.tokenId){return;}
        var metaData = "";
        const NFTContract = await IMON_NFTContract(props.contractAddress,true);
        const assetURI = props.itemType === "ERC-1155" ?  await NFTContract.uri(props.tokenId) :  await NFTContract.tokenURI(props.tokenId)
        let _contractInfo = {
            itemType:getNFTItemType(props.itemType),
            contractAddress:props.contractAddress,
            tokenId:`${props.tokenId}`}
        setContractInfo(_contractInfo)
        if(account){
            var _hasAllowance = false;
            try{
                _hasAllowance = await NFTContract.isApprovedForAll(account,IMONDIAMOND.address);
            }catch (exception){
                _hasAllowance = false;
            }finally {
                setLocked(_hasAllowance)
            }
        }

        const parsedMetadata = await parseMetadata(props.contractAddress,props.tokenId,assetURI);        
        setMetadata(parsedMetadata?.metadata)
        setSVGImage(parsedMetadata?.image)
        setLoaded(parsedMetadata?.success)
        setIsSVGImage(parsedMetadata?.is_embedded);
    }

    const handleImageError = (event,url) => {
        event.target.src = `${url}`;
      };

    useEffect(()=>{
        if(props.contractAddress){
            fetchImage();
        }
    },[props.contractAddress])
    // @ts-ignore
    return (
        <>
            <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />

            <ModalError
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading  text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading} isShowing={isShowLoading}/>
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess} isShowing={isTransactionSuccess}/>

            <ModalSellNFT handleSell={handleSell} isShowing={isSell} hide={toggleSell} contractAddress={props.contractAddress} tokenId={props.tokenId} tokenType={props.itemType} />
            <ModalTransferNFT handleTransfer={handleTransfer} isShowing={isTransfer} hide={toggleTransfer} contractAddress={props.contractAddress} tokenId={props.tokenId} tokenType={props.itemType} />


            {
             <Card className={( (props.canView || props.canSell || props.canStake)? "w-full" : "w-full") + "  min-w-xl max-w-xl  p-2 flex flex-col items-center justify-center gap-2"}>
                    {
                        isLoaded ? isAnimated ?  
                        <video className={"w-full rounded-lg"} src={animationURL} width="100%" height="100%" loop={true} autoPlay={true}>
                           </video>
                        : <Image alt={"IMON NFT"} 
                            isBlurred
                            isZoomed
                            className='w-full h-full min-w-[350px] -z-1'
                             src={nftImage}/> :  <ContentLoader
                            speed={2}
                            width={"100%"}
                            height={"100%"}
                            viewBox="0 0 321 470"
                            backgroundColor="#f3f3f3"
                            foregroundColor="#ecebeb">
                            <rect x="0" y="0" rx="10" ry="10" width="312" height="470" />
                        </ContentLoader>
                    }

                    {
                        props.showMetadata && <MetadataItem contractInfo={contractInfo} metadataJSON={metadata}/>
                    }

                    {
                        props.canSell &&

                        <div className={"w-full grid grid-cols-2 gap-2"}>
                            {
                                !isLocked ? <button onClick={()=>{
                                        handleUnlock()
                                }} className={"btn btn-primary"}>Unlock to Sell</button> :
                                <button onClick={()=>{
                                    toggleSell()
                                }} className={"btn btn-primary"}>Sell</button>
                            }
                            <button onClick={()=>{
                                        toggleTransfer()
                                    }} className={"btn btn-primary"}>Transfer</button>
                        </div>  }
            </Card>
            }
        </>
    );
}
export const NFT = memo(_NFT)
 
