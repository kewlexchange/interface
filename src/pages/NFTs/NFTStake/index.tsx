import IPage from "../../../interfaces/page";
import React, { useEffect, useState } from "react";
import { useExchangeContract, useIMONMarketContract, useIMONTokenContract, usePAIRContract } from "../../../hooks/useContract";
import { useWeb3React } from "@web3-react/core";
import useModal, { ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction } from "../../../hooks/useModals";
import { DEFAULT_CHAIN_ASSETS_URL, isSupportedChain } from "../../../constants/chains";
import { NFTItem } from "../../../Components/NFTItem";
import { NFTLoading } from "../../../Components/NFTLoading";
import useDebounce from "../../../hooks/useDebounce";
import { formatEther, parseEther } from "@ethersproject/units";
import { getNativeCurrencyByChainId, getShordAccount, getShordAccountForMobile, unixTimeToDateTime } from "../../../utils";
import { NavLink } from "react-router-dom";
import { BigNumber, ethers } from "ethers";
import { Price, Token, WETH9 } from "../../../entities";
import { useNavigate } from 'react-router-dom';
import { NFTStakeItem } from "../../../Components/NFTStakeItem";
const NFTStake: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const [defaultAssets, setDefaultAssets] = useState(null);

    const IMONDIAMOND = useIMONMarketContract(chainId, true);
    const IMONTOKEN = useIMONTokenContract(chainId,true);
    const [collections, setCollections] = useState([])
    const [activeCollection, setActiveCollection] = useState(null);
    const [defaultCollectionId, setDefaultCollectionId] = useState(0)
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const [allMarketItems, setAllMarketItems] = useState([])
    const [isLoaded, setIsLoaded] = useState(false)
    const EXCHANGE = useExchangeContract(chainId, true)
    const PAIRContract = usePAIRContract()
    const [priceInfo,setPriceInfo] : any = useState(null)
    const navigate = useNavigate();

    const calculateRewardAmount = (item : any,price:any) : any =>{
        
        let one_ether = parseEther("1")
        let total_price = item.price_per_token.mul(item.amount)
        let limit  = parseEther("10000")
        let market_fee = parseEther("0.02")
        let reward_fee = parseEther("0.3");
        

        let period = ((total_price.add(limit).sub(one_ether)).div(limit)).mul(one_ether)

        let total_fee = total_price.mul(market_fee).div(one_ether)

        let total_reward = ((total_fee.mul(reward_fee).div(one_ether)).mul(parseEther(price.basePrice))).div(one_ether)
        console.log("PERIOD",formatEther(total_price),"---",formatEther(total_reward),price.basePrice)
        return(
            {
                total_reward:total_reward,
                claim_period: formatEther(period),
                claimed_amount:0,
                claimable_amount:0
            })


    }

    const getRewardPrice = async () => {

        let _baseAddress =  WETH9[chainId].address
        let _quoteAddress = IMONTOKEN.address;
        const _pairInfo = await EXCHANGE.getPairInfo(_baseAddress, _quoteAddress);
        const pairAddress = _pairInfo.pair
        let pairContract = PAIRContract(pairAddress);
        const [_reserve0, _reserve1, _blockTimestampLast] = await pairContract.getReserves();
        const baseToken = new Token(chainId, _baseAddress, 18, "WCHZ")
        const quoteToken = new Token(chainId, _quoteAddress, 18,"IMON")
        const [baseReserve, quoteReserve] = baseToken.sortsBefore(quoteToken) ? [_reserve0, _reserve1] : [_reserve1, _reserve0]
        const price = new Price(baseToken, quoteToken, baseReserve, quoteReserve)
        const canInvertPrice = Boolean(
            price && price.baseCurrency && price.quoteCurrency && !price.baseCurrency.equals(price.quoteCurrency))
        const _basePrice = price?.toSignificant(6)
        const _quotePrice = canInvertPrice ? price?.invert()?.toSignificant(6) : undefined
        console.log("ERSAN BASE",_basePrice,"QUOTe",_quotePrice)

        return ({basePrice:_basePrice, quotePrice:_quotePrice})
    }

    const initDefaults = async () => {
        setIsLoaded(false)
        if (!IMONDIAMOND) { return; }
        if(!account) {return;}

        let _priceInfo = await getRewardPrice();
        setPriceInfo(_priceInfo);

        // IMON FIYATI 

        const allCollections = await IMONDIAMOND.fetchCollections();
        const updatedCollections = await Promise.all(allCollections.slice().reverse().map(async (collection) => {
            const collectionItems = await IMONDIAMOND.fetch(collection.collectionId);


            const liveItems = collectionItems.map(item => {
                // Nesneyi kopyala
                const newItem = { ...item };
                const rewardInfo = calculateRewardAmount(item,_priceInfo)
                // Yeni değeri ata
                newItem.created_at = (item.created_at.eq(item.price_per_token.mul(item.amount))) ? collection.created_at : item.created_at;
                newItem.total_reward = rewardInfo.total_reward;
                newItem.claim_period = rewardInfo.claim_period;
                newItem.claimed_amount = rewardInfo.claimed_amount;
                newItem.claimable_amount = rewardInfo.claimable_amount;
                newItem.base_price = _priceInfo.basePrice;
                newItem.quote_price = _priceInfo.quotePrice;
                return newItem;
            }).filter(item => item.seller === account).slice().reverse();
            return  { ...collection, items: liveItems};
        }));    
        setCollections(updatedCollections)
        setIsLoaded(true)
    }


    useEffect(()=>{
        if(chainId){
            initDefaults();
        }else{
            setIsLoaded(false)
            setAllMarketItems([])
            setCollections([])
        }
    },[chainId,account,provider])

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
            <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading} isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess} isShowing={isTransactionSuccess} />


            <div className={"container mx-auto"}>
            <section className={"mx-auto sm:w-[38%] w-full"}>
                    <div className=" w-full">

                        <div className="flex flex-col gap-2 p-2">
                        {
                            collections && collections.length > 0 && collections.map((collection,index) => {
                                return <div key={`collection${collection.collection}`}  className={"w-full"}>{
                                    collection.items.length > 0 && 
                              
                                <div className="w-full flex flex-col gap-2 rounded-lg">
                                   
                                    <div className={"w-full flex flex-col gap-2"}>
                                        {
                                            collection.items.length > 0 && collection.items.map((item, index) => {
                                                return <NFTStakeItem key={`stakeItem${collection.collection}${index}`} index={index} item={item} collection={collection}/>
                                            })
                                        }

                                    </div>
                                 
                                   
                                
                                </div>
                                  }</div>
                            })

                        }
                        </div>
                        {
                            <div className={"grid sm:grid-cols-3 sm:grid-cols-3 w-full gap-2 p-2 z-40 mb-[50px] rounded-lg"}>
                                {
                                    !isLoaded && <NFTLoading className="" />

                                }
                            </div>


                        }

                    </div>
                </section>

            </div>
        </>
    )
}


export default NFTStake;
