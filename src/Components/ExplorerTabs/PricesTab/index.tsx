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

const _PricesTAB = (props: { tokens: any }) => {
    const { connector, account, provider, chainId } = useWeb3React()
    const EXCHANGE = useExchangeContract(chainId, true)
    const JALASWAP = useJALASwapFactory(chainId, true)
    const CHILIZSWAP = useChilizSwapFactory(chainId, true)

    const navigate = useNavigate();

    const [allExchangePairs, setAllExchangePairs]: any = useState([])
    const [isLoaded, setLoaded] = useState(false)
    const PAIRContract = usePAIRContract()
    const ERC20Contract = useERC20Contract()



    const fetchPairs = async () => {
        setLoaded(false)
        let dexURL = ` https://api.kewl.exchange/radar`
        var response: any;
        var responseData: any = null
        try {
            response = await fetch(dexURL);
            let responseJSON = await response.json()
            setAllExchangePairs(responseJSON.PairInfo)
        } catch (error) {
            setAllExchangePairs([])
            responseData = { Message: "Internal Service Error!", Status: false }
            response = { status: 500, statusText: "Internal Service Error!" }
        }
        setLoaded(true)

    }
    useEffect(() => {
        fetchPairs();

    }, [chainId, account])


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
            const wrappledLowercaseSymnbol = "w" + item.symbol.toLowerCase();

            return lowercaseSymbol.includes(ticker) || lowercaseSymbol.includes(wrappedTicker) || wrappledLowercaseSymnbol.includes(ticker);
        });

        return findItem.length > 0 ? findItem[0].logoURI : ""

    }


    const formatCurrency = (currency : any) => {
        return isNaN(parseFloat(currency)) ? "-" : parseFloat(currency).toFixed(4);
    }

    return (
        <>
            <Table removeWrapper  isHeaderSticky color='default'
                classNames={{
                    base: "max-h-[600px] overflow-scroll",
                    table: "min-h-[420px]",
                }}
                selectionMode="single"
                aria-label="Example static collection table">
                <TableHeader>
                    <TableColumn>ASSET</TableColumn>
                    <TableColumn>KEWL</TableColumn>
                    <TableColumn>CHILIZNET</TableColumn>
                    <TableColumn>KAYEN</TableColumn>
                    <TableColumn>CHILIZSWAP</TableColumn>
                    <TableColumn>DIVISWAP</TableColumn>
                </TableHeader>
                <TableBody emptyContent={isLoaded ? "No Pairs Found!" : "Loading... Please Wait!"}
                    isLoading={!isLoaded}
                    items={allExchangePairs}
                    loadingContent={<Spinner color="default" />}>
                    {(pair: any) => (
                       getIconPath(pair.ticker) != "" && <TableRow key={pair.ticker}>

                            <TableCell>
                            <div className='flex flex-row gap-2 items-center justify-start'>
                            <Avatar isBordered src={getIconPath(pair.ticker)}/>
                            {pair.ticker}
                                </div>
                        
                            </TableCell>
                            <TableCell  className='items-end justify-end text-end'>
                                {formatCurrency(pair.kewl)}
                            </TableCell>

                            <TableCell className='items-end justify-end text-end'>
                                {formatCurrency(pair.chilizx)}
                            </TableCell >
                           
                            <TableCell  className='items-end justify-end text-end'>
                                {formatCurrency(pair.kayen)}

                            </TableCell>
                            <TableCell  className='items-end justify-end text-end'>
                                {formatCurrency(pair.chilizswap)}
                            </TableCell>

                            <TableCell className='items-end justify-end text-end'>
                                {formatCurrency(pair.diviswap)}
                            </TableCell>


                        </TableRow>

                    )}
                </TableBody>
            </Table>
        </>
    );
}
export const PricesTAB = memo(_PricesTAB)
