import React, { useEffect, useState,useMemo,ReactNode, useRef } from 'react';
import { getWalletMeta } from '@uniswap/conedison/provider/meta'

import { useWeb3React, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { Connector } from '@web3-react/types'
import { getConnection } from '../../connection'
import { isSupportedChain } from '../../constants/chains'
import { RPC_PROVIDERS } from '../../constants/providers'
import useEagerlyConnect from '../../hooks/useEagerlyConnect'
import useOrderedConnections from '../../hooks/useOrderedConnections'
import usePrevious from '../../hooks/usePrevious'
import { useConnectedWallets } from '../../state/wallets/hooks'
import { MAINNET_CHAIN_ID, MAINNET_INFO } from '@/constants/chainInfo';

export default function Web3Provider({ children }: { children: ReactNode }) {
  useEagerlyConnect()
  const connections = useOrderedConnections()
  const connectors: [Connector, Web3ReactHooks][] = connections.map(({ hooks, connector }) => [connector, hooks])

  // Force a re-render when our connection state changes.
  const [index, setIndex] = useState(0)
  useEffect(() => setIndex((index) => index + 1), [connections])
  const key = useMemo(
      () => connections.map((connection) => connection.getName()).join('-') + index,
      [connections, index]
  )

  return (
      <Web3ReactProvider connectors={connectors} key={key}>
        <Updater />
        {children}
      </Web3ReactProvider>
  )
}

/** A component to run hooks under the Web3ReactProvider context. */
function Updater() {
  const { account, chainId, connector, provider } = useWeb3React()

  // Trace RPC calls (for debugging).
  const networkProvider = isSupportedChain(chainId) ? RPC_PROVIDERS[chainId] : RPC_PROVIDERS[MAINNET_CHAIN_ID]
  const shouldTrace = false
  useEffect(() => {
    if (shouldTrace) {
      provider?.on('debug', trace)
      if (provider !== networkProvider) {
        networkProvider?.on('debug', trace)
      }
    }
    return () => {
      provider?.off('debug', trace)
      networkProvider?.off('debug', trace)
    }
  }, [networkProvider, provider, shouldTrace])

  // Send analytics events when the active account changes.
  const previousAccount = usePrevious(account)
  const [connectedWallets, addConnectedWallet] = useConnectedWallets()
  useEffect(() => {
    if (account && account !== previousAccount) {
      const walletType = getConnection(connector).getName()
      const peerWalletAgent = provider ? getWalletMeta(provider)?.agent : undefined
      const isReconnect = connectedWallets.some(
          (wallet) => wallet.account === account && wallet.walletType === walletType
      )


      /*
      user.set(CustomUserProperties.WALLET_ADDRESS, account)
      user.set(CustomUserProperties.WALLET_TYPE, walletType)
      user.set(CustomUserProperties.PEER_WALLET_AGENT, peerWalletAgent ?? '')
      if (chainId) {
        user.postInsert(CustomUserProperties.ALL_WALLET_CHAIN_IDS, chainId)
      }
      user.postInsert(CustomUserProperties.ALL_WALLET_ADDRESSES_CONNECTED, account)
      */

      addConnectedWallet({ account, walletType })
    }
  }, [account, addConnectedWallet, chainId, connectedWallets, connector, previousAccount, provider])

  return null
}

function trace(event: any) {
  if (!event?.request) return
  const { method, id, params } = event.request
  console.groupCollapsed(method, id)
  console.debug(params)
  console.groupEnd()
}
