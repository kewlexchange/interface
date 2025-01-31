import CustomModal from "../Components/Modal";
import React, { ChangeEvent, useEffect, useState } from 'react'
import { AnimationHeader } from "../Components/AnimationHeader";
import { Network } from "../Components/Network";
import { Spinner } from "../Components/Spinner";
import { useWeb3React } from "@web3-react/core";
import { generateTxLink } from "../utils/web3Provider";
import MetamaskAnimation from "../assets/images/animation/metamask.json"
import LoadingAnimation from "../assets/images/animation/loading.json"
import WalletModal from "../Components/WalletModal";
import { NFT } from "../Components/NFT";
import { debounce, getIconByChainId, getNativeCurrencyByChainId, sendHTTPRequest } from "../utils";
import { useDomainContract, useERC20Contract, useNFT1155Contract, useNFT721Contract } from "./useContract";
import { BigNumber } from "@ethersproject/bignumber";
import { formatEther, formatUnits, getAddress, isAddress, parseEther } from "ethers/lib/utils";
import { DEFAULT_TOKEN_LOGO, ETHER_ADDRESS, ZERO_ADDRESS } from "../constants/misc";
import { CurrencyAmount, Token, WETH9 } from "../entities";
import { ChainId, isSupportedChain } from "../constants/chains";
import { TCommandTypes } from "../constants/commands";
import { DoubleCurrencyIcon } from "../Components/DoubleCurrency";
import { Avatar, AvatarGroup, Button, Card, CardBody, CardFooter, CardHeader, Image, Input, Listbox, ListboxItem, ListboxSection, ScrollShadow, Slider, Switch, Tab, Tabs } from "@nextui-org/react";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { updateCustomTokenList } from "../state/user/reducer";
import { useFetchAllTokenList } from "../state/user/hooks";
import { fetchAndUpdateAllTokenList } from "../utils/fetchAllTokenList";

export default function useModal(initialValue: boolean = false) {
    const [state, setState] = useState(initialValue)
    const toggle = () => setState(state => !state)
    return { state, toggle }
}

export const ModalNoProvider = ({ isShowing, hide }) => {
    return (
        <CustomModal header={"No Web3 Provider Found!"} isShowing={isShowing} hide={hide} closable={true}>
            <div className={"modal-body"}>
                <div className="m-2 transparent-bg rounded-xl p-3">

                    <div className='flex flex-col items-center justify-center'>
                        <div className='text-center mb-3'>
                            <AnimationHeader repeat={true} className={"animation"} dataSource={MetamaskAnimation} width={"30%"} height={"30%"} />
                        </div>
                        <p className='text-center'>
                            No Web3 browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.
                        </p>
                        <a className={"btn btn-primary mt-4"} target='_blank' onPress={hide} href='https://metamask.io/download.html'>
                            <span>Install MetaMask</span>
                        </a>
                    </div>
                </div>
            </div>
        </CustomModal>
    )
}

export const ModalLoading = ({ isShowing, hide, text, isClosable }) => {
    return (
        <CustomModal header={"Please Wait!"} isShowing={isShowing} hide={hide} closable={isClosable}>
            <div className={"w-full"}>
                <div className="m-2 transparent-bg- rounded-xl p-2 py-4">
                    <div className='flex flex-col items-center justify-center'>
                        <div className='text-center'>
                            <Spinner repeat={true} className={"animation"} dataSource={LoadingAnimation} width={"50%"} height={"50%"} />
                        </div>
                        <p className='text-center'>
                            Please Wait!
                        </p>
                        <small className='text-center'>
                            {text}
                        </small>

                    </div>
                </div>
            </div>
        </CustomModal>
    )
}

export const ModalConnect = ({ isShowing, hide }) => {
    return (
        <CustomModal isShowing={isShowing} hide={hide} header="Connect" closable={true}>
            <div className={"w-full"}>
                <div className="m-2 border border-default rounded-xl p-4">
                    <WalletModal />
                </div>
            </div>


        </CustomModal>
    )
}

export const ModalError = ({ isShowing, hide, error }) => {
    return (
        <CustomModal isShowing={isShowing} hide={hide} header="Error" closable={true}>
            <div className={"w-full"}>
                <div className="m-2 rounded-xl p-2">
                    <div className='flex flex-col items-center gap-y-2 justify-center'>



                        <textarea defaultValue={error?.data ? error.data?.message : error?.message} rows={5} cols={5} className={"w-full h-20 rounded-xl p-2  border border-default border-1 modalDialogInput"} />

                        <p className='text-xs'>
                            Transaction attempt failed with an Error
                        </p>

                    </div>
                </div>
            </div>


        </CustomModal>
    )
}

export const ModalInfo = ({ isShowing, hide, error }) => {
    return (
        <CustomModal isShowing={isShowing} hide={hide} header="Information" closable={true}>
            <div className={"w-full"}>
                <div className="m-2 rounded-xl p-4">
                    <div className='flex flex-col items-center gap-y-4 justify-center'>



                        <textarea defaultValue={error?.data ? error.data?.message : error?.message} rows={5} cols={5} className={"w-full h-20 rounded-xl p-2 "} />



                    </div>
                </div>
            </div>


        </CustomModal>
    )
}

export const ModalSuccessTransaction = ({ isShowing, hide, transaction }) => {
    const { chainId } = useWeb3React()
    return (
        <CustomModal isShowing={isShowing} hide={hide} header="Transaction Success" closable={true}>
            <div className={"w-full"}>
                <div className="m-2 rounded-xl p-4">
                    <div className='flex flex-col items-center justify-center gap-y-4'>

                        <p>Transaction has been completed.</p>
                        <a className={"my-2 text-blue-500"} href={generateTxLink(chainId, transaction.hash)} target={"_blank"}>View on Explorer</a>
                    </div>
                </div>
            </div>


        </CustomModal>
    )
}


