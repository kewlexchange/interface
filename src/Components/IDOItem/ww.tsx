import React, { memo, useEffect, useMemo, useState } from 'react';
import { getIconByChainId, getNFTItemType, getNativeCurrencyByChainId, getShordAccount, unixTimeToDateTime } from "../../utils";
import { useWeb3React } from "@web3-react/core";
import Identicon from '../Identicon';
import { ethers } from 'ethers';
import { Avatar, Button, Card, CardBody, CardFooter, CardHeader, Chip, Image, Input, Slider, Spinner, Switch, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs } from "@nextui-org/react";
import { title } from '../Primitives';
import { formatEther, formatUnits, parseEther } from '@ethersproject/units';
import { ChainId } from '../../constants/chains';
import { useDomainContract, useCHZINULaunchpadContract, useTBTLaunchpadSecondContract, useCHILIZPEPELaunchpadSecondContract, useAngryHoopLaunchpadSecondContract } from '../../hooks/useContract';
import useModal, { ModalInfo, ModalLoading, ModalSuccessTransaction, ModalSelectToken } from '../../hooks/useModals';
import CHZINU_LOGO from "./ww.jpg"
import { NavLink } from 'react-router-dom';
import { WWROUND1IDO } from './ww/round1';
 const _MRLIDO = (props: { IDOParams, name }) => {
    const { connector, account, provider, chainId } = useWeb3React()

    const [depositAmount, setDepositAmount] = useState("500")
    const [userBalance, setUserBalance] = useState("0")
    const [depositAccount, setDepositAccount] = useState("0xe8c402a5F3A9Eb27EBfbd016D2C79a596bCe419C")
    const IMON_LAUNCHPAD_CONTRACT = useTBTLaunchpadSecondContract(chainId, true);
    const DOMAINS = useDomainContract(chainId, true)

    const [totalDeposit, setTotalDeposit] = useState("0")
    const [isSoldOut, setIsSoldOut] = useState(false)
    const [userInfo, setUserInfo]: any = useState(null)
    const [contributors, setContributors]: any = useState([])
    const [isLoaded, setIsLoaded] = useState(false)

    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const [acceptAggrement, setAcceptAggrement] = useState(false)
    const [selected, setSelected] = useState("round1");

    const [hardCap, setHardCap] = useState(parseEther("183100"))

    useEffect(() => {
    }, [])





    const UserCard = (props: { userAccount: any }) => {
        const [userName, setUserName] = useState("")
        const [isRefunded, setIsRefunded] = useState(false)

        const checkRefundStatus = async (acc) => {

            const [_totalDeposit, _userInfo] = await IMON_LAUNCHPAD_CONTRACT.getContributorInfo(acc);
            setIsRefunded(_userInfo.isRefunded)
            console.log(_userInfo)

        }

        const resolveCNS = async (userAddress: any) => {
            let name = userAddress;
            try {
                let accountInfo = await DOMAINS.getDomainByAddress(userAddress);
                if (accountInfo.isValid) {
                    name = accountInfo.name;
                } else {
                    name = getShordAccount(name)

                }
            } catch (e) {
            }
            setUserName(name)
        }

        useEffect(() => {
            resolveCNS(props.userAccount)
            checkRefundStatus(props.userAccount)
        }, [props.userAccount])
        return (
            <>
                <div className='w-full flex flex-row items-center justify-start gap-2'>
                    <Identicon size={32} account={props.userAccount} />
                    <div className="flex flex-col gap-1 items-start justify-center">
                        <h4 className={(isRefunded ? "text-danger line-through" : "text-default-600 ") + " text-small font-semibold leading-none "}>{userName}</h4>
                        <h5 className={(isRefunded ? "text-danger line-through" : "text-default-400 ") + " text-small text-xs tracking-tight"}>{props.userAccount}</h5>
                    </div>
                </div>
            </>
        )
    }
    const initDefaults = async () => {
        setIsLoaded(false)
        setDepositAmount("500")
        setUserBalance("0")

        const _balance = await provider.getBalance(account ? account : ethers.constants.AddressZero);
        setUserBalance(formatEther(_balance))
        const [_totalDeposit, _userInfo, _contributors] = await IMON_LAUNCHPAD_CONTRACT.getFairLaunchInfo(account ? account : ethers.constants.AddressZero);
        setTotalDeposit(formatEther(_totalDeposit))

        if (_totalDeposit >= hardCap) {
            setIsSoldOut(true)
        }
        setUserInfo(_userInfo);
        console.log(_contributors)

        const groupedTransactions: { [_contributor: string]: { depositAmount: any; deposiCount: any } } = {};
        for await (const contributorItem of _contributors) {
            console.log(contributorItem);

            if (!groupedTransactions[contributorItem.user]) {
                groupedTransactions[contributorItem.user] = { depositAmount: parseEther("0"), deposiCount: parseEther("0") };
            }
            groupedTransactions[contributorItem.user].depositAmount = groupedTransactions[contributorItem.user].depositAmount.add(contributorItem.depositAmount)
            groupedTransactions[contributorItem.user].deposiCount = groupedTransactions[contributorItem.user].deposiCount.add(1)
        }

        const sortedGroupedTransactions = Object.entries(groupedTransactions)
            .sort(([, a], [, b]) => b.depositAmount.sub(a.depositAmount))
            .map(([user, values]) => ({ user, ...values }));

        setContributors(sortedGroupedTransactions)
        setIsLoaded(true)

    }
    useEffect(() => {

        initDefaults();

    }, [account, chainId])

    const handleContribute = async () => {
        if (![ChainId.CHILIZ_MAINNET].includes(chainId)) {
            setTransaction({ hash: '', summary: '', error: { message: "Invalid Chain. Please Switch to Chiliz Main Net!" } });
            toggleError();
            return;
        }

        if (depositAmount === "") {
            setTransaction({ hash: '', summary: '', error: { message: "Invalid Amount!" } });
            toggleError();
            return;
        }

        if (depositAmount === "0") {
            setTransaction({ hash: '', summary: '', error: { message: "Invalid Amount!" } });
            toggleError();
            return;
        }


        console.log("depositAmount", depositAmount)


        let overrides = {
            value: parseEther(depositAmount.toString())
        }


        toggleLoading();
        await IMON_LAUNCHPAD_CONTRACT.contribute(overrides).then(async (tx) => {
            await tx.wait();
            const summary = `Joining : ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            initDefaults();
        });
    }

    const handleRefund = async () => {

        if (![ChainId.CHILIZ_MAINNET, ChainId.CHILIZ_SPICY_TESTNET].includes(chainId)) {
            setTransaction({ hash: '', summary: '', error: { message: "Invalid Chain. Please Switch to Chiliz Main Net!" } });
            toggleError();
            return;
        }

        if (!userInfo) {
            setTransaction({ hash: '', summary: '', error: { message: "Invalid User!" } });
            toggleError();
            return;
        }

        if (userInfo && userInfo.isRefunded) {
            setTransaction({ hash: '', summary: '', error: { message: "Already refunded!" } });
            toggleError();
            return;
        }

        toggleLoading();
        await IMON_LAUNCHPAD_CONTRACT.doRefund().then(async (tx) => {
            await tx.wait();
            const summary = `Refunding... : ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            initDefaults();
        });
    }

    const handleClaimFunds = async () => {

        if (![ChainId.CHILIZ_MAINNET, ChainId.CHILIZ_SPICY_TESTNET].includes(chainId)) {
            setTransaction({ hash: '', summary: '', error: { message: "Invalid Chain. Please Switch to Chiliz Main Net!" } });
            toggleError();
            return;
        }

        toggleLoading();
        await IMON_LAUNCHPAD_CONTRACT.claimFunds().then(async (tx) => {
            await tx.wait();
            const summary = `Claiming Funds... : ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            initDefaults();
        });
    }


    const handleClaimTokens = async () => {

        if (![ChainId.CHILIZ_MAINNET, ChainId.CHILIZ_SPICY_TESTNET].includes(chainId)) {
            setTransaction({ hash: '', summary: '', error: { message: "Invalid Chain. Please Switch to Chiliz Main Net!" } });
            toggleError();
            return;
        }

        if (!userInfo) {
            setTransaction({ hash: '', summary: '', error: { message: "Invalid User!" } });
            toggleError();
            return;
        }

        if (userInfo && userInfo.isClaimed) {
            setTransaction({ hash: '', summary: '', error: { message: "Already claimed!" } });
            toggleError();
            return;
        }

        toggleLoading();
        await IMON_LAUNCHPAD_CONTRACT.claimTokens().then(async (tx) => {
            await tx.wait();
            const summary = `Claiming Tokens... : ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
            initDefaults();
        });
    }

    return (
        <>
            <ModalInfo
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading}
                isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess}
                isShowing={isTransactionSuccess} />

            <div className="w-full flex flex-col items-center justify-center">
                <Image isZoomed isBlurred src={CHZINU_LOGO} />
            </div>
            <div className={"w-full rounded-lg p-2"}>

                <div className="rounded-lg flex items-center justify-center gap-2 flex-col">


                    <div className={"w-full flex gap-2 flex-col rounded-lg  py-2"}>
                        <div className='w-full flex flex-col items-center justify-center gap-2'>
                            <span className={title({ size: "md", color: "yellow" })}>{props.name}</span>
                        </div>
                        <Card shadow='lg'
                            className="min-w-xl max-w-xl"
                        

                        >
                            <CardBody>
                            <Tabs onSelectionChange={setSelected}  selectedKey={selected} aria-label="Options">
                                <Tab key="round1" title="Phase 1">
                                    <Card shadow='sm'>
                                        <WWROUND1IDO />
                                    </Card>
                                </Tab>
                            </Tabs>
                            </CardBody>
                         
                        </Card>





                    </div>




                </div>

            </div>
        </>
    );
}
export const WWTokenIDO = memo(_MRLIDO)
