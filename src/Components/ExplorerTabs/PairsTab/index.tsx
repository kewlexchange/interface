import React, { memo, useEffect, useMemo, useState } from 'react';
import { useWeb3React } from "@web3-react/core";
import { BigNumber, ethers } from 'ethers';
import { Avatar, Button, Card, CardBody, CardFooter, CardHeader, Chip, Image, Input, Slider, Spinner, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs } from "@nextui-org/react";
import { formatEther, parseEther } from '@ethersproject/units';
import { useChilizSwapFactory, useERC20Contract, useExchangeContract, useJALASwapFactory, usePAIRContract } from '../../../hooks/useContract';
import { useAppSelector } from '../../../state/hooks';
import { DoubleCurrencyIcon } from '../../DoubleCurrency';
import { Price, Token, WETH9 } from '../../../entities';
import { CONTRACT_ADRESSES } from '../../../contracts/addresses';
import { ChainId } from '../../../constants/chains';
import { useNavigate } from 'react-router-dom';

const _PairTAB = (props: { exchange, tokens }) => {
    const { connector, account, provider, chainId } = useWeb3React()
    const EXCHANGE = useExchangeContract(chainId, true)
    const JALASWAP = useJALASwapFactory(chainId, true)
    const CHILIZSWAP = useChilizSwapFactory(chainId, true)

    const navigate = useNavigate();

    const [allExchangePairs, setAllExchangePairs]: any = useState([])
    const [isLoaded, setLoaded] = useState(false)
    const PAIRContract = usePAIRContract()
    const ERC20Contract = useERC20Contract()

    const fetchIMONPairs = async () => {
        setLoaded(false);
        const _exchangePairs = await EXCHANGE.getAllPairs();

        let _pairList = []
        await Promise.all(_exchangePairs.map(async (item, index) => {
            const _pair = await EXCHANGE.getPairInfo(item.base.token, item.quote.token);
            const tokenA = new Token(chainId, _pair.base.token, BigNumber.from(_pair.base.decimals).toNumber())
            const tokenB = new Token(chainId, _pair.quote.token, BigNumber.from(_pair.quote.decimals).toNumber())
            const [baseToken, quoteToken] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
            const price = new Price(baseToken, quoteToken, _pair.reserveBase, _pair.reserveQuote)

            const canInvertPrice = Boolean(
                price && price.baseCurrency && price.quoteCurrency && !price.baseCurrency.equals(price.quoteCurrency))

            const _basePrice = price?.toSignificant(6)
            const _quotePrice = canInvertPrice ? price?.invert()?.toSignificant(6) : "-"
            const updatedPair = { ..._pair, basePrice: _basePrice, quotePrice: _quotePrice };
            _pairList.push(updatedPair);
        }));

        setAllExchangePairs(_pairList);
        setLoaded(true);
    }

    const fetchJALAPairs = async () => {
        if (chainId != ChainId.CHILIZ_MAINNET) {
            return
        }
        const jalaPairList = []
        const jalaPairLogs = await JALASWAP.queryFilter("PairCreated")
        for (const log of jalaPairLogs) {
            const parsedLog = JALASWAP.interface.parseLog(log);

            let pairContract = PAIRContract(parsedLog.args.pair);

            const [_reserve0, _reserve1, _blockTimestampLast] = await pairContract.getReserves();


            const [token0, token1, pair] = [parsedLog.args.token0, parsedLog.args.token1, parsedLog.args.pair]


            let token0ERC = ERC20Contract(token0);
            let token1ERC = ERC20Contract(token1);

            let abiERC = [
                'function name() external view returns (string memory)',
                'function symbol() external view returns (string memory)',
                'function decimals() external view returns (uint256)',
            ];

            let abiInterfaceParam = new ethers.utils.Interface(abiERC)

            let multicallParams = [
                {
                    target: token0,
                    callData: abiInterfaceParam.encodeFunctionData("name", [])
                },
                {
                    target: token0,
                    callData: abiInterfaceParam.encodeFunctionData("symbol", [])
                },
                {
                    target: token0,
                    callData: abiInterfaceParam.encodeFunctionData("decimals", [])
                },
                {
                    target: token1,
                    callData: abiInterfaceParam.encodeFunctionData("name", [])
                },
                {
                    target: token1,
                    callData: abiInterfaceParam.encodeFunctionData("symbol", [])
                },
                {
                    target: token1,
                    callData: abiInterfaceParam.encodeFunctionData("decimals", [])
                },
            ];

            let abiERCResults = [
                { "type": 'string memory', "variable": "name" },
                { "type": 'string memory', "variable": "symbol" },
                { "type": 'uint256', "variable": "decimals" },
                { "type": 'string memory', "variable": "name" },
                { "type": 'string memory', "variable": "symbol" },
                { "type": 'uint256', "variable": "decimals" },
            ];

            var base = {
                name: "",
                symbol: "",
                decimals: 0
            }
            var quote = {
                name: "",
                symbol: "",
                decimals: 0
            }

            try {
                const [blockNum, multicallResult] = await EXCHANGE.callStatic.aggregate(multicallParams)


                base.name = ethers.utils.defaultAbiCoder.decode(["string memory name"], multicallResult[0]).name
                base.symbol = ethers.utils.defaultAbiCoder.decode(["string memory symbol"], multicallResult[1]).symbol
                base.decimals = ethers.utils.defaultAbiCoder.decode(["uint256 decimals"], multicallResult[2]).decimals

                quote.name = ethers.utils.defaultAbiCoder.decode(["string memory name"], multicallResult[3]).name
                quote.symbol = ethers.utils.defaultAbiCoder.decode(["string memory symbol"], multicallResult[4]).symbol
                quote.decimals = ethers.utils.defaultAbiCoder.decode(["uint256 decimals"], multicallResult[5]).decimals



            } catch (e) {
                console.log("multicallException:", e)
                setLoaded(false)
                return
            }


            const tokenA = new Token(chainId, token0, BigNumber.from(base.decimals).toNumber())
            const tokenB = new Token(chainId, token1, BigNumber.from(quote.decimals).toNumber())
            const price = new Price(tokenA, tokenB, _reserve0, _reserve1)

            const canInvertPrice = Boolean(
                price && price.baseCurrency && price.quoteCurrency && !price.baseCurrency.equals(price.quoteCurrency))

            const _basePrice = price?.toSignificant(6)
            const _quotePrice = canInvertPrice ? price?.invert()?.toSignificant(6) : "-"
            let pairInfo = {
                base: base,
                quote: quote,
                token0: token0,
                token1: token1,
                pair: pair,
                reserveBase: _reserve0,
                reserveQuote: _reserve1,
                basePrice: _basePrice,
                quotePrice: _quotePrice,
            }

            jalaPairList.push(pairInfo)
        }
        setAllExchangePairs(jalaPairList);
        setLoaded(true);
    }

    const fetchChilizSwapPairs = async () => {
        console.log("chilizswap")
        if (chainId != ChainId.CHILIZ_MAINNET) {
            return
        }
        const jalaPairList = []
        const pairLength = (await CHILIZSWAP.allPairsLength()).toNumber()


        for (let i = 0; i < pairLength; i++) {
            const pair = await CHILIZSWAP.allPairs(i);
            console.log(`index`, pair)

            let pairContract = PAIRContract(pair);

            let token0 = await pairContract.token0();
            let token1 = await pairContract.token1()

            const [_reserve0, _reserve1, _blockTimestampLast] = await pairContract.getReserves();




            let token0ERC = ERC20Contract(token0);
            let token1ERC = ERC20Contract(token1);

            let abiERC = [
                'function name() external view returns (string memory)',
                'function symbol() external view returns (string memory)',
                'function decimals() external view returns (uint256)',
            ];

            let abiInterfaceParam = new ethers.utils.Interface(abiERC)

            let multicallParams = [
                {
                    target: token0,
                    callData: abiInterfaceParam.encodeFunctionData("name", [])
                },
                {
                    target: token0,
                    callData: abiInterfaceParam.encodeFunctionData("symbol", [])
                },
                {
                    target: token0,
                    callData: abiInterfaceParam.encodeFunctionData("decimals", [])
                },
                {
                    target: token1,
                    callData: abiInterfaceParam.encodeFunctionData("name", [])
                },
                {
                    target: token1,
                    callData: abiInterfaceParam.encodeFunctionData("symbol", [])
                },
                {
                    target: token1,
                    callData: abiInterfaceParam.encodeFunctionData("decimals", [])
                },
            ];

            let abiERCResults = [
                { "type": 'string memory', "variable": "name" },
                { "type": 'string memory', "variable": "symbol" },
                { "type": 'uint256', "variable": "decimals" },
                { "type": 'string memory', "variable": "name" },
                { "type": 'string memory', "variable": "symbol" },
                { "type": 'uint256', "variable": "decimals" },
            ];

            var base = {
                name: "",
                symbol: "",
                decimals: 0
            }
            var quote = {
                name: "",
                symbol: "",
                decimals: 0
            }

            try {
                const [blockNum, multicallResult] = await EXCHANGE.callStatic.aggregate(multicallParams)


                base.name = ethers.utils.defaultAbiCoder.decode(["string memory name"], multicallResult[0]).name
                base.symbol = ethers.utils.defaultAbiCoder.decode(["string memory symbol"], multicallResult[1]).symbol
                base.decimals = ethers.utils.defaultAbiCoder.decode(["uint256 decimals"], multicallResult[2]).decimals

                quote.name = ethers.utils.defaultAbiCoder.decode(["string memory name"], multicallResult[3]).name
                quote.symbol = ethers.utils.defaultAbiCoder.decode(["string memory symbol"], multicallResult[4]).symbol
                quote.decimals = ethers.utils.defaultAbiCoder.decode(["uint256 decimals"], multicallResult[5]).decimals



            } catch (e) {
                console.log("multicallException:", e)
                //setLoaded(false)
                return
            }


            const tokenA = new Token(chainId, token0, BigNumber.from(base.decimals).toNumber())
            const tokenB = new Token(chainId, token1, BigNumber.from(quote.decimals).toNumber())
            const price = new Price(tokenA, tokenB, _reserve0, _reserve1)

            const canInvertPrice = Boolean(
                price && price.baseCurrency && price.quoteCurrency && !price.baseCurrency.equals(price.quoteCurrency))

            const _basePrice = price?.toSignificant(6)
            const _quotePrice = canInvertPrice ? price?.invert()?.toSignificant(6) : "-"
            let pairInfo = {
                base: base,
                quote: quote,
                token0: token0,
                token1: token1,
                pair: pair,
                reserveBase: _reserve0,
                reserveQuote: _reserve1,
                basePrice: _basePrice,
                quotePrice: _quotePrice,
            }

            jalaPairList.push(pairInfo)
        }
        setAllExchangePairs(jalaPairList);
        setLoaded(true);
    }


    const fetchKayenPairs = async () => {
        console.log("chilizswap")
        if (chainId != ChainId.CHILIZ_MAINNET) {
            return
        }
        const jalaPairList = []
        const pairLength = (await JALASWAP.allPairsLength()).toNumber()
        console.log("JALA PAIR LENGTH",pairLength)

        for (let i = 0; i < pairLength; i++) {
            const pair = await JALASWAP.allPairs(i);
            console.log(`index`, pair)

            let pairContract = PAIRContract(pair);

            let token0 = await pairContract.token0();
            let token1 = await pairContract.token1()

            const [_reserve0, _reserve1, _blockTimestampLast] = await pairContract.getReserves();




            let token0ERC = ERC20Contract(token0);
            let token1ERC = ERC20Contract(token1);

            let abiERC = [
                'function name() external view returns (string memory)',
                'function symbol() external view returns (string memory)',
                'function decimals() external view returns (uint256)',
            ];

            let abiInterfaceParam = new ethers.utils.Interface(abiERC)

            let multicallParams = [
                {
                    target: token0,
                    callData: abiInterfaceParam.encodeFunctionData("name", [])
                },
                {
                    target: token0,
                    callData: abiInterfaceParam.encodeFunctionData("symbol", [])
                },
                {
                    target: token0,
                    callData: abiInterfaceParam.encodeFunctionData("decimals", [])
                },
                {
                    target: token1,
                    callData: abiInterfaceParam.encodeFunctionData("name", [])
                },
                {
                    target: token1,
                    callData: abiInterfaceParam.encodeFunctionData("symbol", [])
                },
                {
                    target: token1,
                    callData: abiInterfaceParam.encodeFunctionData("decimals", [])
                },
            ];

            let abiERCResults = [
                { "type": 'string memory', "variable": "name" },
                { "type": 'string memory', "variable": "symbol" },
                { "type": 'uint256', "variable": "decimals" },
                { "type": 'string memory', "variable": "name" },
                { "type": 'string memory', "variable": "symbol" },
                { "type": 'uint256', "variable": "decimals" },
            ];

            var base = {
                name: "",
                symbol: "",
                decimals: 0
            }
            var quote = {
                name: "",
                symbol: "",
                decimals: 0
            }

            try {
                const [blockNum, multicallResult] = await EXCHANGE.callStatic.aggregate(multicallParams)


                base.name = ethers.utils.defaultAbiCoder.decode(["string memory name"], multicallResult[0]).name
                base.symbol = ethers.utils.defaultAbiCoder.decode(["string memory symbol"], multicallResult[1]).symbol
                base.decimals = ethers.utils.defaultAbiCoder.decode(["uint256 decimals"], multicallResult[2]).decimals

                quote.name = ethers.utils.defaultAbiCoder.decode(["string memory name"], multicallResult[3]).name
                quote.symbol = ethers.utils.defaultAbiCoder.decode(["string memory symbol"], multicallResult[4]).symbol
                quote.decimals = ethers.utils.defaultAbiCoder.decode(["uint256 decimals"], multicallResult[5]).decimals



            } catch (e) {
                console.log("multicallException:", e)
                //setLoaded(false)
                //return
            }


            const tokenA = new Token(chainId, token0, BigNumber.from(base.decimals).toNumber())
            const tokenB = new Token(chainId, token1, BigNumber.from(quote.decimals).toNumber())
            const price = new Price(tokenA, tokenB, _reserve0, _reserve1)

            const canInvertPrice = Boolean(
                price && price.baseCurrency && price.quoteCurrency && !price.baseCurrency.equals(price.quoteCurrency))

            const _basePrice = price?.toSignificant(6)
            const _quotePrice = canInvertPrice ? price?.invert()?.toSignificant(6) : "-"
            let pairInfo = {
                base: base,
                quote: quote,
                token0: token0,
                token1: token1,
                pair: pair,
                reserveBase: _reserve0,
                reserveQuote: _reserve1,
                basePrice: _basePrice,
                quotePrice: _quotePrice,
            }

            jalaPairList.push(pairInfo)
        }
        setAllExchangePairs(jalaPairList);
        setLoaded(true);
    }

    useEffect(() => {


        if (props.exchange === "IMON") {
            fetchIMONPairs();
        } else if (props.exchange === "JALA") {
            console.log("jalaswap")
            fetchKayenPairs();
        } else if (props.exchange === "CHILIZSWAP") {
            console.log("chilizswap")
            fetchChilizSwapPairs();
        }
    }, [props.exchange, chainId, account])


    const getIconPath = (ticker: any) => {
        if (!props.tokens) {
            return
        }
        if (props.tokens.length == 0) {
            return;
        }

        ticker = ticker.toLowerCase();
        let wrappedTicker = WETH9[chainId].symbol

        const findItem = props.tokens.filter((item) => {
            const lowercaseSymbol = item.symbol.toLowerCase();

            return lowercaseSymbol.includes(ticker) || lowercaseSymbol.includes(wrappedTicker);
        });

        return findItem.length > 0 ? findItem[0].logoURI : ""

    }


    return (
        <>
            <Table color='danger'
                onRowAction={(key: any) => {
                    navigate(`${key}`)
                }}
                selectionMode="single"
                aria-label="Example static collection table">
                <TableHeader>
                    <TableColumn>Pair Info</TableColumn>
                    <TableColumn>Base Liquidity</TableColumn>
                    <TableColumn>Quote Liquidity</TableColumn>
                    <TableColumn>Base Price</TableColumn>
                    <TableColumn>Quote Price</TableColumn>
                </TableHeader>
                <TableBody emptyContent={isLoaded ? "No Pairs Found!" : "Loading... Please Wait!"}
                    isLoading={!isLoaded}
                    items={allExchangePairs}
                    loadingContent={<Spinner color="danger" />}>
                    {(pair: any) => (


                        <TableRow key={`/explorer/${pair.pair}`}>

                            <TableCell>
                                <div className='flex flex-row gap-2 items-center justify-start'>
                                    <DoubleCurrencyIcon baseIcon={getIconPath(pair.base.symbol)} quoteIcon={getIconPath(pair.quote.symbol)} />
                                    <span>
                                        {pair.base.symbol} x {pair.quote.symbol}
                                    </span>
                                </div>


                            </TableCell>

                            <TableCell className='items-end justify-end text-end'>
                                {parseFloat(ethers.utils.formatUnits(pair.reserveBase, pair.base.decimals)).toFixed(4)}   {pair.base.symbol}
                            </TableCell>

                            <TableCell className='items-end justify-end text-end'>
                                {parseFloat(ethers.utils.formatUnits(pair.reserveQuote, pair.quote.decimals)).toFixed(4)} {pair.quote.symbol}

                            </TableCell >
                            <TableCell className='items-end justify-end text-end'>
                                {pair.basePrice}  {pair.quote.symbol}
                            </TableCell>

                            <TableCell className='items-end justify-end text-end'>
                                {pair.quotePrice} {pair.base.symbol}

                            </TableCell>
                        </TableRow>

                    )}
                </TableBody>
            </Table>
        </>
    );
}
export const PairTAB = memo(_PairTAB)
