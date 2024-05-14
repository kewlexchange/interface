import IPage from "@/interfaces/page";
import React, { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getNativeCurrencyByChainId, getNFTAPIURLByChainId } from "@/utils";
import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "ethers";
import BG_IMAGE from "@/assets/images/covers/account.jpeg"
import Identicon from "@/Components/Identicon";
import { useWeb3React } from "@web3-react/core";
import { Unicon } from "@/Components/Unicon";
import { updateSelectedWallet } from "@/state/user/reducer";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { NFT } from "@/Components/NFT";
import {
    useDiamondContract,
    useNFT1155Contract,
    useNFT721Contract,
    useStandardNFT721Contract
} from "@/hooks/useContract";
import useModal from "@/hooks/useModals";
import { AbiCoder, hexZeroPad } from "ethers/lib/utils";
import useBlockNumber from "@/hooks/useBlockNumber";
import { log } from "util";
import { DEFAULT_BITCI_CHAIN_NFT_URL, DEFAULT_CHAIN_ASSETS_URL, DEFAULT_CHAIN_NFT_URL } from "@/constants/chains";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import Moralis from "moralis/.";
import { MORALIS_API_KEY } from "../../../constants/ai";
import { useDomainContract } from "../../../hooks/useContract";
import { ChainId } from "../../../constants/chains";
import { DomainItem } from "../../../Components/DomainItem";

const ManagePage: React.FunctionComponent<IPage> = props => {

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);
    return (

        <>


            <div className={"container mx-auto my-5 swap"}>

                <div className={"mx-auto w-[38%] sm:w-full"}>




                    <div className={"grid grid-cols-1 gap-5"}>
                        <div className={"border flex gap-2 flex-col  border-1 rounded-xl p-2 w-full content-background"}>

                            <div className="w-full max-w-full">
                                <div className="block overflow-hidden">
                                    <nav>
                                        <div role="tablist" className="flex flex-row gap-2 w-full relative p-1 h-10 w-auto  nav-border bg-white shadow-2xl shadow-blue-gray-500/40">

                                            <NavLink to={"/cns"} role="tab" className={("") + " rounded-full grid place-items-center px-2 min-w-[100px] text-center h-full relative bg-transparent antialiased font-sans text-base leading-relaxed select-none cursor-pointer p-0 font-normal"} data-value="react">
                                                <div className="z-20 flex items-center justify-center">
                                                    <span translate={"no"} className="material-symbols-outlined">
                                                        app_registration
                                                    </span>
                                                    <span translate={"no"}>Register</span>
                                                </div>

                                            </NavLink>
                                            <NavLink to={"/cns/domains"} onClick={() => {

                                            }} role="tab" className={" rounded-full grid place-items-center px-2 min-w-[100px] text-center h-full relative bg-transparent antialiased font-sans text-base leading-relaxed select-none cursor-pointer p-0 font-normal"} data-value="html">
                                                <div className="z-20 flex items-center justify-center">
                                                    <span translate={"no"} className="material-symbols-outlined">
                                                        grain
                                                    </span>
                                                    <span translate={"no"}>My Names</span>
                                                </div>

                                            </NavLink>
                                            <NavLink to={"/cns/manage"} onClick={() => {

                                            }} role="tab" className={("bg-gradient text-white shadow") + " rounded-full grid place-items-center px-2 min-w-[100px] text-center h-full relative bg-transparent antialiased font-sans text-base leading-relaxed select-none cursor-pointer p-0 font-normal"} data-value="html">
                                                <div className="z-20 flex items-center justify-center">
                                                    <span translate={"no"} className="material-symbols-outlined">
                                                        deployed_code_account
                                                    </span>
                                                    <span translate={"no"}>Manage</span>
                                                </div>

                                            </NavLink>
                                        </div>
                                    </nav>
                                </div>

                            </div>




                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}


export default ManagePage;
