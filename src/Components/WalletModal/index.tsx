import React, { useEffect, useState, useRef } from 'react';
import { useWeb3React } from '@web3-react/core'
import ConnectionErrorView from './ConnectionErrorView'
import Option from './Option'
import {getConnections, networkConnection} from "../../connection";
import {ActivationStatus, useActivationState} from "../../connection/activate";
import {isSupportedChain} from "../../constants/chains";

export default function WalletModal() {

  const { connector, chainId } = useWeb3React()

  const connections = getConnections()

  const { activationState } = useActivationState()

  // Keep the network connector in sync with any active user connector to prevent chain-switching on wallet disconnection.
  useEffect(() => {
    if (chainId && isSupportedChain(chainId) && connector !== networkConnection.connector) {
      networkConnection.connector.activate(chainId)
    }
  }, [chainId, connector])
  return (
    <>

        {activationState.status === ActivationStatus.ERROR ? (
            <ConnectionErrorView />
        ) : (
            <>
              <div className={"w-full flex flex-col gap-2 mb-2"}>
                <span className={"text-2xl"}>Connect</span>
                <span className={"text-sm"}>Connect wallet in one click to start using IMON</span>
              </div>
              <div className={"w-full grid sm:grid-cols-2 grid-cols-1 gap-4 rounded-lg border border-default p-4 mb-2"}>
                {connections
                    .filter((connection) => connection.shouldDisplay())
                    .map((connection) => (
                        <Option key={connection.getName()} connection={connection} />
                    ))}
              </div>
              <div className={"w-full border border-default p-2 flex flex-col gap-2 rounded-lg"}>
                <span className={"flex flex-row gap-2"}>
                  <span translate={"no"} className="material-symbols-outlined">visibility</span>
                  View only permissions. We cannot do anything without your approval.
                </span>
                <span className={"flex flex-row gap-2"}><span translate={"no"} className="material-symbols-outlined">info</span>
              New to Web3? <a className={"text-pink-960 flex flex-row gap-2"} target={"_blank"} href={"https://ethereum.org/en/wallets/"}>Learn more about wallets <span translate={"no"} className="material-symbols-outlined">arrow_outward</span></a></span>


              </div>
            </>
        )}


    </>
  )
}
