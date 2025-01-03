import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ETHER_ADDRESS, TradeType } from '../../../constants/misc';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import JSBI from 'jsbi';
import moment from 'moment';
import { Route as ReactRoute, NavLink } from 'react-router-dom';
import { isSupportedChain } from '../../../constants/chains';
import { WETH9, Token, CurrencyAmount, Pair, Price, Trade, Currency, Percent, Route } from '../../../entities';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalInfo } from '../../../hooks/useModals';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { useFetchAllTokenList } from '../../../state/user/hooks';
import { getNativeCurrencyByChainId, parseFloatWithDefault } from '../../../utils';
import { DoubleCurrencyIcon } from '../../DoubleCurrency';
import UniwalletModal from '../../Modal/UniwalletModal';
import { updateTax, updateUserDeadline, updateUserSlippageTolerance } from '../../../state/user/reducer';
import { Button, ButtonGroup, Card, Input, Switch } from '@nextui-org/react';



const _SETTINGS_TAB = () => {

    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const EXCHANGE = useExchangeContract(chainId, true)
    const ERC20Contract = useERC20Contract()
    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const { state: isSelectToken, toggle: toggleSelectToken } = useModal()
    const dispatch = useAppDispatch()


    const userDeadline = useAppSelector((state) => state.user.userDeadline);
    const userSlippageTolerance = useAppSelector((state) => state.user.userSlippageTolerance);
    const userTax = useAppSelector((state) => state.user.userTax);

    const [rawSlippage, setRawSlippage] = useState(userSlippageTolerance)
    const [deadline, setDeadline] = useState(userDeadline)

    enum SlippageError {
        InvalidInput = 'InvalidInput',
        RiskyLow = 'RiskyLow',
        RiskyHigh = 'RiskyHigh'
    }

    enum DeadlineError {
        InvalidInput = 'InvalidInput'
    }



    const inputRef = useRef<HTMLInputElement>()

    const [slippageInput, setSlippageInput]: any = useState("")
    const [deadlineInput, setDeadlineInput]: any = useState("")
    const [taxesStatus, setTaxesStatus] = useState(userTax);

    

    const slippageInputIsValid =
        slippageInput === '' || (rawSlippage / 100).toFixed(2) === Number.parseFloat(slippageInput).toFixed(2)
    const deadlineInputIsValid = deadlineInput === '' || (deadline / 60).toString() === deadlineInput

    let slippageError: SlippageError | undefined
    if (slippageInput !== '' && !slippageInputIsValid) {
        slippageError = SlippageError.InvalidInput
    } else if (slippageInputIsValid && rawSlippage < 50) {
        slippageError = SlippageError.RiskyLow
    } else if (slippageInputIsValid && rawSlippage > 500) {
        slippageError = SlippageError.RiskyHigh
    } else {
        slippageError = undefined
    }

    let deadlineError: DeadlineError | undefined
    if (deadlineInput !== '' && !deadlineInputIsValid) {
        deadlineError = DeadlineError.InvalidInput
    } else {
        deadlineError = undefined
    }

    function parseCustomSlippage(value: string) {
        setSlippageInput(value)

        try {
            const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString())
            if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 5000) {
                setRawSlippage(valueAsIntFromRoundedFloat)
            }
        } catch { }
    }

    function parseCustomDeadline(value: string) {
        setDeadlineInput(value)

        try {
            const valueAsInt: number = Number.parseInt(value) * 60
            if (!Number.isNaN(valueAsInt) && valueAsInt > 0) {
                setDeadline(valueAsInt)
            }
        } catch { }
    }

    const handleSaveSettings = async () => {
        dispatch(updateUserDeadline({ userDeadline: deadline }))
        dispatch(updateUserSlippageTolerance({ userSlippageTolerance: rawSlippage }))
        dispatch(updateTax({ userTax: taxesStatus }))

        let error = { message: "Transaction Settings Saved Successfuly" }
        setTransaction({ hash: '', summary: '', error: error });
        toggleError()
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


            <div className="w-full rounded-xl pb-0">
                <div className="rounded-xl pb-0 flex gap-2 flex-col">



                    <Card shadow='none' className="w-full border border-default-100 flex flex-col gap-2 p-2 rounded-lg">
                        <span className="text-pink-960">Slippage Tolerance</span>
                        <small>Your transaction will revert if the price changes unfavorably by more than this percentage.</small>

                        <div className="w-full gap-2 flex flex-col gap-2 items-start justify-center">
                           
                            <div className={"w-full col-span-2 flex flex-row items-center text-center gap-2"}>
                                <Input
                                    startContent={
                                        <ButtonGroup size='sm' fullWidth={true}>
                                        <Button onPress={() => {
                                            setSlippageInput('')
                                            setRawSlippage(10)
                                        }} color={(rawSlippage === 10 ? "default" : "default")}>0.1%</Button>
                                        <Button onPress={() => {
                                            setSlippageInput('')
                                            setRawSlippage(50)
                                        }} color={(rawSlippage === 50 ? "default" : "default")}>0.5%</Button>
                                        <Button onPress={() => {
                                            setSlippageInput('')
                                            setRawSlippage(100)
                                        }} color={(rawSlippage === 100 ? "default" : "default")}>1%</Button>
            
                                        <Button onPress={() => {
                                            setSlippageInput('')
                                            setRawSlippage(200)
                                        }} color={(rawSlippage === 200 ? "default" : "default")}>2%</Button>
                                        </ButtonGroup>
                                    }
                                    ref={inputRef as any}
                                    placeholder={(rawSlippage / 100).toFixed(2)}
                                    value={slippageInput}
                                    onBlur={() => {
                                        parseCustomSlippage((rawSlippage / 100).toFixed(2))
                                    }}
                                    onChange={e => parseCustomSlippage(e.target.value)}
                                    color={!slippageInputIsValid ? 'red' : ''}

                                    type="text"></Input>
                                <span translate={"no"} className="material-symbols-outlined">percent</span>
                            </div>
                        </div>
                        <div className="w-full">

                            {!!slippageError && (
                                <div
                                    style={{
                                        fontSize: '14px',
                                        paddingTop: '7px',
                                        color: slippageError === SlippageError.InvalidInput ? 'red' : '#F3841E'
                                    }}
                                >
                                    {slippageError === SlippageError.InvalidInput
                                        ? 'Enter a valid slippage percentage'
                                        : slippageError === SlippageError.RiskyLow
                                            ? 'Your transaction may fail'
                                            : 'Your transaction may be frontrun'}
                                </div>
                            )}


                        </div>

                    </Card>

                    <Card shadow='none' className="w-full flex border border-default-100 flex-col gap-2 p-2 rounded-lg">
                        <span className="text-pink-960">Transaction Deadline</span>
                        <small>Your transaction will revert if it is pending for more than this long.</small>
                        <div className="w-full gap-2 flex flex-row items-center justify-start">
                            <Input color={!!deadlineError ? 'red' : undefined}
                                onBlur={() => {
                                    parseCustomDeadline((deadline / 60).toString())
                                }}
                                placeholder={(deadline / 60).toString()}
                                value={deadlineInput}
                                onChange={e => parseCustomDeadline(e.target.value)}/>
                            <span>Minutes</span>
                        </div>
                    </Card>

                    <Card shadow='none' className="w-full flex border border-default-100 flex-col gap-2 p-2 rounded-lg">
                        <span className="text-pink-960">Taxes Contracts</span>
                        <small>Allow trading of tokens that incur tax.</small>
                        <div className="w-full gap-2 flex flex-row items-center justify-start">
                        <Switch isSelected={taxesStatus} onValueChange={setTaxesStatus} color="default">{taxesStatus? "On" : "Off"}</Switch>
                        </div>
                    </Card>

                    <div className="w-full">
                        <Button className={"w-full"} onPress={() => {
                            handleSaveSettings()
                        }} color="default">
                            Save Settings
                        </Button>

                    </div>

                </div>


            </div>

        </>
    );
}
export const SETTINGS_TAB = memo(_SETTINGS_TAB)

