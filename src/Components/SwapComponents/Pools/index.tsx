import React, { memo, useEffect, useMemo, useState } from 'react';
import { ETHER_ADDRESS, MINIMUM_LIQUIDITY, SWAP_FEE_ON, TradeType, ZERO } from '../../../constants/misc';
import { BigNumber, ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import moment from 'moment';
import { Route as ReactRoute, NavLink } from 'react-router-dom';
import { ChainId, isSupportedChain } from '../../../constants/chains';
import { WETH9, Token, CurrencyAmount, Pair, Price, Trade, Currency, Percent, Route } from '../../../entities';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction } from '../../../hooks/useModals';
import { useAppSelector } from '../../../state/hooks';
import { useFetchAllTokenList } from '../../../state/user/hooks';
import { getNativeCurrencyByChainId, parseFloatWithDefault, sqrt } from '../../../utils';
import { DoubleCurrencyIcon } from '../../DoubleCurrency';
import UniwalletModal from '../../Modal/UniwalletModal';
import { calculateSlippageAmount } from '../../../utils/calculateSlippageAmount';
import useBlockNumber from '../../../hooks/useBlockNumber';
import { parseUnits } from 'ethers/lib/utils';
import { Button, Card, Image } from '@nextui-org/react';
import { BLACK_LIST } from '../../../constants/blacklist';



