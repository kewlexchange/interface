
import uniPng from '../../assets/images/uniwallet_modal_icon.png'
import {ActivationStatus, useActivationState} from "../../connection/activate";
import React, {useEffect, useState} from "react";
import { WalletConnect as WalletConnectv2 } from '@web3-react/walletconnect-v2'
import {uniwalletWCV2ConnectConnection} from "../../connection";
import {ConnectionType} from "../../connection/types";
import { UniwalletConnect as UniwalletConnectV2 } from '../../connection/WalletConnectV2'
import Modal from "./index";
import {QRCodeSVG} from "qrcode.react";

export default function UniwalletModal() {
    const { activationState, cancelActivation } = useActivationState()
    const [uri, setUri] = useState<string>()
    const open =
        activationState.status === ActivationStatus.PENDING &&
        activationState.connection.type === ConnectionType.UNISWAP_WALLET_V2 &&
        !!uri


    useEffect(() => {
        const connectorV2 = uniwalletWCV2ConnectConnection.connector as WalletConnectv2
        connectorV2.events.addListener(UniwalletConnectV2.UNI_URI_AVAILABLE, (uri: string) => {
            uri && setUri(uri)
        })
    }, [open])


  return (
    <Modal header={"Connect via Uniswap Wallet"} closable={true} isShowing={open} hide={cancelActivation}>
      <div className={"modal-body w-full"}>
        <div className="m-2 bg-white/30 rounded-xl p-4 flex gap-5 flex-col items-center justify-center">
          <span>Scan with Uniswap Wallet</span>
          <div className={"w-[370px] h-[370px] p-5 bg-white rounded-lg"}>
          {uri &&   <QRCodeSVG
              value={uri}
              width="100%"
              height="100%"
              level="M"
              fgColor={"black"}
              imageSettings={{
                src: uniPng,
                height: 33,
                width: 33,
                excavate: false,
              }}
          />}
          </div>
        </div>
      </div>
    </Modal>
  )
}