export const ModalSellNFT = ({ isShowing, hide, contractAddress, tokenId, tokenType, handleSell }) => {
    const { connector, account, provider, chainId } = useWeb3React()
    const [isUnlocked, setIsUnlocked] = useState(false)
    const [defaultPrice, setDefaultPrice] = useState("0")
    const [totalPrice, setTotalPrice] = useState("0")
    const IMON_1155NFTContract = useNFT1155Contract()
    const IMON_721NFTContract = useNFT721Contract();
    const [userBalance, setUserBalance] = useState("0")
    const [userNFTBalance, setUserNFTBalance] = useState("0")

    const fetchBalance = async () => {
        const NFTContract = tokenType === "ERC-1155" ? await IMON_1155NFTContract(contractAddress, true) : IMON_721NFTContract(contractAddress, true);

        if (tokenType === "ERC-721") {
            setUserBalance("1")
            setUserNFTBalance("1")
        } else {
            const _userBalances = await NFTContract.balanceOf(account, tokenId);
            setUserBalance(BigNumber.from(_userBalances).toString())
            setUserNFTBalance(BigNumber.from(_userBalances).toString())
        }

    }
    useEffect(() => {
        fetchBalance();
    }, [tokenType])

    useEffect(() => {
        let _userBalance = parseInt(userBalance ? userBalance : "0");
        let _defaultPrice = parseEther(defaultPrice ? defaultPrice : "0");
        let _totalPrice = _defaultPrice.mul(_userBalance);
        setTotalPrice(formatEther(_totalPrice))
    }, [userBalance, defaultPrice])
    const handleAmountChanged = (e) => {
        setUserBalance(e.target.value)
    }
    const handleChangeInput = (e) => {
        let value = e.target.value;
        value = value.replace(",", ".")

        const regex = /^[0-9]*\.?[0-9]*$/;
        if (regex.test(value) && !isNaN(value)) {
            setDefaultPrice(value)
        } else {
            return;
        }


    }
    return (
        <CustomModal isShowing={isShowing} hide={hide} header="Sell Item" closable={true}>
            <div className={"w-full p-2"}>
                <div className='w-full relative flex flex-col items-center justify-center gap-y-4'>




                    <div className="grid grid-cols-3 rounded-xl p-1">
                        <div className="col-span-1 w-full w-full h-full flex items-center justify-center">
                            <NFT canStake={false} reloadFunction={null} showMetadata={false} itemType={tokenType} contractAddress={contractAddress} tokenId={tokenId} canSell={false} />
                        </div>




                        <div className="col-span-2 p-2 flex flex-col gap-2 rounded-xl w-full">
                            <div className="border p-2 rounded-xl">
                                <div className="flex flex-col items-center p-2 gap-2">

                                    <div className="w-full flex flex-col gap-2">
                                        <Input type="number" onChange={(e) => {
                                            handleAmountChanged(e)
                                        }} variant={"bordered"} label="Amount" placeholder="Please enter amount" defaultValue={userBalance} />


                                        <Input startContent={
                                            <img src={getIconByChainId(chainId)} className="w-5 h-5" alt="Price" />
                                        } type="number" onChange={(e) => {
                                            handleChangeInput(e)
                                        }} variant={"bordered"} label="Price Per Unit" placeholder="Please enter price per unit" defaultValue={defaultPrice} />

                                    </div>

                                </div>

                                <div className="flex items-center justify-between border-t transparent-border-color flex-wrap p-2 py-4">
                                    <div className="whitespace-nowrap">
                                        <span className="text-xs text-sky-500 font-semibold ">Balance :</span> <span>{userNFTBalance} NFT</span>
                                    </div>
                                    <div className="whitespace-nowrap">
                                        <span className="text-xs text-sky-500 font-semibold ">Total Price :</span> <span>{totalPrice} {getNativeCurrencyByChainId(chainId)} </span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full flex flex-col items-center justify-center">
                                {
                                    <Button variant="solid" color="default" onPress={() => {
                                        handleSell(defaultPrice, userBalance)
                                    }} className=" w-full">Sell</Button>
                                }

                            </div>
                        </div>





                    </div>



                </div>
            </div>


        </CustomModal>
    )
}

export const ModalTransferNFT = ({ isShowing, hide, contractAddress, tokenId, tokenType, handleTransfer }) => {
    const { connector, account, provider, chainId } = useWeb3React()
    const [isUnlocked, setIsUnlocked] = useState(false)
    const [receiverAddress, setReceiverAddress] = useState("0")
    const [totalPrice, setTotalPrice] = useState("0")
    const IMON_1155NFTContract = useNFT1155Contract()
    const IMON_721NFTContract = useNFT721Contract();
    const [userAmount, setUserAmount] = useState("0")
    const [userNFTBalance, setUserNFTBalance] = useState("0")

    const fetchBalance = async () => {
        const NFTContract = tokenType === "ERC-1155" ? await IMON_1155NFTContract(contractAddress, true) : IMON_721NFTContract(contractAddress, true);

        if (tokenType === "ERC-721") {
            setUserNFTBalance("1")
        } else {
            const _userBalances = await NFTContract.balanceOf(account, tokenId);
            setUserNFTBalance(BigNumber.from(_userBalances).toString())
        }

    }
    useEffect(() => {
        fetchBalance();
    }, [tokenType])


    const handleAmountChanged = (e) => {
        setUserAmount(e.target.value)
    }
    const handleChangeInput = (e) => {
        setReceiverAddress(e.target.value)
    }
    return (
        <CustomModal isShowing={isShowing} hide={hide} header="Transfer Item" closable={true}>
            <div className="w-full">


                <div className="rounded-xl w-full">
                    <div className="border border-default rounded-xl pb-0">
                        <div className="flex flex-col items-center p-2 gap-2">

                            <Input onChange={(e) => {
                                handleChangeInput(e)
                            }
                            } color="default" labelPlacement="outside"
                                variant="bordered" size={"lg"} type="text" label="Receiver Address" placeholder="0x0000...." />
                            <Slider
                                size="lg"
                                step={1}
                                onChange={(e) => {
                                    handleAmountChanged(e)
                                }}
                                color="danger"
                                label="NFT Amount"
                                showSteps={true}
                                maxValue={parseInt(userNFTBalance)}
                                minValue={0}
                                defaultValue={1}
                                className="w-full"
                            />
                        </div>

                        <div className="flex items-center justify-between border-t transparent-border-color flex-wrap p-2 py-4">
                            <div className="whitespace-nowrap">
                                <span className="font-semibold ">Balance :</span> <span>{userNFTBalance} NFT</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex flex-col items-center justify-center">
                        {
                            <Button size="lg" color="default" onPress={() => {
                                handleTransfer(userAmount, receiverAddress)
                            }} className=" my-2 w-full">Transfer</Button>
                        }

                    </div>
                </div>





            </div>
        </CustomModal>
    )
}


export const ModalShowWallet = ({ isShowing, hide, address, onDisconnect, isClosable }) => {
    return (
        <CustomModal header={"Switch Chain"} isShowing={isShowing} hide={hide} closable={isClosable}>
            <div className={"w-full p-2"}>
                <div className="w-full rounded-xl p-3">

                    <div className='flex w-full items-center justify-center p-2'>
                        <div className={"flex w-full flex-col items-center rounded-lg"}>


                            <div className={"flex flex-col items-center justify-center"}>
                                <Network />
                            </div>

                            <div className={"flex align-center justify-center my-3"}>
                                <button onPress={() => {
                                    onDisconnect();
                                }} className={"btn btn-primary"}>
                                    Disconnect
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </CustomModal>
    )
}

