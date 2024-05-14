import { Player } from '@lottiefiles/react-lottie-player';
import React, { useEffect, useState, useRef } from 'react';

export const SwapAnimation = (props: {className:string, dataSource:string, width?, height?,repeat?})=> {

    return (
        <>
            <Player
                className={props.className + " animation"}
                autoplay={true}
                loop={props.repeat}
                controls={true}
                src={props.dataSource}
                style={{minHeight:props.height ? props.height : "100%", maxHeight:props.height ? props.height : "100%",  height: props.height ? props.height : "100%", width: props.width ? props.width : "100%"}}
            ></Player>
        </>
    );
}
