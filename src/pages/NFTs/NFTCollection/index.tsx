import IPage from "../../../interfaces/page";
import React, {useEffect, useState} from "react";
import {AnimationHeader} from "../../../Components/AnimationHeader";
import Identicon from "../../../Components/Identicon";
import {ethers} from "ethers";
import GEMBOXES_WHITELIST from "../../../assets/data/GEMBOXESNFT_WHITELIST_PACKED.json"
import {useDiamondContract} from "../../../hooks/useContract";
import {useWeb3React} from "@web3-react/core";
import {BigNumber} from "@ethersproject/bignumber";
import useModal, {ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction} from "../../../hooks/useModals";
import {SocialLinks} from "../../../Components/SocialLinks";
import {Unicon} from "../../../Components/Unicon";
import {DEFAULT_CHAIN_ASSETS_URL, isSupportedChain} from "../../../constants/chains";
import {formatEther} from "ethers/lib/utils";
import {getNativeCurrencyByChainId} from "../../../utils";
import {NFTItem} from "../../../Components/NFTItem";
import useDebounce from "../../../hooks/useDebounce";
import ContentLoader from "react-content-loader";
import { NFTLoading } from "../../../Components/NFTLoading";
import { parseEther } from "ethers/lib.esm/utils";
import { Button, Card, Slider } from "@nextui-org/react";
const NFTCollection: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const {state:isTransactionSuccess, toggle:toggleTransactionSuccess } = useModal();
    const {state:isShowLoading, toggle:toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({hash: '',summary: '',error: null})
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const [allMarketItems,setAllMarketItems] : any = useState(null)
    const [sweepItem,setSwepItem] :  any = useState(0)
    const [basketItems,setBasketItems] : any = useState(null)
    const [totalPrice,setTotalPrice] : any = useState(parseEther("0"))
    const [basketNFTAmount,setBasketNFTAmount] : any = useState(parseEther("0"))
    const IMONDIAMOND = useDiamondContract(chainId,true);

    const initDefaults = async () => {
        if(!IMONDIAMOND){
            return;
        }
        if(!chainId){
            return;
        }
        const _pathText  = location.pathname.replace("/nfts/","")
        const regex = /(\d+)/;
        const match = _pathText.match(regex);
       let  _collectionId = 0;
        if (match) {
            _collectionId = match[0];
          } else {
            return;
          }

        let marketItems = []
        try{
            const collectionItems = await IMONDIAMOND.fetch(_collectionId)
            const liveItems = collectionItems.slice().reverse().filter(collectionItem => {
                return collectionItem.is_cancelled === false && collectionItem.is_completed === false
            });
            marketItems = [...marketItems, ...liveItems];
        }catch(exception){
            console.log("ex",exception)
        }

        const sortedCollections = marketItems.sort((a, b) => a.price_per_token - b.price_per_token);
        setAllMarketItems(sortedCollections)
    }


    useEffect(()=>{
        setAllMarketItems(null)
        if(!provider){
            return
        }
        if(!chainId){
            return
        }
        if(!isSupportedChain(chainId)){
            return
        }
  
        if(chainId){
            initDefaults();
        }
    },[chainId,account])

    const handleBuy = async () => {
        if(basketItems.length === 0){
            setTransaction({ hash: '', summary: '', error:{message:"Your basket is empty!"} });
            toggleError();
            return
        }

        const  buyParams = []

        
        basketItems.map((nftItem,index)=>{
            buyParams.push({
                collectionId:nftItem.collectionId,//1
                itemId:nftItem.itemId, // 0
                tokenId:nftItem.tokenId, // 1
                amount:nftItem.remaining_amount
            })
        })
        let buy1155ParamOverrides = {
            value:totalPrice
        }

        console.log(buyParams)

        toggleLoading();
        await IMONDIAMOND.buy(buyParams,buy1155ParamOverrides.value,buy1155ParamOverrides).then(async (tx)=>{
            await tx.wait();
            const summary = `Buying NFT: ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error:null});
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error:error });
            toggleError();
        }).finally(async ()=>{
            initDefaults();
            toggleLoading();
        });



    }

    useEffect(()=>{
        let totalPrice = parseEther("0");
        let basketItems = [];
        let totalNFTAmount = parseEther("0");
        for(let i = 0; i < sweepItem;i++){
                if(i<allMarketItems.length){
                    basketItems.push(allMarketItems[i]);
                    totalPrice = totalPrice.add((allMarketItems[i].price_per_token.mul(allMarketItems[i].remaining_amount)))
                    totalNFTAmount = totalNFTAmount.add(allMarketItems[i].remaining_amount);
                }
        }
        setBasketItems(basketItems);
        setTotalPrice(totalPrice);
        setBasketNFTAmount(totalNFTAmount)

    },[sweepItem])

 
    
    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);
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

            <div className={"w-full sticky top-[56px] z-[20]"}>
                    <Card shadow="none" isBlurred className={"w-full px-6 grid grid-cols-1 sm:grid-cols-2 sticky top-0 gap-2 py-2  rounded-lg items-center justify-start"}>
                        
                        <div className={"w-full flex flex-row items-center justify-start gap-2"}>
                        <span>Sweep</span>
                        <Slider   
                        onChange={(e)=>{
                            setSwepItem(e)
                        }}
                        size="lg"
                        step={1}
                        color="default"
                        showSteps={true} 
                        maxValue={20} 
                        minValue={0} 
                        defaultValue={0}
                        className="max-w-md" 
                    />
                    
                        </div>
                        <div className={"w-full items-center justify-center grid grid-cols-3 gap-2"}>
                        <div className={"w-full flex flex-row gap-2"}>
                            <span>{formatEther(totalPrice)}</span>
                            <span>{getNativeCurrencyByChainId(chainId)}</span>
                        </div>
                        <div className={"w-full flex flex-row gap-2"}>
                            <span>{sweepItem ? BigNumber.from(basketNFTAmount).toNumber() : 0}</span>
                            <span>NFT</span>
                        </div>
                        <Button color={"default"} onClick={()=>{
                            handleBuy()
                        }} className={"w-full btn btn-primary"}>
                            Buy
                        </Button>
                        </div>



                    </Card>
                    </div>

            <div className={"w-full mx-auto"}>
 
                <section className=" z-40 py-5 mb-[50px]">

              
                    <div className=" w-full">
                        {
                            !allMarketItems && <div className="grid grid-cols-2 sm:grid-cols-5 w-full gap-2 p-2">
                               <NFTLoading/>
                            </div>
                        }
                        <div className={"grid grid-cols-2 sm:grid-cols-5 w-full gap-2 p-2 py-160 z-40 mb-[50px] rounded-lg"}>

                            {
                                allMarketItems && allMarketItems.length > 0  && allMarketItems.map((item,index)=>{
                                    return <NFTItem isActive={sweepItem > 0 & index + 1 <= sweepItem} item={item} key={`nftItem${index}`} itemType={item.assetType === 3 ? "ERC-1155" : "ERC-721"} contractAddress={item.contract_address} tokenId={item.tokenId}/>

                                })
                            }
                    </div>
                    </div>
                </section>

             </div>
        </>
    )
}


export default NFTCollection;
