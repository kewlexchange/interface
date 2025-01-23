import { Slider, Image, Badge, Spinner, Button, CardBody, CardHeader, CardFooter, Card } from "@nextui-org/react";
import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import TokenInfoComponent from "../../Components/TokenInfoComponent";
import { useExchangeContract } from "@/hooks/useContract";
import { parseEther } from "@ethersproject/units";
import useModal, { ModalError, ModalLoading, ModalSuccessTransaction } from "@/hooks/useModals";
import { useWeb3React } from "@web3-react/core";
import { useFetchAllTokenList } from "@/state/user/hooks";
import { getIconByAsset, getTokenLogoBySymbol } from "@/utils";
import { useAppSelector } from "@/state/hooks";
import { DEFAULT_TOKEN_LOGO } from "@/constants/misc";
import { ChevronsRight } from "lucide-react";

const TokenInfo: React.FunctionComponent<IPage> = props => {
    const { account, provider, chainId } = useWeb3React()

    const EXCHANGE = useExchangeContract(chainId, true)
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { fetchTokens } = useFetchAllTokenList(chainId, account);
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])
    const [value, setValue] = React.useState(5);



    return (
        <>
       
            <div className={"w-full px-2 py-5"}>
             
                <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5 my-5"}>
                    <TokenInfoComponent />
                </div>
            </div>


        </>
    )
}


export default TokenInfo;