const _POOL_TAB = () => {

    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const EXCHANGE = useExchangeContract(chainId, true)
    const ERC20Contract = useERC20Contract()
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const { state: isSelectToken, toggle: toggleSelectToken } = useModal()

    const [baseAsset, setBaseAsset] = useState(null)
    const [quoteAsset, setQuoteAsset] = useState(null)
    const [isBase, setIsBase] = useState(true)

    const [basePrice, setBasePrice] = useState("0")
    const [quotePrice, setQuotePrice] = useState("0")
    const [shareOfPool, setShareOfPool] = useState("0")
    const blockNumber = useBlockNumber()

    const [baseInputValue, setBaseInputValue] = useState("")
    const [quoteInputValue, setQuoteInputValue] = useState("")

    const [baseLiquidity, setBaseLiquidity] = useState("0")
    const [quoteLiquidity, setQuoteLiquidity] = useState("0")
    const [userBaseLiquidity, setUserBaseLiquidity] = useState("0")
    const [userQuoteLiquidity, setUserQuoteLiquidity] = useState("0")

    const [isPairExists, setPairExists] = useState(false)
    const [pairInfo, setPairInfo] = useState(null)

    const [baseTokenAllowance, setBaseTokenAllowance] = useState(0)
    const [quoteTokenAllowance, setQuoteTokenAllowance] = useState(0)
    const [hasBaseAllowance, setHasBaseAllowance] = useState(false)
    const [hasQuoteAllowance, setHasQuoteAllowance] = useState(false)

    const [hasLiquidity, setHasLiquidity] = useState(false)
    const [userLiquidity, setUserLiquidity] = useState("0.0000")
    const [totalLiquidity, setTotalLiquidity] = useState("0.0000")


    const userDeadline = useAppSelector((state) => state.user.userDeadline);
    const userSlippageTolerance = useAppSelector((state) => state.user.userSlippageTolerance);
    const [allExchangePairs, setAllExchangePairs]: any = useState(null)


    const PAIRContract = usePAIRContract()
    useFetchAllTokenList(chainId, account)




    const checkAllowance = async () => {
        if (!account) {
            setBaseTokenAllowance(0)
            setQuoteTokenAllowance(0)
            return;
        }

        let _baseAssetAddress = baseAsset.address === ETHER_ADDRESS ? WETH9[chainId].address : baseAsset.address;
        let _quoteAssetAddress = quoteAsset.address === ETHER_ADDRESS ? WETH9[chainId].address : quoteAsset.address;

        const userAccount = account

        let baseTokenERC = ERC20Contract(_baseAssetAddress);
        let quoteTokenERC = ERC20Contract(_quoteAssetAddress);
        const _baseAllowanceAmount = await baseTokenERC.allowance(userAccount, EXCHANGE.address);
        const _quoteAllowanceAmount = await quoteTokenERC.allowance(userAccount, EXCHANGE.address);

        console.log("BASE", _baseAllowanceAmount)
        console.log("QUOTE", _quoteAllowanceAmount)

        setQuoteTokenAllowance(_quoteAllowanceAmount)
        setBaseTokenAllowance(_baseAllowanceAmount)
    }
    const displayError = (message) => {
        let error = { message: message }
        setTransaction({ hash: '', summary: '', error: error });
        toggleError();
    }
    const handleAddLiquidity = async () => {



        const ZERO_PERCENT = new Percent('0')
        const DEFAULT_ADD_SLIPPAGE_TOLERANCE = new Percent(userSlippageTolerance, 10_000)

        let _baseAssetAddress = baseAsset.address === ETHER_ADDRESS ? WETH9[chainId].address : baseAsset.address
        let _quoteAssetAddress = quoteAsset.address === ETHER_ADDRESS ? WETH9[chainId].address : quoteAsset.address

        const tokenA = new Token(baseAsset.chainId, _baseAssetAddress, baseAsset.decimals)
        const tokenB = new Token(quoteAsset.chainId, _quoteAssetAddress, quoteAsset.decimals)
        const [baseToken, quoteToken] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]

        
        if (BLACK_LIST.includes(baseAsset.address)) {
            displayError("Under Maintenance!"); return;
        }


        if (BLACK_LIST.includes(quoteAsset.address)) {
            displayError("Under Maintenance!"); return;
        }


   


        const amountADesired = ethers.utils.parseUnits(baseInputValue, baseAsset.decimals);
        const amountBDesired = ethers.utils.parseUnits(quoteInputValue, quoteAsset.decimals);


        let reserve0: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(baseToken, amountADesired.toString());
        let reserve1: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(quoteToken, amountBDesired.toString());

        const amountAMin = calculateSlippageAmount(reserve0, hasLiquidity ? ZERO_PERCENT : DEFAULT_ADD_SLIPPAGE_TOLERANCE)[0].toString()
        const amountBMin = calculateSlippageAmount(reserve1, hasLiquidity ? ZERO_PERCENT : DEFAULT_ADD_SLIPPAGE_TOLERANCE)[0].toString();
        const addressTo = account
        const deadline = moment().utc().unix() + (30 * 60)

        toggleLoading();



        if ((baseAsset.address === ETHER_ADDRESS) || (quoteAsset.address === ETHER_ADDRESS)) {
            let tokenAddress = baseAsset.address === ETHER_ADDRESS ? quoteAsset.address : baseAsset.address



            let _amountTokenDesired = baseAsset.address === ETHER_ADDRESS ? amountBDesired : amountADesired
            let _amountTokenMin = baseAsset.address === ETHER_ADDRESS ? amountBMin : amountAMin
            let _amountETHMin = baseAsset.address === ETHER_ADDRESS ? amountAMin : amountBMin

            let depositOverrides = {
                value: baseAsset.address === ETHER_ADDRESS ? amountADesired : amountBDesired
            }

            console.log("DEPOSIT", depositOverrides.value)
            console.log("tokenAddress", tokenAddress)
            console.log("_amountTokenDesired", ethers.utils.formatUnits(_amountTokenDesired, 18))
            console.log("_amountTokenMin", ethers.utils.formatUnits(_amountTokenMin, 18))
            console.log("_amountETHMin", ethers.utils.formatUnits(_amountETHMin, 18))
            console.log("addressTo", addressTo)


            await EXCHANGE.addLiquidityETH(tokenAddress, _amountTokenDesired, _amountTokenMin, _amountETHMin, addressTo, deadline, depositOverrides).then(async (tx) => {
                await tx.wait();
                const summary = `Adding Liquidity to Pair: ${tx.hash}`
                setTransaction({ hash: tx.hash, summary: summary, error: null });
                toggleTransactionSuccess();
            }).catch((error: Error) => {
                setTransaction({ hash: '', summary: '', error: error });
                toggleError();
            }).finally(async () => {
                initDefaults();
                toggleLoading();
            });


        } else {
            await EXCHANGE.addLiquidity(baseAsset.address, quoteAsset.address, amountADesired, amountBDesired, amountAMin, amountBMin, addressTo, deadline).then(async (tx) => {
                await tx.wait();
                const summary = `Adding Liquidity to Pair: ${tx.hash}`
                setTransaction({ hash: tx.hash, summary: summary, error: null });
                toggleTransactionSuccess();
            }).catch((error: Error) => {
                setTransaction({ hash: '', summary: '', error: error });
                toggleError();
            }).finally(async () => {
                initDefaults();
                toggleLoading();
            });
        }




    }

    const handleApprove = async (token) => {

        console.log("TOKEN", token)
        let poolToken = ERC20Contract(token);
        const tokenDecimals = await poolToken.decimals();
        const transferAmount = ethers.constants.MaxUint256
        toggleLoading();
        await poolToken.approve(EXCHANGE.address, transferAmount, { from: account }).then(async (tx) => {
            await tx.wait();
            const summary = `Unlocking tokens for: ${EXCHANGE.address}`
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
    const handleCreatePair = async () => {
        toggleLoading();
        await EXCHANGE.createPair(baseAsset.address, quoteAsset.address).then(async (tx) => {
            await tx.wait();
            const summary = `Creating Pair: ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            initDefaults();
            toggleLoading();
        });
    }

    function toHex(currencyAmount: CurrencyAmount<Currency>) {
        return `0x${currencyAmount.quotient.toString(16)}`
    }


    const handleRemoveLiquidity = async () => {
        let pairContract = PAIRContract(pairInfo.pair);
        const _account = account
        let allowanceBalance: BigNumber = await pairContract.allowance(_account, EXCHANGE.address)
        let balance = await pairContract.balanceOf(_account)
        let totalSupply = await pairContract.totalSupply()
        let kLast = await pairContract.kLast()

        const [_reserve0, _reserve1, _blockTimestampLast] = await pairContract.getReserves();

        const pairToken = new Token(baseAsset.chainId, pairInfo.pair, 18)
        const tokenA = new Token(baseAsset.chainId, pairInfo.base.token, baseAsset.decimals)
        const tokenB = new Token(quoteAsset.chainId, pairInfo.quote.token, quoteAsset.decimals)
        const [baseToken, quoteToken] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]

        const [baseReserve, quoteReserve] = baseToken.sortsBefore(quoteToken) ? [_reserve0, _reserve1] : [_reserve1, _reserve0]

        const exchangePair = new Pair(
            CurrencyAmount.fromRawAmount(baseToken, baseReserve),
            CurrencyAmount.fromRawAmount(quoteToken, quoteReserve),
            pairToken.address
        )

        console.log("BASE", pairInfo.base.token, baseToken.address)
        console.log("QUOTE", pairInfo.quote.token, quoteToken.address)
        console.log("totalSupply", totalSupply)

        const lpTotalSupply: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(pairToken, totalSupply)
        const userLiquidity: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(pairToken, balance)



        const liquidityValueA =
            exchangePair &&
                lpTotalSupply &&
                userLiquidity &&
                tokenA &&
                JSBI.greaterThanOrEqual(lpTotalSupply.quotient, userLiquidity.quotient)
                ? CurrencyAmount.fromRawAmount(tokenA, exchangePair.getLiquidityValue(baseToken, lpTotalSupply, userLiquidity, SWAP_FEE_ON, kLast).quotient)
                : undefined


        const liquidityValueB =
            exchangePair &&
                lpTotalSupply &&
                userLiquidity &&
                tokenB &&
                JSBI.greaterThanOrEqual(lpTotalSupply.quotient, userLiquidity.quotient)
                ? CurrencyAmount.fromRawAmount(quoteToken, exchangePair.getLiquidityValue(quoteToken, lpTotalSupply, userLiquidity, SWAP_FEE_ON, kLast).quotient)
                : undefined

        let percentToRemove: Percent = new Percent('100', '100')

        console.log("liquidityValueA", liquidityValueA.toSignificant(6))
        console.log("liquidityValueB", liquidityValueB.toSignificant(6))




        if (userLiquidity.greaterThan(0)) {
            if (allowanceBalance.lt(balance)) {
                toggleLoading();

                await pairContract.approve(EXCHANGE.address, balance).then(async (tx) => {
                    await tx.wait();
                    const summary = `Allowance Pair: ${tx.hash}`
                    setTransaction({ hash: tx.hash, summary: summary, error: null });
                    toggleTransactionSuccess();
                }).catch((error: Error) => {
                    setTransaction({ hash: '', summary: '', error: error });
                    toggleError();
                }).finally(async () => {
                    initDefaults();
                    toggleLoading();
                });
            }
        }

        if (balance.gt(0)) {
            let liquidity = balance
            let amountAMin = 0;//toHex(liquidityValueA)
            let amountBMin = 0;//toHex(liquidityValueB)
            let to = account
            const tenMinutesInSeconds = 10 * 60; // 10 dakika saniye cinsinden
            const deadline = Math.ceil(Date.now() / 1000) + tenMinutesInSeconds;

            toggleLoading();

            if ((pairInfo.base.token === WETH9[chainId].address) || (pairInfo.quote.token === WETH9[chainId].address)) {

                let tokenAddress = pairInfo.base.token === WETH9[chainId].address ? pairInfo.quote.token : pairInfo.base.token
                await EXCHANGE.removeLiquidityETH(tokenAddress, liquidity, 0, 0, to, deadline).then(async (tx) => {
                    await tx.wait();
                    const summary = `Remove Liquidity: ${tx.hash}`
                    setTransaction({ hash: tx.hash, summary: summary, error: null });
                    toggleTransactionSuccess();
                }).catch((error: Error) => {
                    setTransaction({ hash: '', summary: '', error: error });
                    toggleError();
                }).finally(async () => {
                    initDefaults();
                    toggleLoading();
                });
            } else {
                await EXCHANGE.removeLiquidity(pairInfo.base.token, pairInfo.quote.token, liquidity, 0, 0, to, deadline).then(async (tx) => {
                    await tx.wait();
                    const summary = `Remove Liquidity: ${tx.hash}`
                    setTransaction({ hash: tx.hash, summary: summary, error: null });
                    toggleTransactionSuccess();
                }).catch((error: Error) => {
                    setTransaction({ hash: '', summary: '', error: error });
                    toggleError();
                }).finally(async () => {
                    initDefaults();
                    toggleLoading();
                });
            }


        } else {
            setTransaction({ hash: '', summary: '', error: { message: "No LP Token Found!" } });
            toggleError();
        }
    }

    const initDefaults = async () => {
        await fetchPairInfo()
    }

    const fetchPairInfo = async () => {
        const isDebug = true
        if (!chainId) { return }
        if (!isSupportedChain(chainId)) {
            return;
        }
        console.log("chainId", chainId)
        if ((baseAsset?.chainId !== chainId) || (quoteAsset?.chainId !== chainId)) {
            console.log("Token not found!", baseAsset, quoteAsset)
            return;
        }

        await checkAllowance()


        let _baseAssetAddress = baseAsset.address === ETHER_ADDRESS ? WETH9[chainId].address : baseAsset.address;
        let _quoteAssetAddress = quoteAsset.address === ETHER_ADDRESS ? WETH9[chainId].address : quoteAsset.address;



        const _allExchangePairs = await EXCHANGE.getAllPairs();
        setAllExchangePairs(_allExchangePairs)


        const _pairInfo = await EXCHANGE.getPairInfo(_baseAssetAddress, _quoteAssetAddress);
        if (_pairInfo.valid === false) {
            setPairInfo(_pairInfo)
            setUserLiquidity("0.0000")
            setTotalLiquidity("0.0000")
            setBasePrice("0.0000");
            setQuotePrice("0.0000");
            setBaseLiquidity("0.0000")
            setQuoteLiquidity("0.0000")
            setUserBaseLiquidity("0.00000")
            setUserQuoteLiquidity("0.0000")
            setShareOfPool("0")
            console.log("Pair doesn't exists")
            return;
        }

        setPairInfo(_pairInfo);

        const pairAddress = _pairInfo.pair;
        const liquidityToken: Token = new Token(chainId, pairAddress, 18, "PAIR", "PAIR", false)

        const tokenA = new Token(baseAsset.chainId, _baseAssetAddress, baseAsset.decimals)
        const tokenB = new Token(quoteAsset.chainId, _quoteAssetAddress, quoteAsset.decimals)
        const [baseToken, quoteToken] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]

        let pairContract = PAIRContract(pairAddress);

        let _userLiquidity = await pairContract.balanceOf(account)
        let _kLast = await pairContract.kLast()

        let _userLiquidityAmount: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(liquidityToken, _userLiquidity);

        setUserLiquidity(_userLiquidityAmount.toSignificant(6))

        const _totalSupply = await pairContract.totalSupply()
        let _totalLiquidityAmount: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(liquidityToken, _totalSupply);
        setTotalLiquidity(_totalLiquidityAmount.toSignificant(6))

        const [_reserve0, _reserve1, _blockTimestampLast] = await pairContract.getReserves();
        let noLiquidity = _reserve0 === 0 && _reserve1 === 0
        setHasLiquidity(noLiquidity)
        if (noLiquidity) {
            return
        }

        const price = new Price(baseToken, quoteToken, _reserve0, _reserve1)

        const canInvertPrice = Boolean(
            price && price.baseCurrency && price.quoteCurrency && !price.baseCurrency.equals(price.quoteCurrency))

        const _basePrice = price?.toSignificant(6)
        const _quotePrice = canInvertPrice ? price?.invert()?.toSignificant(6) : undefined


        setBasePrice(baseToken.address === _baseAssetAddress ? _basePrice : _quotePrice);
        setQuotePrice(quoteToken.address === _quoteAssetAddress ? _quotePrice : _basePrice);

        let reserve0: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(baseToken, _reserve0);
        let reserve1: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(quoteToken, _reserve1);

        const [baseReserve, quoteReserve] = baseToken.sortsBefore(quoteToken) ? [reserve0, reserve1] : [reserve1, reserve0]
        setBaseLiquidity(baseToken.address === _baseAssetAddress ? baseReserve.toSignificant(6) : quoteReserve.toSignificant(6))
        setQuoteLiquidity(quoteToken.address === _quoteAssetAddress ? quoteReserve.toSignificant(6) : baseReserve.toSignificant(6))

        let totalSupply: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(liquidityToken, _totalSupply);

        const exchangePair = new Pair(
            baseReserve,
            quoteReserve,
            liquidityToken.address
        )

        const liquidityValueA =
            exchangePair &&
                _totalLiquidityAmount &&
                _userLiquidityAmount &&
                baseToken &&
                JSBI.greaterThanOrEqual(_totalLiquidityAmount.quotient, _userLiquidityAmount.quotient)
                ? CurrencyAmount.fromRawAmount(baseToken, exchangePair.getLiquidityValue(baseToken, _totalLiquidityAmount, _userLiquidityAmount, SWAP_FEE_ON, _kLast).quotient)
                : undefined


        const liquidityValueB =
            exchangePair &&
                _totalLiquidityAmount &&
                _userLiquidityAmount &&
                quoteToken &&
                JSBI.greaterThanOrEqual(_totalLiquidityAmount.quotient, _userLiquidityAmount.quotient)
                ? CurrencyAmount.fromRawAmount(quoteToken, exchangePair.getLiquidityValue(quoteToken, _totalLiquidityAmount, _userLiquidityAmount, SWAP_FEE_ON, _kLast).quotient)
                : undefined


        setUserBaseLiquidity(baseToken.address === _baseAssetAddress ? liquidityValueA.toSignificant(6) : liquidityValueB.toSignificant(6))
        setUserQuoteLiquidity(quoteToken.address === _quoteAssetAddress ? liquidityValueB.toSignificant(6) : liquidityValueA.toSignificant(6))


        if (baseInputValue === "") {
            if (isBase) {
                setQuoteInputValue("")
                setShareOfPool("0")
                return;
            }
        }

        let _baseInputVal = ""
        if (isBase) {
            _baseInputVal = parseUnits(baseInputValue, baseAsset.decimals).toString()
            if (baseToken.address === _baseAssetAddress) {
                let _tokenQuoteAmount: CurrencyAmount<Token> = price.quote(CurrencyAmount.fromRawAmount(baseToken, JSBI.BigInt(_baseInputVal)))
                if (isBase) {
                    setQuoteInputValue(_tokenQuoteAmount.toSignificant(6))
                }
            } else {
                let _tokenQuoteAmount: CurrencyAmount<Token> = price.invert().quote(CurrencyAmount.fromRawAmount(quoteToken, JSBI.BigInt(_baseInputVal)))
                if (isBase) {
                    setQuoteInputValue(_tokenQuoteAmount.toSignificant(6))
                }
            }
        } else {
            if (baseToken.address === _baseAssetAddress) {
                _baseInputVal = parseUnits(quoteInputValue, quoteToken.decimals).toString()
                let _tokenQuoteAmount: CurrencyAmount<Token> = price.invert().quote(CurrencyAmount.fromRawAmount(quoteToken, JSBI.BigInt(_baseInputVal)))
                setBaseInputValue(_tokenQuoteAmount.toSignificant(6))

            } else {
                _baseInputVal = parseUnits(quoteInputValue, baseToken.decimals).toString()
                let _tokenQuoteAmount: CurrencyAmount<Token> = price.quote(CurrencyAmount.fromRawAmount(baseToken, JSBI.BigInt(_baseInputVal)))
                setBaseInputValue(_tokenQuoteAmount.toSignificant(6))
            }
        }


        const _quoteInputVal = parseUnits(quoteInputValue, quoteAsset.decimals).toString()

        let tokenAmountA: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(tokenA, JSBI.BigInt(_baseInputVal));
        let tokenAmountB: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(tokenB, JSBI.BigInt(_quoteInputVal));


        let baseVal = ethers.utils.parseUnits(_baseInputVal, tokenA.decimals);
        setHasBaseAllowance(baseVal.lte(baseTokenAllowance))

        let quoteVal = ethers.utils.parseUnits(_quoteInputVal, tokenB.decimals);
        setHasQuoteAllowance(quoteVal.lte(quoteTokenAllowance))




        const tokenAmounts = tokenAmountA.currency.sortsBefore(tokenAmountB.currency) // does safety checks
            ? [tokenAmountA, tokenAmountB]
            : [tokenAmountB, tokenAmountA]

        let liquidity: JSBI
        if (JSBI.equal(totalSupply.quotient, ZERO)) {
            liquidity = JSBI.subtract(
                sqrt(JSBI.multiply(tokenAmounts[0].quotient, tokenAmounts[1].quotient)),
                MINIMUM_LIQUIDITY
            )
        } else {
            const amount0 = JSBI.divide(JSBI.multiply(tokenAmounts[0].quotient, totalSupply.quotient), reserve0.quotient)
            const amount1 = JSBI.divide(JSBI.multiply(tokenAmounts[1].quotient, totalSupply.quotient), reserve1.quotient)
            liquidity = JSBI.lessThanOrEqual(amount0, amount1) ? amount0 : amount1
        }
        if (!JSBI.greaterThan(liquidity, ZERO)) {
            console.log("ERROR,LIQ_ZERO")
            setShareOfPool("0")
        }

        let liquidityMinted: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(liquidityToken, liquidity)

        console.log("noliq", noLiquidity,liquidityMinted.toSignificant(6),liquidityToken.address)
        if (liquidityMinted && totalSupply) {
            const poolTokenPercentage = new Percent(liquidityMinted.quotient, totalSupply.add(liquidityMinted).quotient)
            let percentShare = noLiquidity && price
                ? '100'
                : (poolTokenPercentage?.lessThan(new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))) ? '<0.01' : poolTokenPercentage?.toFixed(2)) ?? '0'
            setShareOfPool(percentShare)
        } else {
            setShareOfPool("0")
        }



    }




    useEffect(() => {
        if (!blockNumber) { return; }
        if (!chainId) { return; }
        if (!baseAsset) { return; }
        if (!quoteAsset) { return; }

        initDefaults()
        return () => {

        };

    }, [blockNumber, chainId, account, baseAsset, quoteAsset, baseInputValue, quoteInputValue])

    useEffect(() => {
        if (!chainId) { return; }
        if (!defaultAssets) { return }
        if (defaultAssets.length == 0) { return }
        setQuoteAsset(defaultAssets.find(token => token?.symbol === "KWL"))
        //setBaseAsset(defaultAssets.find(token => token?.symbol === WETH9[chainId].symbol))
        setBaseAsset(defaultAssets.find(token => token?.symbol === getNativeCurrencyByChainId(chainId)))

    }, [defaultAssets])

    const handleSwapAssets = () => {
        const temp = baseAsset;
        setBaseAsset(quoteAsset);
        setQuoteAsset(temp)
    }

    const onSelectToken = (tokenInfo) => {
        isBase ? setBaseAsset(tokenInfo) : setQuoteAsset(tokenInfo)
        toggleSelectToken()
    }

    const handleSelectPair = (pair:any, base: any, quote: any) => {
        setBaseAsset(base);
        setQuoteAsset(quote);
        toggleSelectToken();
    }

    const setInputValue = (e, isBase) => {


        
        const regex = /^[0-9]*\.?[0-9]*$/;
        e = e.replace(",", ".")
        if (regex.test(e)) {
            if (isBase) {
                setBaseInputValue(e)
            } else {
                setQuoteInputValue(e)
            }
        }
        setIsBase(isBase)
    }


    return (
        <>
            <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />
            <ModalSelectToken disableToken={!isBase ? baseAsset : quoteAsset} hide={toggleSelectToken} isShowing={isSelectToken} onSelect={onSelectToken} onSelectPair={handleSelectPair} isClosable={true} tokenList={defaultAssets} allExchangePairs={allExchangePairs} />

            <ModalError
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading}
                isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess}
                isShowing={isTransactionSuccess} />


            <div className="w-full flex flex-col gap-2">
                <div className="swap-inputs">
                    <div className="input sm:order-1">

                        {
                            baseAsset &&

                            <Button className="token-selector px-2" radius='full' variant="flat" color="default" onClick={() => {
                                setIsBase(true)
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

                    <button onClick={() => {
                        handleSwapAssets()
                    }} className="swap-currencies sm:order-2  my-3 anim"
                        style={{ "left": "calc(50% - 16px)" }}>
                        <span translate={"no"} className="material-symbols-outlined ">
                            arrow_downward
                        </span>
                    </button>

                    <div className="input sm:order-3">

                        {
                            quoteAsset &&

                            <Button className="token-selector px-2" radius='full' variant="flat" color="default" onClick={() => {
                                setIsBase(false)
                                toggleSelectToken()
                            }} startContent={
                                <Image className='w-[32px] h-[32px] min-w-[32px] min-h-[32px] max-h-[32px] max-w-[32px]' src={quoteAsset.logoURI} />
                            }
                                endContent={
                                    <span translate={"no"} className="material-symbols-outlined ">
                                        expand_more
                                    </span>
                                }
                            >{quoteAsset.symbol}
                            </Button>

                        }

                        <div onClick={() => {
                            setInputValue(quoteAsset.balance, false)
                        }} className="balance cursor-pointer">
                            Balance: {quoteAsset && quoteAsset.balance}
                        </div>



                        <input value={quoteInputValue} onChange={(e) => {
                            setInputValue(e.target.value, false)
                        }} inputMode="decimal" autoComplete="off" autoCorrect="off" type="text"
                            pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0" minLength={0} maxLength={100} spellCheck="false" />
                    </div>
                </div>
                <div className="rounded-xl w-full">
                    <div className="rounded-xl pb-0">

                        {
                            baseAsset && quoteAsset &&
                            <Card shadow='none' className="w-full border border-default-100 flex flex-col gap-2 rounded-lg p-2">
                                <span className="text-sm">Prices and Pool Share</span>

                                <div className={"grid grid-cols-3 gap-2 text-center"}>
                                    <Card shadow="none" className={"flex border border-default-100 flex-col w-full rounded-lg py-2"}>
                                        <span>{basePrice}</span>
                                        <span className="text-xs">{quoteAsset.symbol} per {baseAsset.symbol}</span>
                                    </Card>
                                    <Card shadow="none" className={"flex border border-default-100 flex-col w-full rounded-lg py-2"}>
                                        <span>{quotePrice}</span>
                                        <span className="text-xs">{baseAsset.symbol} per {quoteAsset.symbol}</span>
                                    </Card>
                                    <Card shadow="none" className={"flex border border-default-100 flex-col w-full rounded-lg py-2"}>
                                        <span>{shareOfPool} % </span>
                                        <span className="text-xs">Share of Pool</span>
                                    </Card>
                                </div>
                                <div className="w-full flex flex-col gap-2">
                                    <span className="text-sm">Your Liquidity</span>

                                    <div className="w-full grid grid-cols-2 gap-2">
                                        <Card shadow="none" className="rounded-lg border border-default-100 flex flex-row items-center justify-start gap-2 px-2">
                                            <img className="w-5 h-5" src={baseAsset?.logoURI} alt={baseAsset?.symbol} />
                                            <small className={"w-full text-start py-2"} >{userBaseLiquidity} {baseAsset?.symbol}</small>
                                        </Card>
                                        <Card shadow="none" className="rounded-lg border border-default-100 flex flex-row items-center justify-start gap-2 px-2">
                                            <img className="w-5 h-5" src={quoteAsset?.logoURI} alt={quoteAsset?.symbol} />
                                            <small className={"w-full text-start py-2"} >{userQuoteLiquidity} {quoteAsset?.symbol}</small>
                                        </Card>

                                    </div>

                                    <Card shadow="none" className={"w-full border border-default-100 flex flex-row gap-2 px-2 rounded-lg p-2"}>

                                        <div className="w-full flex flex-row gap-2">
                                            <div className="flex flex-row">
                                                <DoubleCurrencyIcon baseIcon={baseAsset?.logoURI} quoteIcon={quoteAsset?.logoURI} />
                                            </div>
                                            <div className="w-full px-2">
                                                <span className="sm:text-xs">{baseAsset?.symbol}x{quoteAsset?.symbol}</span>
                                            </div>
                                        </div>
                                        <div className="w-full flex items-end justify-end">
                                            <span className="text-pink-960 sm:text-xs">{userLiquidity}</span>
                                        </div>
                                    </Card>
                                    <span className="text-sm">Total Liquidity</span>
                                    <div className="w-full grid grid-cols-2 gap-2">
                                        <Card shadow='none' className="rounded-lg border border-default-100 flex flex-row items-center justify-start gap-2 px-2">
                                            <img className="w-5 h-5" src={baseAsset?.logoURI} alt={baseAsset?.symbol} />
                                            <small className={"w-full text-start py-2"} >{baseLiquidity} {baseAsset?.symbol}</small>
                                        </Card>
                                        <Card shadow='none' className="rounded-lg border border-default-100 flex flex-row items-center justify-start gap-2 px-2">
                                            <img className="w-5 h-5" src={quoteAsset?.logoURI} alt={quoteAsset?.symbol} />
                                            <small className={"w-full text-start py-2"} >{quoteLiquidity} {quoteAsset?.symbol}</small>
                                        </Card>

                                    </div>

                                    <Card shadow='none' className={"w-full border border-default-100 flex flex-row gap-2 px-2 rounded-lg p-2"}>
                                        <div className="w-full  flex flex-row gap-2">
                                            <div className="flex flex-row">
                                                <DoubleCurrencyIcon baseIcon={baseAsset?.logoURI} quoteIcon={quoteAsset?.logoURI} />
                                            </div>
                                            <div className="w-full px-2">
                                                <span className="text-xs sm:text-sm">{baseAsset?.symbol}x{quoteAsset?.symbol}</span>
                                            </div>
                                        </div>
                                        <div className="w-full flex items-end justify-end">
                                            <span className="text-pink-960 sm:text-xs">{totalLiquidity}</span>
                                        </div>
                                    </Card>

                                </div>
                            </Card>
                        }




                    </div>
                </div>
                <div className="w-full flex flex-col gap-2 items-center justify-center">


                    <div className={"w-full grid grid-cols-1 gap-2"}>
                        {
                            baseAsset && quoteAsset && baseAsset.address !== ETHER_ADDRESS && hasBaseAllowance === false &&
                            <Button className={"w-full"} onClick={() => {
                                handleApprove(baseAsset.address);
                            }} color="danger">
                                Unlock {baseAsset.symbol}
                            </Button>
                        }
                        {
                            baseAsset && quoteAsset && quoteAsset.address !== ETHER_ADDRESS && hasQuoteAllowance === false &&
                            <Button className={"w-full"} onClick={() => {
                                handleApprove(quoteAsset.address);
                            }} color="danger">
                                Unlock {quoteAsset.symbol}
                            </Button>
                        }


                    </div>


                    <div className={"w-full grid grid-cols-2 gap-2"}>
                        <Button className={"w-full"} onClick={() => {
                            handleAddLiquidity()
                        }} color="danger">
                            Add Liquidity
                        </Button>
                        <Button className={"w-full"} onClick={() => {
                            handleRemoveLiquidity()
                        }} color="danger">
                            Remove Liquidity
                        </Button>
                    </div>





                </div>
            </div>


        </>
    );
}
export const POOL_TAB = memo(_POOL_TAB)

