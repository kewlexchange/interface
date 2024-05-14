import { Player } from '@lottiefiles/react-lottie-player';
import React, { useEffect, useState, useRef } from 'react';

export const AnimationHeader = (props: {className:string, dataSource?, width?, height?,repeat?})=> {
    const componentMounted = useRef(true); // (3) component is mounted
    const [isLoaded,setLoaded] = useState(false);
    useEffect(()=>{
        setLoaded(componentMounted.current);
    },[componentMounted.current])
    return (
        <>
            {
                isLoaded && <Player
                    className={props.className + " animation"}
                    autoplay={true}
                    loop={props.repeat}
                    controls={true}
                    src={props.dataSource}
                    style={{minHeight:props.height ? props.height : "100%", maxHeight:props.height ? props.height : "100%",  height: props.height ? props.height : "100%", width: props.width ? props.width : "100%"}}
                ></Player>
            }
        </>

    );
}
