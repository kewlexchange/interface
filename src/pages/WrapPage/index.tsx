import IPage from "../../interfaces/page";
import React, {useEffect, useState} from "react";
import {AnimationHeader} from "../../Components/AnimationHeader";
import Identicon from "../../Components/Identicon";
import {ethers} from "ethers";
import {useDiamondContract, useExchangeContract, useWETH9Contract} from "../../hooks/useContract";
import {useWeb3React} from "@web3-react/core";
import {BigNumber} from "@ethersproject/bignumber";
import useModal, {ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction} from "../../hooks/useModals";
import {SocialLinks} from "../../Components/SocialLinks";
import {Unicon} from "../../Components/Unicon";
import {DEFAULT_CHAIN_ASSETS_URL} from "../../constants/chains";
import {formatEther, parseEther} from "ethers/lib/utils";
import {getIconByChainId, getNativeCurrencyByChainId} from "../../utils";
import {WETH9} from "../../entities";
const WrapPage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const EXCHANGE = useExchangeContract(chainId,true);

    const {state:isTransactionSuccess, toggle:toggleTransactionSuccess } = useModal();
    const {state:isShowLoading, toggle:toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({hash: '',summary: '',error: null})
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()

    const WETH9Contract = useWETH9Contract()


    const [amount,setAmount] = useState("0")
    const [userBalance,setUserBalance] = useState("0")
    const [userWETHBalance,setUserWETHBalance] = useState("0")
    const [weth9Address,setWETH9Address] = useState(ethers.constants.AddressZero);

    const handleWrap = async () => {
        if(!account){
            setTransaction({ hash: '', summary: '', error:{message:"No Account Detected!"} });
            toggleError();
            return;
        }
        if(!amount){
            setTransaction({ hash: '', summary: '', error:{message:"Invalid Amount"} });
            toggleError();
            return;
        }
        if(parseEther(amount).eq(0)){
            setTransaction({ hash: '', summary: '', error:{message:"Invalid Amount"} });
            toggleError();
            return;
        }
        const WETH9Token = await WETH9Contract("0x721EF6871f1c4Efe730Dce047D40D1743B886946");
        toggleLoading();
        await WETH9Token.deposit({value:parseEther(amount)}).then(async (tx)=>{
            await tx.wait();
            const summary = `Wrapping Native Currency: ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error:null});
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error:error });
            toggleError();
        }).finally(async ()=>{
            toggleLoading();
            initDefaults();
        });
    }

    const handleUnwrap = async () => {
        if(!account){
            setTransaction({ hash: '', summary: '', error:{message:"No Account Detected!"} });
            toggleError();
            return;
        }
        if(!amount){
            setTransaction({ hash: '', summary: '', error:{message:"Invalid Amount"} });
            toggleError();
            return;
        }
        if(parseEther(amount).eq(0)){
            setTransaction({ hash: '', summary: '', error:{message:"Invalid Amount"} });
            toggleError();
            return;
        }
        const WETH9Token = await WETH9Contract("0x721EF6871f1c4Efe730Dce047D40D1743B886946");
        toggleLoading();
        await WETH9Token.withdraw(parseEther(amount)).then(async (tx)=>{
            await tx.wait();
            const summary = `Unwrapping Native Currency: ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error:null});
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error:error });
            toggleError();
        }).finally(async ()=>{
            toggleLoading();
            initDefaults();
        });
    }
    
    const initDefaults = async () => {
        if(!EXCHANGE){return;}
        if(!account){return;}
        const _weth9Address = "0x721EF6871f1c4Efe730Dce047D40D1743B886946";
        setWETH9Address(_weth9Address);
        let abiERC = [
            'function allowance(address owner, address spender)',
            'function balanceOf(address addr)',
            'function getEthBalance(address addr)',
        ];
        let abiInterfaceParam = new ethers.utils.Interface(abiERC)

        let multicallParams = [
            {
                target: _weth9Address,
                callData: abiInterfaceParam.encodeFunctionData("balanceOf", [account])
            },
            {
                target: EXCHANGE.address,
                callData: abiInterfaceParam.encodeFunctionData("getEthBalance", [account])
            }
        ];

        let abiERCResults = [
            {"type":'uint256',"variable":"tokenBalance"},
            {"type":'uint256',"variable":"etherBalance"},
        
        ];

        let multicallResponseObjects = {"tokenBalance":0,"etherBalance":0};
        try{
            const [blockNum, multicallResult] = await EXCHANGE.callStatic.aggregate(multicallParams)
            for (let i = 0; i < multicallResult.length; i++) {
                const decodeType = `${abiERCResults[i]["type"]} ${abiERCResults[i]["variable"]}`;
                let encodedMulticallData = multicallResult[i];
                const decodedMulticallData = ethers.utils.defaultAbiCoder.decode( [decodeType],encodedMulticallData)
                multicallResponseObjects[abiERCResults[i]["variable"]] = decodedMulticallData[abiERCResults[i]["variable"]];
            }
        }catch (e){

        }

        setUserBalance(ethers.utils.formatEther(multicallResponseObjects.etherBalance));
        setUserWETHBalance(ethers.utils.formatEther(multicallResponseObjects.tokenBalance));


       // await IMONDIAMOND
    }

    const handleChangeInput = (e) => {
        setAmount(e.target.value)
    }

    useEffect(()=>{
        initDefaults()
    },[chainId,account])

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

            <div className={"container mt-[20px] mx-auto"}>
        
                <div className={"w-3/4 sm:w-full content-background flex flex-col items-center gap-4 justify-center mx-auto border border-1 rounded-2xl p-5"}>
                    <div className={"w-full p-5 rounded-lg"}>
                        <p>
                            If you have W{getNativeCurrencyByChainId(chainId)}, you can unwrap it and get {getNativeCurrencyByChainId(chainId)}. After unwrapping (a.k.a. burning) it, you get the original {getNativeCurrencyByChainId(chainId)} back. The burned W{getNativeCurrencyByChainId(chainId)} is returned as {getNativeCurrencyByChainId(chainId)} and deposited into the former W{getNativeCurrencyByChainId(chainId)} holder’s crypto wallet.
                        </p>
                    </div>
                
                    <div className="rounded-xl flex flex-col gap-2 p-2 w-full">
                            <div className="border border-1 rounded-xl p-4 gap-2 flex flex-col">
                            
                                <div className="flex items-center justify-start p-2">
                                    <div className="w-[100px] max-w-[100px] flex items-center gap-x-2 border-r transparent-border-color pr-8 py-4 select-none cursor-pointer">
                                        <img src={getIconByChainId(chainId)} className="w-5 h-5" alt=""/>{getNativeCurrencyByChainId(chainId)}</div>
                                    <div className="w-full flex px-2 items-center justify-between relative">
                                        <input  onChange={(e) => {
                                            handleChangeInput(e)
                                        }
                                        } type="text" placeholder="Please enter amount"  className="p-5 w-full rounded-lg font-semibold  text-xl"  value={amount}/>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t flex-wrap p-2">
                                    <div className="whitespace-nowrap">
                                        <span  className="text-sm font-semibold ">Balance :</span> <button onClick={()=>{
                                            setAmount(userBalance)
                                            }}>{userBalance} {getNativeCurrencyByChainId(chainId)}</button>
                                    </div>
                                    <div className="whitespace-nowrap">
                                        <span  className="text-sm font-semibold ">Balance :</span> <button onClick={()=>{
                                            setAmount(userWETHBalance);
                                        }}>{userWETHBalance} W{getNativeCurrencyByChainId(chainId)} </button>
                                    </div>
                                </div>
                        </div>
                        <div className={"w-full flex flex-row items-center justify-center gap-2"}>
                    <button onClick={()=>{
                        handleWrap();
                    }} className={"btn btn-primary  w-full flex flex-col items-start justify-start"}>
                        <span>Wrap</span>
                        <span className={"text-xs"}>{getNativeCurrencyByChainId(chainId)} to W{getNativeCurrencyByChainId(chainId)}</span></button>
                    <button onClick={()=>{
                        handleUnwrap();
                    }} className={"btn btn-primary flex w-full flex-col items-start justify-start"}>
                        <span>Unwrap</span>
                        <span className={"text-xs"}>W{getNativeCurrencyByChainId(chainId)} to {getNativeCurrencyByChainId(chainId)}
                        </span></button>
                    </div>
                </div>
            </div>
            </div>
        </>
    )
}


export default WrapPage;
