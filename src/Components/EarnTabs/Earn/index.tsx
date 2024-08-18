import React, { memo, useEffect, useMemo, useState } from 'react';
import { DEFAULT_TOKEN_LOGO, ETHER_ADDRESS, TradeType } from '../../../constants/misc';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import moment from 'moment';
import { Route as ReactRoute, NavLink } from 'react-router-dom';
import { ChainId, isSupportedChain } from '../../../constants/chains';
import { WETH9, Token, CurrencyAmount, Pair, Price, Trade, Currency, Percent, Route } from '../../../entities';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract, useFanTokenWrapperContract, useKEWLStakeContract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalSelectExchangePair } from '../../../hooks/useModals';
import { useAppSelector } from '../../../state/hooks';
import { useFetchAllTokenList } from '../../../state/user/hooks';
import { getNativeCurrencyByChainId, parseFloatWithDefault } from '../../../utils';
import { DoubleCurrencyIcon } from '../../DoubleCurrency';
import UniwalletModal from '../../Modal/UniwalletModal';
import { Accordion, AccordionItem, Avatar, Button, ButtonGroup, Card, CardBody, CardFooter, CardHeader, DatePicker, Divider, Image, Progress, Spinner, User } from '@nextui-org/react';
import { formatUnits, parseEther } from '@ethersproject/units';
import { Chart } from '../../Chart';
import { BLACK_LIST } from '../../../constants/blacklist';

import { parseAbsoluteToLocal, now, getLocalTimeZone } from "@internationalized/date";


const _EARN_TAB = () => {

    const { connector, account, provider, chainId } = useWeb3React()
    const EXCHANGE = useExchangeContract(chainId, true)
    const FANTOKENWRAPPER = useFanTokenWrapperContract(chainId, true)
    const KEWLSTAKE = useKEWLStakeContract(chainId, true);

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

    const [baseLiquidity, setBaseLiquidity] = useState("0")
    const [quoteLiquidity, setQuoteLiquidity] = useState("0")

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
    const userTax = useAppSelector((state) => state.user.userTax);
    const userSlippageTolerance = useAppSelector((state) => state.user.userSlippageTolerance);
    const [allExchangePairs, setAllExchangePairs]: any = useState(null)
    const [lockDate, setLockDate] = useState(parseAbsoluteToLocal(new Date().toISOString()));


    const [pools, setPools]: any = useState(null)
    const [isLoading, setLoaded] = useState(false)

    useFetchAllTokenList(chainId, account)




    useEffect(() => {


        if (!chainId) { return; }
        if (!defaultAssets) { return }
        if (defaultAssets.length === 0) { return }
        initDefaults()

    }, [chainId, account, defaultAssets])


    const initDefaults = async () => {
        setLoaded(false)

        console.log(defaultAssets);




        setLoaded(true)
    }


    function isWrappedAsset(asset: any): boolean {
        const wrappedSymbols = ['wCHZ', 'WCHZ', 'CHZ'];
        return wrappedSymbols.includes(asset);
    }


    const RewardAsset = (props: { asset: any }) => {



        useEffect(() => {

        }, [props.asset])


        const getAssetSymbol = () => {
            return `ersan`
        }
        return (
            <Card isHoverable={true}>
                <CardBody className='flex flex-row gap-2 justify-between'>

                    <User
                        name={props.asset.symbol}
                        description={props.asset.name}
                        avatarProps={{
                            src: props.asset.logoURI
                        }}
                    />

                    <Button color='danger' size='md' radius='sm' variant='solid'>
                        Claim
                    </Button>

                </CardBody>
                <CardFooter className='grid grid-cols-2 gap-4'>


                    <Progress
                        label="Total Tradings"
                        size="sm"
                        value={0}
                        maxValue={10000}
                        color="danger"
                        showValueLabel={true}
                        className="w-full"
                    />
                    <Progress
                        label="Your Tradings"
                        size="sm"
                        value={0}
                        maxValue={10000}
                        color="success"
                        showValueLabel={true}
                        className="w-full"
                    />
                    <Divider className='col-span-2' />
                    <Progress
                        label="Your Balance"
                        size="sm"
                        value={0}
                        maxValue={10000}
                        color="danger"
                        showValueLabel={true}
                        className="w-full"
                    />
                    <Progress
                        label="Your Earnings"
                        size="sm"
                        value={0}
                        maxValue={10000}
                        color="success"
                        showValueLabel={true}
                        className="w-full"
                    />

                    <Divider className='col-span-2' />

                    <Progress
                        label="Total Reward"
                        size="sm"
                        value={0}
                        maxValue={10000}
                        color="success"
                        showValueLabel={true}
                        className="w-full"
                    />

                    <Progress
                        label="Total Supply"
                        size="sm"
                        value={0}
                        maxValue={10000}
                        color="success"
                        showValueLabel={true}
                        className="w-full"
                    />



                </CardFooter>
            </Card>
        )
    }

    return (
        <>
            <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />
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

                {defaultAssets && defaultAssets.length > 0 &&
                    defaultAssets.map((asset, index) => (
                        !isWrappedAsset(asset?.symbol) && <RewardAsset
                            key={index}
                            asset={asset}
                        />
                    ))
                }
            </div>

        </>
    );
}
export const EARN_TAB = memo(_EARN_TAB)




