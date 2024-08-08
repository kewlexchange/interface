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
import { DEFAULT_TOKEN_LOGO, ETHER_ADDRESS } from "../constants/misc";
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
                        <a className={"btn btn-primary mt-4"} target='_blank' onClick={hide} href='https://metamask.io/download.html'>
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
                        <Button color="danger" size="lg" className={"w-full"} onClick={() => {
                            hide();
                        }
                        }>
                            Close
                        </Button>
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


                        <Button color="danger" size="lg" className={"w-full"} onClick={() => {
                            hide();
                        }
                        }>
                            Close
                        </Button>
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

                        <Button color="danger" size="lg" className={"w-full"} onClick={() => {
                            hide();
                        }
                        }>
                            Close
                        </Button>
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
                                    <Button variant="solid" color="danger" onClick={() => {
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
                            <div className="w-[20%] flex items-center justify-center">
                                <NFT canStake={false} reloadFunction={null} showMetadata={false} itemType={tokenType} contractAddress={contractAddress} tokenId={tokenId} canSell={false} />
                            </div>
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
                            <Button size="lg" color="danger" onClick={() => {
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
                                <button onClick={() => {
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
    const {state:isTransactionSuccess, toggle:toggleTransactionSuccess } = useModal();
    const {state:isShowLoading, toggle:toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const { state: isInfoShowing, toggle: toggleInfo } = useModal()
    const [transaction, setTransaction] = useState({hash: '',summary: '',error: null})
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


        if(baseItem.length == 0){
            baseItem.push( {
                "chainId": chainId,
                "address": exchangeItem.base.token,
                "name": exchangeItem.base.name,
                "symbol": exchangeItem.base.symbol,
                "decimals": BigNumber.from(exchangeItem.base.decimals).toNumber(),
                "logoURI": DEFAULT_TOKEN_LOGO,
                "balance": "0"
            })
        }
        if(quoteItem.length == 0){
            quoteItem.push( {
                "chainId": chainId,
                "address": exchangeItem.quote.token,
                "name": exchangeItem.quote.name,
                "symbol": exchangeItem.quote.symbol,
                "decimals": BigNumber.from(exchangeItem.quote.decimals).toNumber(),
                "logoURI": DEFAULT_TOKEN_LOGO,
                "balance": "0"
            })
        }

        console.log(baseItem,quoteItem,exchangeItem)
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

        setTransaction({ hash: '', summary: '', error:{message:`Token has been imported.`}});
        toggleInfo();

    }


    const canDisplayExchangePair = (pair) => {

        const baseItem = filteredItems.filter((item) => item.address.toLowerCase().includes(pair.base.token.toLowerCase()));
        const quoteItem = filteredItems.filter((item) => item.address.toLowerCase().includes(pair.quote.token.toLowerCase()));

     
        
        if(baseItem.length == 0){
            return false
        }

        if(quoteItem.length == 0){
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
            <div className={"w-full"}>




                <Card shadow="sm" fullWidth={true}>

                    <CardBody>
                        <Tabs color="danger" aria-label="Options">
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
                                                        disableToken && filteredItems && filteredItems.map((tokenItem) => {
                                                            return (canDisplay(tokenItem.address)) &&
                                                                <ListboxItem startContent={
                                                                    <AvatarGroup size='sm' isBordered>

                                                                        <Avatar size='sm' src={tokenItem.logoURI} />

                                                                    </AvatarGroup>

                                                                }
                                                                    key={`token${tokenItem.address}`} onClick={() => {
                                                                        onSelect(tokenItem)
                                                                        setSearchText("")
                                                                    }} className={"w-full flex flex-row items-center justify-between gap-2"}>
                                                                    <div className={"flex flex-row items-center justify-between gap-2 w-full"}>
                                                                        <div className={"w-full flex flex-col items-center justify-center gap-2"}>
                                                                            <div className={"w-full flex flex-col items-start justify-start whitespace-nowrap overflow-ellipsis"}>
                                                                                <span className="font-bold">{tokenItem.symbol}</span>
                                                                                <span className={"text-xs whitespace-nowrap overflow-ellipsis"}>{tokenItem.name}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className={"w-full text-xs text-end "}>
                                                                            {tokenItem.balance}
                                                                        </div>
                                                                    </div>

                                                                </ListboxItem>
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
                                                                        key={`exchangeItem${exchangeIndex}`} onClick={() => {
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
                                            <Image className="h-[128px] w-[128px]"  src={DEFAULT_TOKEN_LOGO}/>
                                            <span>External tokens are likely added for testing purposes or as potential scams. Please conduct your own research. Otherwise, you may risk losing your assets. Please refrain from making purchases.</span>
                                        </div>
                                        <div className="w-full flex flex-row items-center justify-between">
                                        <Switch  isSelected={isSelected} onValueChange={setIsSelected} defaultSelected color="danger">I understand. I promise not to buy, I swear to God.</Switch>

                                            <Button isDisabled={!isSelected} onClick={() => {
                                                handleImportToken()
                                            }} size="lg" color="danger">Import Token</Button>
                                        </div>

                                    
                                    </CardFooter>
                                </Card>
                            </Tab>

                        </Tabs>
                    </CardBody>
                </Card>




            </div>
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
    const {state:isTransactionSuccess, toggle:toggleTransactionSuccess } = useModal();
    const {state:isShowLoading, toggle:toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const { state: isInfoShowing, toggle: toggleInfo } = useModal()
    const [transaction, setTransaction] = useState({hash: '',summary: '',error: null})
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


        if(baseItem.length == 0){
            baseItem.push( {
                "chainId": chainId,
                "address": exchangeItem.base.token,
                "name": exchangeItem.base.name,
                "symbol": exchangeItem.base.symbol,
                "decimals": BigNumber.from(exchangeItem.base.decimals).toNumber(),
                "logoURI": DEFAULT_TOKEN_LOGO,
                "balance": "0"
            })
        }
        if(quoteItem.length == 0){
            quoteItem.push( {
                "chainId": chainId,
                "address": exchangeItem.quote.token,
                "name": exchangeItem.quote.name,
                "symbol": exchangeItem.quote.symbol,
                "decimals": BigNumber.from(exchangeItem.quote.decimals).toNumber(),
                "logoURI": DEFAULT_TOKEN_LOGO,
                "balance": "0"
            })
        }

        console.log(baseItem,quoteItem,exchangeItem)
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

        setTransaction({ hash: '', summary: '', error:{message:`Token has been imported.`}});
        toggleInfo();

    }


    const canDisplayExchangePair = (pair) => {

        const baseItem = filteredItems.filter((item) => item.address.toLowerCase().includes(pair.base.token.toLowerCase()));
        const quoteItem = filteredItems.filter((item) => item.address.toLowerCase().includes(pair.quote.token.toLowerCase()));

     
        
        if(baseItem.length == 0){
            return false
        }

        if(quoteItem.length == 0){
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
            <div className={"w-full"}>




                <Card shadow="sm" fullWidth={true}>

                    <CardBody>
                        <Tabs color="danger" aria-label="Options">
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
                                                        disableToken && filteredItems && filteredItems.map((tokenItem) => {
                                                            return (tokenItem.decimals < 18 && canDisplay(tokenItem.address)) &&
                                                                <ListboxItem startContent={
                                                                    <AvatarGroup size='sm' isBordered>

                                                                        <Avatar size='sm' src={tokenItem.logoURI} />

                                                                    </AvatarGroup>

                                                                }
                                                                    key={`token${tokenItem.address}`} onClick={() => {
                                                                        onSelect(tokenItem)
                                                                        setSearchText("")
                                                                    }} className={"w-full flex flex-row items-center justify-between gap-2"}>
                                                                    <div className={"flex flex-row items-center justify-between gap-2 w-full"}>
                                                                        <div className={"w-full flex flex-col items-center justify-center gap-2"}>
                                                                            <div className={"w-full flex flex-col items-start justify-start whitespace-nowrap overflow-ellipsis"}>
                                                                                <span className="font-bold">{tokenItem.symbol}</span>
                                                                                <span className={"text-xs whitespace-nowrap overflow-ellipsis"}>{tokenItem.name}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className={"w-full text-xs text-end "}>
                                                                            {tokenItem.balance}
                                                                        </div>
                                                                    </div>

                                                                </ListboxItem>
                                                        })
                                                    }
                                                </ListboxSection>
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
                                            <Image className="h-[128px] w-[128px]"  src={DEFAULT_TOKEN_LOGO}/>
                                            <span>External tokens are likely added for testing purposes or as potential scams. Please conduct your own research. Otherwise, you may risk losing your assets. Please refrain from making purchases.</span>
                                        </div>
                                        <div className="w-full flex flex-row items-center justify-between">
                                        <Switch  isSelected={isSelected} onValueChange={setIsSelected} defaultSelected color="danger">I understand. I promise not to buy, I swear to God.</Switch>

                                            <Button isDisabled={!isSelected} onClick={() => {
                                                handleImportToken()
                                            }} size="lg" color="danger">Import Token</Button>
                                        </div>

                                    
                                    </CardFooter>
                                </Card>
                            </Tab>

                        </Tabs>
                    </CardBody>
                </Card>




            </div>
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

                            <Listbox className="w-full" variant="flat" aria-label="Listbox menu with sections">
                                {
                                    allExchangePairs && <ListboxSection>
                                        {


                                            allExchangePairs.map((exchangeItem, exchangeIndex) => {
                                                return (
                                                    canDisplay(exchangeItem.pair) &&
                                                    <ListboxItem
                                                        startContent={
                                                            <DoubleCurrencyIcon baseIcon={getIconPath(exchangeItem.base.symbol)} quoteIcon={getIconPath(exchangeItem.quote.symbol)} />
                                                        }
                                                        key={`exchangeItem${exchangeIndex}`} onClick={() => {
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


                    </div>
                </div>


            </div>
        </CustomModal>
    )
}

