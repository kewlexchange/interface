import React, { memo, useEffect, useMemo, useState } from 'react';
import { getIconByChainId, getNFTItemType, getNativeCurrencyByChainId, getShordAccount, unixTimeToDateTime } from "../../../utils";
import { useWeb3React } from "@web3-react/core";
import Identicon from '../../Identicon';
import { ethers } from 'ethers';
import { Avatar, Button, Card, CardBody, CardFooter, CardHeader, Chip, Image, Input, Slider, Spinner, Switch, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs } from "@nextui-org/react";
import { title } from '../../Primitives';
import { formatEther, formatUnits, parseEther } from '@ethersproject/units';
import { ChainId } from '../../../constants/chains';
import { useDSWAPLaunchpadContract, useDomainContract} from '../../../hooks/useContract';
import useModal, { ModalInfo, ModalLoading, ModalSuccessTransaction, ModalSelectToken } from '../../../hooks/useModals';
import CHZINU_LOGO from "../dswap.svg"
import { NavLink } from 'react-router-dom';
const _MRLIDO = (props: { IDOParams, name }) => {
    const { connector, account, provider, chainId } = useWeb3React()

    const [depositAmount, setDepositAmount] = useState("500")
    const [userBalance, setUserBalance] = useState("0")
    const [depositAccount, setDepositAccount] = useState("0xe8c402a5F3A9Eb27EBfbd016D2C79a596bCe419C")
    const IMON_LAUNCHPAD_CONTRACT = useDSWAPLaunchpadContract(chainId, true);
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

    const [hardCap, setHardCap] = useState(parseEther("183100"))
    const [selected, setSelected] = useState("info");

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


        let _activeAccount = account ? account : ethers.constants.AddressZero;
        const _balance = await provider.getBalance(account ? account : ethers.constants.AddressZero);
        setUserBalance(formatEther(_balance))
        const [_totalDeposit, _userInfo, _contributors] = await IMON_LAUNCHPAD_CONTRACT.getFairLaunchInfo(_activeAccount);
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



        let userAddresses = [];
        const sortedGroupedTransactions = Object.entries(groupedTransactions)
            .sort(([, a], [, b]) => b.depositAmount.sub(a.depositAmount))
            .map(([user, values]) => {
                userAddresses.push(user); // user adresini userAddresses'e ekle
                return { user, ...values };
            });
        

        setContributors(sortedGroupedTransactions)

        console.log(userAddresses)
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


            <div className={"w-full rounded-lg p-2"}>

                <div className="rounded-lg flex items-center justify-center gap-2 flex-col">


                    <div className={"w-full flex gap-2 flex-col rounded-lg  py-2"}>
                        <div className='w-full flex flex-col items-center justify-center gap-2'>
                            <span className={title({ size: "md", color: "yellow" })}>{props.name}</span>
                        </div>

                        <Tabs onSelectionChange={setSelected} selectedKey={selected} size={"md"} color='default' aria-label="Tabs sizes">
                            <Tab key={"info"} title={"Info"}>
                                <Card fullWidth shadow='none' >
                                    <CardHeader className="justify-between">
                                        <div className="flex gap-5">
                                            <Avatar isBordered radius="full" size="md" src={CHZINU_LOGO} />
                                            <div className="flex flex-col gap-1 items-start justify-center">
                                                <h4 className="text-small font-semibold leading-none text-default-600">DSwap</h4>
                                                <h5 className="text-small tracking-tight text-default-400">DIVISwap</h5>
                                            </div>
                                        </div>

                                        <div className={"bg-success-200/30 rounded-xl p-2"}>
                                            <span className={"text-success-500 flex flex-row items-center justify-center gap-2"}>
                                                <svg
                                                    className="animate-spin h-5 w-5 text-current"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        fill="currentColor"
                                                    />
                                                </svg>
                                                {"LIVE"}
                                            </span>
                                        </div>

                                    </CardHeader>
                                    <CardBody>
                                        <div className='w-full flex flex-row items-center justify-between'>
                                            <span className={"font-normal"}>Name</span>
                                            <span className={"font-bold text-warning-600"}>DIVISwap</span>
                                        </div>
                                        <div className='w-full flex flex-row items-center justify-between'>
                                            <span className={"font-normal"}>Symbol</span>
                                            <span className={"font-bold text-warning-600"}>DSWAP</span>
                                        </div>
                                        <div className='w-full flex flex-row items-center justify-between'>
                                            <span className={"font-normal"}>Decimals</span>
                                            <span className={"font-bold text-warning-600"}>18</span>
                                        </div>
                                        <div className='w-full flex flex-row items-center justify-between'>
                                            <span className={"font-normal"}>Total Supply</span>
                                            <span className={"font-bold text-warning-600"}>888.888,00</span>
                                        </div>
                                        <div className='w-full flex flex-row items-center justify-between'>
                                            <span className={"font-normal"}>Standard</span>
                                            <span className={"font-bold text-warning-600"}>ERC20</span>
                                        </div>
                                        <div className='w-full flex flex-row items-center justify-between'>
                                            <span className={"font-normal"}>Blockchain</span>
                                            <span className={"font-bold text-warning-600"}>Chiliz</span>
                                        </div>

                                        <div className='w-full flex flex-row items-center justify-between'>
                                            <span className={"font-normal"}>Token Price</span>
                                            <span className={"font-bold text-warning-600"}>2.3 CHZ</span>
                                        </div>

                                        <div className='w-full flex flex-row items-center justify-between'>
                                            <span className={"font-normal"}>Token Amount</span>
                                            <span className={"font-bold text-warning-600"}>133.333 DSWAP</span>
                                        </div>

                                        <div className='w-full flex flex-row items-center justify-between'>
                                            <span className={"font-normal"}>Soft Capitalization</span>
                                            <span className={"font-bold text-warning-600"}>80.000 CHZ</span>
                                        </div>
                                        <div className='w-full flex flex-row items-center justify-between'>
                                            <span className={"font-normal"}>Hard Capitalization</span>
                                            <span className={"font-bold text-warning-600"}>306.665,9 CHZ</span>
                                        </div>
                                        <div className='w-full flex flex-row items-center justify-between'>
                                            <span className={"font-normal"}>Fully Diluted Valuation</span>
                                            <span className={"font-bold text-warning-600"}>150.000 USD</span>
                                        </div>
                                        <div className='w-full flex flex-row items-center justify-between'>
                                            <span className={"font-normal"}>Start Date</span>
                                            <span className={"font-bold text-warning-600"}>July 27, Saturday, 12:00 UTC+3</span>
                                        </div>
                                        <div className='w-full flex flex-row items-center justify-between'>
                                            <span className={"font-normal"}>End Date</span>
                                            <span className={"font-bold text-warning-600"}>August 05, Monday, 23:59 UTC+3</span>
                                        </div>
                                        <div className=' w-full flex flex-row items-center justify-between'>
                                            <span className={"font-normal"}>Minimum Buy</span>
                                            <span className={"font-bold text-warning-600"}>1 CHZ</span>
                                        </div>
                                        <div className=' w-full flex flex-row items-center justify-between'>
                                            <span className={"font-normal"}>Maximum Buy</span>
                                            <span className={"font-bold text-warning-600"}>20000 CHZ</span>
                                        </div>
                                       
                                      


                                    </CardBody>
                                    <CardFooter className="gap-3">
                                        <div className="flex gap-1">
                                            <p className="font-semibold text-default-400 text-small">{contributors && contributors.length}</p>
                                            <p className=" text-default-400 text-small">Investors</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <p className="font-semibold text-default-400 text-small">{totalDeposit} CHZ</p>
                                            <p className="text-default-400 text-small">Total Raised</p>
                                        </div>
                                    </CardFooter>
                                </Card>


                            </Tab>
                            <Tab isDisabled={true} key="contribute" title="Invest">
                                <Card fullWidth shadow='none' className='w-full flex flex-col gap-2'>
                                    <CardHeader className="flex justify-between items-start">
                                        <div className="flex gap-5">
                                            <Button radius='full' isIconOnly size='lg'> <Identicon size={36} account={account ? account : ethers.constants.AddressZero} />
                                            </Button>
                                            <div className="flex flex-col gap-1 items-start justify-center">
                                                <h4 className="text-small font-semibold leading-none text-default-600">Introducing DSWAP Token</h4>

                                                <h5 className="text-small tracking-tight text-warning-400">
                                                DSwap is a decentralized exchange (DEX) built on the Chiliz Chain, The Sports Blockchain. 🌶️
                                                </h5>
                                            </div>

                                        </div>
                                        <Button onPress={() => {
                                            initDefaults()
                                        }} isIconOnly radius='full'>
                                            <span translate='no' className="material-symbols-outlined">
                                                refresh
                                            </span>
                                        </Button>
                                    </CardHeader>
                                    <CardBody>

                                        <div className='w-full flex flex-col gap-2 items-center justify-center'>
                                            <div className='w-full flex flex-row items-center justify-center'>
                                                <span className={title({ size: "md", color: "yellow" })}>{depositAmount} CHZ</span>
                                            </div>
                                            <Slider
                                                onChange={(e) => {
                                                    setDepositAmount(e)
                                                }}
                                                className={"w-full"}
                                                size="lg"
                                                showTooltip={true}

                                                step={1}
                                                color="default"
                                                showSteps={false}
                                                maxValue={20000}
                                                minValue={1}
                                                value={depositAmount === "" ? 20000 : parseFloat(depositAmount)}
                                                defaultValue={parseFloat(depositAmount)}
                                            />

                                            <Input
                                                type="number"
                                                size='lg'
                                                onChange={(e) => {
                                                    setDepositAmount(e.target.value)
                                                }}
                                                min={0}
                                                color={"default"}
                                                variant='flat'
                                                label="Deposit Amount"

                                                placeholder=""
                                                defaultValue=""

                                                labelPlacement='outside'
                                                value={depositAmount}
                                                className="w-full"
                                                endContent={
                                                    <img src={getIconByChainId(chainId)} className="w-8 h-8" alt="" />
                                                }
                                            />

                                            <div className="w-full flex flex-col gap-2">
                                                <Switch onValueChange={(val) => {
                                                    setAcceptAggrement(val)
                                                }} color={"default"} size="lg">I acknowledge that DSWAP is a Native DEX token and understand that I am solely responsible for any potential losses incurred.</Switch>

                                                <Button isDisabled={!acceptAggrement} onPress={() => {
                                                    handleContribute();
                                                }} variant='shadow' size='lg' className='w-full' color='default'>Invest Now</Button>
                                            </div>




                                        </div>




                                    </CardBody>

                                </Card>
                            </Tab>
                            <Tab isDisabled={true} key="refund" title="Refund">
                                <Card fullWidth shadow='none' className='w-full flex flex-col gap-2'>
                                    <CardHeader className="flex justify-between items-start">
                                        <div className="flex gap-5">
                                            <Button radius='full' isIconOnly size='lg'> <Identicon size={36} account={account ? account : ethers.constants.AddressZero} />
                                            </Button>
                                            <div className="flex flex-col gap-1 items-start justify-center">
                                                <h4 className="text-small font-semibold leading-none text-default-600">Refund</h4>
                                                <h5 className="text-small tracking-tight rounded-xl text-danger-400">
                                                    You can retrieve the money you invested in the MarloVerse Launch by requesting a refund.
                                                </h5>
                                            </div>

                                        </div>
                                        <Button onPress={() => {
                                            initDefaults()
                                        }} isIconOnly radius='full'>
                                            <span translate='no' className="material-symbols-outlined">
                                                refresh
                                            </span>
                                        </Button>
                                    </CardHeader>
                                    <CardBody>

                                        <div className='w-full flex flex-col gap-2 items-center justify-center'>
                                            <div className='w-full flex flex-row items-center justify-center'>
                                                <span className={title({ size: "md", color: "red" })}>{userInfo && formatEther(userInfo.depositAmount)} CHZ</span>
                                            </div>
                                            <div className='w-full flex flex-col gap-2'>
                                                <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                    <span>Your Contribution</span>
                                                    <span>{userInfo ? userInfo.joinedAt ? formatEther(userInfo.depositAmount) : "-" : "-"} CHZ</span>
                                                </div>
                                                <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                    <span>Joined At</span>
                                                    <span>{userInfo ? userInfo.joinedAt ? unixTimeToDateTime(userInfo.joinedAt) : "-" : "-"}</span>
                                                </div>
                                                <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                    <span>Is Refunded</span>
                                                    <span>{userInfo ? (userInfo.isRefunded ? "Yes" : "No") : "-"}</span>
                                                </div>
                                                <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                    <span>Refunded At</span>
                                                    <span>{userInfo ? userInfo.isRefunded ? unixTimeToDateTime(userInfo.refundedAt) : "-" : "-"}</span>
                                                </div>
                                                <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                    <span>Withdraw Amount</span>
                                                    <span>{userInfo ? formatUnits(userInfo.withdrawAmount, 18) : "-"} CHZ</span>
                                                </div>
                                            </div>



                                            <div className="w-full">
                                                <Button onPress={() => {
                                                    handleRefund();
                                                }} isDisabled={userInfo && userInfo.isRefunded} variant='shadow' size='lg' className='w-full' color='default'>Refund</Button>
                                            </div>




                                        </div>




                                    </CardBody>

                                </Card>

                            </Tab>

                            <Tab  key="claim" title="Claim">
                                <Card fullWidth shadow='none' className='w-full flex flex-col gap-2'>
                                    <CardHeader className="flex justify-between items-start">
                                        <div className="flex gap-5">
                                            <Button radius='full' isIconOnly size='lg'> <Identicon size={36} account={account ? account : ethers.constants.AddressZero} />
                                            </Button>
                                            <div className="flex flex-col gap-1 items-start justify-center">
                                                <h4 className="text-small font-semibold leading-none text-default-600">Claim Tokens</h4>
                                                <h5 className="text-small tracking-tight  text-secondary-400">Thank you for participating in the DSWAP Token project on the KEWL Launchpad.</h5>
                                            </div>



                                        </div>
                                        <Button onPress={() => {
                                            initDefaults()
                                        }} isIconOnly radius='full'>
                                            <span translate='no' className="material-symbols-outlined">
                                                refresh
                                            </span>
                                        </Button>
                                    </CardHeader>
                                    <CardBody>

                                        <div className='w-full flex flex-col gap-2 items-center justify-center'>

                                            <div className='w-full flex flex-row items-center justify-center'>
                                                <span className={title({ size: "md", color: "violet" })}>{userInfo && formatEther(userInfo.depositAmount)} CHZ</span>
                                            </div>
                                            <div className='w-full flex flex-col gap-2'>
                                                <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                    <span>Your Contribution</span>
                                                    <span>{userInfo ? userInfo.joinedAt ? formatEther(userInfo.depositAmount) : "-" : "-"} CHZ</span>
                                                </div>
                                                <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                    <span>Joined At</span>
                                                    <span>{userInfo ? userInfo.joinedAt ? unixTimeToDateTime(userInfo.joinedAt) : "-" : "-"}</span>
                                                </div>
                                                <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                    <span>Is Refunded</span>
                                                    <span>{userInfo ? (userInfo.isRefunded ? "Yes" : "No") : "-"}</span>
                                                </div>
                                                <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                    <span>Refunded At</span>
                                                    <span>{userInfo ? userInfo.isRefunded ? unixTimeToDateTime(userInfo.refundedAt) : "-" : "-"}</span>
                                                </div>
                                                <div className='w-full flex flex-row items-center justify-between border border-default p-2 rounded-xl'>
                                                    <span>Withdraw Amount</span>
                                                    <span>{userInfo ? formatUnits(userInfo.withdrawAmount, 18) : "-"} DSWAP</span>
                                                </div>
                                            </div>



                                            <div className="w-full">
                                                <Button onPress={() => {
                                                    handleClaimTokens()

                                                }} variant='shadow' size='lg' className='w-full' color='secondary'>Claim Tokens</Button>
                                            </div>



                                        </div>




                                    </CardBody>

                                </Card>

                            </Tab>
                            <Tab key="parts" title="Participants">

                                <Table
                                removeWrapper
                                    isHeaderSticky
                                    color={"default"}
                                    disallowEmptySelection
                                    shadow='none'
                                    selectionMode="single"
                                    aria-label="Example static collection table">
                                    <TableHeader>
                                        <TableColumn>Address</TableColumn>
                                        <TableColumn>Amount</TableColumn>
                                    </TableHeader>


                                    <TableBody
                                        emptyContent={isLoaded ? "No Transactions Found!" : "Loading... Please Wait!"}
                                        isLoading={!isLoaded}
                                        items={contributors}
                                        loadingContent={<Spinner color="default" />}
                                        className="flex flex-col gap-2">
                                        {(collection) => (

                                            <TableRow key={`/nfts/${collection.user}`}>
                                                <TableCell>
                                                    <UserCard userAccount={collection.user} />
                                                </TableCell>
                                                <TableCell className='text-end'>{formatEther(collection.depositAmount)} {getNativeCurrencyByChainId(chainId)}</TableCell>

                                            </TableRow>
                                        )}

                                    </TableBody>

                                </Table>

                            </Tab>
                        </Tabs>



                    </div>




                </div>

            </div>
        </>
    );
}
export const DSWAP1IDO = memo(_MRLIDO)
