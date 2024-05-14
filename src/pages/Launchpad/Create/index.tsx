import IPage from "../../../interfaces/page";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { ethers } from "ethers";
import useFilePreview from "../../../hooks/useFilePreview";
import { useWeb3React } from "@web3-react/core";

import useModal, { ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction } from "../../../hooks/useModals";
import { useDiamondContract } from "../../../hooks/useContract";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

const CreateLaunchPage: React.FunctionComponent<IPage> = props => {
    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const [statusText, setStatusText] = useState("Waiting for confirmation...")

    const [userCollections, setUserCollections] = useState([])
    const [is1155, setIs1155] = useState(false)
    const [royaltiesRatio, setRoyaltiesRatio] = useState(0)
    const { register, control, unregister, setValue, watch, handleSubmit, getValues, formState } = useForm();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "attributes"
    });


    const [formValues, setFormValues] = useState(null)


    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [fcfsStartDate, setfcfsStartDate] = useState(new Date())
    const [fcfsEndDate, setfcfsEndDate] = useState(new Date())

    const formatDate = (date: Date) => {
        return format(date, 'dd.MM.yyyy HH:mm');
    };

    function addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    function subDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() - days);
        return result;
    }

    useEffect(() => {
        // Başlangıç tarihine 2 saat ekleyerek yeni bir tarih oluştur
        const _startDate = new Date();
        _startDate.setHours(_startDate.getHours() + 2);
        const _endDate = new Date(_startDate)
        _endDate.setHours(_startDate.getHours() + 4);

        const _fcfsStartDate = new Date(_endDate)
        _fcfsStartDate.setHours(_fcfsStartDate.getHours() + 2);

        const _fcfsEndDate = new Date(_fcfsStartDate)
        _fcfsEndDate.setHours(_fcfsEndDate.getHours() + 2);

        setStartDate(_startDate)
        setEndDate(_endDate)

        setfcfsStartDate(_fcfsStartDate)
        setfcfsStartDate(_fcfsEndDate)
    }, []);





    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);
    return (

        <>
            <ModalNoProvider isShowing={isNoProvider} hide={toggleNoProvider} />
            <ModalError
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading text={statusText} isClosable={true} hide={toggleLoading} isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess} isShowing={isTransactionSuccess} />

            <div className={"container max-w-[60%] mx-auto sm:w-full"}>

                <form className={"flex flex-col gap-2 p-2"} onSubmit={handleSubmit((obj) => {
                    console.log("Submit even pressed", obj);
                })}>
                    <>
                        <div className={"w-full launchpad rounded-lg border border-1 flex flex-col p-2 gap-2"}>
                            <div className={"w-full grid grid-cols-1 gap-2 sm:grid-cols-1"}>

                                <div className={"w-full flex flex-col gap-2 p-2 rounded-lg border border-1"}>


                                    <div className={"flex flex-col w-full gap-2"}>
                                        <span>Contract Address</span>
                                        <input className={"rounded-lg p-2"}
                                            name={`tokenAddress`}
                                            placeholder={"0x9631be8566fC71d91970b10AcfdEe29F21Da6C27"}
                                            {...register('tokenAddress', { required: true })} />

                                        <div className="grid grid-cols-4 sm:grid-cols-1 gap-2 transparent-bg border border-1 p-2 rounded-lg">
                                            <span className="col-span-4 sm:col-span-1">Token Info</span>
                                            <div className={"flex flex-col w-full"}>
                                                <span>Name</span>
                                                <input className={"rounded-lg p-2"}
                                                    name={`token_name`}
                                                    placeholder={"Intelligent Monsters"}
                                                    {...register('token_name', { required: true })} />
                                            </div>
                                            <div className={"flex flex-col w-full"}>
                                                <span>Symbol</span>
                                                <input className={"rounded-lg p-2"}
                                                    name={`token_symbol`}
                                                    placeholder={"KEWL"}
                                                    {...register('token_symbol', { required: true })} />
                                            </div>
                                            <div className={"flex flex-col w-full"}>
                                                <span>Decimals</span>
                                                <input className={"rounded-lg p-2"}
                                                    name={`token_decimals`}
                                                    placeholder={"18"}
                                                    {...register('token_decimals', { required: true })} />
                                            </div>
                                            <div className={"flex flex-col w-full"}>
                                                <span>Total Supply</span>
                                                <input className={"rounded-lg p-2"}
                                                    name={`total_supply`}
                                                    placeholder={"50000000"}
                                                    {...register('total_supply', { required: true })} />
                                            </div>
                                        </div>
                                    </div>



                                    <div className={"flex flex-col w-full gap-2"}>
                                        <span>Launchpad Settings</span>


                                        <div className={"grid grid-cols-1 gap-2 p-2 transparent-bg rounded-lg"}>

                                            <div className={"flex flex-col w-full"}>
                                                <span>IDO Name</span>
                                                <input className={"rounded-lg p-2"}
                                                    placeholder={"IDO Name"}
                                                    name={`name`}
                                                    {...register('name', { required: true })} />
                                            </div>

                                            <div className={"flex flex-col w-full"}>
                                                <span>IDO Description</span>
                                                <textarea className={"rounded-lg p-2"}
                                                    placeholder={"Join the fully community-driven revolution of decentralized finance on the blockchain with the power of revolutionary technology."}
                                                    name={`description`}
                                                    {...register('description', { required: true })} />
                                            </div>



                                            <div className="grid grid-cols-4 sm:grid-cols-1 gap-2 transparent-bg border border-1 p-2 rounded-lg">

                                                <div className={"flex flex-col w-full"}>
                                                    <span>Start Date</span>
                                                    <DatePicker placeholder={"Please select date and time"} includeDateIntervals={[
                                                        { start: subDays(new Date(), 1), end: addDays(new Date(), 15) },
                                                    ]} dateFormat="d.M.yyyy H:mm" showTimeSelect className={"rounded-lg w-full"} selected={startDate} onChange={(date) => setStartDate(date)} />
                                                </div>
                                                <div className={"flex flex-col w-full"}>
                                                    <span>End Date</span>
                                                    <DatePicker
                                                        placeholder={"Please select date and time"}
                                                        includeDateIntervals={[
                                                            { start: subDays(new Date(), 1), end: addDays(new Date(), 15) },
                                                        ]} dateFormat="d.M.yyyy H:mm" showTimeSelect className={"rounded-lg w-full"} selected={endDate} onChange={(date) => setEndDate(date)} />
                                                </div>
                                                <div className={"flex flex-col w-full"}>
                                                    <span>FCFS Start</span>
                                                    <input className={"rounded-lg p-2"}
                                                        name={`fcfsstart`}
                                                        readOnly
                                                        placeholder={""}
                                                        {...register('fcfsstart', { required: true })} />
                                                </div>
                                                <div className={"flex flex-col w-full"}>
                                                    <span>FCFS End</span>
                                                    <input className={"rounded-lg p-2"}
                                                        name={`fcfsend`}
                                                        readOnly
                                                        placeholder={""}
                                                        {...register('fcfsend', { required: true })} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 sm:grid-cols-1 gap-2 transparent-bg border border-1 p-2 rounded-lg">
                                            <span className="col-span-4 sm:col-span-1">Sale Settings</span>
                                            <div className={"flex flex-col w-full"}>
                                                <span>Token Amount</span>
                                                <input className={"rounded-lg p-2"}
                                                    name={`tokenAmount`}
                                                    placeholder={"10000000"}
                                                    {...register('tokenAmount', { required: true })} />
                                            </div>
                                            <div className={"flex flex-col w-full"}>
                                                <span>Presale Rate</span>
                                                <input className={"rounded-lg p-2"}
                                                    name={`tokenPrice`}
                                                    placeholder={"0.005"}
                                                    {...register('tokenPrice', { required: true })} />
                                            </div>
                                            <div className={"flex flex-col w-full"}>
                                                <span>Soft Capitalization</span>
                                                <input className={"rounded-lg p-2"}
                                                    name={`softCap`}
                                                    placeholder={"1000000"}
                                                    {...register('softCap', { required: true })} />
                                            </div>
                                            <div className={"flex flex-col w-full"}>
                                                <span>Hard Capitalization</span>
                                                <input className={"rounded-lg p-2"}
                                                    name={`hardCap`}
                                                    placeholder={"10000000"}
                                                    {...register('hardCap', { required: true })} />
                                            </div>
                                        </div>


                                        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 transparent-bg border border-1 p-2 rounded-lg">
                                            <span className="col-span-2 sm:col-span-1">Contribution Limits</span>
                                            <div className={"flex flex-col w-full"}>
                                                <span>Minimum Contribution Limit</span>
                                                <input className={"rounded-lg p-2"}
                                                    name={`minContribution`}
                                                    placeholder={"0.005"}
                                                    {...register('minContribution', { required: true })} />
                                            </div>
                                            <div className={"flex flex-col w-full"}>
                                                <span>Maximum Contribution Limit</span>
                                                <input className={"rounded-lg p-2"}
                                                    name={`maxContribution`}
                                                    placeholder={"100"}
                                                    {...register('maxContribution', { required: true })} />
                                            </div>

                                        </div>
                                    </div>



                                    <div className={"grid grid-cols-2 sm:grid-cols-1 gap-2 p-2 transparent-bg rounded-lg"}>
                                        <div className={"col-span-2 sm:col-span-1"}>
                                            Social Profiles
                                        </div>

                                        <div className={"flex flex-col w-full"}>
                                            <span>Web Site</span>
                                            <input className={"rounded-lg p-2"}
                                                placeholder={"https://kewl.exchange"}
                                                name={`website`}
                                                {...register('website', { required: true })} />
                                        </div>
                                        <div className={"flex flex-col w-full"}>
                                            <span>Telegram</span>
                                            <input className={"rounded-lg p-2"}
                                                placeholder={"https://t.me/imondotai"}
                                                name={`telegram`}
                                                {...register('telegram', { required: true })} />
                                        </div>
                                        <div className={"flex flex-col w-full"}>
                                            <span>Twitter</span>
                                            <input className={"rounded-lg p-2"}
                                                placeholder={"https://twitter.com/imondotai"}
                                                name={`twitter`}
                                                {...register('twitter', { required: true })} />
                                        </div>
                                        <div className={"flex flex-col w-full"}>
                                            <span>Discord</span>
                                            <input className={"rounded-lg p-2"}
                                                placeholder={"https://discord.com/invite/7yXaMsS9J2"}
                                                name={`discord`}
                                                {...register('discord', { required: true })} />
                                        </div>
                                    </div>




                                </div>
                            </div>


                        </div>
                    </>

                    <div className="w-full flex items-center justify-center">
                        <button onClick={(e) => {
                            e.preventDefault();

                        }} className="btn btn-primary" type="submit">Create Launchpad</button>
                    </div>
                </form>

            </div>
        </>
    )
}


export default CreateLaunchPage;