export const ModalSelectToken = ({ isShowing, disableToken, hide, tokenList, onSelect, isClosable, allExchangePairs, onSelectPair }) => {
    const { chainId, account } = useWeb3React()
    const [allTokenList, setAllTokenList] = useState([])
    const [searchText, setSearchText] = useState("")
    const [filteredItems, setFilteredItems] = useState([]);
    const [externalTokenName, setExternalTokenName] = useState("")
    const [externalTokenSymbol, setExternalTokenSymbol] = useState("")
    const [externalTokenAddress, setExternalTokenAddress] = useState("")
    const [externalTokenDecimals, setExternalTokenDecimals] = useState(0)
    const [externalTokenBalance, setExternalTokenBalance] = useState("0")
    const ERC20Contract = useERC20Contract()
    const dispatch = useAppDispatch()
    var customTokens = useAppSelector((state) => state.user.customTokenList && state.user.customTokenList[chainId])
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const { state: isInfoShowing, toggle: toggleInfo } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const [isSelected, setIsSelected] = useState(false);



    useEffect(() => {
        if (!tokenList) {
            return;
        }
        if (searchText !== "") {
            const filteredList = tokenList.filter((item) =>
                item.symbol.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredItems(filteredList);
        } else {
            setFilteredItems(tokenList)
        }

    }, [searchText])

    const getIconPath = (ticker: any) => {
        if (!tokenList) {
            return
        }
        if (tokenList.length == 0) {
            return;
        }
        const findItem = tokenList.filter((item) => item.symbol.toLowerCase().includes(ticker.toLowerCase()));
        return findItem.length > 0 ? findItem[0].logoURI : ""

    }

    const handleSelectPair = (exchangeItem: any) => {
        const baseItem = tokenList.filter((item) => item.address.toLowerCase().includes(exchangeItem.base.token.toLowerCase()));
        const quoteItem = tokenList.filter((item) => item.address.toLowerCase().includes(exchangeItem.quote.token.toLowerCase()));


        if (baseItem.length == 0) {
            baseItem.push({
                "chainId": chainId,
                "address": exchangeItem.base.token,
                "name": exchangeItem.base.name,
                "symbol": exchangeItem.base.symbol,
                "decimals": BigNumber.from(exchangeItem.base.decimals).toNumber(),
                "logoURI": DEFAULT_TOKEN_LOGO,
                "balance": "0"
            })
        }
        if (quoteItem.length == 0) {
            quoteItem.push({
                "chainId": chainId,
                "address": exchangeItem.quote.token,
                "name": exchangeItem.quote.name,
                "symbol": exchangeItem.quote.symbol,
                "decimals": BigNumber.from(exchangeItem.quote.decimals).toNumber(),
                "logoURI": DEFAULT_TOKEN_LOGO,
                "balance": "0"
            })
        }

        console.log(baseItem, quoteItem, exchangeItem)
        if (onSelectPair) {
            if (baseItem.length > 0 && quoteItem.length > 0) {
                onSelectPair(exchangeItem, baseItem[0], quoteItem[0]);
            }
        }


    }

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    const fetchTokenInfo = async (tokenAddress: any) => {
        try {
            const ERC20Token = ERC20Contract(tokenAddress)
            const name = await ERC20Token.name();
            const symbol = await ERC20Token.symbol();
            const decimals = await ERC20Token.decimals();
            const balance = await ERC20Token.balanceOf(account)


            const tokenAddr = new Token(chainId, tokenAddress, BigNumber.from(decimals).toNumber())

            setExternalTokenName(name)
            setExternalTokenDecimals(BigNumber.from(decimals).toNumber())
            setExternalTokenSymbol(symbol)
            setExternalTokenBalance(CurrencyAmount.fromRawAmount(tokenAddr, balance).toSignificant())
        } catch (e) {

        }

    }

    useEffect(() => {
        if (isAddress(externalTokenAddress)) {
            fetchTokenInfo(getAddress(externalTokenAddress))
        } else {
            setExternalTokenDecimals(0)
            setExternalTokenName("")
            setExternalTokenSymbol("")
        }
    }, [externalTokenAddress])

    const handleContractAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (isAddress(event?.target?.value)) {
            setExternalTokenAddress(event?.target?.value)
        } else {
            setExternalTokenAddress("")

        }
    };

    const handleImportToken = async () => {
        if (!isAddress(externalTokenAddress)) {
            return
        }
        let tokenInfo = {
            "chainId": chainId,
            "address": externalTokenAddress,
            "name": externalTokenName,
            "symbol": externalTokenSymbol,
            "decimals": externalTokenDecimals,
            "logoURI": "https://kewl.exchange/images/coins/skull.svg"
        }

        if (!chainId) {
            return
        }
        if (chainId < 1) {
            return
        }



        let customTokenList = [];
        customTokenList.push(tokenInfo)
        if (customTokens) {

            let hasToken = customTokens.some(token => token.address === externalTokenAddress);
            if (!hasToken) {
                customTokenList = [] = [...customTokenList, ...customTokens];
            } else {
                console.log("already exists")
            }

        }


        let newToken = [{
            "chainId": chainId,
            "address": externalTokenAddress,
            "name": externalTokenName,
            "symbol": externalTokenSymbol,
            "decimals": externalTokenDecimals,
            "logoURI": "https://kewl.exchange/images/coins/skull.svg",
            "balance": externalTokenBalance
        }]
        let newTokenList = [] = [...filteredItems, ...newToken];
        setFilteredItems(newTokenList)

        dispatch(updateCustomTokenList({ chainId: chainId, tokens: customTokenList }))

        setTransaction({ hash: '', summary: '', error: { message: `Token has been imported.` } });
        toggleInfo();

    }


    const canDisplayExchangePair = (pair) => {

        const baseItem = filteredItems.filter((item) => item.address.toLowerCase().includes(pair.base.token.toLowerCase()));
        const quoteItem = filteredItems.filter((item) => item.address.toLowerCase().includes(pair.quote.token.toLowerCase()));



        if (baseItem.length == 0) {
            return false
        }

        if (quoteItem.length == 0) {
            return false
        }

        return true

    }

    const canDisplay = (inputAddress) => {




        let hideAddresses = [
            "0x70d0fd23C13ebA3104C28e1dC8c470a253F73Fd7",
            "0xE02A38Ad58152Ab7CFC68Db4705E8c88B93479CB",
            "0xc57765AE831BD4c117BA103B802b74DdCF3750d2",
            "0xF299328bC0ED4ADC6713f1B3d4aa169569431579",
            "0xC245A489aaDC5E4519B852142D1AFF3E3418151e",
            "0x68d73FE616c3faaC1FC0feC6899a84e69b2CfA4F",
            "0xd4A1da83dc89aA13B8fa15d3Bf4EB1D52B6A949e"
        ]
        if (hideAddresses.includes(inputAddress)) {
            if (chainId == ChainId.ARBITRUM_ONE) {
                return false;
            }
        }

        let chilizAddresses = [
            "0x67289d20400EF06171dF3ADe7f5B826Daf3685D8",
            "0x70d0fd23C13ebA3104C28e1dC8c470a253F73Fd7",
            "0x9631be8566fC71d91970b10AcfdEe29F21Da6C27",

        ]
        if (chilizAddresses.includes(inputAddress)) {
            if (chainId == ChainId.CHILIZ_MAINNET) {
                return false;
            }
        }


        let ret = true;
        if (!chainId) { return false }
        if (!disableToken) {
            return false;
        }
        if (inputAddress === disableToken?.address) {
            ret = false;
        }

        if (!isSupportedChain(chainId)) {
            return false
        }
        const weth9Address = WETH9[chainId].address
        const IS_NATIVE = disableToken.addres == ETHER_ADDRESS || disableToken.address == ZERO_ADDRESS
        if (IS_NATIVE) {
            if (inputAddress === weth9Address) {
                ret = false;
            }
        }

        if (disableToken.address === weth9Address) {
            if (inputAddress === ETHER_ADDRESS) {
                ret = false;
            }
        }
        return ret
    }

    useEffect(() => {

        console.log("chainId:tokens", chainId, tokenList)
        if (tokenList) {
            setFilteredItems(tokenList)
            setAllTokenList(tokenList)
        }
    }, [tokenList])

    return (<>

        <ModalInfo
            isShowing={isInfoShowing}
            hide={toggleInfo}
            error={transaction.error}
        />
        <ModalError
            isShowing={isErrorShowing}
            hide={toggleError}
            error={transaction.error}
        />
        <CustomModal header={"Select Token"} isShowing={isShowing} hide={hide} closable={isClosable}>
            <Tabs 
                 disableAnimation
                 radius="lg" 
                 fullWidth 
                 classNames={{
                     base: "w-full",
                     tabList: [
                         "relative",
                         "bg-white/[0.01] dark:bg-black/[0.01]",
                         "backdrop-blur-xl",
                         "border border-violet-500/10",
                         "p-1",
                         "rounded-2xl",
                         "flex",
                         "gap-1"
                     ].join(" "),
                     cursor: "hidden",
                     tab: [
                         "flex-1",
                         "h-9",
                         "px-4",
                         "rounded-xl",
                         "flex items-center justify-center",
                         "gap-2",
                         "text-xs font-medium",
                         "text-violet-600/50 dark:text-violet-400/50",
                         "group",
                         "relative",
                         "overflow-hidden",
                         "transition-all duration-200",
                         "data-[selected=true]:bg-violet-500/[0.02] dark:data-[selected=true]:bg-violet-400/[0.02]",
                         "data-[selected=true]:backdrop-blur-xl",
                         "data-[selected=true]:text-violet-500 dark:data-[selected=true]:text-violet-400",
                         "before:absolute",
                         "before:inset-0",
                         "before:rounded-xl",
                         "before:opacity-0",
                         "before:pointer-events-none",
                         "before:z-[-1]",
                         "data-[selected=true]:before:opacity-100",
                         "before:bg-gradient-to-r",
                         "before:from-violet-500/0",
                         "before:via-violet-500/[0.07]",
                         "before:to-violet-500/0",
                         "before:transition-opacity",
                         "data-[selected=true]:before:animate-shimmer",
                         "before:bg-[length:200%_100%]",
                         "hover:bg-violet-500/[0.01] dark:hover:bg-violet-400/[0.01]",
                         "hover:text-violet-500/70"
                     ].join(" "),
                     tabContent: "relative z-10",
                     panel: "pt-4"
                 }}
            >
                <Tab key="tokens" title="Tokens">
                    <Card 
                        shadow="none"
                        className="border border-violet-500/10 bg-white/5 dark:bg-black/5 backdrop-blur-xl mt-4"
                    >
                        <CardHeader>
                            <Input 
                                startContent={
                                    <span translate="no" className="material-symbols-outlined text-violet-400">
                                        search
                                    </span>
                                }
                                label="Search" 
                                variant="bordered"
                                size="lg" 
                                value={searchText}
                                onChange={handleInputChange}
                                classNames={{
                                    input: "text-violet-400",
                                    inputWrapper: "border-violet-500/20 bg-violet-500/5 hover:border-violet-500/30 group-data-[focused=true]:border-violet-500/40"
                                }}
                                placeholder="Search token or paste address" 
                            />
                        </CardHeader>
                        <CardBody>
                            <ScrollShadow hideScrollBar orientation="horizontal" className="w-full h-[270px] max-h-[270px]">
                              
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {filteredItems && filteredItems.map((tokenItem) => {
                                                if (disableToken?.address !== tokenItem.address) {
                                                    return (
                                                        <button
                                                            key={`token${tokenItem.address}`}
                                                            onClick={() => {
                                                                onSelect(tokenItem);
                                                                setSearchText("");
                                                            }}
                                                            className="group flex items-center gap-3 p-3
                                                                border border-violet-500/10 
                                                                hover:border-violet-500/30
                                                                bg-violet-500/[0.02] hover:bg-violet-500/[0.05]
                                                                rounded-xl
                                                                transition-all duration-300
                                                                backdrop-blur-xl
                                                                relative overflow-hidden"
                                                        >
                                                            {/* Hover Animation Gradient */}
                                                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/[0.05] to-violet-500/0
                                                                translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" 
                                                            />
                                                            
                                                            {/* Token Icon */}
                                                            <div className="relative">
                                                                <Avatar 
                                                                    size='sm' 
                                                                    src={tokenItem.logoURI}
                                                                    className="border-2 border-violet-500/20 group-hover:border-violet-500/40
                                                                        group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]
                                                                        transition-all duration-300"
                                                                />
                                                            </div>

                                                            {/* Token Info */}
                                                            <div className="flex-1 flex items-center justify-between min-w-0">
                                                                <div className="flex flex-col min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="font-semibold text-violet-400 group-hover:text-violet-300
                                                                            transition-colors duration-300 truncate">
                                                                            {tokenItem.symbol}
                                                                        </p>
                                                                        <div className="h-1 w-1 rounded-full bg-violet-500/30 shrink-0" />
                                                                        <p className="text-xs text-violet-400/50 truncate">
                                                                            ${tokenItem.price || '0.00'}
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-xs w-full text-start text-violet-400/50 truncate">
                                                                        {tokenItem.name}
                                                                    </p>
                                                                </div>
                                                                
                                                                {/* Balance Badge with Arrow */}
                                                                <div className="flex items-center gap-2">
                                                                    <div className="shrink-0 bg-violet-500/10 rounded-lg px-2 py-1
                                                                        border border-violet-500/20 text-xs text-violet-400/90
                                                                        group-hover:border-violet-500/30 transition-colors duration-300">
                                                                        {tokenItem.balance}
                                                                    </div>
                                                              
                                                                </div>
                                                            </div>

                                     
                                                        </button>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </div>
                                 
                            </ScrollShadow>
                        </CardBody>
                    </Card>
                </Tab>

                <Tab key="pairs" title="Pairs">
                    <Card className="border border-violet-500/10 bg-white/5 dark:bg-black/5 backdrop-blur-xl mt-4">
                        <CardBody>
                            <ScrollShadow hideScrollBar orientation="horizontal" className="w-full h-[350px] max-h-[350px]">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {allExchangePairs && allExchangePairs.map((exchangeItem, exchangeIndex) => {
                                        return (
                                            canDisplayExchangePair(exchangeItem) &&
                                            canDisplay(exchangeItem.pair) && (
                                                <button
                                                    key={`exchangeItem${exchangeIndex}`}
                                                    onClick={() => handleSelectPair(exchangeItem)}
                                                    className="group flex items-center gap-3 p-3
                                                        border border-violet-500/10 
                                                        hover:border-violet-500/30
                                                        bg-violet-500/[0.02] hover:bg-violet-500/[0.05]
                                                        rounded-xl
                                                        transition-all duration-300
                                                        backdrop-blur-xl
                                                        relative overflow-hidden"
                                                >
                                                    {/* Hover Animation Gradient */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/[0.05] to-violet-500/0
                                                        translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" 
                                                    />
                                                    
                                                    {/* Pair Icons */}
                                                    <div className="relative shrink-0">
                                                        <DoubleCurrencyIcon 
                                                            baseIcon={getIconPath(exchangeItem.base.symbol)} 
                                                            quoteIcon={getIconPath(exchangeItem.quote.symbol)}
                                                            className="group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]
                                                                transition-all duration-300"
                                                        />
                                                    </div>

                                                    {/* Pair Info */}
                                                    <div className="flex-1 flex items-center justify-between min-w-0">
                                                        <div className="flex flex-col min-w-0 flex-shrink">
                                                            {/* Symbols */}
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <p className="font-semibold text-violet-400 group-hover:text-violet-300
                                                                    transition-colors duration-300 truncate">
                                                                    {exchangeItem.base.symbol}
                                                                </p>
                                                                <span className="text-violet-400/50 shrink-0">×</span>
                                                                <p className="font-semibold text-violet-400 group-hover:text-violet-300
                                                                    transition-colors duration-300 truncate">
                                                                    {exchangeItem.quote.symbol}
                                                                </p>
                                                            </div>
                                                            {/* Names */}
                                                            <div className="flex items-center w-full min-w-0">
                                                                <p className="text-xs text-violet-400/50 truncate">
                                                                    {exchangeItem.base.name}
                                                                </p>
                                                                <div className="h-1 w-1 rounded-full bg-violet-500/30 shrink-0 mx-2" />
                                                                <p className="text-xs text-violet-400/50 truncate">
                                                                    {exchangeItem.quote.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Arrow Icon */}
                                                        <div className="hidden sm:block opacity-0 group-hover:opacity-100
                                                            transition-opacity duration-300 ml-2 shrink-0">
                                                            <span className="material-symbols-outlined text-violet-400/70 text-sm">
                                                                arrow_forward
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        )
                                    })}
                                </div>
                            </ScrollShadow>
                        </CardBody>
                    </Card>
                </Tab>

                <Tab key="import" title="Import Token">
                    <Card className="border border-violet-500/10 bg-white/5 dark:bg-black/5 backdrop-blur-xl mt-4">
                        <CardBody className="flex flex-col gap-3">
                            <Input
                                onChange={handleContractAddressChange}
                                size="lg"
                                label="Contract Address"
                                placeholder="0x"
                                classNames={{
                                    input: "text-violet-400",
                                    inputWrapper: "border-violet-500/20 bg-violet-500/5 hover:border-violet-500/30"
                                }}
                            />
                            <Input
                                isDisabled
                                isReadOnly
                                size="lg"
                                label="Name"
                                value={externalTokenName}
                                classNames={{
                                    input: "text-violet-400/50",
                                    inputWrapper: "border-violet-500/10 bg-violet-500/5"
                                }}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    isDisabled
                                    isReadOnly
                                    size="lg"
                                    label="Symbol"
                                    value={externalTokenSymbol}
                                    classNames={{
                                        input: "text-violet-400/50",
                                        inputWrapper: "border-violet-500/10 bg-violet-500/5"
                                    }}
                                />
                                <Input
                                    isDisabled
                                    isReadOnly
                                    size="lg"
                                    label="Decimals"
                                    value={externalTokenDecimals}
                                    classNames={{
                                        input: "text-violet-400/50",
                                        inputWrapper: "border-violet-500/10 bg-violet-500/5"
                                    }}
                                />
                            </div>
                        </CardBody>
                        <CardFooter className="flex flex-col gap-3">
                            <div className="flex gap-4 items-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                <Image className="h-24 w-24" src={DEFAULT_TOKEN_LOGO}/>
                                <p className="text-red-400 text-sm">
                                    External tokens are likely added for testing purposes or as potential scams. 
                                    Please conduct your own research. Otherwise, you may risk losing your assets.
                                </p>
                            </div>
                            <div className="flex flex-row gap-2 items-between w-full justify-between">
                                <Switch
                                    isSelected={isSelected}
                                    onValueChange={setIsSelected}
                                    classNames={{
                                        wrapper: "group-data-[selected=true]:bg-violet-500"
                                    }}
                                >
                                    <span className="text-violet-400 text-sm">
                                        I understand and accept the risks
                                    </span>
                                </Switch>

                                <Button
                                    isDisabled={!isSelected}
                                    onPress={handleImportToken}
                                    className="bg-violet-500/10 backdrop-blur-xl
                                        border border-violet-500/30
                                        text-violet-500 hover:text-violet-400
                                        shadow-[0_0_15px_rgba(139,92,246,0.3)]
                                        hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]
                                        transition-all duration-500
                                        group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-violet-500/0
                                        translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    <span className="relative">Import Token</span>
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </Tab>
            </Tabs>
        </CustomModal>
    </>


    )
}

export const ModalSelectFanToken = ({ isShowing, disableToken, hide, tokenList, onSelect, isClosable, allExchangePairs, onSelectPair }) => {
    const { chainId, account } = useWeb3React()
    const [allTokenList, setAllTokenList] = useState([])
    const [searchText, setSearchText] = useState("")
    const [filteredItems, setFilteredItems] = useState([]);
    const [externalTokenName, setExternalTokenName] = useState("")
    const [externalTokenSymbol, setExternalTokenSymbol] = useState("")
    const [externalTokenAddress, setExternalTokenAddress] = useState("")
    const [externalTokenDecimals, setExternalTokenDecimals] = useState(0)
    const [externalTokenBalance, setExternalTokenBalance] = useState("0")
    const ERC20Contract = useERC20Contract()
    const dispatch = useAppDispatch()
    var customTokens = useAppSelector((state) => state.user.customTokenList && state.user.customTokenList[chainId])
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const { state: isInfoShowing, toggle: toggleInfo } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const [isSelected, setIsSelected] = useState(false);

    const CNS_DOMAIN_CONTRACT = useDomainContract(chainId, true);


    useEffect(() => {
        if (searchText !== "") {
            const filteredList = tokenList.filter((item) =>
                item.symbol.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredItems(filteredList);
        } else {
            setFilteredItems(tokenList)
        }

    }, [searchText])

    const getIconPath = (ticker: any) => {
        if (!tokenList) {
            return
        }
        if (tokenList.length == 0) {
            return;
        }
        const findItem = tokenList.filter((item) => item.symbol.toLowerCase().includes(ticker.toLowerCase()));
        return findItem.length > 0 ? findItem[0].logoURI : ""

    }

    const handleSelectPair = (exchangeItem: any) => {
        const baseItem = tokenList.filter((item) => item.address.toLowerCase().includes(exchangeItem.base.token.toLowerCase()));
        const quoteItem = tokenList.filter((item) => item.address.toLowerCase().includes(exchangeItem.quote.token.toLowerCase()));


        if (baseItem.length == 0) {
            baseItem.push({
                "chainId": chainId,
                "address": exchangeItem.base.token,
                "name": exchangeItem.base.name,
                "symbol": exchangeItem.base.symbol,
                "decimals": BigNumber.from(exchangeItem.base.decimals).toNumber(),
                "logoURI": DEFAULT_TOKEN_LOGO,
                "balance": "0"
            })
        }
        if (quoteItem.length == 0) {
            quoteItem.push({
                "chainId": chainId,
                "address": exchangeItem.quote.token,
                "name": exchangeItem.quote.name,
                "symbol": exchangeItem.quote.symbol,
                "decimals": BigNumber.from(exchangeItem.quote.decimals).toNumber(),
                "logoURI": DEFAULT_TOKEN_LOGO,
                "balance": "0"
            })
        }

        console.log(baseItem, quoteItem, exchangeItem)
        if (onSelectPair) {
            if (baseItem.length > 0 && quoteItem.length > 0) {
                onSelectPair(exchangeItem, baseItem[0], quoteItem[0]);
            }
        }


    }

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    const fetchTokenInfo = async (tokenAddress: any) => {
        try {
            const ERC20Token = ERC20Contract(tokenAddress)
            const name = await ERC20Token.name();
            const symbol = await ERC20Token.symbol();
            const decimals = await ERC20Token.decimals();
            const balance = await ERC20Token.balanceOf(account)


            const tokenAddr = new Token(chainId, tokenAddress, BigNumber.from(decimals).toNumber())

            setExternalTokenName(name)
            setExternalTokenDecimals(BigNumber.from(decimals).toNumber())
            setExternalTokenSymbol(symbol)
            setExternalTokenBalance(CurrencyAmount.fromRawAmount(tokenAddr, balance).toSignificant())
        } catch (e) {

        }

    }

    useEffect(() => {
        if (isAddress(externalTokenAddress)) {
            fetchTokenInfo(getAddress(externalTokenAddress))
        } else {
            setExternalTokenDecimals(0)
            setExternalTokenName("")
            setExternalTokenSymbol("")
        }
    }, [externalTokenAddress])

    const handleContractAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (isAddress(event?.target?.value)) {
            setExternalTokenAddress(event?.target?.value)
        } else {
            setExternalTokenAddress("")

        }
    };

    const handleImportToken = async () => {
        if (!isAddress(externalTokenAddress)) {
            return
        }
        let tokenInfo = {
            "chainId": chainId,
            "address": externalTokenAddress,
            "name": externalTokenName,
            "symbol": externalTokenSymbol,
            "decimals": externalTokenDecimals,
            "logoURI": "https://kewl.exchange/images/coins/skull.svg"
        }

        if (!chainId) {
            return
        }
        if (chainId < 1) {
            return
        }


        /*
        const [_isRegistered, _Address] = await CNS_DOMAIN_CONTRACT.isRegistered(account);
       if(!_isRegistered){
        setTransaction({ hash: '', summary: '', error:{message:`To import external tokens, you need to perform Domain Registration. Please complete your Domain Registration.`}});
        toggleError();
        return
       }
       */

        let customTokenList = [];
        customTokenList.push(tokenInfo)
        if (customTokens) {

            let hasToken = customTokens.some(token => token.address === externalTokenAddress);
            if (!hasToken) {
                customTokenList = [] = [...customTokenList, ...customTokens];
            } else {
                console.log("already exists")
            }

        }


        let newToken = [{
            "chainId": chainId,
            "address": externalTokenAddress,
            "name": externalTokenName,
            "symbol": externalTokenSymbol,
            "decimals": externalTokenDecimals,
            "logoURI": "https://kewl.exchange/images/coins/skull.svg",
            "balance": externalTokenBalance
        }]
        let newTokenList = [] = [...filteredItems, ...newToken];
        setFilteredItems(newTokenList)

        dispatch(updateCustomTokenList({ chainId: chainId, tokens: customTokenList }))

        setTransaction({ hash: '', summary: '', error: { message: `Token has been imported.` } });
        toggleInfo();

    }


    const canDisplayExchangePair = (pair) => {

        const baseItem = filteredItems.filter((item) => item.address.toLowerCase().includes(pair.base.token.toLowerCase()));
        const quoteItem = filteredItems.filter((item) => item.address.toLowerCase().includes(pair.quote.token.toLowerCase()));



        if (baseItem.length == 0) {
            return false
        }

        if (quoteItem.length == 0) {
            return false
        }

        return true

    }

    const canDisplay = (inputAddress) => {




        let hideAddresses = [
            "0x70d0fd23C13ebA3104C28e1dC8c470a253F73Fd7",
            "0xE02A38Ad58152Ab7CFC68Db4705E8c88B93479CB",
            "0xc57765AE831BD4c117BA103B802b74DdCF3750d2",
            "0xF299328bC0ED4ADC6713f1B3d4aa169569431579",
            "0xC245A489aaDC5E4519B852142D1AFF3E3418151e",
            "0x68d73FE616c3faaC1FC0feC6899a84e69b2CfA4F",
            "0xd4A1da83dc89aA13B8fa15d3Bf4EB1D52B6A949e"
        ]
        if (hideAddresses.includes(inputAddress)) {
            if (chainId == ChainId.ARBITRUM_ONE) {
                return false;
            }
        }

        let chilizAddresses = [
            "0x67289d20400EF06171dF3ADe7f5B826Daf3685D8",
            "0x70d0fd23C13ebA3104C28e1dC8c470a253F73Fd7",
            "0x9631be8566fC71d91970b10AcfdEe29F21Da6C27",

        ]
        if (chilizAddresses.includes(inputAddress)) {
            if (chainId == ChainId.CHILIZ_MAINNET) {
                return false;
            }
        }


        let ret = true;
        if (!chainId) { return false }
        if (!disableToken) {
            return false;
        }
        if (inputAddress === disableToken?.address) {
            ret = false;
        }

        if (!isSupportedChain(chainId)) {
            return false
        }
        const weth9Address = WETH9[chainId].address
        if (disableToken.address === ETHER_ADDRESS) {
            if (inputAddress === weth9Address) {
                ret = false;
            }
        }

        if (disableToken.address === weth9Address) {
            if (inputAddress === ETHER_ADDRESS) {
                ret = false;
            }
        }
        return ret
    }

    useEffect(() => {

        console.log(tokenList)
        if (tokenList) {
            setFilteredItems(tokenList)
            setAllTokenList(tokenList)
        }
    }, [tokenList])

    return (<>

        <ModalInfo
            isShowing={isInfoShowing}
            hide={toggleInfo}
            error={transaction.error}
        />
        <ModalError
            isShowing={isErrorShowing}
            hide={toggleError}
            error={transaction.error}
        />
        <CustomModal header={"Select Token"} isShowing={isShowing} hide={hide} closable={isClosable}>
            <Tabs color="default" aria-label="Options">
                <Tab key="tokens" title="Tokens">
                    <Card shadow="sm">
                        <CardHeader>
                            <Input startContent={
                                <span translate="no" className="material-symbols-outlined">
                                    search
                                </span>
                            }

                                label="Search" variant="flat" size="lg" value={searchText}
                                onChange={handleInputChange}
                                className="w-full" type="text" placeholder="" />

                        </CardHeader>
                        <CardBody>
                            <ScrollShadow orientation="horizontal" className="w-full h-[270px] max-h-[270px]">

                                <Listbox className="w-full" variant="flat" aria-label="Listbox menu with sections">


                                    <ListboxSection title="Tokens">
                                        {
                                            filteredItems && filteredItems.map((tokenItem) => {
                                                // Check if disableToken is null or address is different
                                                if (disableToken?.address !== tokenItem.address) {
                                                    return (
                                                        <ListboxItem
                                                            startContent={
                                                                <AvatarGroup size='sm' isBordered>
                                                                    <Avatar size='sm' src={tokenItem.logoURI} />
                                                                </AvatarGroup>
                                                            }
                                                            key={`token${tokenItem.address}`}
                                                            onPress={() => {
                                                                onSelect(tokenItem);
                                                                setSearchText("");
                                                            }}
                                                            className={"w-full flex flex-row items-center justify-between gap-2"}
                                                        >
                                                            <div className={"flex flex-row items-center justify-between gap-2 w-full"}>
                                                                <div className={"w-full flex flex-col items-center justify-center gap-2"}>
                                                                    <div className={"w-full flex flex-col items-start justify-start whitespace-nowrap overflow-ellipsis"}>
                                                                        <span className="font-bold">{tokenItem.symbol}</span>
                                                                        <span className={"text-xs whitespace-nowrap overflow-ellipsis"}>{tokenItem.name}</span>
                                                                    </div>
                                                                </div>
                                                                <div className={"w-full text-xs text-end"}>
                                                                    {tokenItem.balance}
                                                                </div>
                                                            </div>
                                                        </ListboxItem>
                                                    );
                                                }
                                                return null;  // This ensures nothing is rendered if the token is disabled
                                            })
                                        }
                                    </ListboxSection>

                                </Listbox>
                            </ScrollShadow>
                        </CardBody>
                    </Card>
                </Tab>
                <Tab key="pairs" title="Pairs">
                    <Card>
                        <CardBody>

                            <ScrollShadow orientation="horizontal" className="w-full h-[350px] max-h-[350px]">

                                <Listbox className="w-full" variant="flat" aria-label="Listbox menu with sections">
                                    {
                                        allExchangePairs && <ListboxSection title="Exchange Pairs">
                                            {


                                                allExchangePairs.map((exchangeItem, exchangeIndex) => {
                                                    return (
                                                        canDisplayExchangePair(exchangeItem) &&
                                                        canDisplay(exchangeItem.pair) &&
                                                        <ListboxItem
                                                            startContent={
                                                                <DoubleCurrencyIcon baseIcon={getIconPath(exchangeItem.base.symbol)} quoteIcon={getIconPath(exchangeItem.quote.symbol)} />
                                                            }
                                                            key={`exchangeItem${exchangeIndex}`} onPress={() => {
                                                                handleSelectPair(exchangeItem)
                                                            }} className="w-full">
                                                            <span className={"sm:text-sm"}>{exchangeItem.base.symbol} x {exchangeItem.quote.symbol}</span>
                                                        </ListboxItem>
                                                    )
                                                })

                                            }
                                        </ListboxSection>
                                    }

                                </Listbox>
                            </ScrollShadow>
                        </CardBody>
                    </Card>
                </Tab>
                <Tab key={"import"} title={"Import Token"}>
                    <Card>
                        <CardBody className="flex flex-col gap-2">
                            <Input onChange={handleContractAddressChange} size="lg" type="text" label="Contract Address" placeholder="0x" />
                            <Input isDisabled isReadOnly size="lg" type="text" label="Name" placeholder="" value={externalTokenName} />
                            <div className="grid grid-cols-2 gap-2">
                                <Input isDisabled isReadOnly size="lg" type="text" label="Symbol" placeholder="" value={externalTokenSymbol} />
                                <Input isDisabled isReadOnly size="lg" type="text" label="Decimals" placeholder="" value={externalTokenDecimals} />
                            </div>
                        </CardBody>
                        <CardFooter className="flex flex-col gap-2">
                            <div className="w-full flex flex-row gap-2 items-center justify-center rounded-lg bg-danger-500/30 text-danger-500 p-2">
                                <Image className="h-[128px] w-24" src={DEFAULT_TOKEN_LOGO} />
                                <span>External tokens are likely added for testing purposes or as potential scams. Please conduct your own research. Otherwise, you may risk losing your assets. Please refrain from making purchases.</span>
                            </div>
                            <div className="w-full flex flex-row items-center justify-between">
                                <Switch isSelected={isSelected} onValueChange={setIsSelected} defaultSelected color="default">I understand. I promise not to buy, I swear to God.</Switch>

                                <Button isDisabled={!isSelected} onPress={() => {
                                    handleImportToken()
                                }} size="lg" color="default">Import Token</Button>
                            </div>


                        </CardFooter>
                    </Card>
                </Tab>

            </Tabs>
        </CustomModal>
    </>


    )
}


export const ModalSelectCryptoCurrency = ({ isShowing, disableToken, hide, tokenList, onSelect, isClosable }) => {
    const [searchText, setSearchText] = useState("")

    const [filteredItems, setFilteredItems] = useState();


    const searchRequest = async (input: any) => {
        if (!input) { return }
        const equitiesRequest = await sendHTTPRequest(TCommandTypes.ACT_EQUITIES_FETCH, [{ key: "search", value: input, asset_type: 1 }])
        if (equitiesRequest.status === 200) {
            setFilteredItems(equitiesRequest.payload.Equities)
        }
    }
    const debouncedFunction = debounce(async (text: string) => {
        await searchRequest(text)
    }, 500);

    useEffect(() => {
        if (searchText !== "") {

            debouncedFunction(searchText)

        } else {
            setFilteredItems(tokenList)
        }

    }, [searchText])


    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };


    useEffect(() => {
        if (tokenList) {
            setFilteredItems(tokenList)
        }
    }, [tokenList])

    return (
        <CustomModal header={"Select Token"} isShowing={isShowing} hide={hide} closable={isClosable}>
            <div className={"w-full"}>

                <div className='flex w-full items-center justify-center p-2'>
                    <div className={"flex w-full flex-col items-center rounded-lg p-2"}>
                        <div className={"w-full"}>
                            <input value={searchText}
                                onChange={handleInputChange}
                                className="w-full rounded-lg p-4 font-semibold text-lg border border-1 border-[#e5e7eb]" type="text" placeholder="Search..." />
                        </div>
                        <div className={"grid sm:grid-cols-2 grid-cols-3 gap-2 w-full max-h-96  sm:max-h-[500px] overflow-y-scroll overflow-x-hidden my-3"}>
                            {
                                filteredItems && filteredItems.map((tokenItem) => {
                                    return (
                                        <button key={`token${tokenItem.address}`} onClick={() => {
                                            setSearchText("")
                                            onSelect(tokenItem)
                                        }} className={"token-selection hover:text-white flex flex-col gap-2"}>
                                            <div className={"flex flex-col items-center justify-center gap-2 w-full col-span-2 sm:col-span-1"}>
                                                <div className={"w-full flex flex-row items-center justify-start gap-2"}>
                                                    <img alt={tokenItem.symbol} className={"h-8 w-8 rounded-full"} src={tokenItem.Logo} />
                                                    <div className={"w-full flex flex-col items-start justify-start whitespace-nowrap overflow-ellipsis"}>
                                                        <span className="font-bold hover:text-white">{tokenItem.Ticker}</span>
                                                        <span className={"text-xs whitespace-nowrap overflow-ellipsis"}>{tokenItem.Name}</span>

                                                    </div>

                                                </div>

                                            </div>
                                        </button>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>


            </div>
        </CustomModal>
    )
}


export const ModalSelectExchangePair = ({ isShowing, disableToken, hide, tokenList, onSelect, isClosable, allExchangePairs, onSelectPair }) => {
    const { chainId } = useWeb3React()
    const [searchText, setSearchText] = useState("")

    const [filteredItems, setFilteredItems] = useState();


    useEffect(() => {
        if (searchText !== "") {
            const filteredList = tokenList.filter((item) =>
                item.symbol.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredItems(filteredList);
        } else {
            setFilteredItems(tokenList)
        }

    }, [searchText])

    const getIconPath = (ticker: any) => {
        if (!tokenList) {
            return
        }
        if (tokenList.length == 0) {
            return;
        }
        const findItem = tokenList.filter((item) => item.symbol.toLowerCase().includes(ticker.toLowerCase()));
        return findItem.length > 0 ? findItem[0].logoURI : ""

    }

    const handleSelectPair = (exchangeItem: any) => {
        const baseItem = tokenList.filter((item) => item.address.toLowerCase().includes(exchangeItem.base.token.toLowerCase()));
        const quoteItem = tokenList.filter((item) => item.address.toLowerCase().includes(exchangeItem.quote.token.toLowerCase()));

        if (onSelectPair) {
            if (baseItem.length > 0 && quoteItem.length > 0) {
                onSelectPair(exchangeItem, baseItem[0], quoteItem[0]);
            }
        }


    }

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    const canDisplay = (inputAddress) => {

        let hideAddresses = [
            "0x70d0fd23C13ebA3104C28e1dC8c470a253F73Fd7",
            "0xE02A38Ad58152Ab7CFC68Db4705E8c88B93479CB",
            "0xc57765AE831BD4c117BA103B802b74DdCF3750d2",
            "0xF299328bC0ED4ADC6713f1B3d4aa169569431579",
            "0xC245A489aaDC5E4519B852142D1AFF3E3418151e",
            "0x68d73FE616c3faaC1FC0feC6899a84e69b2CfA4F",
            "0xd4A1da83dc89aA13B8fa15d3Bf4EB1D52B6A949e",
            "0x9631be8566fC71d91970b10AcfdEe29F21Da6C27",

        ]
        if (hideAddresses.includes(inputAddress)) {
            if (chainId == ChainId.ARBITRUM_ONE) {
                return false;
            }
        }

        let chilizAddresses = [
            "0x67289d20400EF06171dF3ADe7f5B826Daf3685D8",
            "0x70d0fd23C13ebA3104C28e1dC8c470a253F73Fd7",
            "0x9631be8566fC71d91970b10AcfdEe29F21Da6C27",
            "0x70d0fd23C13ebA3104C28e1dC8c470a253F73Fd7"
        ]
        if (chilizAddresses.includes(inputAddress)) {
            if (chainId == ChainId.CHILIZ_MAINNET) {
                return false;
            }
        }




        let ret = true;
        if (!chainId) { return false }


        console.log("coder")
        if (inputAddress === disableToken?.address) {
            ret = false;
        }

        if (!isSupportedChain(chainId)) {
            return false
        }
        const weth9Address = WETH9[chainId].address
        if (disableToken?.address === ETHER_ADDRESS) {
            if (inputAddress === weth9Address) {
                ret = false;
            }
        }

        if (disableToken?.address === weth9Address) {
            if (inputAddress === ETHER_ADDRESS) {
                ret = false;
            }
        }
        return ret
    }
    useEffect(() => {
        if (tokenList) {
            setFilteredItems(tokenList)
        }
    }, [tokenList])

    return (
        <CustomModal header={"Select Pair"} isShowing={isShowing} hide={hide} closable={isClosable}>
            <div className={"w-full"}>

                <div className='flex w-full items-center justify-center'>
                    <div className={"flex w-full flex-col items-center rounded-lg p-2"}>


                        <ScrollShadow orientation="horizontal" className="w-full max-h-[400px]">

                            <div className="w-full grid  grid-cols-1 sm:grid-cols-3 p-2 gap-4">
                                {
                                    allExchangePairs &&


                                    allExchangePairs.map((exchangeItem, exchangeIndex) => {
                                        return (
                                            canDisplay(exchangeItem.pair) &&
                                            <Button size="lg" variant="flat"

                                                key={`exchangeItem${exchangeIndex}`} onPress={() => {
                                                    handleSelectPair(exchangeItem)
                                                }} className="w-full flex flex-col gap-2 h-[100px]">
                                                <DoubleCurrencyIcon baseIcon={getIconPath(exchangeItem.base.symbol)} quoteIcon={getIconPath(exchangeItem.quote.symbol)} />
                                                <span className={"sm:text-sm"}>{exchangeItem.base.symbol} x {exchangeItem.quote.symbol}</span>
                                            </Button>
                                        )
                                    })

                                }



                            </div>
                        </ScrollShadow>


                    </div>
                </div>


            </div>
        </CustomModal>
    )
}
