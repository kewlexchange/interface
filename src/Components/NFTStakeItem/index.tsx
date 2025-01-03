import { BigNumber } from "ethers";
import { unixTimeToDateTime } from "../../utils";
import { formatEther } from "@ethersproject/units";
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";


export const NFTStakeItem = (props: {collection:any, item:any,index:any})=> {
    const navigate = useNavigate();
    const [isExpanded,setExpanded] = useState(false)

    const handleViewItem = (item:any) => {
        navigate(`/nfts/${item.collectionId}/${item.itemId}`);
    }

    return (
        <>
                <div className={"w-full flex flex-col gap-2 border border-default p-2 rounded-lg"} key={`rewardItem${props.item.collection}-${props.index}`}>

                                                <div className={"w-full flex border border-default  rounded-lg flex-col gap-2 p-2"}>
                                                    <div className={"w-full  p-2"}>
                                                            <span>Reward Info</span>
                                                    </div>

                                                    <div className={"w-full flex flex-col gap-2"}>
                                                        <div className={"w-full items-center rounded-lg flex flex-row justify-between border border-default gap-2 p-2"}>
                                                            <span className={"text-sm"}>Total Reward</span>
                                                            <span>{formatEther(props.item.total_reward)} IMON</span>
                                                        </div>
                                                        <div className={"w-full items-center rounded-lg flex flex-row justify-between border border-default gap-2 p-2"}>
                                                            <span className={"text-sm"}>Claim Period</span>
                                                            <span>{props.item.claim_period} Month</span>
                                                        </div>
                                                        <div className={"w-full items-center rounded-lg flex flex-row justify-between border border-default gap-2 p-2"}>
                                                            <span className={"text-sm"}>Claimed Amount</span>
                                                            <span>{formatEther(props.item.claimed_amount)} IMON</span>
                                                        </div>
                                                        <div className={"w-full items-center rounded-lg flex flex-row justify-between border border-default gap-2 p-2"}>
                                                            <span className={"text-sm"}>Claimable Amount</span>
                                                            <span>{formatEther(props.item.claimable_amount)} IMON</span>
                                                        </div>
                                                        <div className={"w-full items-center rounded-lg flex flex-row justify-between items-center border border-default gap-2 p-2"}>
                                                            <span className={"text-sm"}>Claim</span>
                                                            {
                                                                !props.item.is_cancelled  ?  <button className={"pointer-events-auto rounded-md bg-pink-960 px-3 py-2 text-[0.8125rem] font-semibold leading-5 text-white hover:bg-pink-900"}>
                                                                Harvest
                                                            </button> : <span>Cancelled</span>
                                                            }
                                                        </div>

                                                    </div>
                                                </div>

                                                <div className={"w-full  rounded-lg  border border-default flex flex-col gap-2"}>
                                                    <div className={"w-full  p-2 flex items-center justify-between"}>
                                                            <span>Asset Info</span>
                                                            <button onPress={() => { 
                                                                    setExpanded(!isExpanded)
                                                                }} className="flex items-center gap-x-2 select-none w-8 text-center justify-center h-8 cursor-pointer border border-default bg-white text-pink-960 hover:bg-pink-960 hover:text-white rounded-full p-2">
                                                                    <span translate={"no"}
                                                                        className="material-symbols-outlined"> {isExpanded ? "keyboard_double_arrow_up":"keyboard_double_arrow_down"}</span>
                                                            </button>
                                                    </div>
                                                    {
                                                        isExpanded && <div className={"w-full flex flex-col gap-2 p-2 rounded-lg"}>
                                                            <div className={"w-full items-center rounded-lg flex flex-row justify-between border border-default gap-2 p-2"}>
                                                                <span className={"text-sm"}>Created Date</span>
                                                                <span> {  unixTimeToDateTime(props.item.created_at)} </span>
                                                            </div>
                                                            <div className={"w-full items-center rounded-lg flex flex-row justify-between border border-default gap-2 p-2"}>
                                                                <span className={"text-sm"}>Complated Date</span>
                                                                <span>{props.item.is_completed ? unixTimeToDateTime( props.item.completed_at) : "-"}</span>
                                                            </div>
                                                            <div className={"w-full items-center rounded-lg flex flex-row justify-between border border-default gap-2 p-2"}>
                                                                <span className={"text-sm"}>Cancelled Date</span>
                                                                <span>{props.item.is_cancelled ? unixTimeToDateTime( props.item.cancelled_at) : "-"}</span>
                                                            </div>
                                                            <div className={"w-full items-center rounded-lg flex flex-row justify-between border border-default gap-2 p-2"}>
                                                            <span className={"text-sm"}>Total Quantity</span>
                                                            <span>{BigNumber.from(props.item.amount).toNumber()}</span>
                                                            </div>
                                                            <div className={"w-full items-center rounded-lg flex flex-row justify-between border border-default gap-2 p-2"}>
                                                            <span className={"text-sm"}>Price Per NFT</span>
                                                            <span>{formatEther(props.item.price_per_token)}</span>
                                                            </div>
                                                            <div className={"w-full items-center rounded-lg flex flex-row justify-between border border-default gap-2 p-2"}>
                                                            <span className={"text-sm"}>Sold Quantity</span>
                                                            <span>{BigNumber.from(props.item.amount.sub(props.item.remaining_amount)).toNumber()}</span>
                                                            </div>
                                                            <div className={"w-full items-center rounded-lg flex flex-row justify-between border border-default gap-2 p-2"}>
                                                            <span className={"text-sm"}>Remaining Quantity</span>
                                                            <span>{BigNumber.from(props.item.remaining_amount).toNumber()}</span>
                                                            </div>
                                                            <div className={"w-full items-center rounded-lg flex flex-row justify-between border border-default gap-2 p-2"}>
                                                                <button onPress={()=>{
                                                                    handleViewItem(props.item)
                                                                }} className={"w-full pointer-events-auto rounded-md bg-pink-960 px-3 py-2 text-[0.8125rem] font-semibold leading-5 text-white hover:bg-pink-900"}>
                                                                    View Item
                                                                </button>
                                                            </div>
        
                                                        </div>
        
                                                    }
                                                </div>
                                            
                </div>
        </>
    );
}
