import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Tabs, Tab, Card, CardBody, Table, TableHeader, TableColumn, TableBody, Spinner, TableRow, TableCell } from "@nextui-org/react";
import Identicon from "../../Components/Identicon";
import { Route, Routes, useLocation } from "react-router-dom";
import { SWAP_TAB } from "../../Components/SwapComponents/Swap";
import { POOL_TAB } from "../../Components/SwapComponents/Pools";
import { SETTINGS_TAB } from "../../Components/SwapComponents/Settings";
import { STAKE_TAB } from "../../Components/StakeTabs/Stake";
import { UNSTAKE_TAB } from "../../Components/StakeTabs/Unstake";
import { useWeb3React } from "@web3-react/core";
import { FARM_TAB } from "../../Components/StakeTabs/Farm";
import { DAO_TAB } from "../../Components/StakeTabs/DAO";
import { useStakeContract } from "../../hooks/useContract";
import useBlockNumber from "../../hooks/useBlockNumber";
import { getAddress, hexZeroPad } from "ethers/lib/utils";
import { ethers } from "ethers";


const StakeProofPage: React.FunctionComponent<IPage> = props => {
    const { pathname } = useLocation();
    const { connector, account, provider, chainId } = useWeb3React()
    const IMON_STAKE_CONTRACT = useStakeContract(chainId, true);
    const blockNumber = useBlockNumber()
    const [userTxList,setUserTxList] = useState([])
    const [isLoaded,setLoaded] = useState(false)

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, [props, account, chainId]);


    const initDefaults  = async () => {
        let userAccount = "0x039b7767D2c697A9007A41C56f91D02bDEfc5781"
        const logs = await provider.getLogs({
            fromBlock: 0,
            toBlock: blockNumber,
            address: IMON_STAKE_CONTRACT.address
        })


        let txList = []
        let accounts = []
        for (const log of logs) {
           try{
            const parsedLog = IMON_STAKE_CONTRACT.interface.parseLog(log);
           
            let txHash = log.transactionHash;
            var userAddress = ""
            if(parsedLog.name == "HANDLE_UNSTAKE"){
                 userAddress = parsedLog.args[1]

            }else if(parsedLog.name == "HANDLE_HARVEST"){
                userAddress = parsedLog.args[0]
            }

            if(userAddress == userAccount){
                txList.push({"action":parsedLog.name,"account":userAddress,"hash":txHash,"link":"https://chiliscan.com/tx/"+txHash})
            }

            if(!accounts.includes(userAddress)){
                accounts.push(userAddress)
            }


           
           }catch(e){

           }
          
        }

        setUserTxList(txList)
        setLoaded(true)
        console.log(accounts)

      //  const filter = contract.filters.Staked(); // Staked olayına göre filtre oluştur
       // const logs = await contract.queryFilter(filter, fromBlock, latestBlock); // Logları filtre ile al


        //console.log(logs)
    }
    useEffect(()=>{
        if(provider){

            initDefaults()
        }
     
    },[provider,account])


    return (

        <>


            <div className={"w-full px-2 py-5 swap"}>
                <div className={"w-full mx-auto flex flex-col gap-5 my-5"}>

                    <Card className={" flex gap-2 flex-col rounded-xl p-2 w-full"}>

                    <Table
                        isHeaderSticky
                        color={"danger"}
                        disallowEmptySelection
                        selectionMode="single"
                        aria-label="Example static collection table">
                            <TableHeader>
                            <TableColumn>Action</TableColumn>
                                <TableColumn>Address</TableColumn>
                                <TableColumn>TX</TableColumn>
                            </TableHeader>
                            

                            <TableBody
            emptyContent={isLoaded ? "No Transactions Found!" : "Loading... Please Wait!"}
            isLoading={!isLoaded}
            items={userTxList}
            loadingContent={<Spinner color="danger" />}
            className="flex flex-col gap-2">
            {(collection) => (
            
                <TableRow key={collection.hash}>
                     <TableCell>
                        {collection.action}
                    </TableCell>
                    <TableCell>
                        {collection.account}
                    </TableCell>
                    <TableCell>
                    <a target="_blank" href={collection.link}>{collection.hash}</a>
                    </TableCell>
       
                </TableRow>
            )}

        </TableBody>

                        </Table>

                    </Card>




                </div>
            </div>

        </>
    )
}


export default StakeProofPage;
