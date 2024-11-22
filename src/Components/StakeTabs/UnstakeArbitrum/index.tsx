import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ETHER_ADDRESS, TradeType } from '../../../constants/misc';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import moment from 'moment';
import { Route as ReactRoute, NavLink } from 'react-router-dom';
import { isSupportedChain } from '../../../constants/chains';
import { WETH9, Token, CurrencyAmount, Pair, Price, Trade, Currency, Percent, Route } from '../../../entities';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract, useStakeContract, useKEWLFarmContract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalInfo } from '../../../hooks/useModals';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { useFetchAllTokenList } from '../../../state/user/hooks';
import { getAssetIconByChainIdFromTokenList, getNativeCurrencyByChainId, parseFloatWithDefault } from '../../../utils';
import { DoubleCurrencyIcon } from '../../DoubleCurrency';
import UniwalletModal from '../../Modal/UniwalletModal';
import { updateUserDeadline, updateUserSlippageTolerance } from '../../../state/user/reducer';
import { Accordion, AccordionItem, Avatar, Button } from '@nextui-org/react';
import { STAKE_ARBITRUM_ITEM } from './StakeItem';



const _UNSTAKE_TAB = () => {

    const { connector, account, provider, chainId } = useWeb3React()
    useFetchAllTokenList(chainId, account)
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const EXCHANGE = useExchangeContract(chainId, true)
    const ERC20Contract = useERC20Contract()
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const [isLoaded,setLoaded] = useState(false)
    const IMON_STAKE_CONTRACT = useStakeContract(chainId, true);
    const [userStakings,setUserStaknigs] : any = useState(null);
    const [rewardPools,setRewardPools] : any = useState(null)
    const [nftContract,setNFTContract] : any = useState(null)
    const [userAccount,setUserAccount] : any = useState("")
    const [exchangePairs,setExchangePairs] : any = useState([]);
    const dispatch = useAppDispatch()
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])

    const initDefaults = async () => {
        const _pairs = await EXCHANGE.getAllPairs();
        setExchangePairs(_pairs);

        console.log("pairs",_pairs);
        const _nftContract = await IMON_STAKE_CONTRACT.getStakeNFTContract();
        setNFTContract(_nftContract);
        const _rewardPools = await IMON_STAKE_CONTRACT.getRewardPools();
        setRewardPools(_rewardPools)
        let _userAccount = account 
        setUserAccount(_userAccount)
        const _userStakings = await IMON_STAKE_CONTRACT.getUserStakingInfo(_userAccount);

        console.log("_USER STAKINGS",_userStakings);

        const updatedUserStakings = await Promise.all(_userStakings.map(async (stakingItem) => {
            const [poolInfo, rewardInfo] = await IMON_STAKE_CONTRACT.getPoolInfo(stakingItem.token);

            // Kopya bir nesne oluşturarak poolInfo ve rewardInfo özelliklerini ekleyin
            return {
                ...stakingItem,
                poolInfo: poolInfo,
                rewardInfo: rewardInfo
            };
        }));

        setUserStaknigs(updatedUserStakings);
        console.log(updatedUserStakings)

        
    
    }


    function searchByAddress(addressToSearch: string): any | undefined {
        return  exchangePairs.find(pair => pair.pair === addressToSearch);
    
    }

    const UNSTAKEICON = (props:{tokenAddress}) => {
        const [isToken,setIsToken] = useState(true)
        const [pair,setPair]:any = useState(null)
        useEffect(()=>{
            
            const isPair = searchByAddress(props.tokenAddress);
                console.log("pairIngo",isPair)
            if(isPair){
                setPair(isPair)
                setIsToken(false)
            }else{
                setIsToken(true)
            }

   
        },[props.tokenAddress])

        return (
            <>
            {
                isToken ? <>
                      <Avatar
                    isBordered
                    color="default"
                    radius="full"
                    src={getAssetIconByChainIdFromTokenList(chainId,defaultAssets,props.tokenAddress)}
                />
                </> : <>
                <DoubleCurrencyIcon baseIcon={getAssetIconByChainIdFromTokenList(chainId,defaultAssets,pair.base.token)} quoteIcon={getAssetIconByChainIdFromTokenList(chainId,defaultAssets,pair.quote.token)}/>
                </>
            }
          
            </>
        )
    }


    useEffect(() => {
        setLoaded(false)
        if (!chainId) { return; }
        if(!account){
            return;
        }
        initDefaults();
    }, [account,chainId])

    return (
        <>
            <ModalInfo
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading}
                isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess}
                isShowing={isTransactionSuccess} />

                {

               
                !userStakings || userStakings.length === 0 && <div className="w-full rounded-xl pb-0">
                    <div className="w-full rounded-xl pb-0 flex gap-2 flex-col">
                        <div className={"flex flex-col gap-2 p-2 text-center items-center justify-center"}>
                            <span translate='no' className="material-symbols-outlined">deployed_code</span>
                            <span className={"w-full text-center"}>Your active staking positions will appear here.</span>
                        </div>
                    </div>
                </div>
                 }

                <div className='w-full flex flex-col gap-2'>
              
                <Accordion  isCompact={true} variant="light"  selectionMode="multiple">

                    
                    {userStakings && userStakings.map((stakingItem,index)=>{
                                    return  stakingItem.isExists && <AccordionItem
                                    key={`stakingItem${stakingItem.stakingId}`}
                                    aria-label={"IMONSTAKE"}
                                    startContent={
                                      <UNSTAKEICON tokenAddress={stakingItem.token} />
                                    }
                                    
                                    subtitle={stakingItem?.poolInfo?.tokenInfo?.name}
                                    title={stakingItem?.poolInfo?.tokenInfo?.symbol}>
                                        <STAKE_ARBITRUM_ITEM isPair={searchByAddress(stakingItem.token)} userAccount={userAccount} nft={nftContract} assets={defaultAssets} rewardPools={rewardPools} stakeItem={stakingItem}/>
                                    
                                    </AccordionItem>
                    })}
                </Accordion>
                </div>
     

        </>
    );
}
export const UNSTAKE_ARBITRUM_TAB = memo(_UNSTAKE_TAB)

