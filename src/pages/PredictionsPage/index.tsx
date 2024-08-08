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
import { useFetchAllTokenList } from "../../state/user/hooks";
import { useAppSelector } from "../../state/hooks";
import { title } from "../../Components/Primitives";
import { useERC20Contract, useKEWLMigratorContract } from "../../hooks/useContract";
import { formatEther, parseEther } from "@ethersproject/units";
import { ChainId } from "../../constants/chains";
import useModal, { ModalError, ModalLoading, ModalSuccessTransaction } from "../../hooks/useModals";
import { BET_TAB } from "../../Components/PredictionTabs/BetTab";
import { BET_CREATE_TAB } from "../../Components/PredictionTabs/CreateTab";


const PredictionsPage: React.FunctionComponent<IPage> = props => {
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

    
    useFetchAllTokenList(chainId, account)


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
 
    useEffect(() => {
        fetchBalances()
        console.log(baseAsset, quoteAsset)
    }, [baseAsset, quoteAsset,account])
    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, [props, account, chainId]);


    return (



        <>
            <div className={"w-full px-2 py-5 swap"}>
                <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5 my-5"}>
                    <Card  className={" flex gap-2 flex-col w-full"}>
                        <CardBody>
                        <div className="w-full max-w-full">
                            <Tabs color={"danger"} aria-label="Swap Tabs">
                                <Tab key="predictions" title="Match Predictions">
                                    <BET_TAB />
                                </Tab>
                                <Tab key="create" title="Create Match">
                                    <BET_CREATE_TAB/>
                                </Tab>
                        
                            </Tabs>
                        </div>
                        </CardBody>
                     
                    </Card>
                </div>
            </div>
        </>
    )
}


export default PredictionsPage;
