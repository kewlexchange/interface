import { Slider, Image, Badge, Spinner, Button } from "@nextui-org/react";
import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";
import TokenInfoComponent from "../../Components/TokenInfoComponent";
import { useExchangeContract } from "@/hooks/useContract";
import { parseEther } from "@ethersproject/units";
import useModal, { ModalError, ModalLoading, ModalSuccessTransaction } from "@/hooks/useModals";
import { useWeb3React } from "@web3-react/core";

const TokenInfo: React.FunctionComponent<IPage> = props => {
    const { account, provider, chainId } = useWeb3React()

    const EXCHANGE = useExchangeContract(chainId, true)
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })

    const handleReflect = async () => {

        let swapConfig = {
            amountIn: parseEther("1"),
            weth9: "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",
            input: "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",
            receiver: account
        }


        let liqudityPools = [

            {// WCHZ -> KWL
                side: true,
                amountOut: 0,
                pair: "0xFfD8c1F14c20AeabdFc8B148fa1A7bD9ED63bbde",
                input: "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",
                token0: "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",
                token1: "0xEd5740209FcF6974d6f3a5F11e295b5E468aC27c"
            },
            {// KWL -> PEPPER
                side: false,
                amountOut: 0,
                pair: "0xdBf63b174e218D328C5DEE873B47e412ff4e12FA",
                input: "0xEd5740209FcF6974d6f3a5F11e295b5E468aC27c",
                token0: "0x60F397acBCfB8f4e3234C659A3E10867e6fA6b67",
                token1: "0xEd5740209FcF6974d6f3a5F11e295b5E468aC27c"
            },
            {// PEPPER -> CHZINU
                side: true,
                amountOut: 0,
                pair: "0xD7716A59066A431d703F3fd9Dd9ab1C5F694282F",
                input: "0x60F397acBCfB8f4e3234C659A3E10867e6fA6b67",
                token0: "0x60F397acBCfB8f4e3234C659A3E10867e6fA6b67",
                token1: "0xF3928e7871eb136DD6648Ad08aEEF6B6ea893001"
            },

            {//  CHZINU -> KWL
                side: false,
                amountOut: 0,
                pair: "0xddf175F2688EbcBca1dA4B87D6e944a88f55a034",
                input: "0xF3928e7871eb136DD6648Ad08aEEF6B6ea893001",
                token0: "0xEd5740209FcF6974d6f3a5F11e295b5E468aC27c",
                token1: "0xF3928e7871eb136DD6648Ad08aEEF6B6ea893001"
            },

            {//  KWL -> DSWAP
                side: false,
                amountOut: 0,
                pair: "0xd0D27a653cB010EdF7C1Cd2f1D51449B01BB2d06",
                input: "0xEd5740209FcF6974d6f3a5F11e295b5E468aC27c",
                token0: "0x2eBEc8E89BB4B9C3681BE4eAA85C391F1cd717cE",
                token1: "0xEd5740209FcF6974d6f3a5F11e295b5E468aC27c"
            },
            {//  DSWAP -> PEPPER
                side: true,
                amountOut: 0,
                pair: "0x3159a90f80FA4aECCc044923b7A504A98417145D",
                input: "0x2eBEc8E89BB4B9C3681BE4eAA85C391F1cd717cE",
                token0: "0x2eBEc8E89BB4B9C3681BE4eAA85C391F1cd717cE",
                token1: "0x60F397acBCfB8f4e3234C659A3E10867e6fA6b67"
            },

            {// PEPPER -> CHZ
                side: true,
                amountOut: 0,
                pair: "0x5F3efAB95224dBb5490E8DDc8D2C1dAAd4c0db37",
                input: "0x60F397acBCfB8f4e3234C659A3E10867e6fA6b67",
                token0: "0x60F397acBCfB8f4e3234C659A3E10867e6fA6b67",
                token1: "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47"
            },
            {// WCHZ -> KWL
                side: true,
                amountOut: 0,
                pair: "0xFfD8c1F14c20AeabdFc8B148fa1A7bD9ED63bbde",
                input: "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",
                token0: "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",
                token1: "0xEd5740209FcF6974d6f3a5F11e295b5E468aC27c"
            },



        ]

        let overrides = {
            value: swapConfig.amountIn
        }

        toggleLoading();

        await EXCHANGE.reflect(swapConfig, liqudityPools, overrides).then(async (tx) => {
            await tx.wait();
            const summary = `Swapping : ${tx.hash}`
            setTransaction({ hash: tx.hash, summary: summary, error: null });
            toggleTransactionSuccess();
        }).catch((error: Error) => {
            setTransaction({ hash: '', summary: '', error: error });
            toggleError();
        }).finally(async () => {
            toggleLoading();
        });

}

return (
    <>
       <ModalError
            isShowing={isErrorShowing}
            hide={toggleError}
            error={transaction.error}
          />
          <ModalLoading text={"Waiting for confirmation..."} isClosable={true} hide={toggleLoading}
            isShowing={isShowLoading} />
          <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess}
            isShowing={isTransactionSuccess} />

        <div className={"w-full px-2 py-5"}>
            <div className="w-full flex flex-col gap-2 items-center justify-center">
                <Button color="danger" variant="shadow" onPress={() => {
                    handleReflect()
                }} size="lg">Reflect</Button>
            </div>
            <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5 my-5"}>
                <TokenInfoComponent />
            </div>
        </div>


    </>
)
}


export default TokenInfo;
