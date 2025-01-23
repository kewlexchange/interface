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
        {// PEPPER -> USDT ersan
            side: false,
            amountOut: 0,
            pair: "0xA696baC74097A2da96438283F3b10492dac5A669",
            input: "0x60F397acBCfB8f4e3234C659A3E10867e6fA6b67",
            token0: "0x37C57a89812a0D492AeEd7691F1610CA0a8f74A1",
            token1: "0x60F397acBCfB8f4e3234C659A3E10867e6fA6b67"
        },
        {// USDT -> CHZ ersan
            side: true,
            amountOut: 0,
            pair: "0x14A634Bf2d5bE1c6AD7790D958E748174d8A2D43",
            input: "0x37C57a89812a0D492AeEd7691F1610CA0a8f74A1",
            token0: "0x37C57a89812a0D492AeEd7691F1610CA0a8f74A1",
            token1: "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47"
        },
        {// CHZ -> PEPPER
            side: false,
            amountOut: 0,
            pair: "0x5F3efAB95224dBb5490E8DDc8D2C1dAAd4c0db37",
            input: "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",
            token0: "0x60F397acBCfB8f4e3234C659A3E10867e6fA6b67",
            token1: "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47"
        },


        {// PEPPER -> USDT ersan
            side: false,
            amountOut: 0,
            pair: "0xA696baC74097A2da96438283F3b10492dac5A669",
            input: "0x60F397acBCfB8f4e3234C659A3E10867e6fA6b67",
            token0: "0x37C57a89812a0D492AeEd7691F1610CA0a8f74A1",
            token1: "0x60F397acBCfB8f4e3234C659A3E10867e6fA6b67"
        },

        {// USDT -> CHZ ersan
            side: true,
            amountOut: 0,
            pair: "0x14A634Bf2d5bE1c6AD7790D958E748174d8A2D43",
            input: "0x37C57a89812a0D492AeEd7691F1610CA0a8f74A1",
            token0: "0x37C57a89812a0D492AeEd7691F1610CA0a8f74A1",
            token1: "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47"
        },



        {// WCHZ -> KWL
            side: true,
            amountOut: 0,
            pair: "0x0ee0F69ef7a6C94C1ee8aeCe8aB29b606DBd1785",
            input: "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",
            token0: "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",
            token1: "0xEd5740209FcF6974d6f3a5F11e295b5E468aC27c"
        },


    ]

    const handleReflect = async () => {

        let swapConfig = {
            amountIn: parseEther(value.toString()),
            weth9: "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",
            input: "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",
            receiver: account
        }


      

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

    const initialize = async () => {
        await fetchTokens();
    }

       const getTokenLogo = (address:any) => {
        console.log("defaultAssets",defaultAssets)
        if(!defaultAssets){
            return
        }

            const token = defaultAssets.find((token : any) => token?.address === address);
            return token ? token.logoURI : DEFAULT_TOKEN_LOGO; // Varsayılan bir logo URI belirleyin
        }
    

    useEffect(() => {
        if (chainId) {
            if (account) {
                initialize()
            }
        }
    }, [chainId, account])

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
                <div className="w-full sticky top-5 flex flex-col gap-2 items-center justify-center">
                    <Card isBlurred  fullWidth>
                        <CardHeader>
                            <span>KEWL Reflector</span>
                        </CardHeader>
                        <CardBody className="flex flex-row gap-2">
                            {
                                liqudityPools.map((pair:any,index)=>(
                                    <div className="flex flex-row gap-2 items-center justify-center">
                                    <Button color="danger" variant="flat" isIconOnly radius="full" size="lg" key={`route${index}`}>
                                        <Image className="w-8 h-8" src={getTokenLogo(!pair.side ? pair.token0 : pair.token1)}/>
                                        
                                    </Button>
                                    <ChevronsRight />
                                    </div>

                                ))
                            }

                              
                        </CardBody>
                        <CardFooter className="w-full flex flex-row gap-2 items-center justify-between">
                        <Slider
                                value={value}
                                onChange={setValue}
                        className="w-full"
                        defaultValue={1}
                        size="lg"
                        color="danger"
                        label="Reflection Amount"
                        maxValue={100}
                        minValue={1}
                        step={1}
                    />

                    <Button color="danger" variant="shadow" onPress={() => {
                        handleReflect()
                    }} size="lg">Reflect</Button>
                        </CardFooter>
                    </Card>
             
                </div>
                <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5 my-5"}>
                    <TokenInfoComponent />
                </div>
            </div>


        </>
    )
}


export default TokenInfo;
