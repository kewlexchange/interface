import IPage from "../../../interfaces/page";
import React, { createRef, useEffect, useState } from "react";
import Plinko from "./components/Plinko";
import { popCnt } from "./util/math";
import { PLINKO_PAYOUT } from "./config";
import moment from "moment";
import { playFromBegin } from "./util/audio";
import sounds from "./config/sounds";
import PLINKO_LOGO from "../assets/plinko.png"
import { BigNumber, ethers } from "ethers";
import Identicon from "../../../Components/Identicon";
import { getNativeCurrencyByChainId } from "../../../utils";
import { useWeb3React } from "@web3-react/core";
import { useIMONTokenContract, usePlinkoContract } from "../../../hooks/useContract";
import { formatEther, parseEther } from "@ethersproject/units";
import useModal, { ModalNoProvider, ModalError, ModalLoading, ModalSuccessTransaction } from "../../../hooks/useModals";
import { sleep } from "./util/time";
import { CurrencyAmount } from "../../../entities";
import { title } from "../../../Components/Primitives";
import { HighlightGroup, HighlighterItem } from "../../../Components/HighlighterItem";
import { Button } from "@nextui-org/react";

const PlinkoGamePage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const [rows, setRows] = useState(16)
    const [risk, setRisk] = useState(3)
    const [balls, setBalls] = useState(1)
    const [betAmount, setBetAmount] = useState(10)
    const [resultColumn,setResultColumn] = useState(0);
    const [showResult,setShowResult] = useState(false);
    const plinko = createRef<Plinko>()
    const [platformInfo, setPlatformInfo]: any = useState(null);
    const [userInfo, setUserInfo]: any = useState(null);
    const PLINKODIAMOND = usePlinkoContract(chainId, true);
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const [lastGameInfo,setLastGameInfo] : any = useState(null)
    const [nftBoost,setNFTBoost] : any = useState(null)
    const IMON_TOKEN_CONTRACT = useIMONTokenContract(chainId,true);

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);


    const initDefaults = async () => {
        if(!PLINKODIAMOND){
            return;
        }
        if(!account){return}
        let userAccount = account;
        const [_accountInfo, _platformInfo] = await PLINKODIAMOND.getGameInfo(userAccount);
        setPlatformInfo(_platformInfo);
        setUserInfo(_accountInfo);
        const _nftBoost = await PLINKODIAMOND.getNFTBoost(userAccount);
        console.log("_nftBoost", _nftBoost)
        if(_accountInfo.games.length > 0){
            setLastGameInfo(_accountInfo.games[_accountInfo.games.length-1]);
   
        }
        setNFTBoost(_nftBoost);



    }



    const playGame = async () => {



        setTransaction({ hash: '', summary: '', error: {message:"No bonus tokens available! Wait the next round! ❤️"} });
        toggleError();
        return;

        

        setLastGameInfo(null)
        setShowResult(false)
        let betInfo = {
            betAmount: parseEther(betAmount.toString()),
            ballCount: balls,
            riskLevel: risk,
            totalRows: rows
        }
        let overrides = {
            value: betInfo.betAmount.mul(betInfo.ballCount)
        }
        playFromBegin(sounds.start);

        toggleLoading();
        await PLINKODIAMOND.playGame(betInfo, overrides).then(async (tx) => {
            await tx.wait();
            const summary = `Playing PLINKO: ${tx.hash}`
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

    useEffect(() => {
        if (!PLINKODIAMOND) { return; }
        initDefaults();

    }, [chainId, account])
 



    const onDisplayResult = async (ballInfo:any) => {
        setLastGameInfo(null)
        setShowResult(false)
        setResultColumn(BigNumber.from(ballInfo.luckyNumber).toNumber())
        setShowResult(true)
        playFromBegin(sounds.win);

    }


    const onPlay = async (lastGame : any) => {
        for await (const ballItem of lastGame.balls) {
        const resultNum = BigNumber.from(ballItem.luckyNumber).toNumber();
        plinko.current?.addBall(resultNum, resultNum,ballItem,onDisplayResult);
        await sleep(400)
    }
}

useEffect(() => {
    if (plinko.current) {
      console.log('Ref yüklendi:', plinko.current,lastGameInfo);
      if(lastGameInfo){
        onPlay(lastGameInfo)
      }
    
      
    }
  }, [plinko,lastGameInfo]);


    return (

        <>
            <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />
            <ModalError
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />


            <div className={"sm:max-w-3xl sm:min-w-3xl w-full mx-auto p-2"}>
                <div className={"w-full flex flex-col items-center justify-center"}>
                    <img src={PLINKO_LOGO} className="w-[500px] h-[300px]" />
                </div>
                <div className={"w-full flex flex-col items-center gap-4 justify-center mx-auto"}>

                    <div className="flex flex-col gap-2 w-full">
                        <div className="w-full cursor-pointer  rounded-lg">
                            <div className={"w-full flex flex-col gap-2"}>

                                <div className="grid grid-cols-2">
                                    <div className="w-full flex flex-row  gap-2 justify-start items-center">
                                        <Identicon size={48} account={ethers.constants.AddressZero} />
                                        <div className="w-full">
                                            <span className="text-2xl font-bold leading-none">
                                                PLINKO
                                            </span>
                                            <h3 className="text-base uppercase font-normal">Decentralized Plinko Game</h3>
                                        </div>
                                    </div>



                                </div>
                            </div>
                        </div>
                        <HighlightGroup className="grid sm:grid-cols-4 grid-cols-2 gap-2 text-white">
                            <HighlighterItem>
                                <div className=" p-4 rounded-lg flex flex-col gap-2 items-start justify-center">
                                <span className="text-base uppercase font-normal">Total Deposit</span>
                                <span className="font-bold leading-none flex flex-row items-center justify-center gap-2">
                                    <img alt="chiliz" className="w-5 h-5" src={"/images/coins/chz.svg"} />
                                    <span>{platformInfo ? formatEther(platformInfo.totalDeposit) : "0.0000"} {getNativeCurrencyByChainId(chainId)}</span>
                                </span>
                                </div>
                            </HighlighterItem>

                            <HighlighterItem>
                            <div className=" p-4 rounded-lg flex flex-col gap-2 items-start justify-center">
                                <span className="text-base uppercase font-normal">Total Player</span>
                                <span className="font-bold leading-none">
                                    {platformInfo ? BigNumber.from(platformInfo.playerCount).toNumber() : "0.0000"}
                                </span>
                                </div>
                            </HighlighterItem>

                            <HighlighterItem>
                            <div className=" p-4 rounded-lg flex flex-col gap-2 items-start justify-center">
                                <span className="text-base uppercase font-normal">Your Spendings </span>
                                <span className="font-bold leading-none flex flex-row items-center justify-center gap-2">
                                    <img alt="chiliz" className="w-5 h-5" src={"/images/coins/chz.svg"} />
                                    <span>{userInfo ? formatEther(userInfo.totalDeposit) : "0.0000"} {getNativeCurrencyByChainId(chainId)}</span>
                                </span>
                                </div>
                            </HighlighterItem>

                            <HighlighterItem>
                            <div className=" p-4 rounded-lg flex flex-col gap-2 items-start justify-center">

                                <span className="text-base uppercase font-normal">Your Earnings</span>
                                <span className="font-bold leading-none flex flex-row gap-2 items-center justify-center">
                                    <img alt="imon" className="w-5 h-5" src={"/images/coins/chz.svg"} />

                                    <span>{userInfo ? parseFloat(ethers.utils.formatEther(userInfo.totalWithdraw)).toFixed(4) : "0.0000"} {getNativeCurrencyByChainId(chainId)}</span>
                                </span>
                                </div>
                            </HighlighterItem>



                        </HighlightGroup>





                    </div>

                    <div className={"w-full flex flex-col gap-2 rounded-lg"}>
                        <div className={"w-full h-full rounded-lg mx-auto"}>
                            <div className=" grid sm:grid-cols-3  relative overflow-hidden w-full flex flex-col gap-2 w-full h-full border border-default rounded-lg">
                                <div className="w-full flex items-center justify-center  col-span-2 p-5">
                                    <Plinko
                                        gameInfo={lastGameInfo}
                                        className={""}
                                        ref={plinko}
                                        rows={rows}
                                        risk={risk}
                                        nightMode={false}
                                        showResult={showResult}
                                        resultColumn={resultColumn}
                                    />
                                </div>

                                <div className="col-span-2 sm:col-span-1 rounded-lg h-full flex flex-col items-center justify-center gap-2  w-full p-4 py-5 text-[#212120] text-center font-semibold text-[20px]">


                                    <div className="w-full">
                                        <span className="text-xs font-bold text-pink-900">PARTICIPATION</span>
                                        <div className="w-full bg-pink-100 flex flex-row items-center justify-between border border-b-4 rounded-full border border-pink-200 border border-b-pink-500 p-2">
                                            <button onClick={() => {
                                                playFromBegin(sounds.button);

                                                const _betAmount = betAmount > 10 ? betAmount / 2 : 10;
                                                if (_betAmount < 10) {
                                                    setBetAmount(10)
                                                } else {
                                                    setBetAmount(_betAmount)
                                                }

                                            }} className="relative btn bg-pink-500 rounded-full min-w-[48px] max-h-[48px] min-h-[48px] p-2 text-white flex text-center items-center justify-center border border-4 border border-pink-200 border border-pink-900">
                                                1/2
                                            </button>
                                            <span className="text-2xl text-white font-bold">{betAmount}</span>
                                            <button onClick={() => {
                                                playFromBegin(sounds.button);

                                                const _betAmount = betAmount * 2;
                                                if (_betAmount < 10) {
                                                    setBetAmount(10)
                                                } else {
                                                    setBetAmount(_betAmount)
                                                }

                                            }} className="relative btn bg-pink-500 rounded-full min-w-[48px] max-h-[48px] min-h-[48px] p-2 text-white flex text-center items-center justify-center border border-4 border border-pink-200 border border-pink-900">
                                                2X
                                            </button>
                                        </div>
                                    </div>

                                    <div className="w-full">
                                        <span className="text-xs font-bold text-pink-900">BALLS</span>
                                        <div className="w-full bg-pink-100 flex flex-row items-center justify-between border border-b-4 rounded-full border border-pink-200 border border-b-pink-500 p-2">
                                            <button onClick={() => {
                                                playFromBegin(sounds.button);

                                                const _balls = balls - 1;
                                                if (_balls < 1) {
                                                    setBalls(1)
                                                } else {
                                                    setBalls(_balls)
                                                }

                                            }} className="relative btn bg-pink-500 rounded-full min-w-[30px] min-h-[30px] p-2 text-white flex text-center items-center justify-center border border-4 border border-pink-200 border border-pink-900">
                                                <span translate="no" className="material-symbols-outlined">
                                                    remove
                                                </span>
                                            </button>
                                            <span className="text-2xl text-white font-bold">{balls}</span>
                                            <button onClick={() => {
                                                playFromBegin(sounds.button);

                                                const _balls = balls + 1 > 18 ? 18 : balls + 1;
                                                if (_balls < 1) {
                                                    setBalls(1)
                                                } else {
                                                    setBalls(_balls)
                                                }

                                            }} className="relative btn bg-pink-500 rounded-full min-w-[30px] min-h-[30px] p-2 text-white flex text-center items-center justify-center border border-4 border border-pink-200 border border-pink-900">
                                                <span translate="no" className="material-symbols-outlined">
                                                    add
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="w-full">
                                        <span className="text-xs font-bold text-pink-900">RISK LEVEL</span>
                                        <div className="w-full bg-pink-100 flex flex-row items-center justify-between border border-b-4 rounded-full border border-pink-200 border border-b-pink-500 p-2">
                                            <button onClick={() => {
                                                playFromBegin(sounds.button);

                                                const _risk = risk - 1;
                                                if (_risk < 1) {
                                                    setRisk(1)
                                                } else {
                                                    setRisk(_risk)
                                                }

                                            }} className="relative btn bg-pink-500 rounded-full min-w-[48px] min-h-[48px] p-2 text-white flex text-center items-center justify-center border border-4 border-pink-200  border-pink-900">
                                                <span translate="no" className="material-symbols-outlined">
                                                    keyboard_double_arrow_left
                                                </span>
                                            </button>
                                            <span className="text-2xl text-white font-bold">
                                                {risk == 1 ? "LOW" : risk == 2 ? "MID" : "HIGH"}
                                            </span>
                                            <button onClick={() => {
                                                playFromBegin(sounds.button);

                                                const _risk = risk + 1;
                                                if (_risk > 3) {
                                                    setRisk(3)
                                                } else {
                                                    setRisk(_risk)
                                                }

                                            }} className="relative btn bg-pink-500 rounded-full min-w-[48px] min-h-[48px] p-2 text-white flex text-center items-center justify-center border border-4 border border-pink-200  border-pink-900">
                                                <span translate="no" className="material-symbols-outlined">
                                                    keyboard_double_arrow_right
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="w-full">
                                        <span className="text-xs font-bold text-pink-900">ROWS</span>
                                        <div className="w-full bg-pink-100 flex flex-row items-center justify-between border border-b-4 rounded-full border border-pink-200 border border-b-pink-500 p-2">
                                            <button onClick={() => {
                                                playFromBegin(sounds.button);

                                                setRows(8)
                                            }} className="relative btn bg-pink-500 rounded-full min-w-[48px] max-h-[48px] min-h-[48px] p-2 text-white flex text-center items-center justify-center border border-4 border border-pink-200 border border-pink-900">
                                                <span translate="no" className="text-xl">
                                                    8
                                                </span>
                                            </button>
                                            <button onClick={() => {
                                                playFromBegin(sounds.button);

                                                setRows(12)
                                            }} className="relative btn bg-pink-500 rounded-full min-w-[48px] max-h-[48px] min-h-[48px] p-2 text-white flex text-center items-center justify-center border border-4 border border-pink-200 border border-pink-900">
                                                <span translate="no" className="text-xl">
                                                    12
                                                </span>
                                            </button>
                                            <button onClick={() => {
                                                playFromBegin(sounds.button);

                                                setRows(16)
                                            }} className="relative btn bg-pink-500 rounded-full min-w-[48px] max-h-[48px] min-h-[48px] p-2 text-white flex text-center items-center justify-center border border-4 border border-pink-200 border border-pink-900">
                                                <span translate="no" className="text-xl">
                                                    16
                                                </span>
                                            </button>
                                        </div>
                                    </div>


                                    <div className="w-full">
                                        <span className="text-xs font-bold text-pink-900">TOTAL</span>
                                        <div className="w-full bg-pink-100 flex flex-row items-center justify-center border border-b-4 rounded-full border border-pink-200 border border-b-pink-500 p-2">
                                            <span className="text-2xl text-white font-bold">{betAmount * balls} {getNativeCurrencyByChainId(chainId)}</span>
                                        </div>
                                    </div>


                                    <div className={"w-full gap-2 rounded-lg"}>
                                        <button className="btn btn-primary hover:bg-pink-200 w-full text-white text-2xl rounded-full border border-b-4 border border-b-pink-300" onClick={() => {
                                            playGame()
                                            //onPlay();
                                            //playFromBegin(sounds.button);
                                        }}>
                                            {
                                                isShowLoading ? <div className="w-full flex flex-row items-center justify-center gap-2"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg> <span>Please Wait</span> </div> : <span>Play</span>
                                            }
                                      
                                          
                                            </button>

                                    </div>
                                </div>



                            </div>
                        </div>

                        <div className="w-full py-4">
                            {userInfo &&
                                <div className="flex flex-col gap-2">
                                    <span className={title({size:"lg",color:"pink"})}>My Games</span>
                                    <div className="w-full grid sm:grid-cols-3 grid-cols-2 gap-2">
                                        {userInfo.games.slice().reverse().map((game, index) => (
                                            <div className={"w-full flex flex-col items-start justify-start text-start border border-default p-2 gap-2 rounded-lg"} key={index}>
                                                <div className="flex flex-col gap-2 w-full p-2">


                                                    <span className="text-sm text-pink-900">Participation Amount</span>
                                                    <div className="flex flex-col">

                                                        <span className="text-xs"> {formatEther(game.betAmount)} {getNativeCurrencyByChainId(chainId)}</span>
                                                    </div>

                                                    <div className="grid grid-cols-3 rounded-lg p-2 border border-default gap-2 text-center">
                                                        <div className="w-full">
                                                            <span className="text-sm text-pink-900">Balls</span>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs"> {BigNumber.from(game.balls.length).toNumber()}</span>
                                                            </div>
                                                        </div>
                                                        <div className="w-full">
                                                            <span className="text-sm text-pink-900">Risk</span>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs"> {BigNumber.from(game.risk).toNumber()}</span>
                                                            </div>
                                                        </div>

                                                        <div className="w-full">
                                                            <span className="text-sm text-pink-900">Rows</span>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs"> {BigNumber.from(game.rows).toNumber()}</span>
                                                            </div>
                                                        </div>

                                                        <Button size="sm" variant="flat" color={"default"} className="col-span-3" onClick={()=>{
                                                            onPlay(game);
                                                            
                                                        }}>Replay</Button>
                                                    </div>

                                                    <span className="text-sm text-pink-900">Total Deposit</span>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs"> {formatEther(game.totalDeposit)} {getNativeCurrencyByChainId(chainId)}</span>
                                                    </div>
                                                    <span className="text-sm text-pink-900">Total Reward</span>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs"> {formatEther(game.totalTokenReward)} CHZ</span>
                                                    </div>

                         
                                                    <div className="w-full hidden">

                                                    <span className="text-sm text-pink-900">NFT Boost</span>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs"> {formatEther(game.nftBoost)} IMON NFT</span>
                                                    </div>

                                                    <span className="text-sm text-pink-900">Total Reward</span>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs"> {formatEther(game.totalReward)} IMON</span>
                                                    </div>

                                                    <span className="text-sm text-pink-900">Minted Token Amount</span>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs"> {formatEther(game.mintedToken)} IMON</span>
                                                    </div>
                                                    <span className="text-sm text-pink-900">Minted Token Price</span>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs"> {formatEther(game.mintedTokenPrice)} IMON</span>
                                                    </div>
                                                    </div>

                                             


                                                </div>


                                            </div>
                                        ))}
                                    </div>
                                </div>
                            }
                        </div>

                  
                    </div>
                </div>
            </div>


        </>
    )
}


export default PlinkoGamePage;
