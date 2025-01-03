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
import { Navbar, NavbarBrand, NavbarMenuToggle, NavbarMenuItem, NavbarMenu, NavbarContent, NavbarItem, Link, Button, Dropdown, DropdownTrigger, DropdownItem, Avatar, DropdownMenu, DropdownSection, User, Badge, Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { Network } from './Components/Network';
import { DropdownNetwork } from './Components/DropdownNetwork';
import { LandingBG } from './Components/Landing';


const ReactAudioPlayerEx = process.env.NODE_ENV === 'production' ? (ReactAudioPlayer as any).default : ReactAudioPlayer;
const App = () => {

  const { state: isConnect, toggle: toggleConnectModal } = useModal()
  const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
  const { state: isShowWallet, toggle: toggleWalletModal } = useModal()
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
    <>
      <BrowserRouter>

        <UniwalletModal />
        <ModalConnect isShowing={isConnect} hide={toggleConnectModal} />
        <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />
        <ModalShowWallet onDisconnect={() => {
          handleDisconnect();
        }} isClosable={true} address={account} isShowing={isShowWallet} hide={toggleWalletModal} />



        <Navbar
          shouldHideOnScroll={false} maxWidth={"full"} position="sticky"
          isMenuOpen={isMenuOpen}

          onMenuOpenChange={setIsMenuOpen}
        >
         
          <NavbarContent  justify="start">
          <NavbarItem>

          <NavbarBrand as={NavLink} to={"/"}>
              <img className={"h-[45px] w-[45px]"} alt={"Intelligent Monsters Logo"} src={ICON_LOGO} />
            </NavbarBrand>
            </NavbarItem>
   
            <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
            
          </NavbarContent>

      
    

 

          <NavbarContent justify="end">

            {
              account ? <>

                <Dropdown
                  showArrow

                  radius="sm"
                  classNames={{
                    base: "before:bg-default-200", // change arrow background
                    content: "py-1 px-1 border border-default-200 bg-gradient-to-br from-white to-default-200 dark:from-default-50 dark:to-black",
                  }}
                >
                  <DropdownTrigger>
                    <Button variant='flat' radius={"lg"} className='px-2'>
                      <Account />
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
                <Button variant='solid' color='default' onPress={async () => {
                  await handleConnect();
                }}>Connect</Button>
              </>
            }
          </NavbarContent>

          <NavbarMenu className='z-[99999]'>

            <NavbarMenuItem className='flex flex-row items-center justify-start'>
              
              
              <Link onPress={(e) => {
                setIsMenuOpen(false)
                e.stopPropagation();
              }} color="foreground" as={NavLink} to={"/swap"} >
                <span className='text-3xl'>{t("Swap")}</span>
                </Link>
            </NavbarMenuItem>

            <NavbarMenuItem className='flex flex-row items-center justify-start'>
              <Link onPress={(e) => {
                setIsMenuOpen(false)
                e.stopPropagation();
              }} color="foreground" as={NavLink} to={"/nfts"}>

                <span className='text-3xl'>{t("NFT Marketplace")}</span></Link>
            </NavbarMenuItem>


            <NavbarMenuItem className='flex flex-row items-center justify-start'>
              <Link onPress={(e) => {
                setIsMenuOpen(false)
                e.stopPropagation();
              }} color="foreground" as={NavLink} to={"/earn"}>

                <span className='text-3xl'>{t("Earn")}</span></Link>
            </NavbarMenuItem>

            <NavbarMenuItem className='flex flex-row items-center justify-start'>
              <Link onPress={(e) => {
                setIsMenuOpen(false)
                e.stopPropagation();
              }} color="foreground" as={NavLink} to={"/cns"}>

                <span className='text-3xl'>{t("Domains")}</span></Link>
            </NavbarMenuItem>


            <NavbarMenuItem className='flex flex-row items-start justify-start'>
              <Link onPress={(e) => {
                setIsMenuOpen(false)
                e.stopPropagation();
              }} color="foreground" as={NavLink} to={"/launchpad"}>

                <span className='text-3xl'>{t("Launchpad")}</span></Link>
            </NavbarMenuItem>


            <NavbarMenuItem className='flex flex-row items-center justify-start'>
              <Link onPress={(e) => {
                setIsMenuOpen(false)
                e.stopPropagation();
              }} color="foreground" as={NavLink} to={"/metamorph"}>

                <span className='text-3xl'>{t("Metamorph")}</span></Link>
            </NavbarMenuItem>


            <NavbarMenuItem className='flex flex-row items-center justify-start'>
              <Link onPress={(e) => {
                setIsMenuOpen(false)
                e.stopPropagation();
              }} color="foreground" as={NavLink} to={"/vesting"}>

                <span className='text-3xl'>{t("Vesting")}</span></Link>
            </NavbarMenuItem>


            <NavbarMenuItem className='flex flex-row items-center justify-start'>
              <Link onPress={(e) => {
                setIsMenuOpen(false)
                e.stopPropagation();
              }} color="foreground" as={NavLink} to={"/explorer"}>

                <span className='text-3xl'>{t("Explorer")}</span></Link>
            </NavbarMenuItem>






          </NavbarMenu>
        </Navbar>


        <div className={"pb-[70px] flex flex-col items-center justify-center w-screen h-full"}>
       
       
        <Routes>
  {routes.map((route, index) => (
    <Route
      key={`route${index}`}
      path={route.path}
      element={
        !route.full ? (
          <Card  shadow='none' fullWidth className='h-full'>
            <CardBody>
              <route.component title={route.title} />
            </CardBody>
          </Card>
        ) : (
          <route.component title={route.title} />
        )
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

    </>


  );
}


export default function () {
  return (<>
    <Head />
    <Web3Provider>
      <BlockNumberProvider>
        <App />
      </BlockNumberProvider>
    </Web3Provider>
  </>
  )
}
