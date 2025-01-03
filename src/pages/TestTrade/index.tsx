import IPage from "../../interfaces/page";
import React, {useEffect, useState} from "react";
import {NavLink} from "react-router-dom";
import Identicon from "../../Components/Identicon";
import {
    generateExplorerURLByChain, getAssetIconByChainId,
    getIconByChainId,
    getNativeCurrencyByChainId, parseFloatWithDefault,
    unixTimeToDateTime
} from "../../utils";
import {BigNumber} from "@ethersproject/bignumber";
import {ethers} from "ethers";
import {useWeb3React} from "@web3-react/core";
import {
    useDiamondContract,
    useERC20Contract,
    useExchangeContract,
    useIntelliTradeContract,
    usePAIRContract
} from "../../hooks/useContract";
import useModal, {
    ModalError,
    ModalLoading,
    ModalNoProvider,
    ModalSelectToken,
    ModalSuccessTransaction
} from "../../hooks/useModals";
import {formatEther, formatUnits, parseEther, parseUnits} from "ethers/lib/utils";
import useDebounce from "../../hooks/useDebounce";
import {AnimationHeader} from "../../Components/AnimationHeader";
import {UnlockStakePool} from "../../Components/UnlockStakePool";
import {ChainId, DEFAULT_CHAIN_ASSETS_URL, isSupportedChain} from "../../constants/chains";
import {CurrencyAmount, Pair, Route, Token, Trade, WETH9} from "../../entities";
import moment from "moment/moment";
import JSBI from "jsbi";
import {ETHER_ADDRESS, TradeType} from "../../constants/misc";
import {Chart} from "../../Components/Chart";
import {getChainInfoOrDefault} from "../../constants/chainInfo";
import {useAppSelector} from "../../state/hooks";
import {useFetchAllTokenList} from "../../state/user/hooks";

const TestTrade: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const IntelliTradeContract = useIntelliTradeContract(chainId,true)
    const {state: isTransactionSuccess, toggle: toggleTransactionSuccess} = useModal();
    const {state: isShowLoading, toggle: toggleLoading} = useModal();
    const {state: isErrorShowing, toggle: toggleError} = useModal()
    const [transaction, setTransaction] = useState({hash: '', summary: '', error: null})
    const {state: isNoProvider, toggle: toggleNoProvider} = useModal()
    const {state: isSelectToken, toggle: toggleSelectToken} = useModal()

    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])
    const [baseAsset,setBaseAsset] = useState(null)
    const [quoteAsset,setQuoteAsset] = useState(null)
    const [isBase,setIsBase] = useState(true)

    const [baseLiquidity,setBaseLiquidity] = useState("0")
    const [quoteLiquidity, setQuoteLiquidity] = useState("0")

    const [baseInputValue,setBaseInputValue] = useState("")
    const [quoteInputValue,setQuoteInputValue] = useState("")

    const [baseTokenAllowance,setBaseTokenAllowance] = useState(0)
    const [quoteTokenAllowance,setQuoteTokenAllowance] = useState(0)
    const ERC20Contract = useERC20Contract()
    const [pairInfo,setPairInfo] = useState(null)
    const PAIRContract = usePAIRContract()
    const [hasLiquidity,setHasLiquidity] = useState(false)
    const [tradeInfoList,setTradeInfoList] = useState([])

    const [bestSellOrder,setBestSellOrder] = useState(null)
    const [bestBuyOrder,setBestBuyOrder] = useState(null)
    const [tradeParams,setTradeParams] = useState(null)

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);


    const fixCurrencyFormat = (inputVal:CurrencyAmount<Token>) => {
        return parseUnits(inputVal.toSignificant(),inputVal.currency.decimals)
    }

    const testAsset = async () => {
        let usdc = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
        let weth = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
        let usdt = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"

        const tradingPairs = {
            [ChainId.ARBITRUM_ONE]:{
                pairs:[
                    {"name":"sushi","pair":"USDC/WETH","address":["0x905dfCD5649217c42684f23958568e533C711Aa3"]},
                    {"name":"lfgswap","pair":"USDC/WETH","address":["0x101Ec5d2F85DF15df968CAEA715967F3Ab098d5E"]},
                    {"name":"zyber","pair":"USDC/WETH","address":["0x8b8149Dd385955DC1cE77a4bE7700CCD6a212e65"]},
                    {"name":"degenbrains","pair":"USDC/WETH","address":["0xE36F5BC0b0dca21B5918dFa2580F7BA2a6D907d7"]},
                    {"name":"arbswap","pair":"USDC/WETH","address":["0x6E8AEE8Ed658fDCBbb7447743fdD98152B3453A0"]},
                ]
            },
            [ChainId.BITCI]:{
                    pairs:[
                        {"name":"imondex","pair":"IMON/WBITCI","address":["0xcdD3157DC5E16a11A36c10508fa97656C692973d"]},
                    ]
                }
        }

        const dexPairs = tradingPairs[chainId]
        if(!dexPairs){return}
        const pairList = dexPairs.pairs.map((item,index)=>{return item.address[0]})

        const _inTradeList = []
        const _outTradeList = []
        const _bestInTradeList = []
        const _bestOutTradeList = []



        const _reserves = await IntelliTradeContract.getPairReserves(pairList);

        let _bestSellAmount = JSBI.BigInt(0)
        let _bestBuyAmount = JSBI.BigInt(0)

        _reserves.map((reserve,index)=>{
            console.log("RESERVE",reserve)
            const baseToken = new Token(chainId, reserve.base.token, BigNumber.from(reserve.base.decimals).toNumber(),reserve.base.symbol)
            const quoteToken= new Token(chainId, reserve.quote.token, BigNumber.from(reserve.quote.decimals).toNumber(),reserve.quote.symbol)

            const baseInputAmount = baseInputValue
            const quoteInputAmount = baseInputValue

            const baseAmount : CurrencyAmount<Token> = CurrencyAmount.fromRawAmount( baseToken, JSBI.BigInt(ethers.utils.parseUnits(baseInputAmount,baseToken.decimals).toString()));
            const quoteAmount : CurrencyAmount<Token> = CurrencyAmount.fromRawAmount( quoteToken, JSBI.BigInt(ethers.utils.parseUnits(quoteInputAmount,quoteToken.decimals).toString()));

            const exchangePairInput = new Pair(
                CurrencyAmount.fromRawAmount(baseToken, reserve.base.reserve),
                CurrencyAmount.fromRawAmount(quoteToken, reserve.quote.reserve)
            )
            let exactInputBaseXQuote = new Trade(
                new Route([exchangePairInput], baseToken, quoteToken),
                CurrencyAmount.fromRawAmount(baseToken, baseAmount.quotient),
                TradeType.EXACT_INPUT
            )

            if(exactInputBaseXQuote.outputAmount.greaterThan(_bestSellAmount)){
                console.log("HERE")
                _bestSellAmount = exactInputBaseXQuote.outputAmount.quotient
                setBestSellOrder({tradeInfo:exactInputBaseXQuote,reserveInfo:reserve,dex:dexPairs.pairs[index].name})
            }


            let exactInputQuoteXBase = new Trade(
                new Route([exchangePairInput],quoteToken,baseToken),
                CurrencyAmount.fromRawAmount(quoteToken, exactInputBaseXQuote.outputAmount.quotient),
                TradeType.EXACT_INPUT
            )

            _reserves.map((reserveEx,indexEx)=>{
                const exchangePairInputEx = new Pair(
                    CurrencyAmount.fromRawAmount(baseToken, reserveEx.base.reserve),
                    CurrencyAmount.fromRawAmount(quoteToken, reserveEx.quote.reserve)
                )
                let exactInputQuoteXBase = new Trade(
                    new Route([exchangePairInputEx],quoteToken,baseToken),
                    CurrencyAmount.fromRawAmount(quoteToken, exactInputBaseXQuote.outputAmount.quotient),
                    TradeType.EXACT_INPUT
                )
                if(exactInputQuoteXBase.outputAmount.greaterThan(_bestBuyAmount)){
                    setBestBuyOrder({tradeInfo:exactInputQuoteXBase,reserveInfo:reserve,dex:dexPairs.pairs[indexEx].name})
                    _bestBuyAmount = exactInputQuoteXBase.outputAmount.quotient
                    _bestInTradeList.push({tradeInfo:exactInputQuoteXBase,reserveInfo:reserve,dex:dexPairs.pairs[indexEx].name})
                }
            })

            _inTradeList.push({tradeInfo:exactInputBaseXQuote,reserveInfo:reserve,dex:dexPairs.pairs[index].name})
            _outTradeList.push({tradeInfo:exactInputQuoteXBase,reserveInfo:reserve,dex:dexPairs.pairs[index].name})
        })

        let trades = []
        if(bestSellOrder){
            trades.push(bestSellOrder)
        }
        if(bestBuyOrder){
            trades.push(bestBuyOrder)
        }

        setTradeInfoList(trades.concat(_inTradeList.concat(_outTradeList)).concat(_bestInTradeList))

        if(bestSellOrder && bestSellOrder){

        const _tradeParams = {
            token:bestSellOrder.tradeInfo.inputAmount.currency.address,
            amountIn: fixCurrencyFormat(bestSellOrder.tradeInfo.inputAmount),
            orders:[
                {
                    base:bestSellOrder.tradeInfo.inputAmount.currency.address,
                    quote:bestSellOrder.tradeInfo.outputAmount.currency.address,
                    pair:bestSellOrder.tradeInfo.route.pairs[0].liquidityToken.address,
                },
                {
                    base:bestBuyOrder.tradeInfo.inputAmount.currency.address,
                    quote:bestBuyOrder.tradeInfo.outputAmount.currency.address,
                    pair:bestBuyOrder.tradeInfo.route.pairs[0].liquidityToken.address
                }
            ]
         };
            setTradeParams(_tradeParams)

        console.log(_tradeParams)

        }

    }

    const handleApprove = async () =>{
        if(!tradeParams){
            return;
        }
        console.log(tradeParams.token);
        let poolToken = ERC20Contract(tradeParams.token);
        const transferAmount = ethers.constants.MaxUint256
        toggleLoading();
        await poolToken.approve(IntelliTradeContract.address, transferAmount, { from: account }).then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking tokens for: ${IntelliTradeContract.address}`
            setTransaction({ hash: tx.hash, summary: summary, error:null});
            await provider.getTransactionReceipt(tx.hash).then(()=>{
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error:error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
        });

    }
    const handleTrade = async () =>{
        if(!tradeParams){
            return;
        }
        toggleLoading()

       // baseToken.address,tradeAmount,orders

        await IntelliTradeContract.doTrade(tradeParams.token,tradeParams.amountIn,tradeParams.orders).then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking tokens for: ${IntelliTradeContract.address}`
            setTransaction({ hash: tx.hash, summary: summary, error:null});
            await provider.getTransactionReceipt(tx.hash).then(()=>{
                toggleTransactionSuccess();
            });
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error:error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
        });
    }


    useEffect(()=>{
        if(baseInputValue != ""){
            if(parseFloatWithDefault(baseInputValue,0)>0){
                testAsset()
            }
        }

    },[baseInputValue])

    const setInputValue = (e,isBase) => {
        const regex = /^[0-9]*\.?[0-9]*$/;
        if (regex.test(e)) {
            if(isBase){
                setBaseInputValue(e)
            }else{
                setQuoteInputValue(e)
            }
        }
        setIsBase(isBase)
    }


    return (

        <>
            <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider}/>
            <ModalError
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading}
                          isShowing={isShowLoading}/>
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess}
                                     isShowing={isTransactionSuccess}/>


            <div className={"container mx-auto my-5 swap"}>

                <div className={"mx-auto w-full sm:w-full"}>

                    <div className={"grid grid-cols-1 mx-auto w-full sm:w-full gap-2"}>

                        <div className=" rounded-xl transparent-bg px-4 pb-4 w-full">
                            <div className="transparent-bg rounded-xl pb-0 mt-4 mb-4">
                                <div className="flex items-center justify-between border-b transparent-border-color flex-wrap p-2 py-4">
                                    <span translate={"no"} className="flex items-center gap-x-2 whitespace-nowrap">SWAP</span>
                                </div>


                                <div className="swap-inputs p-2">
                                    <div className="input sm:order-1">

                                        {
                                            baseAsset &&
                                            <div onPress={()=>{
                                                setIsBase(true)
                                                toggleSelectToken()
                                            }} className="token-selector">
                                                <img src={baseAsset.logoURI} alt=""/>
                                                <div>{baseAsset.symbol}</div>
                                                <span className="material-symbols-outlined font-bold -ml-1">
                                                                expand_more
                                                            </span>
                                            </div>
                                        }

                                        <input value={baseInputValue} onChange={(e)=>{
                                            setInputValue(e.target.value,true)
                                        }} inputMode="decimal" autoComplete="off" autoCorrect="off" type="text"
                                               pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0" minLength={0} maxLength={100} spellCheck="false"/>
                                    </div>

                                    <div className={"w-full grid grid-cols-2 gap-2"}>

                                        <button onPress={()=>{
                                            handleApprove()
                                        }} className={"btn btn-primary"}>
                                            Unlock
                                        </button>
                                        <button onPress={()=>{
                                            handleTrade()
                                        }} className={"btn btn-primary"}>
                                            Trade
                                        </button>
                                    </div>



                                </div>
                            </div>

                        </div>



                    </div>


                    <table className={"w-full bg-white text-black gap-2"}>
                        <thead>
                            <tr>
                                <td>DEX</td>
                                <td>Pair</td>
                                <td>Trade Type</td>
                                <td>Input</td>
                                <td>Output</td>
                                <td>Price Impact</td>
                                <td>Price Base</td>
                                <td>Price Quote</td>
                            </tr>
                        </thead>
                        {
                            tradeInfoList.map(({tradeInfo,dex},index) => {
                              return (
                                  <tr className={"w-full"}  key={`trade${index}`}>
                                      <td>
                                          <span>{dex}</span>
                                          <input type={"text"} value={tradeInfo.route.pairs[0].liquidityToken.address}/>
                                      </td>
                                      <td>
                                          <span>{tradeInfo.executionPrice.baseCurrency.symbol} {tradeInfo.executionPrice.quoteCurrency.symbol}</span>
                                      </td>
                                      <td>
                                          {tradeInfo.tradeType == 0 ? "EXACT_IN" : "EXACT_OUT"}
                                      </td>

                                      <td>
                                          <span>{tradeInfo.inputAmount.toSignificant()}</span>
                                      </td>
                                      <td>
                                          <span>{tradeInfo.outputAmount.toSignificant()}</span>
                                      </td>
                                      <td>
                                          <span>{tradeInfo.priceImpact.toFixed(2)}%</span>
                                      </td>

                                      <td>
                                          <span>{tradeInfo.executionPrice.toSignificant()} {tradeInfo.outputAmount.currency.symbol} per {tradeInfo.inputAmount.currency.symbol}</span>
                                      </td>
                                      <td>
                                          <span>{tradeInfo.executionPrice.invert().toSignificant()} {tradeInfo.inputAmount.currency.symbol} per {tradeInfo.outputAmount.currency.symbol}</span>
                                      </td>
                                  </tr>)
                            })
                        }

                    </table>
                </div>
            </div>

        </>
    )
}


export default TestTrade;
