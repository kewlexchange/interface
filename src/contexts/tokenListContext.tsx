import React, { createContext, useContext, useState } from "react";

// Token tipi
interface TokenItem {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  balance: string;
}

// Context değer tipi
interface TokenContextType {
  tokenLists: Record<number, TokenItem[]>;
  setTokenList: (chainId: number, tokens: TokenItem[]) => void;
  getTokenListByChainId: (chainId: number) => TokenItem[] | undefined;
}

// Varsayılan context değeri
const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider: React.FC = ({ children }) => {
  const [tokenLists, setTokenLists] = useState<Record<number, TokenItem[]>>({});

  // setTokenList function that accepts chainId and tokens to update the state
  const updateTokenList = (chainId: number, tokens: TokenItem[]) => {
    setTokenLists((prev) => ({
      ...prev,
      [chainId]: tokens,
    }));
  };

  // getTokenListByChainId function to return token list for a specific chainId
  const getTokenListByChainId = (chainId: number) => {
    return tokenLists[chainId];
  };

  return (
    <TokenContext.Provider value={{ tokenLists, setTokenList: updateTokenList, getTokenListByChainId }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useTokenContext = (): TokenContextType => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useTokenContext must be used within a TokenProvider");
  }
  return context;
};