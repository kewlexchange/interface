import {useCallback, useEffect, useMemo} from 'react'
import {shallowEqual, useDispatch} from 'react-redux'

import {useAppDispatch, useAppSelector} from "../hooks";

import {useExchangeContract} from "../../hooks/useContract";
import {getChainInfoOrDefault} from "../../constants/chainInfo";
import {DEFAULT_CHAIN_ASSETS_URL, isSupportedChain} from "../../constants/chains";
import {ethers} from "ethers";
import {CurrencyAmount, Token, WETH9} from "../../entities";
import {useWeb3React} from "@web3-react/core";
import {updateTokenList} from "./reducer";
import {ETHER_ADDRESS} from "../../constants/misc";
import {getIconByChainId, getNativeCurrencyByChainId} from "../../utils";
import { fetchAndUpdateAllTokenList } from '../../utils/fetchAllTokenList';

export const fetchAllTokenList = async (chainId,account) => {

     const dispatch = useAppDispatch()
    const EXCHANGE = useExchangeContract(chainId,true)
    var customTokens = useAppSelector((state) => state.user.customTokenList && state.user.customTokenList[chainId])

    useEffect(()=>{
        console.log("CHAINID",chainId)


    const fetchData = async () =>{
        if(!isSupportedChain(chainId)){
            return;
        }
        const chainInfo = getChainInfoOrDefault(chainId)
        let fetchURL = chainInfo.defaultListUrl[0]
        if(fetchURL.length === 0){
            fetchURL = DEFAULT_CHAIN_ASSETS_URL;
        }

        let userBalance = "0.0000"

        const _defaultAssets = await (
            await fetch(
                fetchURL
            )
        ).json();
        let abiERC = [
            'function balanceOf(address user)'
        ];



        let tokenList = _defaultAssets?.tokens
  
        if(!tokenList){
            return
        }
        if(customTokens){
            tokenList = [...tokenList, ...customTokens];
        }
        console.log("custom",tokenList)

        let abiInterfaceParam = new ethers.utils.Interface(abiERC)
        let multicallParams = [];
        tokenList.map((item,i)=>{
            let updatedItem = { ...tokenList[i] }; // Önceki öğenin değiştirilebilir bir kopyasını oluştur
            if(account){
                multicallParams.push({
                    target: updatedItem.address,
                    callData: abiInterfaceParam.encodeFunctionData("balanceOf", [account])
                })
            }
            updatedItem.balance = "0.0"
            tokenList[i] = updatedItem;
        })

        if(account && EXCHANGE){
            const [blockNum, multicallResult] = await EXCHANGE.callStatic.aggregate(multicallParams)
            let index = 0;
            for await (const encodedMulticallData of multicallResult) {
                const decodedMulticallData = ethers.utils.defaultAbiCoder.decode( [
                    "uint256 balance"],encodedMulticallData)
                let tokenInfo = tokenList[index];
                tokenInfo.address = ethers.utils.getAddress(tokenInfo.address)
                const tokenAddr = new Token(tokenInfo.chainId, tokenInfo.address, tokenInfo.decimals)
                tokenList[index]["balance"]= CurrencyAmount.fromRawAmount(tokenAddr,decodedMulticallData.balance).toSignificant()
                index++;
            }

            let balanceInfo = await EXCHANGE.getEthBalance(account)
            userBalance = CurrencyAmount.fromRawAmount(WETH9[chainId], balanceInfo).toSignificant(6)

        }


        let nativeCurrency ={"chainId":chainId,"address":ETHER_ADDRESS,balance:userBalance,logoURI:getIconByChainId(chainId,true),...chainInfo.nativeCurrency}
        dispatch(updateTokenList({chainId:chainId,tokens:[nativeCurrency,...tokenList]}))
       // dispatch(updateTokenList({chainId:chainId,tokens:_defaultAssets.tokens}))
    }


        fetchData()
    },[chainId,account])

 


}

