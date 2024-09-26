import React, { memo, useEffect, useMemo, useState } from 'react';
import { useWeb3React } from "@web3-react/core";
import { BigNumber, ethers } from 'ethers';
import { Avatar, Button, Card, CardBody, CardFooter, CardHeader, Chip, Image, Input, Slider, Spinner, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs } from "@nextui-org/react";
import { formatEther, parseEther } from '@ethersproject/units';
import { useERC20Contract, useExchangeContract, useJALASwapFactory, usePAIRContract } from '../../../hooks/useContract';
import { useAppSelector } from '../../../state/hooks';
import { DoubleCurrencyIcon } from '../../DoubleCurrency';
import { Price, Token } from '../../../entities';
import { CONTRACT_ADRESSES } from '../../../contracts/addresses';
import { ChainId } from '../../../constants/chains';
import { useNavigate } from 'react-router-dom';
import { isAddress } from '@ethersproject/address';
import { unixTimeToDateTime } from '../../../utils';

const _TransactionsTAB = (props: { pair }) => {
    const { connector, account, provider, chainId } = useWeb3React()
    const [transactions,setTransactions] : any = useState([])
    const [isLoaded,setLoaded] = useState(false)

    const initTransactions = async () => {
        setLoaded(false)
        const _transactions = await (await fetch(`https://api.imon.ai/transactions?pair=${props.pair}&chain=${chainId}`)).json();
    
        if(_transactions){
            setTransactions(_transactions)
        }else{
            setTransactions([])
        }
        setLoaded(true)
    }

    useEffect(()=>{
        if(isAddress(props.pair)){
            initTransactions()
        }
    },[props.pair,chainId,account])

    return (
        <>
            <Table color='default'
              onRowAction={(key : any) => {
                 //   navigate(`${key}`)
            }}
                selectionMode="single"
                aria-label="Example static collection table">
                <TableHeader>
                    <TableColumn>Pair</TableColumn>
                    <TableColumn>Date</TableColumn>
                    <TableColumn>Input Amount</TableColumn>
                    <TableColumn>Output Amount</TableColumn>
                    <TableColumn>Price</TableColumn>
                </TableHeader>
                <TableBody emptyContent={isLoaded ? "No Pairs Found!" : "Loading... Please Wait!"}
                    isLoading={!isLoaded}
                    items={transactions}
                    loadingContent={<Spinner color="default" />}>
                    {(transaction) => (

                        <TableRow key={`/explorer/${props.pair}`}>

                            <TableCell>
                                {transaction.side == "SELL" ? <>
                                    <div className='rounded-lg bg-green-500/10 p-2 text-center text-green-500'>
                                        <span> Swap {transaction.baseTokenSymbol} for {transaction.quoteTokenSymbol}</span>
                                    </div>
                                </> : <>
                                <div className='rounded-lg bg-danger-500/10 p-2 text-center text-danger-500'>
                                        <span>Swap {transaction.baseTokenSymbol} for {transaction.quoteTokenSymbol}</span>
                                    </div>
                                </>}
                            </TableCell>

                     

                            <TableCell>
                                {unixTimeToDateTime( transaction.timestamp)}
                            </TableCell>
                            <TableCell>
                            {transaction.baseAmount} {transaction.baseTokenSymbol}
                            </TableCell>

                            <TableCell>
                            {transaction.quoteAmount} {transaction.quoteTokenSymbol}
                            </TableCell>

                            <TableCell>
                            {transaction.price} {transaction.side == "SELL" ? transaction.baseTokenSymbol : transaction.quoteTokenSymbol}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </>
    );
}
export const TransactionsTAB = memo(_TransactionsTAB)
