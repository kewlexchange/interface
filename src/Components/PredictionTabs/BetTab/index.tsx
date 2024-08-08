import React, { memo, useEffect, useMemo, useState } from 'react';
import { DEFAULT_TOKEN_LOGO, ETHER_ADDRESS, TradeType } from '../../../constants/misc';
import { BigNumber, ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import moment from 'moment';
import { Route as ReactRoute, NavLink } from 'react-router-dom';
import { isSupportedChain } from '../../../constants/chains';
import { WETH9, Token, CurrencyAmount, Pair, Price, Trade, Currency, Percent, Route } from '../../../entities';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract, useFanTokenWrapperContract, useKEWLPredictionContract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalSelectExchangePair } from '../../../hooks/useModals';
import { useAppSelector } from '../../../state/hooks';
import { useFetchAllTokenList } from '../../../state/user/hooks';
import { convertTimeStampToDay, getNativeCurrencyByChainId, parseFloatWithDefault, unixTimeToDateTime } from '../../../utils';
import { DoubleCurrencyIcon } from '../../DoubleCurrency';
import UniwalletModal from '../../Modal/UniwalletModal';
import { Avatar, AvatarGroup, Button, ButtonGroup, Card, CardBody, CardFooter, CardHeader, Image, Spinner, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs, User } from '@nextui-org/react';
import { formatUnits, parseEther } from '@ethersproject/units';
import { Chart } from '../../Chart';
import { BLACK_LIST } from '../../../constants/blacklist';
import { title } from '../../Primitives';



