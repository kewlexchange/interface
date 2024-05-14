import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Tabs, Tab, Card, CardBody, CardHeader, CardFooter, Button, Table, TableHeader, TableColumn, TableBody, TableCell, TableRow, Image } from "@nextui-org/react";
import Identicon from "../../Components/Identicon";
import { Route, Routes, useLocation } from "react-router-dom";
import { SWAP_TAB } from "../../Components/SwapComponents/Swap";
import { POOL_TAB } from "../../Components/SwapComponents/Pools";
import { SETTINGS_TAB } from "../../Components/SwapComponents/Settings";
import { STAKE_TAB } from "../../Components/StakeTabs/Stake";
import { UNSTAKE_TAB } from "../../Components/StakeTabs/Unstake";
import { useWeb3React } from "@web3-react/core";
import { BRIDGE_TAB } from "../../Components/BridgeTabs/Bridge";
import { BRIDGE_STATUS_TAB } from "../../Components/BridgeTabs/Status";
import { fetchAllTokenList } from "../../state/user/hooks";
import { useAppSelector } from "../../state/hooks";
import { title } from "../../Components/Primitives";
import { useERC20Contract, useKEWLMigratorContract } from "../../hooks/useContract";
import { formatEther, parseEther } from "@ethersproject/units";
import { ChainId } from "../../constants/chains";
import useModal, { ModalError, ModalLoading, ModalSuccessTransaction } from "../../hooks/useModals";


