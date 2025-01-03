
import React, { useEffect, useState, useRef } from 'react';

// TODO(cartcrom): move this to a top level modal, rather than inline in the drawer
import {ActivationStatus, useActivationState} from "../../connection/activate";

export default function ConnectionErrorView() {
  const { activationState, tryActivation, cancelActivation } = useActivationState()

  if (activationState.status !== ActivationStatus.ERROR) return null

  const retry = () => tryActivation(activationState.connection, null)

  return (
   <div className={"w-full bg-white grid grid-cols-1 gap-4 rounded-lg p-5"}>
       <span className={"text-black"}>Error Connecting!</span>
       <span className={"text-black"}>The connection attempt failed. Please click try again and follow the steps to connect in your wallet</span>

       <div className={"grid grid-cols-2 gap-4 w-full"}>
       <button onPress={retry} className={"btn btn-primary w-full"}>Try Again</button>
       <button onPress={cancelActivation} className={"btn btn-secondary w-full"}>Go Back</button>
       </div>

       {/*<Wrapper>
           <AlertTriangleIcon />
           <ThemedText.HeadlineSmall marginBottom="8px">
               <Trans>Error connecting</Trans>
           </ThemedText.HeadlineSmall>
           <ThemedText.BodyPrimary fontSize={16} marginBottom={24} lineHeight="24px" textAlign="center">
               <Trans>
                   T.
               </Trans>
           </ThemedText.BodyPrimary>
           <ButtonPrimary $borderRadius="16px" onPress={retry}>
               <Trans>Try Again</Trans>
           </ButtonPrimary>
           <ButtonEmpty width="fit-content" padding="0" marginTop={20}>
               <ThemedText.Link onPress={cancelActivation} marginBottom={12}>
                   <Trans>Back to wallet selection</Trans>
               </ThemedText.Link>
           </ButtonEmpty>
       </Wrapper>*/}
   </div>
  )
}
