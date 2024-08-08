import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { useExchangeContract } from '../../hooks/useContract';
import {  DEFAULT_CHAIN_ASSETS_URL, isSupportedChain } from '../../constants/chains';
import { ethers } from 'ethers';
import { CurrencyAmount, Token, WETH9 } from '../../entities';
import { updateTokenList } from './reducer';
import { ETHER_ADDRESS } from '../../constants/misc';
import { getIconByChainId } from '../../utils';
import { getChainInfoOrDefault } from '../../constants/chainInfo';

export const useFetchAllTokenList = (chainId: number, account: string | null) => {
    const dispatch = useAppDispatch();
    const EXCHANGE = useExchangeContract(chainId, true);
    const customTokens = useAppSelector(state => state.user.customTokenList && state.user.customTokenList[chainId]);

    const fetchTokens = useCallback(async () => {
        if (!isSupportedChain(chainId)) return;

        const chainInfo = getChainInfoOrDefault(chainId);
        let fetchURL = chainInfo.defaultListUrl[0] || DEFAULT_CHAIN_ASSETS_URL;
        let userBalance = '0.0000';

        const _defaultAssets = await (await fetch(fetchURL)).json();
        let abiERC = ['function balanceOf(address user)'];
        let tokenList = _defaultAssets?.tokens || [];

        if (customTokens) {
            tokenList = [...tokenList, ...customTokens];
        }

        let abiInterfaceParam = new ethers.utils.Interface(abiERC);
        let multicallParams = tokenList.map(item => ({
            target: item.address,
            callData: abiInterfaceParam.encodeFunctionData('balanceOf', [account])
        }));

        tokenList = tokenList.map(item => ({ ...item, balance: '0.0' }));

        if (account && EXCHANGE) {
            const [blockNum, multicallResult] = await EXCHANGE.callStatic.aggregate(multicallParams);
            multicallResult.forEach((encodedMulticallData, index) => {
                const decodedMulticallData = ethers.utils.defaultAbiCoder.decode(['uint256 balance'], encodedMulticallData);
                let tokenInfo = tokenList[index];
                tokenInfo.address = ethers.utils.getAddress(tokenInfo.address);
                const tokenAddr = new Token(tokenInfo.chainId, tokenInfo.address, tokenInfo.decimals);
                tokenList[index]['balance'] = CurrencyAmount.fromRawAmount(tokenAddr, decodedMulticallData.balance).toSignificant();
            });

            let balanceInfo = await EXCHANGE.getEthBalance(account);
            userBalance = CurrencyAmount.fromRawAmount(WETH9[chainId], balanceInfo).toSignificant(6);
        }

        let nativeCurrency = {
            chainId,
            address: ETHER_ADDRESS,
            balance: userBalance,
            logoURI: getIconByChainId(chainId, true),
            ...chainInfo.nativeCurrency
        };
        dispatch(updateTokenList({ chainId, tokens: [nativeCurrency, ...tokenList] }));
    }, [chainId, account, dispatch, EXCHANGE, customTokens]);

    return { fetchTokens };
};
