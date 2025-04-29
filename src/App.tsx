import React, { useEffect, useState, useRef, useCallback, useMemo, useLayoutEffect } from 'react';
import { BrowserRouter, Route, NavLink, Routes, useNavigate, Outlet } from 'react-router-dom';
import routes from "./config/route";
import useModal, { ModalLoading, ModalShowWallet, ModalNoProvider, ModalConnect } from "./hooks/useModals"
import { BLOCKCHAINS, isSupportedChain, ChainId } from './constants/chains'
import { useWeb3React } from '@web3-react/core'
import { ethers } from "ethers";
import { useFindNetworkByChainId } from "./hooks/useContract";

import ICON_LOGO from './assets/images/platform/svg/kewl-pink.svg';

import useBlockNumber, { BlockNumberProvider } from "./hooks/useBlockNumber";
import { Connector } from "@web3-react/types";
import { useAppDispatch, useAppSelector } from "./state/hooks";
import { updateConnectionError } from "./state/connection/reducer";
import {
  updateSelectedWallet,
  updateUserBalance
} from "./state/user/reducer";
import Identicon from "./Components/Identicon";
import { getIconByChainId, getNativeCurrencyByChainId } from "./utils";
import { useActivationState } from "./connection/activate";
import UniwalletModal from "./Components/Modal/UniwalletModal";
import ReactAudioPlayer from "react-audio-player";
import { Volume } from "./Components/Volume";
import { useTranslation } from 'react-i18next';
import Web3Provider from "./Components/Web3Provider";
import { isIMON, isCHZDomains } from './hooks/useDomains';
import Head from './Components/Head/imon';
import { Account } from './Components/Account';
import { ThemeSwitch } from './Components/ThemeSwitch';
import { Image, Navbar, NavbarBrand, NavbarMenuToggle, NavbarMenuItem, NavbarMenu, NavbarContent, NavbarItem, Link, Button, Dropdown, DropdownTrigger, DropdownItem, Avatar, DropdownMenu, DropdownSection, User, Badge, Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { Network } from './Components/Network';
import { DropdownNetwork } from './Components/DropdownNetwork';
import { LandingBG } from './Components/Landing';
import { LeftMenu } from './Components/LeftMenu';
import { icons, Menu, WalletIcon } from 'lucide-react';
import Cobe from './Components/Cobe';
import { NetworkHeader } from './Components/NetworkHeader';
import { GitCompareArrows, ScanEye, Image as ImageIcon, Coins, Sparkles, Globe, PiggyBank, Rocket, Clock } from 'lucide-react';


const ReactAudioPlayerEx = process.env.NODE_ENV === 'production' ? (ReactAudioPlayer as any).default : ReactAudioPlayer;
const App = () => {

  const { state: isConnect, toggle: toggleConnectModal } = useModal()
  const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
  const { state: isShowWallet, toggle: toggleWalletModal } = useModal()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const { state: isTimeLockEnabled, toggle: toggleTimeLock } = useModal()
  const { connector, account, provider, chainId } = useWeb3React()
  const dispatch = useAppDispatch()
  const blockNumber = useBlockNumber()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const userBalance = useAppSelector((state) => state.user.userBalance);
  const componentMounted = useRef(true);
  const [isLoaded, setLoaded] = useState(false)
  const audioElement = useRef(null)
  const [showBalance, setShowBalance] = useState(true)
  const { t, i18n } = useTranslation(['home']);
  const [scrollPosition, setScrollPosition] = useState(0);
  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };


  const { state: isHeaderMenuOpen, toggle: toggleHeaderMenu } = useModal()

  const ref = useRef()

  function useCloseAccountDrawer() {

  }
  const { activationState, tryActivation } = useActivationState()
  const closeDrawer = useCloseAccountDrawer()
  //const activate = () => tryActivation(ConnectionType.INJECTED, closeDrawer)
  //
  // const tryActivation = useCallback(
  //   async (connector: Connector) => {
  //     const connectionType = getConnection(connector).type
  //     try {
  //       // setPendingConnector(connector)
  //       // setWalletView(WALLET_VIEWS.PENDING)
  //       dispatch(updateConnectionError({ connectionType, error: undefined }))
  //       await connector.activate()
  //       dispatch(updateSelectedWallet({ wallet: connectionType }))
  //     } catch (error) {
  //
  //       toggleNoProvider();
  //       console.debug(`web3-react connection error: ${error}`)
  //       // @ts-ignore
  //       dispatch(updateConnectionError({ connectionType, error: error?.message }))
  //     }
  //   },
  //   [dispatch]
  // )

  useEffect(() => {
  }, [account, chainId])



  useEffect(() => {
    // if (chainId && connector !== networkConnection.connector) {
    //   injectedConnection.connector.activate(chainId)
    // }
  }, [chainId, connector])

  const openExplorer = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    let explorer = useFindNetworkByChainId(chainId).networkData.blockExplorerUrls[0]
    explorer = explorer + "/address/" + account;
    window.open(explorer, "_blank");
    return true;
  }
  const gotoTop = (e) => {

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const loadBalance = async () => {
    return await provider.getBalance(account);
  }

  useEffect((): any => {

    if (!!account && !!provider) {
      (async () => {
        setLoaded(false);
        let _balance = await loadBalance();
        let currentChainSymbol = getNativeCurrencyByChainId(chainId)
        let szBalance = `${parseFloat(ethers.utils.formatEther(_balance)).toFixed(6)} ${currentChainSymbol}`
        dispatch(updateUserBalance({ balance: szBalance }))
        setLoaded(true);
      })();
    }
  }, [account, chainId])



  const handleConnect = async () => {
    toggleConnectModal()
    //tryActivation(injectedConnection.connector)
  }





  const disconnect = useCallback(() => {
    if (connector && connector.deactivate) {
      connector.deactivate()
    }
    connector.resetState()
    dispatch(updateSelectedWallet({ wallet: undefined }))
  }, [connector, dispatch])

  const handleDisconnect = async () => {
    disconnect();
    toggleWalletModal();
  }


  useEffect(() => {
    if (account) {
      if (isConnect) {
        toggleConnectModal();
      }
    }

  }, [account])



  useEffect(() => {
    i18n.changeLanguage('en')
  }, [])
  return (
    <div className='relative w-full h-full'>
      <BrowserRouter>

        <UniwalletModal />
        <ModalConnect isShowing={isConnect} hide={toggleConnectModal} />
        <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />
        <ModalShowWallet onDisconnect={() => {
          handleDisconnect();
        }} isClosable={true} address={account} isShowing={isShowWallet} hide={toggleWalletModal} />


        <div className='w-full fixed z-[1] top-[5px]'>
          <div className="absolute top-3 px-2 w-full z-40 flex items-center justify-center">
            <Navbar
              classNames={{
                wrapper: [
                  "rounded-full px-2",
                  "bg-white/[0.05] dark:bg-black/[0.05]",
                  "backdrop-blur-xl",
                  "border border-violet-500/20",
                  "shadow-[0_0_15px_rgba(139,92,246,0.1)]",
                  "hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]",
                  "transition-all duration-300"
                ].join(" "),
                base: [
                  "rounded-full z-990",
                  "flex gap-4",
                  "flex-row relative flex-nowrap",
                  "items-center h-[var(--navbar-height)]",
                  "max-w-[1024px] px-0 w-full justify-center",
                  "bg-transparent"
                ].join(" ")
              }}
              isBlurred={true}
              isBordered={false}
              isMenuOpen={isDrawerOpen}
              onMenuOpenChange={setIsDrawerOpen}
            >
              <Dropdown
                showArrow
                radius="sm"
                classNames={{
                  base: [
                    "before:bg-gradient-to-r before:from-violet-500/20 before:to-fuchsia-500/20",
                    "before:blur-sm"
                  ].join(" "),
                  content: [
                    "py-3 px-2",
                    "border border-violet-500/20",
                    "bg-white/80 dark:bg-black/80",
                    "backdrop-blur-2xl",
                    "shadow-[0_0_25px_rgba(139,92,246,0.15)]",
                    "dark:shadow-[0_0_25px_rgba(139,92,246,0.1)]",
                    "group",
                    "relative",
                    "after:absolute after:inset-0 after:rounded-xl",
                    "after:bg-gradient-to-b after:from-violet-500/[0.03] after:to-transparent",
                    "after:pointer-events-none"
                  ].join(" "),
                  item: [
                    "text-sm",
                    "text-violet-600 dark:text-violet-300",
                    "transition-all duration-300",
                    "data-[hover=true]:bg-gradient-to-r",
                    "data-[hover=true]:from-violet-500/10",
                    "data-[hover=true]:to-fuchsia-500/10",
                    "data-[hover=true]:text-violet-600 dark:data-[hover=true]:text-violet-200",
                    "rounded-lg",
                    "gap-2",
                    "relative",
                    "overflow-hidden",
                    "group/item"
                  ].join(" ")
                }}
              >
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    radius="full"
                    variant="light"
                    className="bg-violet-500/10 hover:bg-violet-500/20 transition-colors group"
                  >
                    <Menu className="w-5 h-5 text-violet-500 group-hover:text-violet-600 transition-colors" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="KEWL"
                  className="w-[340px] p-2"
                  itemClasses={{
                    base: [
                      "gap-4",
                      "data-[hover=true]:scale-[0.98]",
                      "active:scale-95",
                      "rounded-lg",
                      "transition-all duration-200",
                      "data-[hover=true]:text-violet-500",
                      "dark:data-[hover=true]:text-violet-300",
                      "relative"
                    ].join(" "),
                  }}
                >
                  <DropdownItem key={"swap"} className="group/item">
                    <Link 
                      className="w-full flex items-center gap-3 relative p-2" 
                      onPress={() => setIsMenuOpen(false)} 
                      color="foreground" 
                      as={NavLink} 
                      to={"/swap"}
                    >
                      {/* Hover background effect */}
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                        bg-gradient-to-r from-violet-500/[0.03] via-fuchsia-500/[0.05] to-violet-500/[0.03]
                        transition-opacity duration-300" />

                      {/* Hover border glow */}
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                        bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20
                        blur-xl transition-opacity duration-300" />

                      {/* Shimmer effect */}
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                        bg-gradient-to-r from-transparent via-white/5 to-transparent
                        translate-x-[-100%] group-hover/item:translate-x-[100%]
                        transition-all duration-1000 ease-in-out" />

                      {/* Icon container */}
                      <div className="relative w-10 h-10 rounded-xl 
                        bg-gradient-to-br from-violet-500/[0.05] to-fuchsia-500/[0.05]
                        group-hover/item:from-violet-500/[0.1] group-hover/item:to-fuchsia-500/[0.1]
                        flex items-center justify-center
                        overflow-hidden transition-all duration-300
                        shadow-[0_0_0_1px_rgba(139,92,246,0.1)]
                        group-hover/item:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 
                          opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        <GitCompareArrows className="w-5 h-5 text-violet-500 group-hover/item:text-violet-400 
                          transition-colors relative z-10" />
                      </div>

                      {/* Text content */}
                      <div className="relative flex flex-col z-10">
                        <span className="text-sm font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500
                          bg-clip-text text-transparent
                          group-hover/item:from-violet-400 group-hover/item:to-fuchsia-400
                          transition-all duration-300">
                          {t("Swap")}
                        </span>
                        <span className="text-xs text-violet-500/60 group-hover/item:text-violet-400/80 
                          transition-colors">
                          Exchange your tokens
                        </span>
                      </div>
                    </Link>
                  </DropdownItem>

                  <DropdownItem key={"nfts"} className="group/item">
                      <Link 
                        className="w-full flex items-center gap-3 relative p-2" 
                        onPress={() => setIsMenuOpen(false)} 
                        color="foreground" 
                        as={NavLink} 
                        to={"/nfts"}
                      >
                        {/* Hover background effect */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-violet-500/[0.03] via-fuchsia-500/[0.05] to-violet-500/[0.03]
                          transition-opacity duration-300" />

                        {/* Hover border glow */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20
                          blur-xl transition-opacity duration-300" />

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-transparent via-white/5 to-transparent
                          translate-x-[-100%] group-hover/item:translate-x-[100%]
                          transition-all duration-1000 ease-in-out" />

                        {/* Icon container */}
                        <div className="relative w-10 h-10 rounded-xl 
                          bg-gradient-to-br from-violet-500/[0.05] to-fuchsia-500/[0.05]
                          group-hover/item:from-violet-500/[0.1] group-hover/item:to-fuchsia-500/[0.1]
                          flex items-center justify-center
                          overflow-hidden transition-all duration-300
                          shadow-[0_0_0_1px_rgba(139,92,246,0.1)]
                          group-hover/item:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 
                            opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          <ImageIcon className="w-5 h-5 text-violet-500 group-hover/item:text-violet-400 
                            transition-colors relative z-10" />
                        </div>

                        {/* Text content */}
                        <div className="relative flex flex-col z-10">
                          <span className="text-sm font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500
                            bg-clip-text text-transparent
                            group-hover/item:from-violet-400 group-hover/item:to-fuchsia-400
                            transition-all duration-300">
                            {t("NFTs")}
                          </span>
                          <span className="text-xs text-violet-500/60 group-hover/item:text-violet-400/80 
                            transition-colors">
                            Browse NFT collections
                          </span>
                        </div>
                      </Link>
                    </DropdownItem>

                  <DropdownItem key={"metamorph"} className="group/item">
                      <Link 
                        className="w-full flex items-center gap-3 relative p-2" 
                        onPress={() => setIsMenuOpen(false)} 
                        color="foreground" 
                        as={NavLink} 
                        to={"/metamorph"}
                      >
                        {/* Hover background effect */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-violet-500/[0.03] via-fuchsia-500/[0.05] to-violet-500/[0.03]
                          transition-opacity duration-300" />

                        {/* Hover border glow */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20
                          blur-xl transition-opacity duration-300" />

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-transparent via-white/5 to-transparent
                          translate-x-[-100%] group-hover/item:translate-x-[100%]
                          transition-all duration-1000 ease-in-out" />

                        {/* Icon container */}
                        <div className="relative w-10 h-10 rounded-xl 
                          bg-gradient-to-br from-violet-500/[0.05] to-fuchsia-500/[0.05]
                          group-hover/item:from-violet-500/[0.1] group-hover/item:to-fuchsia-500/[0.1]
                          flex items-center justify-center
                          overflow-hidden transition-all duration-300
                          shadow-[0_0_0_1px_rgba(139,92,246,0.1)]
                          group-hover/item:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 
                            opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          <Sparkles className="w-5 h-5 text-violet-500 group-hover/item:text-violet-400 
                            transition-colors relative z-10" />
                        </div>

                        {/* Text content */}
                        <div className="relative flex flex-col z-10">
                          <span className="text-sm font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500
                            bg-clip-text text-transparent
                            group-hover/item:from-violet-400 group-hover/item:to-fuchsia-400
                            transition-all duration-300">
                            {t("Metamorph")}
                          </span>
                          <span className="text-xs text-violet-500/60 group-hover/item:text-violet-400/80 
                            transition-colors">
                            Transform your assets
                          </span>
                        </div>
                      </Link>
                    </DropdownItem>
                    

                  {chainId && chainId == ChainId.CHILIZ_MAINNET && (
                    <>
                      <DropdownItem key={"reflection"} className="group/item">
                        <Link 
                          className="w-full flex items-center gap-3 relative p-2" 
                          onPress={() => setIsMenuOpen(false)} 
                          color="foreground" 
                          as={NavLink} 
                          to={"/reflection"}
                        >
                          {/* Hover background effect */}
                          <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                            bg-gradient-to-r from-violet-500/[0.03] via-fuchsia-500/[0.05] to-violet-500/[0.03]
                            transition-opacity duration-300" />

                          {/* Hover border glow */}
                          <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                            bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20
                            blur-xl transition-opacity duration-300" />

                          {/* Shimmer effect */}
                          <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                            bg-gradient-to-r from-transparent via-white/5 to-transparent
                            translate-x-[-100%] group-hover/item:translate-x-[100%]
                            transition-all duration-1000 ease-in-out" />

                          {/* Icon container */}
                          <div className="relative w-10 h-10 rounded-xl 
                            bg-gradient-to-br from-violet-500/[0.05] to-fuchsia-500/[0.05]
                            group-hover/item:from-violet-500/[0.1] group-hover/item:to-fuchsia-500/[0.1]
                            flex items-center justify-center
                            overflow-hidden transition-all duration-300
                            shadow-[0_0_0_1px_rgba(139,92,246,0.1)]
                            group-hover/item:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 
                              opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            <ScanEye className="w-5 h-5 text-violet-500 group-hover/item:text-violet-400 
                              transition-colors relative z-10" />
                          </div>

                          {/* Text content */}
                          <div className="relative flex flex-col z-10">
                            <span className="text-sm font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500
                              bg-clip-text text-transparent
                              group-hover/item:from-violet-400 group-hover/item:to-fuchsia-400
                              transition-all duration-300">
                              {t("Reflection")}
                            </span>
                            <span className="text-xs text-violet-500/60 group-hover/item:text-violet-400/80 
                              transition-colors">
                              Multi hop trading
                            </span>
                          </div>
                        </Link>
                      </DropdownItem>
                    </>
                  )}

 
               

                  {chainId && chainId == ChainId.CHILIZ_MAINNET ? <>

                    <DropdownItem key={"nfts"} className="group/item">
                      <Link 
                        className="w-full flex items-center gap-3 relative p-2" 
                        onPress={() => setIsMenuOpen(false)} 
                        color="foreground" 
                        as={NavLink} 
                        to={"/nfts"}
                      >
                        {/* Hover background effect */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-violet-500/[0.03] via-fuchsia-500/[0.05] to-violet-500/[0.03]
                          transition-opacity duration-300" />

                        {/* Hover border glow */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20
                          blur-xl transition-opacity duration-300" />

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-transparent via-white/5 to-transparent
                          translate-x-[-100%] group-hover/item:translate-x-[100%]
                          transition-all duration-1000 ease-in-out" />

                        {/* Icon container */}
                        <div className="relative w-10 h-10 rounded-xl 
                          bg-gradient-to-br from-violet-500/[0.05] to-fuchsia-500/[0.05]
                          group-hover/item:from-violet-500/[0.1] group-hover/item:to-fuchsia-500/[0.1]
                          flex items-center justify-center
                          overflow-hidden transition-all duration-300
                          shadow-[0_0_0_1px_rgba(139,92,246,0.1)]
                          group-hover/item:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 
                            opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          <ImageIcon className="w-5 h-5 text-violet-500 group-hover/item:text-violet-400 
                            transition-colors relative z-10" />
                        </div>

                        {/* Text content */}
                        <div className="relative flex flex-col z-10">
                          <span className="text-sm font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500
                            bg-clip-text text-transparent
                            group-hover/item:from-violet-400 group-hover/item:to-fuchsia-400
                            transition-all duration-300">
                            {t("NFTs")}
                          </span>
                          <span className="text-xs text-violet-500/60 group-hover/item:text-violet-400/80 
                            transition-colors">
                            Browse NFT collections
                          </span>
                        </div>
                      </Link>
                    </DropdownItem>

                    <DropdownItem key={"token"} className="group/item">
                      <Link 
                        className="w-full flex items-center gap-3 relative p-2" 
                        onPress={() => setIsMenuOpen(false)} 
                        color="foreground" 
                        as={NavLink} 
                        to={"/token"}
                      >
                        {/* Hover background effect */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-violet-500/[0.03] via-fuchsia-500/[0.05] to-violet-500/[0.03]
                          transition-opacity duration-300" />

                        {/* Hover border glow */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20
                          blur-xl transition-opacity duration-300" />

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-transparent via-white/5 to-transparent
                          translate-x-[-100%] group-hover/item:translate-x-[100%]
                          transition-all duration-1000 ease-in-out" />

                        {/* Icon container */}
                        <div className="relative w-10 h-10 rounded-xl 
                          bg-gradient-to-br from-violet-500/[0.05] to-fuchsia-500/[0.05]
                          group-hover/item:from-violet-500/[0.1] group-hover/item:to-fuchsia-500/[0.1]
                          flex items-center justify-center
                          overflow-hidden transition-all duration-300
                          shadow-[0_0_0_1px_rgba(139,92,246,0.1)]
                          group-hover/item:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 
                            opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          <Coins className="w-5 h-5 text-violet-500 group-hover/item:text-violet-400 
                            transition-colors relative z-10" />
                        </div>

                        {/* Text content */}
                        <div className="relative flex flex-col z-10">
                          <span className="text-sm font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500
                            bg-clip-text text-transparent
                            group-hover/item:from-violet-400 group-hover/item:to-fuchsia-400
                            transition-all duration-300">
                            {t("KWL Token")}
                          </span>
                          <span className="text-xs text-violet-500/60 group-hover/item:text-violet-400/80 
                            transition-colors">
                            Token information
                          </span>
                        </div>
                      </Link>
                    </DropdownItem>

           

                    <DropdownItem key={"cns"} className="group/item">
                      <Link 
                        className="w-full flex items-center gap-3 relative p-2" 
                        onPress={() => setIsMenuOpen(false)} 
                        color="foreground" 
                        as={NavLink} 
                        to={"/cns"}
                      >
                        {/* Hover background effect */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-violet-500/[0.03] via-fuchsia-500/[0.05] to-violet-500/[0.03]
                          transition-opacity duration-300" />

                        {/* Hover border glow */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20
                          blur-xl transition-opacity duration-300" />

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-transparent via-white/5 to-transparent
                          translate-x-[-100%] group-hover/item:translate-x-[100%]
                          transition-all duration-1000 ease-in-out" />

                        {/* Icon container */}
                        <div className="relative w-10 h-10 rounded-xl 
                          bg-gradient-to-br from-violet-500/[0.05] to-fuchsia-500/[0.05]
                          group-hover/item:from-violet-500/[0.1] group-hover/item:to-fuchsia-500/[0.1]
                          flex items-center justify-center
                          overflow-hidden transition-all duration-300
                          shadow-[0_0_0_1px_rgba(139,92,246,0.1)]
                          group-hover/item:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 
                            opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          <Globe className="w-5 h-5 text-violet-500 group-hover/item:text-violet-400 
                            transition-colors relative z-10" />
                        </div>

                        {/* Text content */}
                        <div className="relative flex flex-col z-10">
                          <span className="text-sm font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500
                            bg-clip-text text-transparent
                            group-hover/item:from-violet-400 group-hover/item:to-fuchsia-400
                            transition-all duration-300">
                            {t("Domains")}
                          </span>
                          <span className="text-xs text-violet-500/60 group-hover/item:text-violet-400/80 
                            transition-colors">
                            Manage your domains
                          </span>
                        </div>
                      </Link>
                    </DropdownItem>

                    <DropdownItem key={"earn"} className="group/item">
                      <Link 
                        className="w-full flex items-center gap-3 relative p-2" 
                        onPress={() => setIsMenuOpen(false)} 
                        color="foreground" 
                        as={NavLink} 
                        to={"/earn"}
                      >
                        {/* Hover background effect */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-violet-500/[0.03] via-fuchsia-500/[0.05] to-violet-500/[0.03]
                          transition-opacity duration-300" />

                        {/* Hover border glow */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20
                          blur-xl transition-opacity duration-300" />

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-transparent via-white/5 to-transparent
                          translate-x-[-100%] group-hover/item:translate-x-[100%]
                          transition-all duration-1000 ease-in-out" />

                        {/* Icon container */}
                        <div className="relative w-10 h-10 rounded-xl 
                          bg-gradient-to-br from-violet-500/[0.05] to-fuchsia-500/[0.05]
                          group-hover/item:from-violet-500/[0.1] group-hover/item:to-fuchsia-500/[0.1]
                          flex items-center justify-center
                          overflow-hidden transition-all duration-300
                          shadow-[0_0_0_1px_rgba(139,92,246,0.1)]
                          group-hover/item:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 
                            opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          <PiggyBank className="w-5 h-5 text-violet-500 group-hover/item:text-violet-400 
                            transition-colors relative z-10" />
                        </div>

                        {/* Text content */}
                        <div className="relative flex flex-col z-10">
                          <span className="text-sm font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500
                            bg-clip-text text-transparent
                            group-hover/item:from-violet-400 group-hover/item:to-fuchsia-400
                            transition-all duration-300">
                            {t("Earn")}
                          </span>
                          <span className="text-xs text-violet-500/60 group-hover/item:text-violet-400/80 
                            transition-colors">
                            Stake and earn rewards
                          </span>
                        </div>
                      </Link>
                    </DropdownItem>

                    <DropdownItem key={"launchpad"} className="group/item">
                      <Link 
                        className="w-full flex items-center gap-3 relative p-2" 
                        onPress={() => setIsMenuOpen(false)} 
                        color="foreground" 
                        as={NavLink} 
                        to={"/launchpad"}
                      >
                        {/* Hover background effect */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-violet-500/[0.03] via-fuchsia-500/[0.05] to-violet-500/[0.03]
                          transition-opacity duration-300" />

                        {/* Hover border glow */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20
                          blur-xl transition-opacity duration-300" />

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-transparent via-white/5 to-transparent
                          translate-x-[-100%] group-hover/item:translate-x-[100%]
                          transition-all duration-1000 ease-in-out" />

                        {/* Icon container */}
                        <div className="relative w-10 h-10 rounded-xl 
                          bg-gradient-to-br from-violet-500/[0.05] to-fuchsia-500/[0.05]
                          group-hover/item:from-violet-500/[0.1] group-hover/item:to-fuchsia-500/[0.1]
                          flex items-center justify-center
                          overflow-hidden transition-all duration-300
                          shadow-[0_0_0_1px_rgba(139,92,246,0.1)]
                          group-hover/item:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 
                            opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          <Rocket className="w-5 h-5 text-violet-500 group-hover/item:text-violet-400 
                            transition-colors relative z-10" />
                        </div>

                        {/* Text content */}
                        <div className="relative flex flex-col z-10">
                          <span className="text-sm font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500
                            bg-clip-text text-transparent
                            group-hover/item:from-violet-400 group-hover/item:to-fuchsia-400
                            transition-all duration-300">
                            {t("Launchpad")}
                          </span>
                          <span className="text-xs text-violet-500/60 group-hover/item:text-violet-400/80 
                            transition-colors">
                            Discover new projects
                          </span>
                        </div>
                      </Link>
                    </DropdownItem>

                    <DropdownItem key={"vesting"} className="group/item">
                      <Link 
                        className="w-full flex items-center gap-3 relative p-2" 
                        onPress={() => setIsMenuOpen(false)} 
                        color="foreground" 
                        as={NavLink} 
                        to={"/vesting"}
                      >
                        {/* Hover background effect */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-violet-500/[0.03] via-fuchsia-500/[0.05] to-violet-500/[0.03]
                          transition-opacity duration-300" />

                        {/* Hover border glow */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20
                          blur-xl transition-opacity duration-300" />

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100
                          bg-gradient-to-r from-transparent via-white/5 to-transparent
                          translate-x-[-100%] group-hover/item:translate-x-[100%]
                          transition-all duration-1000 ease-in-out" />

                        {/* Icon container */}
                        <div className="relative w-10 h-10 rounded-xl 
                          bg-gradient-to-br from-violet-500/[0.05] to-fuchsia-500/[0.05]
                          group-hover/item:from-violet-500/[0.1] group-hover/item:to-fuchsia-500/[0.1]
                          flex items-center justify-center
                          overflow-hidden transition-all duration-300
                          shadow-[0_0_0_1px_rgba(139,92,246,0.1)]
                          group-hover/item:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 
                            opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          <Clock className="w-5 h-5 text-violet-500 group-hover/item:text-violet-400 
                            transition-colors relative z-10" />
                        </div>

                        {/* Text content */}
                        <div className="relative flex flex-col z-10">
                          <span className="text-sm font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500
                            bg-clip-text text-transparent
                            group-hover/item:from-violet-400 group-hover/item:to-fuchsia-400
                            transition-all duration-300">
                            {t("Vesting")}
                          </span>
                          <span className="text-xs text-violet-500/60 group-hover/item:text-violet-400/80 
                            transition-colors">
                            Token vesting schedule
                          </span>
                        </div>
                      </Link>
                    </DropdownItem>
                  </>
                    : <></>
                  }



                </DropdownMenu>
              </Dropdown>


              <NavbarBrand>
                <Link href='/' className="group">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20 
                      rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Image
                      className='cursor relative transform group-hover:scale-105 transition-transform duration-300'
                      width={72}
                      height={72}
                      src={ICON_LOGO}
                    />
                  </div>
                </Link>
              </NavbarBrand>
              <NavbarContent>
                <NetworkHeader />
              </NavbarContent>



              <NavbarContent justify="end">
                {
                  account ? <>

                    <Dropdown
                      showArrow
                      radius="sm"
                      classNames={{
                        base: "before:bg-gradient-to-r before:from-violet-500/20 before:to-fuchsia-500/20",
                        content: [
                          "py-2 px-1",
                          "border border-violet-500/20",
                          "bg-white/90 dark:bg-black/90",
                          "backdrop-blur-xl",
                          "shadow-[0_0_25px_rgba(139,92,246,0.1)]",
                          "dark:shadow-[0_0_25px_rgba(139,92,246,0.05)]"
                        ].join(" ")
                      }}
                    >
                      <DropdownTrigger>
                        <Button
                          onPress={async () => {
                            await handleConnect();
                          }}
                          radius="full"
                          size="lg"
                          className="bg-violet-500/10 backdrop-blur-xl
                         border border-violet-500/30
                         text-violet-500 hover:text-violet-400
                         rounded-full
                         shadow-[0_0_15px_rgba(139,92,246,0.3)]
                         hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]
                         transition-all duration-500
                         group relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-violet-500/0
                             translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                          <span className="relative flex flex-col justify-center items-center gap-2">
                            <Account />
                          </span>
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        disabledKeys={["profile"]}
                        className="p-3"
                        variant='faded'
                      >
                        <DropdownSection aria-label="Profile & Actions">
                          <DropdownItem
                            isReadOnly
                            key="profile"
                            className="gap-2 pb-4 opacity-100 focus-nonee outline-none"
                          >
                            <div className='flex flex-row gap-1'>
                              <Identicon size={32} account={account} />
                              <div className='flex flex-col gap-2'>
                                <p className="font-semibold">{userBalance}</p>
                                <p className="text-xs font-semibold">{account}</p>
                              </div>
                            </div>
                          </DropdownItem>
                          <DropdownItem as={NavLink}
                            description="View your wallet's tokens and NFTs in this section."
                            to="/account" key="dashboard">
                            <p className="font-semibold">Portfolio</p>
                          </DropdownItem>
                        </DropdownSection>

                        <DropdownSection title={"Network"} aria-label="Preferences" showDivider>
                          <DropdownItem variant='light'
                            key="connector"
                            className="cursor-default hover:none">
                            <DropdownNetwork />
                          </DropdownItem>
                        </DropdownSection>

                        <DropdownSection aria-label="Preferences" showDivider>
                          <DropdownItem
                            isReadOnly
                            key="theme"
                            className="cursor-default"
                            endContent={
                              <ThemeSwitch />
                            }
                          >
                            Theme
                          </DropdownItem>
                        </DropdownSection>

                        <DropdownSection aria-label="Help & Feedback">
                          <DropdownItem onPress={() => {
                            disconnect();
                          }} key="logout">Disconnect</DropdownItem>
                        </DropdownSection>
                      </DropdownMenu>
                    </Dropdown>

                  </> : <>

                    <Button
                      onPress={async () => {
                        await handleConnect();
                      }}
                      radius="full"
                      size="lg"
                      className="bg-violet-500/10 backdrop-blur-xl
                         border border-violet-500/30
                         text-violet-500 hover:text-violet-400
                         rounded-full
                         shadow-[0_0_15px_rgba(139,92,246,0.3)]
                         hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]
                         transition-all duration-500
                         group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-violet-500/0
                             translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <span className="relative flex items-center gap-2">
                        <WalletIcon className="w-5 h-5" />
                        Connect
                      </span>
                    </Button>
                  </>
                }
              </NavbarContent>








            </Navbar>
          </div>

        </div>






        <div className={"w-screen h-screen overflow-y-scroll  py-[88px] pb-[70px] flex flex-col items-center justify-center w-screen h-full"}>



          <section className="absolute left-0 top-0 z-[0] w-screen h-screen rounded-lg min-h-[90vh] py-32 overflow-hidden">
            {/* Advanced Sci-fi Tech Background */}
            <div className="absolute inset-0">
              {/* Enhanced Holographic Base Layer */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] 
                          from-violet-600/20 via-violet-900/15 to-transparent
                          dark:from-violet-900/30 dark:via-violet-800/20 dark:to-black/90
                          animate-pulse-slow" />
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_deg,violet-500/5_90deg,transparent_180deg)] 
                          animate-spin-slow" />
              </div>

        

              {/* Matrix-style Digital Rain - Moved behind radar */}
              <div className="absolute inset-0 z-[0]">
                {[...Array(25)].map((_, i) => (
                  <div key={i}
                    className="absolute w-[1px] h-full
                            bg-gradient-to-b from-transparent via-violet-500/30 to-transparent
                            animate-digital-rain"
                    style={{
                      left: `${i * 4}%`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: `${1.5 + Math.random() * 2}s`,
                      opacity: 0.5 + Math.random() * 0.5
                    }} />
                ))}
              </div>

          
            </div>
          </section>


          <Routes>
            {routes.map((route, index) => (
              <Route
                key={`route${index}`}
                path={route.path}
                element={
                  <div className='relative w-full px-2 h-full  max-w-5xl'>


                    <route.component title={route.title} />
                  </div>
                }
              />
            ))}
          </Routes>


        </div>





        <div className='flex flex-col items-center justify-center  fixed bottom-0 w-full backdrop-blur-sm'>
          <div className=' footer w-full flex items-center justify-between text-sm px-6'>
            <div className={"font-semibold"}>
              © 2024 - KEWL [KEWL.EXCHANGE]
            </div>

            <div className='flex items-center font-semibold justify-end gap-x-1'>
              <div className='w-2 h-2  bg-green-600 animate-pulse rounded-full mt-0.5'></div>
              {blockNumber}
            </div>
          </div>

        </div>

      </BrowserRouter>

    </div>


  );
}


export default function () {
  return (<>
      <Web3Provider>
    <Head />

      <BlockNumberProvider>
        <App />
      </BlockNumberProvider>
    </Web3Provider>
  </>
  )
}
