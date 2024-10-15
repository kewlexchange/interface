import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { ethers } from "ethers";
import useFilePreview from "../../hooks/useFilePreview";
import { useWeb3React } from "@web3-react/core";

import useModal, { ModalError, ModalLoading, ModalNoProvider, ModalSuccessTransaction } from "../../hooks/useModals";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import { useDiamondContract } from "../../hooks/useContract";
import SudokuImg from '../../assets/images/arbiscan.svg'
import { NavLink } from "react-router-dom";
import { IDOItem } from "../../Components/IDOItem";

const OldLaunchpadPage: React.FunctionComponent<IPage> = props => {
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
    const selectedFile = watch('file');
    const [filePreview] = useFilePreview(selectedFile);

    const [formValues, setFormValues] = useState(null)

    const selectedCollectionInfo = watch("collection", ethers.constants.AddressZero);
    const [nextTokenId, setNextTokenId] = useState(0);




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

    

            <div className={"w-full px-2 py-5"}>
                <div className={"w-full flex sm:text-center items-center justify-center flex-col gap-3 py-10"}>
                    <h1 className={"text-2xl"}>
                        IMON Launchpad Protocol for Everyone!
                    </h1>
                    <span>IMON helps everyone to create their own tokens and token sales in few seconds. Tokens created on IMON will be verified and published on explorer websites.</span>
                    <div className={"w-full flex items-center justify-center gap-2"}>
                        <NavLink to={"/launchpad/create"} className={"btn btn-primary"}>Create Now</NavLink>
                        <NavLink  target="_blank" to={"https://docs.kewl.exchange/our-products/launchpad"} className={"btn btn-primary"}>Learn More
                        <span translate={"no"} className="material-symbols-outlined">
                        north_east
                    </span>
                        </NavLink>
                    </div>
                </div>
              

                <div className={"w-[80%] sm:w-full sm:grid-cols-1 mx-auto grid grid-cols-3 gap-5 my-5"}>
                <div className={"col-span-3 sm:col-span-1 w-full rounded-lg grid grid-cols-4 sm:grid-cols-2 items-center justify-center text-center gap-2"}>
                    <div className={" border border-1 rounded-lg p-2"}>
                        <h2 className={"font-normal text-lg"}>Total Raised</h2>
                        <span className={"font-bold"}>0 CHZ</span>
                    </div>
                    <div className={" border border-1 rounded-lg p-2"}>
                        <h2 className={"font-normal text-lg"}>Total Projects</h2>
                        <span className={"font-bold"}>0</span>
                    </div>
                    <div className={" border border-1 rounded-lg p-2"}>
                        <h2 className={"font-normal text-lg"}>Total Participants</h2>
                        <span className={"font-bold"}>0</span>
                    </div>
                    <div className={" border border-1 rounded-lg p-2"}>
                        <h2 className={"font-normal text-lg"}>Verified Users</h2>
                        <span className={"font-bold"}>0</span>
                    </div>
                </div>
                    <IDOItem name={"IMON Seed Sale"}/>
                    <IDOItem name={"IMON Pre Sale"}/>
                    <IDOItem name={"IMON Public Sale"}/>
                </div>
     
      </div>

       
        </>
    )
}


export default OldLaunchpadPage;

