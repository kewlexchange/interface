import React, { memo, useEffect, useMemo, useState } from 'react';
import { DEFAULT_TOKEN_LOGO, ETHER_ADDRESS, TradeType } from '../../../constants/misc';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import moment from 'moment';
import { Route as ReactRoute, NavLink } from 'react-router-dom';
import { isSupportedChain } from '../../../constants/chains';
import { WETH9, Token, CurrencyAmount, Pair, Price, Trade, Currency, Percent, Route } from '../../../entities';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract, useFanTokenWrapperContract, useKEWLVestingContract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalSelectExchangePair } from '../../../hooks/useModals';
import { useAppSelector } from '../../../state/hooks';
import { fetchAllTokenList } from '../../../state/user/hooks';
import { getNativeCurrencyByChainId, getShordAccount, parseFloatWithDefault, unixTimeToDateTime } from '../../../utils';
import { DoubleCurrencyIcon } from '../../DoubleCurrency';
import UniwalletModal from '../../Modal/UniwalletModal';
import { Avatar, Button, ButtonGroup, Card, DatePicker, Image, Input, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, TimeInput, User } from '@nextui-org/react';
import { formatUnits, parseEther } from '@ethersproject/units';
import { Chart } from '../../Chart';
import { BLACK_LIST } from '../../../constants/blacklist';
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import { useDateFormatter } from "@react-aria/i18n";
import { format } from 'date-fns';
import { parseAbsoluteToLocal, Time, ZonedDateTime } from "@internationalized/date";


const _SWAP_TAB = () => {

    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const EXCHANGE = useExchangeContract(chainId, true)
    const KEWLVESTING = useKEWLVestingContract(chainId, true)

    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const { state: isSelectToken, toggle: toggleSelectToken } = useModal()
    const { state: isConnect, toggle: toggleConnectModal } = useModal()
    const { state: isShowWallet, toggle: toggleWalletModal } = useModal()

    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])
    const [baseAsset, setBaseAsset] = useState(null)
    const [quoteAsset, setQuoteAsset] = useState(null)
    const [isBase, setIsBase] = useState(true)


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
    const userSlippageTolerance = useAppSelector((state) => state.user.userSlippageTolerance);
    const [allExchangePairs, setAllExchangePairs]: any = useState(null)


    const [lockDate, setLockDate] = useState(parseAbsoluteToLocal(new Date().toISOString()));
    const [claimAccount, setClaimAccount] = useState(account)
    const [vestings, setVestings] = useState([])
    const [isLoaded, setLoaded] = useState(false)
    fetchAllTokenList(chainId, account)




    const fetchVestings = async () => {

        const _vestings = await KEWLVESTING.getVestings();
        setVestings(_vestings)
        console.log(_vestings)
        setLoaded(true)
    }

    useEffect(() => {
        if (!chainId) { return; }
        if (!defaultAssets) { return }
        if (defaultAssets.length === 0) { return }

        fetchVestings()


        const kwlToken = defaultAssets.find(token => token && token.symbol === "KWL");
        if (kwlToken) {
            setBaseAsset(kwlToken);
            setQuoteAsset(defaultAssets.find(token => token?.symbol === getNativeCurrencyByChainId(chainId)))
        } else {
            console.error("KWL token not found in defaultAssets.");
            setBaseAsset(null)
            setQuoteAsset(null)
        }

    }, [defaultAssets])



    const getTokenLogo = (address:any) => {
        return defaultAssets.find(token => token?.address === address).logoURI
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

    }, [chainId, account, defaultAssets, provider, baseAsset, quoteAsset, baseInputValue, quoteInputValue])




    const onSelectToken = (tokenInfo) => {
        isBase ? setBaseAsset(tokenInfo) : setQuoteAsset(tokenInfo)
        toggleSelectToken()
    }

    const handleSelectPair = (pair: any, base: any, quote: any) => {
        setBaseAsset(base);
        setQuoteAsset(quote);
        toggleSelectToken();
    }

    const  handleClaim = async(index:any) =>{
        setTransaction({ hash: '', summary: '', error: {message:`Invalid Action!`} });
        toggleError();
        return;
        toggleLoading();
        await KEWLVESTING.unlockTokens(index).then(async (tx) => {
            await tx.wait();
            const summary = `Locking Tokens : ${tx.hash}`
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
            <ModalSelectToken disableToken={!isBase ? baseAsset : quoteAsset} hide={toggleSelectToken} isShowing={isSelectToken} onSelect={onSelectToken} isClosable={true} tokenList={defaultAssets} onSelectPair={handleSelectPair} allExchangePairs={allExchangePairs} />
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

                <Table removeWrapper color={"danger"} selectionMode="single"
                >
                    <TableHeader>
                        <TableColumn>Asset</TableColumn>
                        <TableColumn>Action</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={isLoaded ? "No Vestings Found!" : "Loading... Please Wait!"}
                        isLoading={!isLoaded}
                        items={vestings}
                        loadingContent={<Spinner color="danger" />}>

                        {(vestingInfo) => (
                            <TableRow key={vestingInfo.vesting}>
                                
                                <TableCell>
                               
                                    <div className='w-full flex flex-col gap-2'>
                                    <User className='w-full flex justify-start'
                                        name={vestingInfo.symbol}
                                        description={vestingInfo.name}
                                        avatarProps={{
                                            src: getTokenLogo(vestingInfo.token)
                                        }}
                                    />
                                        <div className='flex flex-col gap-2'>
                                            <span>Lock Contract</span>
                                            <span className='text-sm'>{ vestingInfo.vesting}</span>
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <span>Token Amount</span>
                                            <span>{formatUnits(vestingInfo?.amount,vestingInfo.decimals)}</span>
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <span>Account</span>
                                            <span>{vestingInfo?.locker}</span>
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <span>Expire Date</span>
                                            <span>{unixTimeToDateTime(vestingInfo.expiredAt)}</span>
                                        </div>

                                    
                          
                                    
                                    
                             
                                    </div>
                                </TableCell>
                                <TableCell align='center' valign='top'>
                                    {
                                        moment().unix() > vestingInfo.expiredAt ? <>
                                             <Button onClick={()=>{
                                                handleClaim(vestingInfo.index);
                                             }} fullWidth size="sm" color="success" variant="flat">
                                        Claim
                                    </Button>
                                        </> : <>
                                        <Button fullWidth size="sm" color="danger" variant="flat">
                                        Locked
                                    </Button>
                                        </>
                                    }
                               
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

        </>
    );
}
export const VESTING_VESTINGS_TAB = memo(_SWAP_TAB)

