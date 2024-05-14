import React, { useEffect, useState, useRef } from 'react';
import {useERC20Contract, usePAIRContract} from "../../hooks/useContract";
import {useWeb3React} from "@web3-react/core";
import useBlockNumber from "../../hooks/useBlockNumber";
import {ColorType, createChart} from "lightweight-charts";
import {BigNumber} from "@ethersproject/bignumber";
import { ethers } from 'ethers';
import { formatUnits, parseEther } from '@ethersproject/units';
import { CurrencyAmount, Price, Token } from '../../entities';
import { Spinner } from '@nextui-org/react';
import { ChainId } from '../../constants/chains';

export const ChartView = (props: {pair})=> {
    const [transactionData,setTransactionData] = useState([])
    const [chartOHLCData,setChartOHLCData] = useState([])
    const PAIRContract = usePAIRContract()
    const { connector, account, provider, chainId } = useWeb3React()
    const blockNumber = useBlockNumber()
    const ERC20Contract = useERC20Contract()
    const [isLoaded,setIsLoaded] = useState(false)


    
  

    useEffect(()=>{
        if(!chainId){return;}

    },[chainId,props.pair])

    const getChainSlug = ()=>{
        if(chainId == ChainId.CHILIZ_MAINNET){
            return "chiliz-chain"
        }else if (chainId == ChainId.ARBITRUM_ONE){
            return "arbitrum"
        }else{
            return "chiliz-chain"
        }
    }
    return (
        <div className={"rounded-lg h-[500px] min-h-[500px] w-full"}>
      
      
      {
        props.pair &&       <iframe height="100%" width="100%" id="geckoterminal-embed" title="GeckoTerminal Embed" src={`https://www.geckoterminal.com/${getChainSlug()}/pools/${props.pair}?embed=1&info=0&swaps=0`} frameBorder="0" allow="clipboard-write" allowFullScreen></iframe>

      }
    	
        </div>
    );
}