import React, { memo, useEffect, useMemo, useState } from 'react';
import { getIconByChainId, getNFTItemType, unixTimeToDateTime } from "../../utils";
import { useWeb3React } from "@web3-react/core";
import { Accordion, AccordionItem, Card, CardBody, CardHeader } from '@nextui-org/react';

const _MetadataItem = (props: { metadataJSON, contractInfo }) => {
    const { connector, account, provider, chainId } = useWeb3React()

    return (
        <>

            <Accordion selectionMode='multiple' fullWidth={true} isCompact={true} className='w-full' variant="splitted">
                <AccordionItem  startContent={
                    <div className='w-full h-full flex flex-col items-center justify-center'>
                    <span translate={"no"} className="material-symbols-outlined">
                        playlist_add_check
                    </span>
                    </div>
                } key="1" aria-label="Description" title="Description">
                    <div className="content w-full rounded-lg p-2 flex flex-col flex-wrap">
                        <div>By <span className="font-semibold">{props.metadataJSON?.created_by ? props.metadataJSON?.created_by : props.metadataJSON?.name}</span>  </div>
                        <span>{props.metadataJSON?.name}</span>
                        <span className={"text-justify w-full whitespace-pre-wrap"}>{props.metadataJSON?.description}</span>
                    </div>
                </AccordionItem>
                <AccordionItem startContent={
                    <span translate={"no"} className="material-symbols-outlined">
                        label
                    </span>
                } key="2" aria-label="Traits" title="Traits">
                    <div className="grid grid-cols-2 gap-2 p-2 rounded-lg">
                        {
                            props.metadataJSON && props.metadataJSON?.attributes && props.metadataJSON?.attributes.length > 0 && props.metadataJSON.attributes.map((item, index) => {
                                return <Card key={`metadata${index}`} className="text-start line-clam-1 whitespace-nowrap overflow-ellipsis   rounded-xl p-2 flex flex-col select-none cursor-pointer hover:bg-white/30">
                                    <span className="font-semibold flex text-xs">{item.trait_type}</span>

                                    {
                                        item.display_type && item.display_type === "boost_percentage" ?
                                            <div className={"flex flex-row gap-2"}>
                                                <span className="text-xs">{item.value} of {item.max_value && item.max_value}</span>
                                                <div className="w-full h-4 bg-gray-200 rounded-xl relative overflow-hidden">
                                                    <div className="bg-pink-960  h-4 transition-all duration-300" style={{ width: `${item.value / item.max_value * 100}%` }}></div>
                                                </div>
                                            </div> : item.display_type && item.display_type == "birthday" ?
                                                <>
                                                    <span className={"whitespace-nowrap overflow-hidden text-xs"}>{unixTimeToDateTime(item.value)}</span>
                                                </> : <span className={"whitespace-nowrap overflow-hidden text-xs"}>{item.value}</span>
                                    }
                                </Card>
                            })
                        }
                    </div>
                </AccordionItem>
                <AccordionItem startContent={
                    <span translate={"no"} className="material-symbols-outlined">display_settings</span>
                } key="3" aria-label="Details" title="Details">
                    <div className="content rounded-lg  flex flex-col gap-y-4 items-start">
                        <div className="w-full flex flex-col items-start justify-start">
                            <span className={"text-xs font-semibold uppercase"}>Contract Address</span>
                            <span className={"text-xs"}>{props.contractInfo && props.contractInfo.contractAddress}</span>
                        </div>
                        <div className="w-full flex flex-col items-start justify-start whitespace-nowrap overflow-hidden text-xs">
                            <span className={"text-xs font-semibold uppercase"}>Token ID</span>
                            <span className={"text-xs whitespace-nowrap overflow-hidden text-xs"}>{props.contractInfo && props.contractInfo.tokenId}</span>
                        </div>
                        <div className="w-full flex flex-col items-start justify-start">
                            <span className={"text-xs font-semibold uppercase"}>Token Standard</span>
                            <span className={"text-xs"}>{props.contractInfo && props.contractInfo.itemType}</span>
                        </div>
                        <div className="w-full flex items-center justify-between">
                            <span className={"text-xs font-semibold uppercase"}>Blockchain</span>
                            <span><img className={"w-5 h-5"} src={getIconByChainId(chainId)} /> </span>
                        </div>
                    </div>
                </AccordionItem>
            </Accordion>



        </>
    );
}
export const MetadataItem = memo(_MetadataItem)
