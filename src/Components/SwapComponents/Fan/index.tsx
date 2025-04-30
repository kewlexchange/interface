import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalInfo } from '../../../hooks/useModals';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { updateTax, updateUserDeadline, updateUserSlippageTolerance } from '../../../state/user/reducer';
import { Button, ButtonGroup, Card, Input, Switch, Slider } from '@nextui-org/react';
import TokenGrid from './Components/TokenGrid';
import { TokenSelectState } from './Components/Types';
import { tokens } from './Components/Data';
import PurchasePanel from './Components/PurchasePanel';
import { ethers } from 'ethers';
import { Currency, CurrencyAmount, Pair, Percent, Route, Token, Trade, WETH9 } from '@/entities';
import { useExchangeContract } from '@/hooks/useContract';
import { INITIAL_ALLOWED_SLIPPAGE, TradeType } from '@/constants/misc';
import JSBI from 'jsbi';
import { parseEther } from 'ethers/lib/utils';
import { ChainId } from '@/constants/chains';

const _FAN_TAB = () => {
    const { connector, account, provider, chainId } = useWeb3React();
    const EXCHANGE = useExchangeContract(chainId, true);
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
   
    // Başlangıçta tüm tokenleri seçili olarak ayarla
    const initialSelectedTokens = useMemo(() => {
        const initial: TokenSelectState = {};
        tokens.forEach(token => {
            initial[token.address] = true;
        });
        return initial;
    }, []);

    const [selectedTokens, setSelectedTokens] = useState<TokenSelectState>(initialSelectedTokens);
    const [sliderValue, setSliderValue] = useState(tokens.length);

    // TokenCard'a tıklama işleyicisi - Düzeltilmiş versiyon
    const handleTokenSelect = (tokenId: string) => {
        // Token seçimini güncelle
        const updatedSelectedTokens = {
            ...selectedTokens,
            [tokenId]: !selectedTokens[tokenId]
        };
        
        setSelectedTokens(updatedSelectedTokens);
        
        // Seçili token sayısını hesapla ve slider değerini güncelle
        const selectedCount = Object.values(updatedSelectedTokens).filter(Boolean).length;
        setSliderValue(selectedCount);
    };
    
    // Slider değişim işleyicisi
    const handleSliderChange = (value: number) => {
        setSliderValue(value);
        
        // Sıraya göre token seçimini güncelle (ilk 'value' kadar token seçili)
        const newSelectedTokens: TokenSelectState = {};
        tokens.forEach((token, index) => {
            newSelectedTokens[token.address] = index < value;
        });
        
        setSelectedTokens(newSelectedTokens);
    };

    // Tüm tokenleri seç butonu için işleyici
    const handleSelectAll = () => {
        const allSelected: TokenSelectState = {};
        tokens.forEach(token => {
            allSelected[token.address] = true;
        });
        setSelectedTokens(allSelected);
        setSliderValue(tokens.length);
    };
    
    // Tüm seçimleri kaldır butonu için işleyici
    const handleClearSelection = () => {
        const noneSelected: TokenSelectState = {};
        tokens.forEach(token => {
            noneSelected[token.address] = false;
        });
        setSelectedTokens(noneSelected);
        setSliderValue(0);
    };

    function toHex(currencyAmount: CurrencyAmount<Currency>) {
        return `0x${currencyAmount.quotient.toString(16)}`
    }
    
    const handlePurchase = async (totalDepositAmount:string) => {
        toggleLoading();

        if(chainId != ChainId.CHILIZ){
            let error = { message: "This is only available on Chiliz" }
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
            return;
        }

        const WCHZ = WETH9[chainId].address; 
        let KAYEN_ROUTER = {
            router:"0xE2918AA38088878546c1A18F2F9b1BC83297fdD3",
            weth:WCHZ,
            flag:false,
            stable:false,
       }
       let CHILIZ_WRAPPER = "0xAEdcF2bf41891777c5F638A098bbdE1eDBa7B264"
       

       let pairsAddressList = []
       tokens.forEach(token => {
            if(selectedTokens[token.address]){
                const pair = token.pair
                if(pair != ethers.constants.AddressZero){
                    pairsAddressList.push(pair)
                    console.log("Pair Aliniyor..", token.symbol, pair)
                }
            }
        });


        const totalInvestment = parseFloat(totalDepositAmount || "0");
        const depositAmount = pairsAddressList.length > 0 ? (totalInvestment / pairsAddressList.length).toFixed(6) : "0";


      
        const pairs = await EXCHANGE.getReservesByPairAddresses(pairsAddressList)
        let swapList = []
        let totalDepositWei = BigInt(0);

        for (const pair of pairs) {
                const token0 = new Token(
                  chainId, // Chain ID
                  pair.token0,
                  pair.token0Decimals.toNumber(),
                  'TOKEN0',
                  'Token0'
                );
        
                const token1 = new Token(
                  chainId, // Chain ID
                  pair.token1,
                  pair.token1Decimals.toNumber(),
                  'TOKEN1',
                  'Token1'
                );
        
        
                var side = pair.token0 == WCHZ
        
                const [tokenA, tokenB]: [Token, Token] = side 
                  ? [token0, token1]
                  : [token1, token0];
                const [reserveA, reserveB] = side
                  ? [pair.reserve0, pair.reserve1]
                  : [pair.reserve1, pair.reserve0];
        
        
                const exchangePair = new Pair(
                  CurrencyAmount.fromRawAmount(tokenA, reserveA),
                  CurrencyAmount.fromRawAmount(tokenB, reserveB),
                  pair.pair
                )
        
        
                const inputOutputToken = tokenA
                  
                const baseAmount: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(inputOutputToken, JSBI.BigInt(ethers.utils.parseUnits(depositAmount, Number(18)).toString()));
          
        
        
                let _tradeInfo = new Trade(
                  new Route([exchangePair],  tokenA,tokenB),
                  CurrencyAmount.fromRawAmount(inputOutputToken, baseAmount.quotient),
                  TradeType.EXACT_INPUT
                )

                       
                const DEFAULT_ADD_SLIPPAGE_TOLERANCE = new Percent(INITIAL_ALLOWED_SLIPPAGE, 10_000)
        
                if(parseFloat(_tradeInfo.priceImpact.toFixed(2)) > 5){
                    console.log("PRICE IMPACTS",tokenA.address,tokenB.address,_tradeInfo.priceImpact.toFixed(2))
                    let error = { message: "Price Impact is too high" }
                    setTransaction({ hash: '', summary: '', error: error });
                    toggleError();
                    return;
                } 
         
        
                const amountIn: string = toHex(_tradeInfo.maximumAmountIn(DEFAULT_ADD_SLIPPAGE_TOLERANCE))
                const amountOut: string = toHex(_tradeInfo.outputAmount)

                
                let swapParam = {
                  amountIn: amountIn,
                  amountOut:amountOut,
                  weth9: WCHZ,
                  wrapper: CHILIZ_WRAPPER,
                  pair: pair.pair,
                  input: WCHZ,
                  flag:false
                }
                
                swapList.push(swapParam)
        
            }

            console.log("SWAP LIST",swapList)


            let fee = parseEther("10")
            let overrides = {
                value:fee.add(parseEther(totalDepositAmount))
            }

        await EXCHANGE.swapAll(swapList, overrides).then(async (tx) => {
            await tx.wait();
            const summary = `Fan Tokens Swapped Successfully: ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
        });
          
    
        


    //setShowSuccessModal(true);
    };


    return (
        <>

<ModalError
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading}
                isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess}
                isShowing={isTransactionSuccess} />

            <div className="w-full rounded-2xl">
                <div className="rounded-2xl flex gap-3 flex-col">
                    <PurchasePanel
                        selectedTokens={selectedTokens}
                        tokens={tokens}
                        onPurchase={handlePurchase}
                    />
                    
                    <div className="grid gap-4">
                        {/* Token Selection Card */}
                        <Card 
                            shadow='none' 
                            className="w-full bg-gradient-to-b from-slate-900/80 to-slate-950/90
                                       border border-slate-700/30 hover:border-violet-500/30
                                       backdrop-blur-xl
                                       rounded-2xl
                                       overflow-hidden
                                       transition-all duration-300
                                       hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]"
                        >
                            {/* Card Header */}
                            <div className="p-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-b border-slate-700/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-violet-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-100">Token Selection</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300">
                                            {sliderValue} tokens
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Card Body */}
                            <div className="p-5">
                                {/* Slider Section */}
                                <div className="mb-6 relative">
                                    {/* Slider Container */}
                                    <div className="p-4 bg-gradient-to-r from-slate-900/70 to-slate-800/50 rounded-xl border border-slate-700/30">
                                        {/* Slider Labels */}
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-slate-400">0 tokens</span>
                                            <span className="text-xs text-violet-300 font-medium">{sliderValue} selected</span>
                                            <span className="text-xs text-slate-400">{tokens.length} tokens</span>
                                        </div>
                                        
                                        {/* Progress Indicator Background */}
                                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 px-4">
                                            <div className="h-full w-full rounded-full bg-gradient-to-r from-violet-900/20 via-violet-600/10 to-indigo-800/20 opacity-30"></div>
                                        </div>
                                        
                                        {/* Custom styled Slider */}
                                        <div className="relative">
                                            <Slider 
                                                size="lg"
                                                step={1} 
                                                color="secondary"
                                                minValue={0} 
                                                maxValue={tokens.length} 
                                                value={sliderValue}
                                                onChange={handleSliderChange}
                                                classNames={{
                                                    base: "max-w-full py-1",
                                                    track: "bg-gradient-to-r from-slate-700/40 via-slate-700/20 to-slate-700/40 h-2",
                                                    filler: "bg-gradient-to-r from-violet-700 to-indigo-600 shadow-[0_0_10px_rgba(139,92,246,0.3)]",
                                                    thumb: [
                                                        "transition-transform",
                                                        "after:bg-gradient-to-b after:from-violet-400 after:to-violet-600",
                                                        "shadow-[0_0_10px_rgba(139,92,246,0.5)]",
                                                        "backdrop-blur-lg",
                                                        "border-2 border-white/40",
                                                        "group-data-[pressed=true]:scale-110",
                                                        "!w-5 !h-5"
                                                    ],
                                                    mark: "hidden"
                                                }}
                                                startContent={
                                                    <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                                                        <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                                    </div>
                                                }
                                                endContent={
                                                    <div className="w-4 h-4 rounded-full bg-violet-900/60 flex items-center justify-center border border-violet-700/60">
                                                        <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                                                    </div>
                                                }
                                                showSteps={false}
                                                aria-label="Select number of tokens"
                                            />
                                            
                                          
                                        </div>
                                        
                                       
                                    </div>
                                </div>
                                
                                {/* Token Grid Section */}
                                <div>
                               
                                    
                                    {/* Token Grid with a subtle border */}
                                    <div className="rounded-xl overflow-hidden">
                                        <TokenGrid 
                                            tokens={tokens}
                                            selectedTokens={selectedTokens}
                                            onTokenSelect={handleTokenSelect}
                                        />
                                    </div>
                                    
                                    {/* Info Section */}
                                    <div className="mt-4 p-3 bg-violet-500/5 border border-violet-500/10 rounded-lg flex items-start gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-xs text-slate-300">
                                            Your investment will be evenly distributed among the selected tokens. 
                                            Tokens are ranked by market capitalization.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                </div>
            </div>
        </>
    );
}

export const FAN_TAB = memo(_FAN_TAB);

