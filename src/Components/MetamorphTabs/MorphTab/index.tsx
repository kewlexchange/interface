import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import useModal, { ModalInfo, ModalLoading, ModalSelectToken, ModalSuccessTransaction } from '../../../hooks/useModals';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { Button, Card , Image} from '@nextui-org/react';
import { useFetchAllTokenList } from '../../../state/user/hooks';
import { getNativeCurrencyByChainId } from '../../../utils';
import { useERC20Contract, useMetamorphContract } from '../../../hooks/useContract';
import { ethers } from 'ethers';
import { formatEther, parseEther, parseUnits } from '@ethersproject/units';
import { ETHER_ADDRESS } from '../../../constants/misc';


const _MORPH_TAB = () => {

    const { connector, account, provider, chainId } = useWeb3React()
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const { state: isSelectToken, toggle: toggleSelectToken } = useModal()
    const dispatch = useAppDispatch()
    const Metamorph = useMetamorphContract(chainId, true)
    const ERC20Contract = useERC20Contract()
    const [baseTokenAllowance, setBaseTokenAllowance] = useState(parseEther("0"))

    const [baseAsset, setBaseAsset] = useState(null)
    const [baseInputValue, setBaseInputValue] = useState("")
    useFetchAllTokenList(chainId, account)


    useEffect(() => {
        if (!chainId) { return; }
        if (!defaultAssets) { return }
        if (defaultAssets.length === 0) { return }

        setBaseAsset(defaultAssets.find(token => token?.symbol === getNativeCurrencyByChainId(chainId)))
    }, [defaultAssets])


    const setInputValue = (e, isBase) => {
        const regex = /^[0-9]*\.?[0-9]*$/;
        e = e.replace(",", ".")
        if (regex.test(e)) {
            setBaseInputValue(e)
        }
    }

    const initDefaults = async () => {
        checkAllowance();
    }
    const onSelectToken = (tokenInfo) => {
        setBaseAsset(tokenInfo)
        toggleSelectToken()
    }

    const handleApprove = async (token) => {
        let poolToken = ERC20Contract(token);
        const tokenDecimals = await poolToken.decimals();
        const transferAmount = ethers.constants.MaxUint256
        toggleLoading();
        await poolToken.approve(Metamorph.address, transferAmount, { from: account }).then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking tokens for: ${Metamorph.address}`
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

    const handleTokenToNFT = async () => {
        toggleLoading();

        if (!baseInputValue) {
            return
        }
 
        let overrides = {
            value:parseEther("0")
        }
        let depositAmount = parseUnits(baseInputValue, baseAsset.decimals);
        
        var tokenAddress = ethers.constants.AddressZero
        if(baseAsset.address === ETHER_ADDRESS){
            overrides.value = depositAmount
            tokenAddress = ETHER_ADDRESS

        }else{
            tokenAddress = baseAsset.address
            overrides.value = parseEther("0")
        }

        await Metamorph.morph(account,tokenAddress,depositAmount,overrides).then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking tokens for: ${Metamorph.address}`
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

    const checkAllowance = async () => {
        if (!chainId) { return }
        if (!defaultAssets) { return }
        if ((!account)) {
            setBaseTokenAllowance(0)
            return;
        }
        let baseTokenERC = ERC20Contract(baseAsset.address);
        const _baseAllowanceAmount = await baseTokenERC.allowance(account, Metamorph.address);
        console.log("_BASE",_baseAllowanceAmount)
        setBaseTokenAllowance(_baseAllowanceAmount)
    }

    useEffect(()=>{
        if(!baseInputValue){
            return;
        }
        checkAllowance();
    },[baseInputValue])


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

        console.log("ALLOWANCE",formatEther(baseTokenAllowance),formatEther(baseVal),baseVal.gte(baseTokenAllowance))
        return baseTokenAllowance.lt(baseVal)
    }

    return (
        <>
            <ModalInfo
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalSelectToken disableToken={baseAsset} hide={toggleSelectToken} isShowing={isSelectToken} onSelect={onSelectToken} isClosable={true} tokenList={defaultAssets} onSelectPair={undefined} allExchangePairs={undefined} />
            <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading}
                isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess}
                isShowing={isTransactionSuccess} />


            <div className="w-full rounded-xl pb-0">
                <div className="rounded-xl pb-0 flex gap-2 flex-col">



                    <Card shadow='none' className="bg-transparent w-full flex flex-col gap-2 rounded-lg">

                        <div className="w-full rounded-xl swap">


                            <div className="swap-inputs">
                                <div className="input sm:order-1">


                                    {
                                        baseAsset &&

                                        <Button className="token-selector" radius='full' variant="flat" color="default" onPress={() => {
                                            toggleSelectToken()
                                        }} startContent={
                                            <Image className='w-[32px] h-[32px] min-w-[32px] min-h-[32px] max-h-[32px] max-w-[32px]' src={baseAsset.logoURI} />
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




                     
                            </div>
                        </div>
                    </Card>

                    <div className="w-full">


                        {
                             isAllowanceRequired() === true  && <Button className={"w-full"} onPress={() => {
                                handleApprove(baseAsset.address)
                            }} color="danger">
                                Unlock
                            </Button>
                        }
                       
                       {
                            isAllowanceRequired() === false  && <Button className={"w-full"} onPress={() => {
                                handleTokenToNFT()
                            }} color="danger">
                                Morph Token to NFT
                            </Button>
                       }

                       

                    </div>

                </div>


            </div>

        </>
    );
}
export const MORPH_TAB = memo(_MORPH_TAB)

