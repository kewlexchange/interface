import React, { useEffect, useState, useRef } from 'react';
import {Connection} from "../../connection/types";
import {ActivationStatus, useActivationState} from "../../connection/activate";
import {useWeb3React} from "@web3-react/core";


export default function Option({ connection }: { connection: Connection }) {
  const { activationState, tryActivation } = useActivationState()
  const { chainId } = useWeb3React()

  const closeDrawer  = () =>{
  }
  const activate = () => tryActivation(connection, closeDrawer, chainId)
  const isSomeOptionPending = activationState.status === ActivationStatus.PENDING
  const isCurrentOptionPending = isSomeOptionPending && activationState.connection.type === connection.type

  return (
    <button className={"border border-default p-2 rounded-xl w-full flex flex-row gap-2 items-center justify-start"} onClick={activate}>
        <img className={"w-10 h-10 rounded-xl"} src={connection.getIcon?.(false)} alt="Icon" />
        <span className={"text-pink-960"}>{connection.getName()}</span>
       {/*{isCurrentOptionPending && <span className={"w-full"}>WAIT PLEASE</span>}*/}
    </button>
  )
}