const _SWAP_TAB = () => {

    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const EXCHANGE = useExchangeContract(chainId, true)
    const PREDICTIONS = useKEWLPredictionContract(chainId, true)

    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const { state: isSelectToken, toggle: toggleSelectToken } = useModal()
    const { state: isConnect, toggle: toggleConnectModal } = useModal()
    const { state: isShowWallet, toggle: toggleWalletModal } = useModal()
    const { state: isExpand, toggle: toggleExpand } = useModal();

    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])
    const [baseAsset, setBaseAsset] = useState(null)
    const [quoteAsset, setQuoteAsset] = useState(null)
    const [isBase, setIsBase] = useState(true)

    const [baseLiquidity, setBaseLiquidity] = useState("0")
    const [quoteLiquidity, setQuoteLiquidity] = useState("0")

    const [baseInputValue, setBaseInputValue] = useState("")
    const [quoteInputValue, setQuoteInputValue] = useState("")

    const [baseTokenAllowance, setBaseTokenAllowance] = useState(0)
    const [quoteTokenAllowance, setQuoteTokenAllowance] = useState(0)
    const ERC20Contract = useERC20Contract()
    const [pairInfo, setPairInfo] = useState(null)
    const PAIRContract = usePAIRContract()
    const [hasLiquidity, setHasLiquidity] = useState(false)
    const [tradeInfo, setTradeInfo] = useState(null)
    const userDeadline = useAppSelector((state) => state.user.userDeadline);
    const userTax = useAppSelector((state) => state.user.userTax);
    const userSlippageTolerance = useAppSelector((state) => state.user.userSlippageTolerance);
    const [allExchangePairs, setAllExchangePairs]: any = useState(null)

    const [matches, setAllMatches]: any = useState([])
    const [matchEntry, setSelectedMatch]: any = useState(null)
    const [matchDetails, setMatchDetails]: any = useState(null)

    useFetchAllTokenList(chainId, account)




    useEffect(() => {
        if (!chainId) { return; }
        if (!defaultAssets) { return }
        if (defaultAssets.length === 0) { return }

        const kwlToken = defaultAssets.find(token => token && token.symbol === "KWL");
        if (kwlToken) {
            setQuoteAsset(kwlToken);
            setBaseAsset(defaultAssets.find(token => token?.symbol === getNativeCurrencyByChainId(chainId)))
        } else {
            console.error("KWL token not found in defaultAssets.");
            setBaseAsset(null)
            setQuoteAsset(null)
        }


        // setQuoteAsset(defaultAssets.find(token => token?.symbol === "KWL"))
    }, [defaultAssets])

    const setInputValue = (e, isBase) => {
        const regex = /^[0-9]*\.?[0-9]*$/;
        e = e.replace(",", ".")
        if (regex.test(e)) {
            if (isBase) {
                setBaseInputValue(e)
            } else {
                setQuoteInputValue(e)
            }
        }

        setIsBase(isBase)
    }

    const fetchMatchDetails = async () => {

        let _baseAddress = baseAsset.address === ETHER_ADDRESS ? ethers.constants.AddressZero : baseAsset.address

        const [matchDetails, _home, _away, _draw] = await PREDICTIONS.fetchMatchDetailsWithBets(_baseAddress, matchEntry.matchId);
        setMatchDetails({ DETAILS: matchDetails, HOME: _home, AWAY: _away, DRAW: _draw })
        console.log(matchDetails)
    }

    useEffect(() => {
        if (baseAsset) {
            if (matchEntry) {
                fetchMatchDetails();
            }
        }

    }, [chainId, account, baseAsset, matchEntry])

    const resetSwap = async (isBase) => {
        setTradeInfo(null)
        setHasLiquidity(true)
        if (!isBase) {
            setBaseInputValue("")
        } else {
            setQuoteInputValue("")
        }
        setBaseLiquidity("")
        setQuoteLiquidity("")
    }
    const fetchPrice = async () => {
        if (!chainId) { return }
        if (!baseAsset) { return }
        if (!quoteAsset) { return }

        if (!isSupportedChain(chainId)) {
            return;
        }

        let _baseAddress = baseAsset.address === ETHER_ADDRESS ? WETH9[chainId].address : baseAsset.address
        let _quoteAddress = quoteAsset.address === ETHER_ADDRESS ? WETH9[chainId].address : quoteAsset.address

        var _baseTokenBalance: any = 0;
        var _quoteTokenBalance: any = 0;

        if (account) {
            if ((baseAsset.address != ETHER_ADDRESS) && (quoteAsset.address != ETHER_ADDRESS)) {
                const BaseERC20Token = ERC20Contract(baseAsset.address)
                _baseTokenBalance = await BaseERC20Token.balanceOf(account);
                const QuoteERC20Token = ERC20Contract(quoteAsset.address)
                _quoteTokenBalance = await QuoteERC20Token.balanceOf(account);
            } else {
                if (baseAsset.address == ETHER_ADDRESS) {
                    _baseTokenBalance = await provider.getBalance(account);
                    const QuoteERC20Token = ERC20Contract(quoteAsset.address)
                    _quoteTokenBalance = await QuoteERC20Token.balanceOf(account);
                } else if (quoteAsset.address == ETHER_ADDRESS) {
                    _quoteTokenBalance = await provider.getBalance(account);
                    const BaseERC20Token = ERC20Contract(baseAsset.address)
                    _baseTokenBalance = await BaseERC20Token.balanceOf(account);
                }
            }
        }





        const _allExchangePairs = await EXCHANGE.getAllPairs();
        setAllExchangePairs(_allExchangePairs)

        const _matchesList = await PREDICTIONS.fetch();
        const _newMatches = _matchesList.slice().sort((a, b) => {
            if (a.expired !== b.expired) {
                // Expire olanları en altta sırala
                return a.expired ? 1 : -1;
            } else {
                // startDate'ye göre artan şekilde sırala
                return a.startDate - b.startDate;
            }
        });

        console.log(_newMatches)
        setAllMatches(_newMatches);

        if (matchEntry) {
            setSelectedMatch(_matchesList[matchEntry.matchId])
        } else {
            setSelectedMatch(_newMatches[0])
        }



        if (isBase) {
            if (parseFloatWithDefault(baseInputValue, 0) === 0) {
                await resetSwap(true)
                return
            }
        } else {
            if (parseFloatWithDefault(quoteInputValue, 0) === 0) {
                await resetSwap(false)
                return
            }
        }


    }



    const displayError = (message) => {
        let error = { message: message }
        setTransaction({ hash: '', summary: '', error: error });
        toggleError();
    }

    function toHex(currencyAmount: CurrencyAmount<Currency>) {
        return `0x${currencyAmount.quotient.toString(16)}`
    }




    useEffect(() => {
        if (!isSupportedChain(chainId)) {
            setBaseAsset(null)
            setQuoteAsset(null)
            setPairInfo(null)
        }
        fetchPrice()
    }, [chainId, account, defaultAssets, provider, baseAsset, quoteAsset, baseInputValue, quoteInputValue])


    const handleDeposit = async (side: any) => {
        if (!baseAsset) { displayError("Please select base asset!"); return; }
        if (!matchEntry) { displayError("Please select match!"); return; }
        if (baseInputValue === "") { displayError("Input amount not valid!"); return; }


        const isEther = baseAsset.address === ETHER_ADDRESS

        const depositAmount = ethers.utils.parseUnits(baseInputValue, baseAsset.decimals)

        let overrides = {
            value: isEther ? depositAmount : 0
        }

        const token = isEther ? ethers.constants.AddressZero : baseAsset.address


        if (!isEther) {
            let poolToken = ERC20Contract(token);
            const _baseAllowanceAmount = await poolToken.allowance(account, PREDICTIONS.address);

            if (depositAmount.gt(_baseAllowanceAmount)) {
                const tokenDecimals = baseAsset.decimals;
                const transferAmount = ethers.constants.MaxUint256
                toggleLoading();
                await poolToken.approve(PREDICTIONS.address, transferAmount, { from: account }).then(async (tx) => {
                    await tx.wait();
                    const summary = `Unlocking tokens for: ${PREDICTIONS.address}`
                    setTransaction({ hash: tx.hash, summary: summary, error: null });
                    await provider.getTransactionReceipt(tx.hash).then(() => {
                        toggleTransactionSuccess();
                    });
                }).catch((error: Error) => {
                    setTransaction({ hash: '', summary: '', error: error });
                    toggleError();
                }).finally(async () => {
                    toggleLoading();
                });
            }
        }

        await PREDICTIONS.predict(token, matchEntry.matchId, depositAmount, side, overrides).then(async (tx) => {
            await tx.wait();
            const summary = `Trading : ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            fetchPrice();
        });


    }

    const handleSwapAssets = () => {
        const temp = baseAsset;
        setBaseAsset(quoteAsset);
        setQuoteAsset(temp)

    }

    const onSelectToken = (tokenInfo) => {
        isBase ? setBaseAsset(tokenInfo) : setQuoteAsset(tokenInfo)
        toggleSelectToken()
    }

    const handleSelectPair = (pair: any, base: any, quote: any) => {
        setBaseAsset(base);
        setQuoteAsset(quote);
        toggleSelectToken();
    }

    const PREDICTION_SECTION = (data: any, side: any, match: any) => {

        const handleClaim = async (bettorInfo: any, match: any, side: any) => {


            
            const isEther = baseAsset.address === ETHER_ADDRESS
            const token = isEther ? ethers.constants.AddressZero : baseAsset.address
           // const rewardInfo = await PREDICTIONS.rewardInfo(token, matchEntry.matchId, side, bettorInfo.bettorId);

            toggleLoading();
            await PREDICTIONS.claim(token, matchEntry.matchId, side, bettorInfo.bettorId).then(async (tx) => {
                await tx.wait();
                const summary = `Trading : ${tx.hash}`
                setTransaction({ hash: tx.hash, summary: summary, error: null });
                toggleTransactionSuccess();
            }).catch((error: Error) => {
                setTransaction({ hash: '', summary: '', error: error });
                toggleError();
            }).finally(async () => {
                toggleLoading();
            });

        }
        useEffect(() => {

            console.log("matchInfo:", data)
            console.log("side", data.side)
        }, [data])

        return (
            <>
                {data && <Table removeWrapper color={"danger"} selectionMode="single">
                    <TableHeader>
                        <TableColumn>Whale</TableColumn>
                        <TableColumn>Amount</TableColumn>
                        <TableColumn>Action</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={"No Predictions Found!"}
                        items={data.data}
                        loadingContent={<Spinner color="danger" />}>

                        {(bettorInfo: any) => (
                            <TableRow key={bettorInfo.bettorId}>

                                <TableCell>
                                    <span className='text-xs'>{bettorInfo.bettor}</span>

                                </TableCell>
                                <TableCell>
                                    {formatUnits(bettorInfo.betAmount, baseAsset.decimals)}
                                </TableCell>
                                <TableCell>
                                    {
                                        bettorInfo && !bettorInfo.claimed ? <>
                                            <Button onClick={() => {
                                                handleClaim(bettorInfo, data.match, data.side)
                                            }} size='sm' color='danger'>Claim</Button>
                                        </> : <>
                                            Claimed
                                        </>
                                    }
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                }
            </>
        )
    }

    const isAllowanceRequired = () => {
        if (!baseAsset) {
            return false
        }
        if (baseAsset.address === ETHER_ADDRESS) {
            return false
        }
        if (!baseInputValue) {
            return false
        }
        let baseVal = parseEther("0");
        try {
            baseVal = ethers.utils.parseUnits(baseInputValue, baseAsset.decimals);
        } catch (e) {
            baseVal = parseEther("0")
        }
        return baseVal.gt(baseTokenAllowance)
    }

    return (
        <>
            <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />
            <ModalSelectToken disableToken={!isBase ? baseAsset : quoteAsset} hide={toggleSelectToken} isShowing={isSelectToken} onSelect={onSelectToken} isClosable={true} tokenList={defaultAssets} onSelectPair={handleSelectPair} allExchangePairs={allExchangePairs} />
            <UniwalletModal />
            <ModalConnect isShowing={isConnect} hide={toggleConnectModal} />
            <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />
            <ModalError
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading}
                isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess}
                isShowing={isTransactionSuccess} />



            <div className="flex flex-col gap-2 rounded-xl w-full">
                <div className="w-full rounded-xl">




                    <div className="swap-inputs flex flex-col gap-5">

                        <div className='w-full'>
                            <Card shadow='sm' >
                                <CardHeader>
                                    <span className={title({ size: "xs", color: "red" })}>Select Match</span>

                                </CardHeader>
                                <CardBody>

                                    {
                                        matchEntry && <Card fullWidth isHoverable isPressable={true} onClick={() => {
                                            toggleExpand()
                                        }}>
                                            <CardHeader>
                                                <span className={title({ size: "xxs", color: "cyan" })}>{unixTimeToDateTime(BigNumber.from(matchEntry.startDate).toNumber())}</span>
                                            </CardHeader>
                                            <CardBody>
                                                <div className='w-full grid grid-cols-3 gap-2'>
                                                    <div className='flex flex-col gap-2 text-center items-center justify-center'>
                                                        <AvatarGroup>
                                                            <Avatar size='sm' src={`/images/football/${matchEntry.home.slug}.svg`} />
                                                        </AvatarGroup>
                                                        <span className={title({ size: "xxs", color: "red" })}>{matchEntry.home.name}</span>
                                                        <span className={title({ size: "xxs", color: "blue" })}>{BigNumber.from(matchEntry.home.betCount).toNumber()} VOTE</span>
                                                    </div>
                                                    <div className='flex flex-col gap-2 text-center items-center justify-center'>
                                                        <Avatar radius='none' color='primary' src={`/images/football/${matchEntry.draw.slug}.svg`} />
                                                        <span className={title({ size: "xxs", color: "yellow" })}>{matchEntry.draw.name}</span>
                                                        <span className={title({ size: "xxs", color: "blue" })}>{BigNumber.from(matchEntry.draw.betCount).toNumber()} VOTE</span>
                                                    </div>
                                                    <div className='flex flex-col gap-2 text-center items-center justify-center'>
                                                        <AvatarGroup>
                                                            <Avatar src={`/images/football/${matchEntry.away.slug}.svg`} />
                                                        </AvatarGroup>
                                                        <span className={title({ size: "xxs", color: "green" })}>{matchEntry.away.name}</span>
                                                        <span className={title({ size: "xxs", color: "blue" })}>{BigNumber.from(matchEntry.away.betCount).toNumber()} VOTE</span>
                                                    </div>
                                                </div>
                                            </CardBody>

                                        </Card>
                                    }
                                </CardBody>
                                {
                                    isExpand && <CardFooter>
                                        <div className='w-full flex flex-col gap-2'>


                                            {
                                                matches.map((matchEntry, index) => {
                                                    return <Card onClick={() => {
                                                        setSelectedMatch(matchEntry)
                                                        toggleExpand();
                                                    }} isHoverable fullWidth isPressable={true}>
                                                        <CardHeader>

                                                            <span className={title({ size: "xxs", color: "cyan" })}>{unixTimeToDateTime(BigNumber.from(matchEntry.startDate).toNumber())}</span>


                                                        </CardHeader>
                                                        <CardBody>
                                                            <div className='w-full grid grid-cols-3 gap-2'>
                                                                <div className='flex flex-col gap-2 text-center items-center justify-center'>
                                                                    <AvatarGroup>
                                                                        <Avatar size='sm' src={`/images/football/${matchEntry.home.slug}.svg`} />
                                                                    </AvatarGroup>
                                                                    <span className={title({ size: "xxs", color: "red" })}>{matchEntry.home.name}</span>
                                                                    <span className={title({ size: "xxs", color: "blue" })}>{BigNumber.from(matchEntry.home.betCount).toNumber()} VOTE</span>
                                                                </div>
                                                                <div className='flex flex-col gap-2 text-center items-center justify-center'>
                                                                    <Avatar radius='none' color='primary' src={`/images/football/${matchEntry.draw.slug}.svg`} />
                                                                    <span className={title({ size: "xxs", color: "yellow" })}>{matchEntry.draw.name}</span>
                                                                    <span className={title({ size: "xxs", color: "blue" })}>{BigNumber.from(matchEntry.draw.betCount).toNumber()} VOTE</span>
                                                                </div>
                                                                <div className='flex flex-col gap-2 text-center items-center justify-center'>
                                                                    <AvatarGroup>
                                                                        <Avatar src={`/images/football/${matchEntry.away.slug}.svg`} />
                                                                    </AvatarGroup>
                                                                    <span className={title({ size: "xxs", color: "green" })}>{matchEntry.away.name}</span>
                                                                    <span className={title({ size: "xxs", color: "blue" })}>{BigNumber.from(matchEntry.away.betCount).toNumber()} VOTE</span>
                                                                </div>
                                                            </div>
                                                        </CardBody>

                                                    </Card>
                                                })
                                            }



                                        </div>
                                    </CardFooter>
                                }


                            </Card>
                        </div>


                        <Card shadow='sm'>
                            <CardHeader>
                                <span className={title({ size: "xs", color: "red" })}>Make Your Prediction</span>

                            </CardHeader>
                            <CardBody className='flex flex-col gap-2'>

                                <div className="input">


                                    {
                                        baseAsset &&

                                        <Button className="token-selector  px-2" radius='full' variant="flat" color="default" onClick={() => {
                                            setIsBase(true)
                                            toggleSelectToken()
                                        }} startContent={
                                            <Image className='w-[32px] h-[32px] min-w-[32px] min-h-[32px] max-h-[32px] max-w-[32px]' src={baseAsset && baseAsset.logoURI} />
                                        }
                                            endContent={
                                                <span translate={"no"} className="material-symbols-outlined ">
                                                    expand_more
                                                </span>
                                            }
                                        >{baseAsset.symbol}
                                        </Button>

                                    }




                                    <div onClick={() => {
                                        setInputValue(baseAsset.balance, true)
                                    }} className="balance cursor-pointer">
                                        Balance: {baseAsset && baseAsset.balance}
                                    </div>



                                    <input value={baseInputValue} onChange={(e) => {
                                        setInputValue(e.target.value, true)
                                    }} inputMode="decimal" autoComplete="off" autoCorrect="off" type="text"
                                        pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0" minLength={0} maxLength={100} spellCheck="false" />
                                </div>

                                <div className={"flex flex-col gap-2 w-full"}>
                                    <ButtonGroup size='lg' variant='shadow' fullWidth>
                                        <Button className='uppercase' onClick={() => {
                                            handleDeposit(0)
                                        }} color='danger' size='lg'>{matchEntry?.home.name}</Button>
                                        <Button onClick={() => {
                                            handleDeposit(2)
                                        }} className='uppercase' color='default' size='lg'>{matchEntry?.draw.name}</Button>
                                        <Button className='uppercase' onClick={() => {
                                            handleDeposit(1)
                                        }} color='success' size='lg'>{matchEntry?.away.name}</Button>

                                    </ButtonGroup>









                                </div>
                            </CardBody>
                        </Card>



                        <div className='w-full'>
                            <Card shadow='sm'>
                                <CardHeader>
                                    <span className={title({ size: "xs", color: "red" })}>Predictions</span>
                                </CardHeader>
                                <CardBody>

                                    {
                                        baseAsset && matchEntry && matchDetails &&

                                        <Tabs aria-label="Options">
                                            <Tab key="stats" title={"Statistics"}>

                                                <Table removeWrapper>
                                                    <TableHeader>
                                                        <TableColumn>TEAM</TableColumn>
                                                        <TableColumn>DEPOSIT</TableColumn>
                                                        <TableColumn>WHALE</TableColumn>
                                                        <TableColumn>SCORE</TableColumn>
                                                        <TableColumn>TOTAL</TableColumn>
                                                    </TableHeader>
                                                    <TableBody>
                                                        <TableRow key="home">
                                                            <TableCell>{matchEntry.home.name}</TableCell>
                                                            <TableCell>{formatUnits(matchDetails.DETAILS.totalHomeBet, baseAsset.decimals)} {baseAsset.symbol}</TableCell>
                                                            <TableCell>{matchDetails.HOME.length}</TableCell>
                                                            <TableCell>
                                                                {
                                                                    matchEntry.expired ? <>
                                                                        {BigNumber.from(matchEntry.home.score).toNumber()}
                                                                    </> :
                                                                        <Spinner size='sm' color="danger" />
                                                                }
                                                            </TableCell>
                                                            <TableCell>{BigNumber.from(matchEntry.home.betCount).toNumber()}</TableCell>
                                                        </TableRow>
                                                        <TableRow key="away">
                                                            <TableCell>{matchEntry.away.name}</TableCell>
                                                            <TableCell>{formatUnits(matchDetails.DETAILS.totalAwayBet, baseAsset.decimals)} {baseAsset.symbol}</TableCell>
                                                            <TableCell>{matchDetails.AWAY.length}</TableCell>
                                                            <TableCell>
                                                                {
                                                                    matchEntry.expired ? <>
                                                                        {BigNumber.from(matchEntry.away.score).toNumber()}
                                                                    </> :
                                                                        <Spinner size='sm' color="danger" />
                                                                }

                                                            </TableCell>
                                                            <TableCell>{BigNumber.from(matchEntry.away.betCount).toNumber()}</TableCell>
                                                        </TableRow>
                                                        <TableRow key="draw">
                                                            <TableCell>{matchEntry.draw.name}</TableCell>
                                                            <TableCell>{formatUnits(matchDetails.DETAILS.totalDrawBet, baseAsset.decimals)} {baseAsset.symbol}</TableCell>
                                                            <TableCell>{matchDetails.DRAW.length}</TableCell>
                                                            <TableCell>
                                                                {
                                                                    matchEntry.expired ? <>

                                                                    </> :
                                                                        <Spinner size='sm' color="danger" />
                                                                }
                                                            </TableCell>
                                                            <TableCell>{BigNumber.from(matchEntry.draw.betCount).toNumber()}</TableCell>
                                                        </TableRow>
                                                        <TableRow key="total">
                                                            <TableCell>TOTAL</TableCell>
                                                            <TableCell>{formatUnits(matchDetails.DETAILS.totalBet, baseAsset.decimals)} {baseAsset.symbol}</TableCell>
                                                            <TableCell>{matchDetails.HOME.length + matchDetails.DRAW.length + matchDetails.AWAY.length}</TableCell>
                                                            <TableCell>{""}</TableCell>
                                                            <TableCell>{BigNumber.from(matchEntry.home.betCount.add(matchEntry.away.betCount).add(matchEntry.draw.betCount)).toNumber()}</TableCell>
                                                        </TableRow>
                                                    </TableBody>

                                                </Table>

                                            </Tab>
                                            <Tab key="homeMatchEntries" title={matchEntry.home.name}>
                                                <PREDICTION_SECTION data={matchDetails.HOME} side={0} match={matchEntry} />
                                            </Tab>
                                            <Tab key="awayMatchEntries" title={matchEntry.away.name}>
                                                <PREDICTION_SECTION data={matchDetails.AWAY} side={1} match={matchEntry} />
                                            </Tab>
                                            <Tab key="drawMatchEntries" title={matchEntry.draw.name}>
                                                <PREDICTION_SECTION data={matchDetails.DRAW} side={2} match={matchEntry} />
                                            </Tab>
                                        </Tabs>
                                    }
                                </CardBody>

                            </Card>
                        </div>

                    </div>
                </div>




            </div>

        </>
    );
}
export const BET_TAB = memo(_SWAP_TAB)

