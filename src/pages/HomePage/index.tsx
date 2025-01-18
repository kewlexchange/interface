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
import TokenInfo from "../TokenInfo";
import TokenInfoComponent from "../../Components/TokenInfoComponent";
import Cobe from "../../Components/Cobe";

const HomePage: React.FunctionComponent<IPage> = props => {
    const { chainId, account } = useWeb3React()
    const { t, i18n } = useTranslation(['home']);

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);

    return (
        <div className="absolute left-0 top-0 w-screen h-screen  flex flex-col gap-2 items-center justify-center">
            <div className="w-full ">
            </div>
            </div>
     
    )
}


export default HomePage;
