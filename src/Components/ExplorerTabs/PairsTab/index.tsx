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
import { sendHTTPRequest } from '../../../utils';

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



    const fetchPairs = async (dexName : any) => {
        setLoaded(false)
        let dexURL = ` https://api.kewl.exchange/explorer?dex=${dexName}`
        var response: any;
        var responseData: any = null
        try {
            response = await fetch(dexURL);
            let responseJSON = await response.json()
            setAllExchangePairs(responseJSON.PairInfo)
        } catch (error) {
            responseData = { Message: "Internal Service Error!", Status: false }
            response = { status: 500, statusText: "Internal Service Error!" }
        }
        setLoaded(true)

    }
    useEffect(() => {


        if (props.exchange === "IMON") {
            fetchPairs(`KEWL`);
        } else if (props.exchange === "JALA") {
            console.log("jalaswap")
            fetchPairs(`KAYEN`);
        } else if (props.exchange === "CHILIZSWAP") {
            console.log("chilizswap")
            fetchPairs(`CHILIZSWAP`);
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


                        <TableRow key={`/explorer/${pair.pairAddress}`}>

                            <TableCell>
                                <div className='flex flex-row gap-2 items-center justify-start'>
                                    <DoubleCurrencyIcon baseIcon={getIconPath(pair.baseSymbol)} quoteIcon={getIconPath(pair.quoteSymbol)} />
                                    <span>
                                        {pair.baseSymbol} x {pair.quoteSymbol}
                                    </span>
                                </div>


                            </TableCell>

                            <TableCell className='items-end justify-end text-end'>
                                {parseFloat(pair.reserveBase).toFixed(4)}   {pair.baseSymbol}
                            </TableCell>

                            <TableCell className='items-end justify-end text-end'>
                                {parseFloat(pair.reserveQuote).toFixed(4)} {pair.quoteSymbol}

                            </TableCell >
                            <TableCell className='items-end justify-end text-end'>
                                {parseFloat(pair.priceBase).toFixed(4)}  {pair.quoteSymbol}
                            </TableCell>

                            <TableCell className='items-end justify-end text-end'>
                                {parseFloat(pair.priceQuote).toFixed(4)} {pair.baseSymbol}

                            </TableCell>
                        </TableRow>

                    )}
                </TableBody>
            </Table>
        </>
    );
}
export const PairTAB = memo(_PairTAB)
