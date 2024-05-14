import IPage from "@/interfaces/page";
import React, { createRef, useEffect, useState } from "react";
import Plinko from "@/components/Plinko";
import PLINKO_LOGO from "./assets/plinko.png"
import CHILIMOTION_LOGO from "./assets/chilimotion.png";
import CHILI_STRIKE_LOGO from "./assets/chiliator.gif"

import { Button, Card,CardBody,CardFooter,CardHeader,Image } from "@nextui-org/react";
import { NavLink } from "react-router-dom";
import { title } from "../../Components/Primitives";
import {isIMON, isPonyGames} from "../../hooks/useDomains";

const GamesPage: React.FunctionComponent<IPage> = props => {
    useEffect(() => {
        if(isPonyGames()){
            document.title = props.title + " - Pony Games - Elevate Your Gaming Experience with Our Route to Triumph and Beyond!.";
        }else if(isIMON()){
            document.title = props.title + " - KEWL EXCHANGE";
        }
    }, []);


    return (

        <>

            <div className={" sm:w-full max-w-xl min-w-xl h-full rounded-lg mx-auto my-5 p-4"}>
                <div className=" grid  grid-cols-1  gap-8 rounded-lg">

                <Card>
                    <CardHeader>
                    <span className={title({size:"md",color:isIMON() ? "red" : "indigo"})}>Chiliator</span>

                    </CardHeader>
                    <CardBody>
                    <Image radius="lg" isZoomed isBlurred shadow="lg" src={CHILI_STRIKE_LOGO} alt="Chiliator" />
                        <div className="px-6 py-4 flex flex-col gap-2">
                            <div className="flex flex-row items-center justify-between mb-2">
                            </div>
                            <p className="text-base">
                                Experience the premier online betting sensation with Chiliator Game! Dive into this renowned online casino game where genuine cash rewards await.
                            </p>

                        </div>
                        <div className="px-6 pt-4 pb-2">
                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#NFT</span>
                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#FPS</span>
                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#P2E</span>
                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#Unity</span>
                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#Game</span>
                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#Battle</span>
                        </div>
                    </CardBody>
                    <CardFooter className="flex hidden items-center justify-end">
                    <Button size={"sm"} variant="shadow" color={isIMON() ? "danger" : "secondary"} as={NavLink} to="/games/chiliator">Play Now</Button>

                    </CardFooter>


                    </Card>


                    <Card>
                        <CardHeader>
                        <span className={title({size:"md",color:isIMON() ? "red" : "indigo"})}>Plinko</span>

                        </CardHeader>
                        <CardBody>
                        <Image radius="lg" isZoomed isBlurred shadow="lg" src={PLINKO_LOGO} alt="Plinko" />
                        <div className="px-6 py-4 flex flex-col gap-2">
                            <div className="flex flex-row items-center justify-between mb-2">
                            </div>
                            <p className="text-base">
                            Plinko is a carnival-style liquidity provider game that is both entertaining and unpredictable.
                            </p>

                        </div>
                        <div className="px-6 pt-4 pb-2">
                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#NFT</span>
                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#Liquidity</span>
                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#Airdrop</span>
                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#Game</span>
                        </div>
                        </CardBody>
                        <CardFooter className="flex hidden items-center justify-end">
                        <Button size={"sm"} variant="shadow" color={isIMON() ? "danger" : "secondary"} as={NavLink} to="/games/plinko">Play Now</Button>

                        </CardFooter>

                    </Card>





                </div>
            </div>
        </>
    )
}


export default GamesPage;