const MigratePage: React.FunctionComponent<IPage> = props => {
    const { pathname } = useLocation();
    const { connector, account, provider, chainId } = useWeb3React()
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])
    const [baseAsset, setBaseAsset] = useState(null)
    const [quoteAsset, setQuoteAsset] = useState(null)
    const [baseBalance,setBaseBalance] = useState(parseEther("0"))
    const [quoteBalance,setQuoteBalance] = useState(parseEther("0"))
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const ERC20Contract = useERC20Contract()

    const MigratorContract = useKEWLMigratorContract(chainId, true)

    
    fetchAllTokenList(chainId, account)


    useEffect(() => {
        if (!chainId) { return; }
        if (!defaultAssets) { return }
        if (defaultAssets.length === 0) { return }

        setBaseAsset(defaultAssets.find(token => token?.symbol === "IMON"))
        setQuoteAsset(defaultAssets.find(token => token?.symbol === "KWL"))
    }, [defaultAssets])


    const fetchBalances = async () =>{
        if(!account){
            return;
        }
        if(!chainId){
            return;
        }

        if (![ChainId.ARBITRUM_ONE, ChainId.CHILIZ_MAINNET].includes(chainId)){
            return
        }

        const IMONToken = ERC20Contract(baseAsset.address)
        const KWLToken = ERC20Contract(quoteAsset.address)
        const _baseBalance = await IMONToken.balanceOf(account)
        const _quoteBalance = await KWLToken.balanceOf(account)

        setBaseBalance(_baseBalance)
        setQuoteBalance(_quoteBalance)

    }

    const handleUnlock = async () => {
        if(!account){
            return;
        }
        if(!chainId){
            return;
        }

        if (![ChainId.CHILIZ_MAINNET,ChainId.ARBITRUM_ONE].includes(chainId)){
            setTransaction({ hash: '', summary: '', error: {message:"Invalid Chain!"} });
            toggleError();
            return
        }

        const IMONToken = ERC20Contract(baseAsset.address)
        const _baseBalance = await IMONToken.balanceOf(account)
        const _baseAllowance = await IMONToken.allowance(account, MigratorContract.address);

        if(_baseBalance.eq(0)){
            setTransaction({ hash: '', summary: '', error: {message:"Insufficient Balance"} });
            toggleError();
            return;
        }
    
        if(_baseBalance.gt(_baseAllowance)){
            toggleLoading();
            await IMONToken.approve(MigratorContract.address, _baseBalance, { from: account }).then(async (tx) => {
                await tx.wait();
                const summary = `Unlocking tokens for: ${MigratorContract.address}`
                setTransaction({ hash: tx.hash, summary: summary, error: null });
                await provider.getTransactionReceipt(tx.hash).then(() => {
                    toggleTransactionSuccess();
                });
            }).catch((error: Error) => {
                setTransaction({ hash: '', summary: '', error: error });
                toggleError();
            }).finally(async () => {
                toggleLoading();
            });
        }
    }

    const handleMigrate = async () =>{
        if(!account){
            return;
        }
        if(!chainId){
            return;
        }

        if (![ChainId.CHILIZ_MAINNET,ChainId.ARBITRUM_ONE].includes(chainId)){
            setTransaction({ hash: '', summary: '', error: {message:"Invalid Chain!"} });
            toggleError();
            return
        }

        const IMONToken = ERC20Contract(baseAsset.address)
        const _baseBalance = await IMONToken.balanceOf(account)
        const _baseAllowance = await IMONToken.allowance(account, MigratorContract.address);

        if(_baseBalance.eq(0)){
            setTransaction({ hash: '', summary: '', error: {message:"Insufficient Balance"} });
            toggleError();
            return;
        }

        if(_baseBalance.gt(_baseAllowance)){
            setTransaction({ hash: '', summary: '', error: {message:"Unlock Required"} });
            toggleError();
            return;  
        }

    
            toggleLoading();
            await MigratorContract.migrate().then(async (tx) => {
                await tx.wait();
                const summary = `Migrating... : ${tx.hash}`
                setTransaction({ hash: tx.hash, summary: summary, error: null });
                toggleTransactionSuccess();
            }).catch((error: Error) => {
                setTransaction({ hash: '', summary: '', error: error });
                toggleError();
            }).finally(async () => {
                fetchBalances();
                toggleLoading();
            });
        

    }
    useEffect(() => {
        fetchBalances()
        console.log(baseAsset, quoteAsset)
    }, [baseAsset, quoteAsset,account])
    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, [props, account, chainId]);


    return (

        <>

            <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading}
                isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess}
                isShowing={isTransactionSuccess} />
     <ModalError
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5 my-5 swap"}>




                <Card shadow="sm" className={" flex gap-2 flex-col rounded-xl p-2 w-full"}>

                    <CardHeader>

                        <p className={title({size:"sm",color:"red"})}>IMON to KWL Migrator</p>
                    </CardHeader>
                    <CardBody className="flex flex-col gap-2">

                        <Table selectionMode="single">
                            <TableHeader>
                                <TableColumn>ASSET</TableColumn>
                                <TableColumn>BALANCE</TableColumn>
                            </TableHeader>
                            <TableBody>
                                <TableRow key="imon">
                                    <TableCell>
                                        {
                                            baseAsset && <div className="flex flex-row gap-2">
                                                <Image className="w-5 h-5" src={baseAsset.logoURI} />
                                                <span>{baseAsset.symbol}</span>
                                            </div>
                                        }
                                    </TableCell>
                                    <TableCell className="flex items-end justify-end">{formatEther(baseBalance)}</TableCell>
                                </TableRow>
                                <TableRow key="kwl">
                                    <TableCell>
                                    {
                                            quoteAsset && <div className="flex flex-row gap-2">
                                                <Image className="w-5 h-5" src={quoteAsset.logoURI} />
                                                <span>{quoteAsset.symbol}</span>
                                            </div>
                                        }
                                    </TableCell>
                                    <TableCell className="flex items-end justify-end">{formatEther(quoteBalance)}</TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>

                        <span className="w-full rounded-lg bg-danger-500/10 text-danger p-2">
                         IMON x KWL migration will be done at a 1:1 ratio. You will not experience any loss.
                        </span>

                        <span className="w-full rounded-lg bg-success-500/10 text-success p-2">
                         Step 1 : Unlock
                        </span>

                        <span className="w-full rounded-lg bg-success-500/10 text-success p-2">
                         Step 2: Migrate
                        </span>


                    </CardBody>
                    <CardFooter className="flex flex-row gap-2">

                    <Button onClick={()=>{
                            handleUnlock();
                        }} color="danger" size="lg" className="w-full">1 - Unlock</Button>

                        <Button onClick={()=>{
                            handleMigrate();
                        }} color="danger" size="lg" className="w-full">2 - Migrate IMON to KWL</Button>

                    </CardFooter>
                </Card>


            </div>

        </>
    )
}


export default MigratePage;
