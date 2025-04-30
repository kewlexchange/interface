import React, { useCallback, useEffect, useState } from 'react';
import { Wallet2, ArrowRight, AlertTriangle, TrendingUp, BarChart3, DollarSign } from 'lucide-react';
import { Token, TokenSelectState } from './Types';
import { Avatar, Button, Tooltip, Image, Divider, Progress } from '@nextui-org/react';
import { debounce, getIconByChainId } from '@/utils';
import { ETHER_ADDRESS, TradeType } from '@/constants/misc';
import { CurrencyAmount, WETH9 } from '@/entities';
import { useWeb3React } from '@web3-react/core';
import { useExchangeContract } from '@/hooks/useContract';
import { getChainInfoOrDefault } from '@/constants/chainInfo';

interface PurchasePanelProps {
  tokens: Token[],
  selectedTokens: TokenSelectState;
  onPurchase: (depositAmount:string) => void;
}

const PurchasePanel: React.FC<PurchasePanelProps> = ({ tokens, selectedTokens, onPurchase }) => {
  const [baseAsset, setBaseAsset] = useState<any>(null);
  const [baseInputValue, setBaseInputValue] = useState("");
  const [debouncedInputValue, setDebouncedSetInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gasEstimate, setGasEstimate] = useState("0.002");
  const { connector, account, provider, chainId } = useWeb3React();
  const EXCHANGE = useExchangeContract(chainId, true);

  // Selected tokens count and calculation
  const selectedCount = Object.values(selectedTokens).filter(Boolean).length;
  const totalInvestment = parseFloat(baseInputValue || "0");
  const isValidInput = totalInvestment > 0 && !isNaN(totalInvestment);
  const perTokenInvestment = selectedCount > 0 ? (totalInvestment / selectedCount).toFixed(4) : "0";

  const initDefaults = async () => {
    setIsLoading(true);
    try {
      let balanceInfo = await EXCHANGE.getEthBalance(account);
      var userBalance = CurrencyAmount.fromRawAmount(WETH9[chainId], balanceInfo).toSignificant(6);
      const chainInfo = getChainInfoOrDefault(chainId);

      let nativeCurrency = {
        chainId,
        address: ETHER_ADDRESS,
        balance: userBalance,
        logoURI: getIconByChainId(chainId, true),
        ...chainInfo.nativeCurrency
      };
      setBaseAsset(nativeCurrency);
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (account && chainId) {
      initDefaults();
    }
  }, [chainId, account]);

  const debouncedSetInputValue = useCallback(
    debounce((val) => {
      setDebouncedSetInputValue(val);
    }, 500),
    []
  );

  const setInputValue = (e: any, side: TradeType) => {
    const regex = /^[0-9]*\.?[0-9]*$/;
    e = e.replace(",", ".");
    if (regex.test(e)) {
      if (side == TradeType.EXACT_INPUT) {
        setBaseInputValue(e);
        debouncedSetInputValue(e);
      }
    }
  };

  const setTradeInputPercent = (percent: number) => {
    let etherBalance: string = baseAsset?.balance || "0.00";
    let balance: number = parseFloat(etherBalance);
    
    if (typeof balance !== "number" || isNaN(balance)) {
      console.error("Balance is not a valid number");
      return;
    }
    
    let calculatedAmount = ((balance * percent) / 100).toFixed(6);
    setInputValue(calculatedAmount, TradeType.EXACT_INPUT);
  };

  const handleInvest = () => {
    if (!isValidInput || selectedCount === 0) return;
    onPurchase(baseInputValue);
  };

  return (
    <div className="z-20 w-full">
      <div className="w-full rounded-xl overflow-hidden bg-white/[0.01] backdrop-blur-xl border border-slate-200/10 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)]">
        {/* Header Section */}
        <div className="px-4 pt-4 pb-3 bg-gradient-to-r from-slate-800/30 to-slate-900/30 border-b border-slate-700/20">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">Fan ETF</h3>
            <div className="flex items-center gap-1">
              <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300">
                {selectedCount} tokens selected
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">Invest in multiple FAN tokens with a single transaction</p>
        </div>

        {/* Main Content */}
        <div className="p-4">
          {/* Investment Amount Section */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-slate-200">Investment Amount</span>
              </div>
              {baseAsset && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/50">
                  <Image src={baseAsset.logoURI} className="w-4 h-4" alt={baseAsset.symbol} />
                  <span className="text-sm text-slate-300">{baseAsset.symbol}</span>
                </div>
              )}
            </div>

            {/* Input Field */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-xl blur-sm bg-gradient-to-r from-violet-600/20 via-slate-800/5 to-violet-600/20 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-300"></div>
              
              <div className="relative flex flex-col sm:flex-row items-center overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50 group-hover:border-violet-500/30 group-focus-within:border-violet-500/50 transition duration-300">
                <input
                  type="text"
                  value={baseInputValue}
                  onChange={(e) => setInputValue(e.target.value, TradeType.EXACT_INPUT)}
                  placeholder="0.00"
                  className="w-full sm:flex-1 bg-transparent text-lg px-4 py-3 text-slate-100 outline-none placeholder:text-slate-600"
                />
                
                <div className="flex items-center justify-center w-full sm:w-auto p-2">
                  <Button
                    onPress={handleInvest}
                    isDisabled={!isValidInput || selectedCount === 0 || isLoading}
                    className={`
                      relative overflow-hidden h-10 w-full sm:w-auto px-5
                      flex items-center justify-center gap-2
                      font-medium tracking-wide
                      ${isValidInput && selectedCount > 0 
                        ? 'bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 text-white border border-violet-500/30' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700/50'}
                      ${isValidInput && selectedCount > 0 ? 'hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]' : ''}
                      ${isValidInput && selectedCount > 0 ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
                      transition-all duration-200
                      group
                    `}
                    radius="full"
                  >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out"></div>
                    
                    {/* Inner Gradient Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    
                    {/* Light Border Effect */}
                    <div className="absolute inset-0 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    
                    {/* Loading Indicator */}
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span className="relative z-10">Invest Now</span>
                        <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Balance and Percentage Buttons */}
            <div className="flex flex-wrap items-center justify-between mt-3 gap-2">
              {baseAsset && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/40 border border-slate-700/30">
                  <Wallet2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-300">
                    Balance: <span className="text-slate-200 font-medium">{parseFloat(baseAsset.balance).toFixed(4)}</span> {baseAsset.symbol}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1 flex-wrap">
                {[25, 50, 75, 100].map((percent) => (
                  <Button
                    key={percent}
                    size="sm"
                    className={`
                      min-w-[46px] h-8 px-2
                      bg-slate-800/60 text-slate-300
                      hover:bg-violet-500/20 hover:text-violet-300
                      border border-slate-700/30 hover:border-violet-500/30
                      active:scale-95
                      transition-all duration-200
                    `}
                    variant="flat"
                    onPress={() => setTradeInputPercent(percent)}
                    radius="full"
                  >
                    {percent}%
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Investment Summary */}
          {isValidInput && selectedCount > 0 && (
            <div className="mt-4 rounded-xl border border-slate-700/30 bg-slate-800/30 overflow-hidden">
              <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/30">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-medium text-slate-200">Investment Summary</span>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Selected Tokens</span>
                  <span className="text-sm font-medium text-slate-200">{selectedCount}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Per Token Investment(~)</span>
                  <span className="text-sm font-medium text-slate-200">{perTokenInvestment} {baseAsset?.symbol}</span>
                </div>
                
                
                <Divider className="my-2 bg-slate-700/30" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-300">Total Investment</span>
                  <span className="text-base font-semibold text-violet-300">
                    {parseFloat(baseInputValue).toFixed(4)} {baseAsset?.symbol}
                  </span>
                </div>
                
                {/* Token Distribution */}
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400">Token Distribution</span>
                    <span className="text-xs text-slate-400">Even Split</span>
                  </div>
                  <Progress 
                    size="sm" 
                    radius="sm" 
                    value={100} 
                    color="secondary"
                    className="max-w-full"
                    aria-label="Token distribution"
                  />
                </div>
              </div>
              
              {/* Action Notice */}
              <div className="px-4 py-3 bg-violet-500/10 border-t border-violet-500/20 flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300">
                  Your investment will be evenly distributed across all selected tokens. Transaction will be processed on {baseAsset?.name || 'current'} network.
                </p>
              </div>
            </div>
          )}
          
          {/* Warning for no tokens selected */}
          {isValidInput && selectedCount === 0 && (
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-200">Please select at least one token to invest in.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchasePanel;