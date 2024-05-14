import React, {useEffect, useState} from 'react';
import ContentLoader from "react-content-loader"
import {useWeb3React} from "@web3-react/core";
import {useDiamondContract} from "../../hooks/useContract";
import VOLUME_ON from '../../assets/svg/volume.svg';
import VOLUME_OFF from '../../assets/svg/volumeoff.svg';
import {useAppDispatch, useAppSelector} from "../../state/hooks";
import {updatePlaySound} from "../../state/user/reducer";

export const Volume = () => {
    const dispatch = useAppDispatch()
    const playSound = useAppSelector((state) => state.user.playSound)

    const toggleVolume = () =>{
        dispatch(updatePlaySound({isEnabled:!playSound}))
    }
    // @ts-ignore
    return (
        <>
            <button className={"rounded-full transparent-bg text-white hover:bg-white/30 p-1"} onClick={()=>{
                toggleVolume()
            }}>
                <img className={"w-3 h-3"} src={playSound ? VOLUME_OFF : VOLUME_ON}/>
            </button>
        </>
    );
}
