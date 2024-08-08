import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ETHER_ADDRESS, TradeType } from '../../../constants/misc';
import { BigNumber, ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import moment from 'moment';
import { Route as ReactRoute, NavLink } from 'react-router-dom';
import { CHAIN_IDS_TO_NAMES, ChainId, isSupportedChain } from '../../../constants/chains';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract, useStakeContract, useDomainContract, useBridgeContract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalInfo } from '../../../hooks/useModals';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { useFetchAllTokenList } from '../../../state/user/hooks';
import { getAssetIconByChainIdFromTokenList, getIconByChainId, getNativeCurrencyByChainId, parseFloatWithDefault, unixTimeToDateTime } from '../../../utils';
import { Accordion, AccordionItem, Avatar, Image,Button, Card, Select, SelectItem, User } from '@nextui-org/react';
import { formatEther, formatUnits, parseEther, parseUnits } from '@ethersproject/units';
import { WETH9 } from '../../../entities';
import { getChainInfo } from '../../../constants/chainInfo';

const _BRIDGE_TAB = () => {
    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const EXCHANGE = useExchangeContract(chainId, true)
    const IMON_BRIDGE_CONTRACT = useBridgeContract(chainId, true);
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

    const [sourceChain, setSourceChain] = useState(new Set([]));
    const [targetChain, setTargetChain] = useState(new Set([]));


    useFetchAllTokenList(chainId, account)


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
        toggleSelectToken()
    }


    const initDefaults = async () => {
        let _baseAssetAddress = baseAsset.address === ETHER_ADDRESS ? WETH9[chainId].address : baseAsset.address;
        let _isWETH = baseAsset.address === ETHER_ADDRESS ? false : true;

        if (_isWETH) {
            const ERC20Token = ERC20Contract(baseAsset.address)
            const _allowanceAmount = await ERC20Token.allowance(account, IMON_BRIDGE_CONTRACT.address);
            setAllowanceAmount(_allowanceAmount);

            console.log("baseAsset:", baseAsset)

            if (baseInputValue) {
                let _baseInputVal = parseUnits(baseInputValue, baseAsset.decimals);
                if (allowanceAmount.gte(_baseInputVal)) {
                    setUnlockRequired(false)
                } else {
                    setUnlockRequired(true)
                }
            }
        } else {
            setAllowanceAmount(ethers.constants.MaxUint256)
        }

        const [_isRegistered, _Address] = await CNS_DOMAIN_CONTRACT.isRegistered(account);
        setCNSRegistered(_isRegistered);
    
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
        if (!baseInputValue) { return }
        if (!baseAsset) { return }
        let depositAmount = ethers.utils.parseUnits(baseInputValue, baseAsset.decimals);
        toggleLoading();
        const ERC20Token = ERC20Contract(baseAsset.address)
        await ERC20Token.approve(IMON_BRIDGE_CONTRACT.address, depositAmount, { from: account }).then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking tokens for: ${IMON_BRIDGE_CONTRACT.address}`
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
 
    

    const supportedChainList = [
        {chainId:ChainId.CHILIZ_MAINNET,chainInfo:getChainInfo(ChainId.CHILIZ_MAINNET)},
        {chainId:ChainId.ARBITRUM_ONE,chainInfo:getChainInfo(ChainId.ARBITRUM_ONE)}
    ]


    const handleTransferAssets = async () =>{

        let sourceChainId = sourceChain.values().next().value;
        let targetChainId = targetChain.values().next().value;

        if (!baseInputValue) { 
            setTransaction({ hash: '', summary: '', error: { message: "Invalid Amount!" } });
            toggleError();
            return 
        }
        if (!isCNSRegistered) {
            setTransaction({ hash: '', summary: '', error: { message: "CNS Registration is Required!" } });
            toggleError();
            return
        }

        if((!sourceChainId) || (!targetChainId) || (sourceChainId == targetChainId)){
            setTransaction({ hash: '', summary: '', error: { message: "Invalid Chain!" } });
            toggleError();
            return;
        }

        let _baseAssetAddress = baseAsset.address === ETHER_ADDRESS ? WETH9[chainId].address : baseAsset.address;
        const ERC20Token = ERC20Contract(_baseAssetAddress)
        const _allowanceAmount = await ERC20Token.allowance(account, IMON_BRIDGE_CONTRACT.address);

        if(chainId != sourceChainId){
            setTransaction({ hash: '', summary: '', error: { message: "Please Switch Chain!" } });
            toggleError();
            return;
        }

        toggleLoading();
        const depositAmount = parseUnits(baseInputValue,baseAsset.decimals);
        if(depositAmount.gt(_allowanceAmount)){
          
            await ERC20Token.approve(IMON_BRIDGE_CONTRACT.address, depositAmount, { from: account }).then(async (tx) => {
                await tx.wait();
                const summary = `Unlocking tokens for: ${IMON_BRIDGE_CONTRACT.address}`
                setTransaction({ hash: tx.hash, summary: summary, error: null });
                await provider.getTransactionReceipt(tx.hash).then(() => {
             
                });
            }).catch((error: Error) => {
                setTransaction({ hash: '', summary: '', error: error });
                toggleError();
                toggleLoading();
            })
        }

        const [bridgeFees,asset] = await IMON_BRIDGE_CONTRACT.getBridgeInfo(sourceChainId,targetChainId,_baseAssetAddress)
        let overrides = {
            value : asset.gasFee
        }

        let depositParams = {
            token:_baseAssetAddress,
            receiver:account,
            amount:depositAmount,
            fromChainId:sourceChainId,
            toChainId:targetChainId
       }

        
       await IMON_BRIDGE_CONTRACT.deposit(depositParams, overrides).then(async (tx) => {
        await tx.wait();
        const summary = `KEWL BRIDGE : ${tx.hash}`
        setTransaction({ hash: tx.hash, summary: summary, error: null });
        toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
        });
        console.log("BASE",baseAsset,baseInputValue,asset,bridgeFees);
         
    }

    useEffect(() => {
        if(targetChain.has(sourceChain.values().next.toString())){
            setTargetChain(null)
        }
    }, [sourceChain])

    useEffect(() => {
        if(sourceChain.has(targetChain.values().next.toString())){
            setSourceChain(null)
        }
    }, [targetChain])


    useEffect(() => {
        if (!chainId) { return; }
        if (!defaultAssets) { return }
        if (defaultAssets.length === 0) { return }

        setBaseAsset(defaultAssets.find(token => token?.symbol === "KWL"))
    }, [defaultAssets])

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

            <ModalSelectToken disableToken={baseAsset} hide={toggleSelectToken} isShowing={isSelectToken} onSelect={onSelectToken} isClosable={true} tokenList={defaultAssets} onSelectPair={null} allExchangePairs={null} />


            {

                <div className="w-full rounded-xl">
                    <div className="rounded-xl flex gap-2 flex-col">
                        <div className="swap-inputs">
                            <div className="input sm:order-1">

                                {
                                    <>
                                        <Button className="token-selector" radius='full' variant="flat" color="default" onClick={() => {
                                    setIsBase(true)
                                    //toggleSelectToken()
                                }} startContent={
                                    <Image className='w-[32px] h-[32px] min-w-[32px] min-h-[32px] max-h-[32px] max-w-[32px]' src={baseAsset?.logoURI} />
                                }
                                    endContent={
                                        <span translate={"no"} className="material-symbols-outlined ">
                                            expand_more
                                        </span>
                                    }
                                >{baseAsset?.symbol}
                                </Button>
                            

</>
                                  
                                }

                                <div onClick={() => {
                                    setInputValue(baseAsset?.balance, true)
                                }} className="balance  cursor-pointer">
                                    Balance: {baseAsset && baseAsset.balance}
                                </div>



                                <input value={baseInputValue} onChange={(e) => {
                                    setInputValue(e.target.value, true)
                                }} inputMode="decimal" autoComplete="off" autoCorrect="off" type="text"
                                    pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0" minLength={0} maxLength={100} spellCheck="false" />
                            </div>


                        </div>
                        <div className='w-full flex flex-col gap-2'>

                            <Select
                                items={supportedChainList}
                                label="Source Chain"
                                size='lg'
                                value={sourceChain}
                                onSelectionChange={setSourceChain}

                                className="w-full"
                                variant="flat"
                                selectionMode={"single"}
                                renderValue={(items) => {
                                    return items.map((item, index) => (
                                        <div key={`item${index}`} className="flex items-center gap-2">
                                            <User   
                                                name={item.data.chainInfo.nativeCurrency.symbol}
                                                description={item.data.chainInfo.label}
                                                avatarProps={{
                                                    className:"w-6 h-6",
                                                    src: item.data.chainInfo.logoUrl
                                                }}
                                                />
                                        </div>
                                    ));
                                }}
                            >
                                {(user) => (
                                    <SelectItem isReadOnly={targetChain.has(user.chainId.toString())}  key={user.chainId}  value={user.chainInfo.label}>
                                        <div className="flex gap-2 items-center">
                                            <Avatar alt={user.chainInfo.label} className="flex-shrink-0" size="sm" src={user.chainInfo.logoUrl} />
                                            <div className="flex flex-col">
                                                <span className="text-small">{user.chainInfo.nativeCurrency.symbol}</span>
                                                <span className="text-tiny text-default-400">{user.chainInfo.label}</span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                )}
                            </Select>

                            <Select
        
                                items={supportedChainList}
                                label="Target Chain"
                                size='lg'
                                className="w-full"
                                variant="flat"
                                value={targetChain}
                                onSelectionChange={setTargetChain}
                                renderValue={(items) => {
                                    return items.map((item, index) => (
                                        <div key={`item${index}`} className="flex items-center gap-2">
                                            <User   
                                                name={item.data.chainInfo.nativeCurrency.symbol}
                                                description={item.data.chainInfo.label}
                                                avatarProps={{
                                                    className:"w-6 h-6",
                                                    src: item.data.chainInfo.logoUrl
                                                }}
                                                />
                                        </div>
                                    ));
                                }}
                            >
                                {(user) => (
                                    <SelectItem isReadOnly={sourceChain.has(user.chainId.toString())} key={user.chainId} textValue={user.chainInfo.label}>
                                        <div className="flex gap-2 items-center">
                                            <Avatar alt={user.chainInfo.label} className="flex-shrink-0" size="sm" src={user.chainInfo.logoUrl} />
                                            <div className="flex flex-col">
                                                <span className="text-small">{user.chainInfo.nativeCurrency.symbol}</span>
                                                <span className="text-tiny text-default-400">{user.chainInfo.label}</span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                )}
                            </Select>

                            {
                             isCNSRegistered && <Button onClick={()=>{
                                handleTransferAssets();
                             }} className='w-full' size='lg' color='danger'>Transfer</Button>
                            }
                            

                        </div>
                        <div className='w-full flex flex-col gap-2'>



                            {
                                !isCNSRegistered &&

                                <div className='w-full gap-2 p-2 flex flex-col'>
                                    <div className='bg-danger-500/10 text-danger-500 rounded-lg w-full p-2'>
                                    <span>In order to execute transfer transactions through the IMONLINE Bridge, it is required to register with the IMON Name Service (CNS).</span>
                                    </div>
                                    <Button as={NavLink} to={"/cns"} color='danger' size='lg' className='w-full' variant='solid'>Register CNS</Button>

                                </div>
                            }



                        </div>
                    </div>
                </div>
            }

        </>
    );
}
export const BRIDGE_TAB = memo(_BRIDGE_TAB)

