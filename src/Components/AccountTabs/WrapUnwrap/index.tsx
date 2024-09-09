import React, { useEffect, useState, useRef } from 'react';
import { useWeb3React } from "@web3-react/core";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { getIconByChainId, getNativeCurrencyByChainId } from '../../../utils';
import useModal, { ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction } from '../../../hooks/useModals';
import { WETH9 } from '../../../entities';
import {formatEther, parseEther} from "ethers/lib/utils";
import { useExchangeContract, useWETH9Contract } from '../../../hooks/useContract';
import {ethers} from "ethers";
import { Button, Input } from '@nextui-org/react';

export const WrapTab = (props: {account})=> {
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
        const _weth9Address ="0x721EF6871f1c4Efe730Dce047D40D1743B886946";
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


        <div className={"w-full flex gap-2 flex-col"}>
                    <div className={"w-full p-2 rounded-lg"}>
                        <p className='text-xs'>
                            If you have W{getNativeCurrencyByChainId(chainId)}, you can unwrap it and get {getNativeCurrencyByChainId(chainId)}. After unwrapping (a.k.a. burning) it, you get the original {getNativeCurrencyByChainId(chainId)} back. The burned W{getNativeCurrencyByChainId(chainId)} is returned as {getNativeCurrencyByChainId(chainId)} and deposited into the former W{getNativeCurrencyByChainId(chainId)} holder’s crypto wallet.
                        </p>
                    </div>
                
                    <div className="rounded-xl flex flex-col gap-2 w-full">
                            <div className="rounded-xl gap-2 flex flex-col">
                            
                                <div className="flex items-center justify-start"> 
                                    <Input startContent={
                                        <img src={getIconByChainId(chainId)} className="w-5 h-5" alt=""/>
                                    } endContent={<span>CHZ</span>}  onChange={(e) => {
                                            handleChangeInput(e)
                                        }} type="number" size='lg' value={amount} isClearable variant={"bordered"} label="Amount" placeholder="Please enter amount" />
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
                    <Button size='lg' color='danger' onClick={()=>{
                        handleWrap();
                    }} className={"w-full flex flex-row items-center justify-center"}>
                        <span>Wrap</span>
                        <span className={"text-xs"}>{getNativeCurrencyByChainId(chainId)} to W{getNativeCurrencyByChainId(chainId)}</span>
                        </Button>
                    <Button size='lg' color='danger' onClick={()=>{
                        handleUnwrap();
                    }} className={" flex w-full flex-row items-center justify-center"}>
                        <span>Unwrap</span>
                        <span className={"text-xs"}>W{getNativeCurrencyByChainId(chainId)} to {getNativeCurrencyByChainId(chainId)}
                        </span>
                        </Button>
                    </div>
                </div>
        </div>
        </>
    );
}
