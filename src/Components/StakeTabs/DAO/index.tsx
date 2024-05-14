import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ETHER_ADDRESS, TradeType } from '../../../constants/misc';
import { BigNumber, ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import moment from 'moment';
import { Route as ReactRoute, NavLink } from 'react-router-dom';
import { ChainId, isSupportedChain } from '../../../constants/chains';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract, useStakeContract, useDomainContract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalInfo, ModalSelectExchangePair } from '../../../hooks/useModals';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { fetchAllTokenList } from '../../../state/user/hooks';
import { getAssetIconByChainIdFromTokenList, getNativeCurrencyByChainId, parseFloatWithDefault, unixTimeToDateTime } from '../../../utils';
import { Accordion, AccordionItem, Avatar, Button, Card, CardBody, CardFooter, CardHeader, Image, Slider, Table, TableBody, TableColumn, TableHeader } from '@nextui-org/react';
import { formatUnits, parseEther, parseUnits } from '@ethersproject/units';
import { WETH9 } from '../../../entities';
import { DoubleCurrencyIcon } from '../../DoubleCurrency';
import GaugeChart from 'react-gauge-chart'

const _STAKE_TAB = () => {
    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const EXCHANGE = useExchangeContract(chainId, true)
    const IMON_STAKE_CONTRACT = useStakeContract(chainId, true);
    const CNS_DOMAIN_CONTRACT = useDomainContract(chainId, true);

    const ERC20Contract = useERC20Contract()
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const { state: isSelectToken, toggle: toggleSelectToken } = useModal()
    const dispatch = useAppDispatch()
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])
    const [allowanceAmount, setAllowanceAmount] = useState(parseEther("0"))
    const [baseAsset, setBaseAsset] = useState(null)
    const [quoteAsset, setQuoteAsset] = useState(null)
    const [isBase, setIsBase] = useState(true)
    const [baseInputValue, setBaseInputValue] = useState("")
    const [isUnlockRequired, setUnlockRequired] = useState(false)
    const [poolInfo, setPoolInfo]: any = useState(null);
    const [rewardInfo, setRewardInfo]: any = useState(null)
    const [isCNSRegistered, setCNSRegistered]: any = useState(false);
    fetchAllTokenList(chainId, account)
    const [pairInfo, setPairInfo]: any = useState(null);
    const [depositAmount, setDepositAmount] = useState(1)

    const [allExchangePairs, setAllExchangePairs]: any = useState(null)
    const [proposalInfo,setProposalInfo] : any = useState(null)
    const [proposers,setProposers] : any = useState([])
    const [maxVote,setMaxVote] : any = useState(null)


    const setInputValue = (e, isBase) => {
        const regex = /^[0-9]*\.?[0-9]*$/;
        e = e.replace(",", ".")
        if (regex.test(e)) {
            setBaseInputValue(e)
        }

        setIsBase(isBase)
    }

    const onSelectToken = (tokenInfo) => {
        setBaseAsset(tokenInfo)
        setPairInfo(null)
        toggleSelectToken()
    }

    const handleSelectPair = (pair, base, quote) => {
        console.log("pairInfo", pair,base,quote)
        setBaseAsset(base)
        setQuoteAsset(quote)
        setPairInfo(pair);
        toggleSelectToken()

    }

    useEffect(() => {
        initDefaults()
    }, [baseAsset, quoteAsset, pairInfo])


    const initDefaults = async () => {

        const _exchangePairs = await EXCHANGE.getAllPairs();
        setAllExchangePairs(_exchangePairs);

        if(!baseAsset){
            return;
        }
        let _baseAssetAddress = baseAsset.address === ETHER_ADDRESS ? WETH9[chainId].address : baseAsset.address;
        let _isWETH = baseAsset.address === ETHER_ADDRESS ? false : true;
  

        const [_maxVote, _proposalInfo] = await IMON_STAKE_CONTRACT.getProposal(_baseAssetAddress);
        const _proposers = await IMON_STAKE_CONTRACT.getProposers(_baseAssetAddress);


        setProposalInfo(_proposalInfo);
        setMaxVote(_maxVote);
        setProposers(_proposers);
        console.log("MAX", _maxVote);
        console.log("_proposal", _proposalInfo);
        console.log("_proposers", _proposers)


    }

    const handleVote = async(isPositive) => {
        setTransaction({ hash: '', summary: '', error:{message:"Not Activated Yet!"} });
        toggleError()
    }
    useEffect(() => {
        console.log(baseAsset)
        console.log("baseInputValue", baseInputValue)
        if (baseInputValue) {
            try {
                let _baseInputVal = parseUnits(baseInputValue, baseAsset.decimals);
                if (allowanceAmount.gte(_baseInputVal)) {
                    setUnlockRequired(false)
                } else {
                    setUnlockRequired(true)
                }
            } catch (e) {
                setInputValue("", true)
            }

        }
    }, [baseInputValue, allowanceAmount])

    useEffect(() => {
        if (!baseAsset) {
            return;
        }
        initDefaults();
    }, [baseAsset, baseInputValue])

  


    const handleUnlock = async () => {
        if (![ChainId.ARBITRUM_ONE, ChainId.CHILIZ_SPICY_TESTNET, ChainId.CHILIZ_MAINNET].includes(chainId)) {
            setTransaction({ hash: '', summary: '', error: { message: "Unsupported Chain!!" } });
            toggleError();
            return
        }
        if (!baseInputValue) { return }
        if (!baseAsset) { return }
        let depositAmount = ethers.utils.parseUnits(baseInputValue, baseAsset.decimals);
        toggleLoading();
        const ERC20Token = ERC20Contract(baseAsset.address)
        await ERC20Token.approve(IMON_STAKE_CONTRACT.address, depositAmount, { from: account }).then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking tokens for: ${IMON_STAKE_CONTRACT.address}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            await provider.getTransactionReceipt(tx.hash).then(() => {
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            initDefaults();

        });
    }


    useEffect(() => {
        if (!chainId) { return; }
        if (!defaultAssets) { return }
        if (defaultAssets.length === 0) { return }

    }, [defaultAssets,allExchangePairs])

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

            <ModalSelectExchangePair disableToken={baseAsset} hide={toggleSelectToken} isShowing={isSelectToken} onSelect={onSelectToken} isClosable={true} tokenList={defaultAssets} onSelectPair={handleSelectPair} allExchangePairs={allExchangePairs} />


            {

                <div className="w-full rounded-xl pb-0">
                    <div className="rounded-xl pb-0 flex gap-2 flex-col">
                        <div className="w-full">
                        {
                                

                                    <Button className="w-full" radius='lg' size='lg' variant="flat" color="default" onClick={() => {
                                        setIsBase(true)
                                        toggleSelectToken()
                                    }} startContent={
                                        
                                        <DoubleCurrencyIcon baseIcon={baseAsset?.logoURI} quoteIcon={quoteAsset?.logoURI}/>
            
                                    }
                                        endContent={
                                            <span translate={"no"} className="material-symbols-outlined ">
                                                expand_more
                                            </span>
                                        }

                                    >
                                        <div className='w-full'>
                                        {pairInfo ? pairInfo.base.symbol + "x" + pairInfo.quote.symbol : "Select Pair"}
                                            </div>
                                    </Button>

                                }



                        </div>
                        <div className='w-full flex flex-col gap-2'>


                            <div className="grid grid-cols-2 m-auto mt-5">
                                <div
                                    className={"w-full flex flex-col gap-2 items-center justify-center"}>
                                    <span
                                        className="text-sm inline-block text-gray-500 dark:text-gray-100">
                                        Increase Votes
                                    </span>
                                     <GaugeChart
                                        id={`positiveVotes`}
                                        nrOfLevels={20}
                                        colors={["green", "red"]}
                                        arcWidth={0.3}
                                        percent={50}
                                        textColor={"#fff"}
                                        needleBaseColor={"green"}
                                        formatTextValue={(value : any) => proposalInfo ? BigNumber.from(proposalInfo.up).toNumber() : "0"}
                                    /> 
                                </div>
                                <div
                                    className={"w-full flex flex-col gap-2 items-center justify-center"}>
                                    <span
                                        className="text-sm inline-block text-gray-500 dark:text-gray-100">
                                        Decrease Votes
                                    </span>
                                     <GaugeChart
                                        id={`negativeVotes`}
                                        nrOfLevels={20}
                                        colors={["red", "green"]}
                                        arcWidth={0.3}
                                        cornerRadius={8}
                                        percent={20}
                                        textColor={"#fff"}
                                        needleBaseColor={"red"}
                                        formatTextValue={(value : any) => proposalInfo ? BigNumber.from(proposalInfo.down).toNumber() : "0"}
                                    />
                                </div>

                            </div>





                        </div>

                        <div className='w-full flex flex-col gap-2'>
                            <Card>
                                <CardHeader>
                                    <p>Vote Now</p>
                                </CardHeader>
                                <CardBody>
                                    {


                                        baseAsset && <div className='w-full flex flex-col gap-2'>


                                            <Slider
                                                label="Vote Amount"
                                                size="lg"
                                                color="danger"
                                                step={1}
                                                showSteps={false}
                                                minValue={1}
                                                defaultValue={1}
                                                maxValue={100}
                                                onChange={(e) => {
                                                    setDepositAmount(e)
                                                }}
                                                getValue={(votingAmount) => `${votingAmount} of 100 KWL total ${votingAmount * 1} VOTE`}
                                                className="w-full"
                                            />


                                        </div>
                                    }
                                </CardBody>
                                <CardFooter>
                                    <div className='w-full grid grid-cols-2 gap-2'>
                                        <Button onClick={() => {
                                            handleVote(true)
                                        }} color='success' size='lg' className='w-full text-white' variant='solid'>Increase Rewards</Button>
                                        <Button onClick={() => {
                                             handleVote(false)
                                        }} color='danger' size='lg' className='w-full' variant='solid'>Decrease Rewards</Button>
                                    </div>
                                </CardFooter>
                            </Card>












                        </div>

                        <div className='w-full'>
                            <Table aria-label="Example empty table">
                                <TableHeader>
                                    <TableColumn>Side</TableColumn>
                                    <TableColumn>Whale</TableColumn>
                                    <TableColumn>Vote</TableColumn>
                                    <TableColumn>Date</TableColumn>
                                </TableHeader>
                                <TableBody emptyContent={"No rows to display."}>{[]}</TableBody>
                            </Table>
                        </div>

                    </div>
                </div>
            }

        </>
    );
}
export const DAO_TAB = memo(_STAKE_TAB)

