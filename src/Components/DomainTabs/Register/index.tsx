import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ETHER_ADDRESS, TradeType } from '../../../constants/misc';
import { BigNumber, ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import moment from 'moment';
import { Route as ReactRoute, NavLink } from 'react-router-dom';
import { ChainId, isSupportedChain } from '../../../constants/chains';
import { WETH9, Token, CurrencyAmount, Pair, Price, Trade, Currency, Percent, Route } from '../../../entities';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract, useDomainContract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalInfo } from '../../../hooks/useModals';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { useFetchAllTokenList } from '../../../state/user/hooks';
import { getNativeCurrencyByChainId, parseFloatWithDefault } from '../../../utils';
import { DoubleCurrencyIcon } from '../../DoubleCurrency';
import UniwalletModal from '../../Modal/UniwalletModal';
import { updateUserDeadline, updateUserSlippageTolerance } from '../../../state/user/reducer';
import { Button } from '@nextui-org/react';
import { formatEther } from '@ethersproject/units';
import { getChainInfoOrDefault } from '../../../constants/chainInfo';



const _DOMAIN_REGISTER_TAB = () => {
    const { connector, account, provider, chainId } = useWeb3React()
    const DOMAINS = useDomainContract(chainId, true)
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const { state: isSelectToken, toggle: toggleSelectToken } = useModal()
    const dispatch = useAppDispatch()
    const [tldDomains, setTLDDomains]: any = useState(null)
    const [domainPrice, setDomainPrice]: any = useState(null)
    const [currentTLD, setCurrentTLD]: any = useState(null);
    const [domainName, setDomainName]: any = useState("")
    const [nameHash, setNameHash]: any = useState("")
    const [labelHash, setLabelHash]: any = useState("")


    const initDefaults = async () => {
        if (!DOMAINS) { return; }
        if (!chainId) { return; }
        const [_domains, _price, domainContract] = await DOMAINS.getTLDS();
        setTLDDomains(_domains);
        setDomainPrice(_price);

        console.log("DOMAINS", _domains);
    }

    useEffect(() => {
        if (!chainId) { return; }
        initDefaults();
    }, [chainId]);


    const getDomain = (name: any) => {
        return (name.split(".")).slice(1).join('.');

    }
    const handleSaveSettings = async () => {
        if (!([ChainId.ARBITRUM_ONE,ChainId.CHILIZ_MAINNET, ChainId.CHILIZ_SPICY_TESTNET, ChainId.BITCI, ChainId.BITCI_TEST].includes(chainId))) {
            let error = { message: "IMON Domains not available on this chain!" }
            setTransaction({ hash: '', summary: '', error: error });
            toggleError()
            return;
        }

        let domainLabel = `${domainName}.${currentTLD.name}`;
        let cleanedDomainName = domainName;

        const match = domainName.match(/^[^.]+/);

        if (match) {
            cleanedDomainName = match[0];
        }

        let domainEntry = getDomain(domainLabel)
        console.log("NAME", cleanedDomainName, "LABEL", domainLabel, "DOMAIN", domainEntry)
        let RegisterParam = {
            parent: ethers.utils.namehash(getDomain(domainLabel)),
            name: cleanedDomainName,
            label: domainLabel,
            node: ethers.utils.namehash(domainLabel)
        }
        console.log(RegisterParam);

        toggleLoading();
        await DOMAINS.register(RegisterParam, { value: domainPrice }).then(async (tx) => {
            await tx.wait();
            const summary = `Registering...: ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: any) => {
            console.log(error)
            //const revertData = error.data.originalError.data;
            let revertData = "0xb13c0a6c"
            const decodedError = DOMAINS.interface.parseError(revertData);
            console.log(decodedError)
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            initDefaults();
        });
    }

    const setInputValue = (e) => {

        setDomainName(e.toLowerCase())
        return
        const domainNameRegex = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/;
        const lowercaseE = e.toLowerCase();  // e'yi küçük harfe çevir
        if (domainNameRegex.test(lowercaseE)) {
            setDomainName(lowercaseE);
        } else {
            setDomainName("");
        }
    }

    useEffect(() => {
        if (currentTLD) {
            try {
                setNameHash(ethers.utils.namehash(domainName))
                setLabelHash(ethers.utils.namehash(domainName + "." + currentTLD.name))
            } catch (ex) {

            }
        }
        if (domainName.length === 0) {
            setNameHash("")
            setLabelHash("")
        }

    }, [chainId, account, currentTLD, domainName])
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


            <div className={"w-full swap"}>

                <div className="flex flex-col rounded-xl w-full gap-2">
                    <div className="w-full rounded-xl pb-0">
                        <div className="rounded-xl pb-0 flex gap-2 flex-col">



                            <div className="w-full flex flex-col gap-2 border border-1 border-default  p-2 rounded-lg">
                                <div className="w-full flex flex-row gap-2 items-center justify-start">
                                    <span translate="no" className="material-symbols-outlined">counter_1</span>
                                    <span className="text-pink-960">Please Select Top Level Domain</span>
                                </div>

                                <small>A naming service designed to support the {getChainInfoOrDefault(chainId).label} ecosystem.</small>

                                <div className="w-full gap-2 grid grid-cols-3 items-center justify-center">
                                    {
                                        tldDomains && tldDomains.map((domainItem, domainIndex) => {
                                            return (<button onClick={() => {
                                                setCurrentTLD(domainItem)

                                            }} key={`domain${domainIndex}`} className={(currentTLD && currentTLD.name === domainItem.name ? "bg-gradient text-white" : "") + " rounded-lg border-default border border-1 p-2 min-w-[60px] hover:bg-gradient hover:text-white"}>
                                                {domainItem.name}
                                            </button>)
                                        })
                                    }

                                </div>



                            </div>

                            {currentTLD &&
                                <div className="w-full flex flex-col gap-2 border border-1  border-default   p-2 rounded-lg">
                                    <div className="w-full flex flex-row gap-2 items-center justify-start">
                                        <span translate="no" className="material-symbols-outlined">counter_2</span>
                                        <span className="text-pink-960">Please Enter Domain Name</span>
                                    </div>


                                    <div className="swap-inputs">
                                        <div className="input sm:order-1">

                                            {
                                                currentTLD &&
                                                <div onClick={() => {

                                                }} className="token-selector text-center">

                                                    <div>.{currentTLD.name}</div>

                                                </div>
                                            }

                                            <div className="balance cursor-pointer">
                                                Domain Name: {domainName}.{currentTLD && currentTLD.name}
                                            </div>
                                            <input onChange={(e) => {
                                                setInputValue(e.target.value)
                                            }} inputMode="text" autoComplete="off" autoCorrect="off" type="text"
                                                placeholder="hello" minLength={0} maxLength={60} spellCheck="false" />
                                        </div>


                                    </div>

                                    {
                                        domainName.length === 0 && <>
                                            <div className="w-full bg-pink-960 text-yellow p-2 rounded-lg">

                                                <span className="text-white">
                                                    Please enter valid domain name.
                                                </span>
                                            </div>
                                        </>
                                    }


                                </div>
                            }

                            {
                                domainName.length > 0 && <div className="w-full flex flex-col gap-2 border border-1  border-default  p-2 rounded-lg">
                                    <div className="w-full flex flex-row gap-2 items-center justify-start">
                                        <span translate="no" className="material-symbols-outlined">counter_3</span>
                                        <span className="text-pink-960">Purchase Summary</span>
                                    </div>

                                    <div className={"w-full flex flex-col gap-2"}>
                                        <div className="w-full p-2 flex flex-col gap-2 rounded-lg border  border-default ">
                                            <span>Name Hash</span>
                                            <span className="text-xs">{nameHash}</span>
                                        </div>
                                        <div className="w-full p-2 flex flex-col gap-2 rounded-lg border  border-default ">
                                            <span>Label Hash</span>
                                            <span className="text-xs">{labelHash}</span>
                                        </div>
                                        <div className="w-full p-2 flex flex-col gap-2 rounded-lg border  border-default ">
                                            <span className="">TLD Hash</span>
                                            <span className="text-xs">{currentTLD && BigNumber.from(currentTLD.namehash).toHexString()}</span>
                                        </div>
                                        <div className="w-full p-2 flex flex-row gap-2 rounded-lg border  border-default ">
                                            <span>Registration Fees</span>

                                            <span>{domainPrice && formatEther(domainPrice)} {getNativeCurrencyByChainId(chainId)}</span>
                                        </div>


                                    </div>



                                </div>

                            }

                            {currentTLD && domainName.length > 0 &&
                                <div className="w-full">
                                    <Button color='default' onClick={() => {
                                        handleSaveSettings()
                                    }} className="w-full">Register Now</Button>
                                </div>

                            }

                        </div>


                    </div>


                </div>

            </div>
        </>
    );
}
export const DOMAIN_REGISTER_TAB = memo(_DOMAIN_REGISTER_TAB)

