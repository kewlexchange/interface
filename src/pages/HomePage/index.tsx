import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import CoverImage from "../../assets/images/cover.png"
import IDO_LOGO from "../../assets/images/icons/ido.svg";
import INO_LOGO from "../../assets/images/icons/ino.svg";
import MARKET_LOGO from "../../assets/images/icons/market.svg";
import SWAP_LOGO from "../../assets/images/icons/swap.svg";
import STAKE_LOGO from "../../assets/images/icons/stake.svg";

import DRAGON_LOGO from "../../assets/images/dragon.svg";

import { TwitterTweetEmbed } from "react-twitter-embed";
import html2canvas from "html2canvas";
import io from "socket.io-client";
import { useWeb3React } from "@web3-react/core";
import { SocialLinks } from "../../Components/SocialLinks";
import { useDiamondContract } from "../../hooks/useContract";
import { ethers } from "ethers";
import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Link, Image } from "@nextui-org/react";
import { title } from "../../Components/Primitives";
import { NavLink } from "react-router-dom";
import { HighlightGroup, HighlighterItem } from "../../Components/HighlighterItem";
import { useTranslation } from 'react-i18next';

const HomePage: React.FunctionComponent<IPage> = props => {
    const { chainId, account } = useWeb3React()
    const { t, i18n } = useTranslation(['home']);

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);


    return (

        <>
            <div className="flex p-4 flex-col items-center justify-center w-full h-screen  overflow-hidden dark:bg-gradient-to-tl dark:from-black dark:via-zinc-600/20 dark:to-black">

        
                <div className="hidden w-full h-px animate-glow md:block animate-fade-left bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
                <h1 className="flex flex-col items-center justify-center z-10 text-4xl text-transparent duration-1000 bg-white cursor-default text-edge-outline animate-title font-display sm:text-6xl md:text-9xl whitespace-nowrap bg-clip-text ">
                    <div className="w-full sm:text-7xl whitespace-nowrap text-3xl my-5 homeshimmer"><span className={"font-bold"}>KEWL.</span>EXCHANGE</div>

                </h1>

                <div className="hidden w-full h-px animate-glow md:block animate-fade-right bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
                <div className="my-16 text-center animate-fade-in">
                    <h2 className="text-sm text-zinc-500 ">
                        Join the fully community-driven revolution of decentralized finance on the blockchain with the power of revolutionary technology.
                    </h2>
                </div>



                <HighlightGroup className="z-0 grid gap-4 grid-cols-2 sm:grid-cols-3 group">


                    <HighlighterItem>

                        <div className="relative h-full bg-zinc-900 rounded-[inherit] z-20 overflow-hidden">
                            <Link as={NavLink} to={`/swap`}>
                                <div className="flex flex-col">
                                    {/* Radial gradient */}
                                    <div
                                        className="absolute bottom-0 w-1/2 pointer-events-none -translate-x-1/2 translate-y-1/2 left-1/2 -z-10 aspect-square"
                                        aria-hidden="true"
                                    >
                                        <div className="absolute inset-0 translate-z-0 bg-zinc-800 rounded-full blur-[80px]" />
                                    </div>
                                    {/* Text */}

                                    <div className="px-4 py-8">

                                        <article className="relative w-full h-full">
                                            <h2 className="sm:text-4xl text-2xl inline-flex items-baseline font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-200/60 via-zinc-200 to-zinc-200/60">
                                                {t("Swap")}
                                            </h2>
                                        </article>

                                    </div>
                                </div>
                            </Link>
                        </div>

                    </HighlighterItem>
                    <HighlighterItem>
                        <div className="relative h-full bg-zinc-900 rounded-[inherit] z-20 overflow-hidden">
                            <Link as={NavLink} to={`/nfts`}>
                                <div className="flex flex-col">
                                    {/* Radial gradient */}
                                    <div
                                        className="absolute bottom-0 w-1/2 pointer-events-none -translate-x-1/2 translate-y-1/2 left-1/2 -z-10 aspect-square"
                                        aria-hidden="true"
                                    >
                                        <div className="absolute inset-0 translate-z-0 bg-zinc-800 rounded-full blur-[80px]" />
                                    </div>
                                    {/* Text */}

                                    <div className="px-4 py-8">

                                        <article className="relative w-full h-full">
                                            <h2 className="sm:text-4xl text-2xl inline-flex items-baseline font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-200/60 via-zinc-200 to-zinc-200/60">
                                                {t("NFT Market")}
                                            </h2>
                                        </article>


                                    </div>
                                </div>
                            </Link>
                        </div>
                    </HighlighterItem>
                    <HighlighterItem>
                        <div className="relative h-full bg-zinc-900 rounded-[inherit] z-20 overflow-hidden">
                            <Link as={NavLink} to={`/earn`}>
                                <div className="flex flex-col">
                                    {/* Radial gradient */}
                                    <div
                                        className="absolute bottom-0 w-1/2 pointer-events-none -translate-x-1/2 translate-y-1/2 left-1/2 -z-10 aspect-square"
                                        aria-hidden="true"
                                    >
                                        <div className="absolute inset-0 translate-z-0 bg-zinc-800 rounded-full blur-[80px]" />
                                    </div>
                                    {/* Text */}

                                    <div className="px-4 py-8">

                                        <article className="relative w-full h-full">
                                            <h2 className="sm:text-4xl text-2xl inline-flex items-baseline font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-200/60 via-zinc-200 to-zinc-200/60">
                                                {t("Earn")}
                                            </h2>
                                        </article>

                                    </div>
                                </div>
                            </Link>
                        </div>
                    </HighlighterItem>

                    <HighlighterItem>
                        <div className="relative h-full bg-zinc-900 rounded-[inherit] z-20 overflow-hidden">
                            <Link as={NavLink} to={`/cns`}>
                                <div className="flex flex-col">
                                    {/* Radial gradient */}
                                    <div
                                        className="absolute bottom-0 w-1/2 pointer-events-none -translate-x-1/2 translate-y-1/2 left-1/2 -z-10 aspect-square"
                                        aria-hidden="true"
                                    >
                                        <div className="absolute inset-0 translate-z-0 bg-zinc-800 rounded-full blur-[80px]" />
                                    </div>
                                    {/* Text */}

                                    <div className="px-4 py-8">

                                        <article className="relative w-full h-full">
                                            <h2 className="sm:text-4xl text-2xl inline-flex items-baseline font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-200/60 via-zinc-200 to-zinc-200/60">
                                                {t("Domains")}
                                            </h2>
                                        </article>

                                    </div>
                                </div>
                            </Link>
                        </div>
                    </HighlighterItem>
                    <HighlighterItem>
                        <div className="relative h-full bg-zinc-900 rounded-[inherit] z-20 overflow-hidden">
                            <Link as={NavLink} to={`/launchpad`}>

                                <div className="flex flex-col">
                                    {/* Radial gradient */}
                                    <div
                                        className="absolute bottom-0 w-1/2 pointer-events-none -translate-x-1/2 translate-y-1/2 left-1/2 -z-10 aspect-square"
                                        aria-hidden="true"
                                    >
                                        <div className="absolute inset-0 translate-z-0 bg-zinc-800 rounded-full blur-[80px]" />
                                    </div>
                                    {/* Text */}

                                    <div className="px-4 py-8">
                                        <article className="relative w-full h-full">
                                            <h2 className="sm:text-4xl text-2xl inline-flex items-baseline font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-200/60 via-zinc-200 to-zinc-200/60">
                                                {t("Launchpad")}
                                            </h2>
                                        </article>


                                    </div>
                                </div>
                            </Link>
                        </div>
                    </HighlighterItem>
                    <HighlighterItem>
                        <div className="relative w-full h-full bg-zinc-900 rounded-[inherit] z-20 overflow-hidden">
                            <Link className="w-full" as={NavLink} to={"/euro2024"}>

                                <div className="flex flex-col">
                                    {/* Radial gradient */}
                                    <div
                                        className="absolute bottom-0 w-1/2 pointer-events-none -translate-x-1/2 translate-y-1/2 left-1/2 -z-10 aspect-square"
                                        aria-hidden="true"
                                    >
                                        <div className="absolute inset-0 translate-z-0 bg-zinc-800 rounded-full blur-[80px]" />
                                    </div>
                                    {/* Text */}

                                    <div className="px-4 py-8">
                                        <article className="relative w-full h-full">
                                            <h2 className="sm:text-4xl text-2xl inline-flex items-baseline font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-200/60 via-zinc-200 to-zinc-200/60">
                                                {t("EURO 2024")}
                                            </h2>
                                        </article>


                                    </div>

                                </div>
                            </Link>
                        </div>
                    </HighlighterItem>

                </HighlightGroup>



            </div>


            <div className="flex flex-col w-full px-3 gap-4 items-center">

          

                <div className="container w-full flex flex-col gap-2 items-center text-center justify-center py-10 ">
                    <div className="w-full text-center">
                        <h1 className={"text-3xl"}>Community</h1>
                    </div>
                    <div className="w-full text-center mt-5 ">Get involved in our community. Everyone is welcome!</div>




                    <SocialLinks className={"w-full my-auto"} />
                    <div className='w-full flex items-center justify-center py-5 my-5'>
                        <a target="_blank" href="https://dorahacks.io/buidl/13943"><img src="https://cdn.dorahacks.io/images/buidl-embed/colored-simple.png" height="33" width="84" /></a>
                    </div>
                </div>
            </div>
        </>




    )
}


export default HomePage;
