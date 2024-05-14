import { Player } from '@lottiefiles/react-lottie-player';
import React, { useEffect, useState, useRef } from 'react';

export const UnlockStakePool = (props: {className:string, dataSource?, width?, height?,repeat?})=> {
    const componentMounted = useRef(true); // (3) component is mounted
    const [isLoaded,setLoaded] = useState(false);
    useEffect(()=>{
        setLoaded(componentMounted.current);
    },[componentMounted.current])
    return (
        <div className={"transparent-bg rounded-lg p-2"}>
            <div className={"w-full flex flex-col gap-2 p-2 text-justify"}>
                <span className={"text-lg w-full"}>Stake Pool is Locked</span>
                <span className={"text-sm"}>The stake pool is locked. To enter this stake pool and be eligible for rewards distributed in the pool, you need to first reactivate by voting for the corresponding pool.</span>
            </div>
            <div className={"grid grid-cols-2 sm:grid-cols-1 items-center justify-center"}>
            <div className={"w-full p-2 flex flex-col text-justify gap-2 sm:order-2"}>
                    <span className={"text-sm"}>
                    Staking pools are a system where those who hold a certain amount of cryptocurrency on a blockchain network can use it to join a pool. Staking pools enable participants to contribute to the security of the network by assigning them a role in the blockchain, and they are rewarded for this contribution.
                </span>
                <span className={"text-sm"}>
                    However, there are certain conditions that must be met in order to join a staking pool and receive rewards. For example, in some staking pools, you may need to vote to participate. This is important to benefit from the rewards distributed in the pool. The voting process is carried out to ensure the management of the pool is trustworthy and fair.
                </span>
                <span className={"text-sm"}>
                    With the widespread adoption of blockchain technology, staking pools have become increasingly popular. Participants can contribute to the security of the network and earn rewards by joining staking pools.
                </span>
            </div>

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
        </div>
        </div>


    );
}
