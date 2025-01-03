import React, { useEffect, useState, useRef } from 'react';
import {Connection} from "../../connection/types";
import {ActivationStatus, useActivationState} from "../../connection/activate";
import {useWeb3React} from "@web3-react/core";
import { Button } from '@nextui-org/react';


export default function Option({ connection }: { connection: Connection }) {
  const { activationState, tryActivation } = useActivationState()
  const { chainId } = useWeb3React()

  const closeDrawer  = () =>{
  }
  const activate = () => tryActivation(connection, closeDrawer, chainId)
  const isSomeOptionPending = activationState.status === ActivationStatus.PENDING
  const isCurrentOptionPending = isSomeOptionPending && activationState.connection.type === connection.type

  return (
    <Button 
    size='lg'
    fullWidth={true}
    color='default'
    variant='flat'
    className='px-2'
    startContent={
      <img className={"w-10 h-10 rounded-xl"} src={connection.getIcon?.(false)} alt="Icon" />
    }
    onPress={activate}>

        <span className='w-full text-start'>{connection.getName()}</span>
       {/*{isCurrentOptionPending && <span className={"w-full"}>WAIT PLEASE</span>}*/}
    </Button>
  )
}
