import React, { memo, useEffect, useMemo, useState } from 'react';
import { DEFAULT_TOKEN_LOGO, ETHER_ADDRESS, TradeType } from '../../../constants/misc';
import { BigNumber, ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import moment from 'moment';
import { Route as ReactRoute, NavLink } from 'react-router-dom';
import { ChainId, isSupportedChain } from '../../../constants/chains';
import { WETH9, Token, CurrencyAmount, Pair, Price, Trade, Currency, Percent, Route } from '../../../entities';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract, useFanTokenWrapperContract, useKEWLPredictionContract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalSelectExchangePair } from '../../../hooks/useModals';
import { useAppSelector } from '../../../state/hooks';
import { useFetchAllTokenList } from '../../../state/user/hooks';
import { convertTimeStampToDay, getNativeCurrencyByChainId, parseFloatWithDefault, unixTimeToDateTime } from '../../../utils';
import { DoubleCurrencyIcon } from '../../DoubleCurrency';
import UniwalletModal from '../../Modal/UniwalletModal';
import { Avatar, AvatarGroup, Button, ButtonGroup, Card, CardBody, CardFooter, CardHeader, DatePicker, Image, Input, Spinner, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs, User } from '@nextui-org/react';
import { formatUnits, parseEther } from '@ethersproject/units';
import { Chart } from '../../Chart';
import { BLACK_LIST } from '../../../constants/blacklist';
import { title } from '../../Primitives';
import { now, getLocalTimeZone,parseAbsoluteToLocal } from "@internationalized/date";



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

    const [eventDate, setEventDate] = useState(parseAbsoluteToLocal(new Date().toISOString()));
    const [home,setHome] = useState("")
    const [away,setAway] = useState("")




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
        setAllMatches(_matchesList);

        if (matchEntry) {
            setSelectedMatch(_matchesList[matchEntry.matchId])
        } else {
            setSelectedMatch(_matchesList[0])
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



    function slugify(message: string): string {
        return message
            .toLowerCase()
            .normalize("NFD") // Unicode karakterleri normalize et
            .replace(/[\u0300-\u036f]/g, "") // Aksanlı harfleri kaldır
            .replace(/[^a-z0-9ğüşıöçı\-_]/g, "") // Alfanumerik, tire ve alt çizgi hariç karakterleri kaldır
            .replace(/[\s_]+/g, "-") // Boşlukları ve alt çizgileri tireye çevir
            .replace(/^-+|-+$/g, ""); // Başta ve sonda kalan tireleri kaldır
    }
    
    const handleCreateMatch = async()=>{
        if(chainId != ChainId.CHILIZ_MAINNET){
            displayError("Unsupported Chain");
            return;
        }

        const expireDate = moment(eventDate).unix();

        let createMatchParam = {
             startDate:expireDate,
             endDate:0,
             homeName:home,
             homeSlug:slugify(home),
             awayName:away,
             awaySlug:slugify(away)
       }

       
        toggleLoading();
        await PREDICTIONS.create(createMatchParam).then(async (tx) => {
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

    return (
        <>
            <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />
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
                                    <span className={title({ size: "xs", color: "red" })}>Create Match</span>

                                </CardHeader>
                                <CardBody className='flex flex-col gap-2'>

                                    <Input onValueChange={setHome}value={home}  size={"lg"} type="text" label="Home Team" placeholder="$CATCHI or Galatasaray" />
                                    <span className='w-full text-center'>vs</span>
                                    <Input onValueChange={setAway} value={away} size={"lg"} type="text" label="Away Team" placeholder="$BUNNY or Fenerbahçe" />

                                    <DatePicker
                                        label="Event Date"
                                        variant="flat"
                                        showMonthAndYearPickers
                                        value={eventDate}
                                        onChange={setEventDate}
                                    />

                                    <span className='p-2 rounded-lg bg-danger-500/10 text-danger-500'>
                                    <b>Warning:</b> The prediction process will be automatically disabled as soon as the Event Date begins. Event Date should be a date much further in the future than the current date.
                                    </span>
                                </CardBody>

                                <CardFooter>
                                    <Button onClick={()=>{
                                        handleCreateMatch();
                                    }} color='danger' fullWidth size='lg'>Create Match</Button>
                                </CardFooter>


                            </Card>
                        </div>



                    </div>
                </div>




            </div>

        </>
    );
}
export const BET_CREATE_TAB = memo(_SWAP_TAB)

