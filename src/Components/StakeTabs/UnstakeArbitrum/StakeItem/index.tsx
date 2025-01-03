import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';

import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract, useStakeContract, useKEWLFarmContract } from '../../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalInfo } from '../../../../hooks/useModals';
import { Button, Card, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, User } from '@nextui-org/react';
import { getAssetIconByChainIdFromTokenList, getNFTItemType, unixTimeToDateTime } from '../../../../utils';
import { NFT } from '../../../NFT';


const _STAKE_ITEM = (props:{userAccount:any,isPair:any,nft : any, assets : any,stakeItem : any,rewardPools : any}) => {

    const { connector, account, provider, chainId } = useWeb3React()
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const [isLoaded,setLoaded] = useState(false)
    const IMON_STAKE_CONTRACT = useStakeContract(chainId, true);
    const [rewardInfo,setRewardInfo] : any = useState(null);


    const initDefaults = async () => {
        if(!props.stakeItem){
            return
        }

        console.log("props.user",props.userAccount,props.stakeItem.stakingId)
        const _rewardInfo = await IMON_STAKE_CONTRACT.getUserRewardInfo(props.userAccount,props.stakeItem.stakingId);
        setRewardInfo(_rewardInfo);
        console.log("ersan")
        console.log("rewardInfo",_rewardInfo);
        console.log(props.rewardPools)
    }

    const unstake = async (stakingId:any) => {
        toggleLoading();
        await IMON_STAKE_CONTRACT.unstake(stakingId).then(async (tx) => {
            await tx.wait();
            const summary = `Harvest : ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            initDefaults();
        });
    }

    const harvest = async (stakingId:any) => {
        toggleLoading();
        await IMON_STAKE_CONTRACT.harvest(stakingId).then(async (tx:any) => {
            await tx.wait();
            const summary = `Harvest : ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            initDefaults();
        });
    }

    const reload  = async () => {
        initDefaults();
    }

    useEffect(() => {
        setLoaded(false)
        if (!props.stakeItem) { return; }

        initDefaults();
    }, [props.stakeItem])

    return (
        <>
            <ModalInfo isShowing={isErrorShowing} hide={toggleError} error={transaction.error}/>
            <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading} isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess} isShowing={isTransactionSuccess} />

                <div className="w-full flex flex-col gap-2  p-2">
                    <div className='w-full flex flex-col gap-2'>
                        
                        <div className='w-full flex flex-col gap-2'>
                    
                        <Card shadow='none' className='flex flex-row gap-2 rounded-xl items-center justify-between'>
                            <span>Deposit Amount</span>
                            <span className='font-bold'>{ethers.utils.formatUnits(props.stakeItem.depositAmount,props.stakeItem.poolInfo.tokenInfo.decimals)} {props.stakeItem.poolInfo.tokenInfo.symbol}</span>
                        </Card>
                        <Card shadow='none' className='flex flex-row gap-2 rounded-xl  items-center justify-between'>
                            <span>Joined At</span>
                            <span className='font-bold'>{unixTimeToDateTime(props.stakeItem.joinedAt)}</span>
                        </Card>
                     
                        </div>
                    </div>
                    <div className="w-full">
                    <Table removeWrapper shadow='none'>
                    <TableHeader>
                        <TableColumn>REWARD</TableColumn>
                        <TableColumn>AMOUNT</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={"No rows to display."}>{
                        rewardInfo && rewardInfo.length > 0  && rewardInfo.map((reward,index)=>{
                            return <TableRow key={`reward${index}`}>
                            <TableCell>
                            <User   
                                name={props.rewardPools[index].symbol}
                                description={props.rewardPools[index].name}
                                avatarProps={{
                                    src: getAssetIconByChainIdFromTokenList(chainId,props.assets,reward.token)
                                  }}
                                />
                               </TableCell>
                            <TableCell>
                                 {ethers.utils.formatUnits(reward.amount,props.rewardPools[index].decimals)} 
                                </TableCell>
                          </TableRow>
                        })   
                    }</TableBody>
                    </Table>
                    </div>
                    <div className='grid grid-cols-3 gap-2 my-5'>
                            <Button  onPress={()=>{
                                harvest(props.stakeItem.stakingId)
                            }} color='success'>Harvest</Button>
                            <Button onPress={()=>{
                                unstake(props.stakeItem.stakingId)
                            }} color='danger'>Unstake</Button>
                              <Button onPress={()=>{
                                reload()
                            }} color='default'>Refresh</Button>
                        </div>
                </div>
     

        </>
    );
}
export const STAKE_ARBITRUM_ITEM = memo(_STAKE_ITEM)

