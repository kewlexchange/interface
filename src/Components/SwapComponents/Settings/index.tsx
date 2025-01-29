import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useDiamondContract, useExchangeContract, useERC20Contract, usePAIRContract } from '../../../hooks/useContract';
import useModal, { ModalNoProvider, ModalSelectToken, ModalConnect, ModalError, ModalLoading, ModalSuccessTransaction, ModalInfo } from '../../../hooks/useModals';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { updateTax, updateUserDeadline, updateUserSlippageTolerance } from '../../../state/user/reducer';
import { Button, ButtonGroup, Card, Input, Switch } from '@nextui-org/react';
import { Wallet2 } from '@nextui-org/react';



const _SETTINGS_TAB = () => {

    const { connector, account, provider, chainId } = useWeb3React()

    const defaultAssets = useAppSelector((state) => state.user.tokenList && state.user.tokenList[chainId])
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })

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


            <div className="w-full rounded-2xl">
                <div className="rounded-2xl flex gap-3 flex-col">
                    <Card 
                        shadow='none' 
                        className="w-full bg-white/[0.02] dark:bg-black/[0.02]
                                  border border-violet-500/10
                                  backdrop-blur-xl
                                  p-4 rounded-2xl
                                  hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]
                                  transition-all duration-300"
                    >
                        <div className="flex flex-col gap-2">
                            <span className="text-base font-medium bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-500 text-transparent bg-clip-text">
                                Slippage Tolerance
                            </span>
                            <small className="text-sm bg-gradient-to-r from-violet-600/60 via-fuchsia-500/60 to-violet-500/60 text-transparent bg-clip-text">
                                Your transaction will revert if the price changes unfavorably by more than this percentage.
                            </small>

                            <div className="flex flex-col gap-3 mt-2">
                                <div className="grid grid-cols-4 gap-1.5">
                                    {[
                                        { value: 10, label: '0.1%' },
                                        { value: 50, label: '0.5%' },
                                        { value: 100, label: '1%' },
                                        { value: 200, label: '2%' }
                                    ].map((preset) => (
                                        <Button 
                                            key={preset.value}
                                            onPress={() => {
                                                setSlippageInput('')
                                                setRawSlippage(preset.value)
                                            }}
                                            className={`
                                                h-9 rounded-xl
                                                relative overflow-hidden
                                                group
                                                transition-all duration-200
                                                ${rawSlippage === preset.value 
                                                    ? 'bg-violet-500/10 text-violet-500 border-violet-500/20' 
                                                    : 'bg-white/[0.02] dark:bg-black/[0.02] border-violet-500/10 text-violet-500/60'}
                                                border
                                                backdrop-blur-xl
                                                hover:bg-violet-500/[0.05]
                                                hover:border-violet-500/20
                                                hover:text-violet-500/80
                                            `}
                                        >
                                            {/* Background Glow Effect */}
                                            {rawSlippage === preset.value && (
                                                <div className="absolute inset-0 bg-violet-500/5 blur-md" />
                                            )}
                                            
                                            {/* Shimmer Effect */}
                                            <div className={`
                                                absolute inset-0 
                                                bg-gradient-to-r from-transparent via-white/[0.05] to-transparent
                                                translate-x-[-100%]
                                                ${rawSlippage === preset.value ? 'animate-shimmer' : 'group-hover:translate-x-[100%]'}
                                                transition-transform duration-1000
                                            `} />

                                            {/* Border Glow */}
                                            {rawSlippage === preset.value && (
                                                <div className="absolute inset-0 rounded-xl opacity-50
                                                    shadow-[0_0_15px_rgba(139,92,246,0.3)]
                                                    transition-opacity duration-200" />
                                            )}
                                            
                                            {/* Content */}
                                            <span className="relative z-10 font-medium">{preset.label}</span>
                                        </Button>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center">
                                        <Input
                                            ref={inputRef as any}
                                            placeholder={(rawSlippage / 100).toFixed(2)}
                                            value={slippageInput}
                                            onBlur={() => parseCustomSlippage((rawSlippage / 100).toFixed(2))}
                                            onChange={e => parseCustomSlippage(e.target.value)}
                                            variant="bordered"
                                            endContent={
                                                <div className="flex items-center gap-2 pr-2">
                                                    <span className="text-violet-500/60">%</span>
                                                </div>
                                            }
                                            classNames={{
                                                base: [
                                                    "h-9",
                                                    "group/input",
                                                ],
                                                input: [
                                                    "text-violet-500",
                                                    "placeholder:text-violet-500/40",
                                                    "bg-transparent !important",
                                                    "selection:bg-violet-500/10",
                                                ],
                                                innerWrapper: [
                                                    "bg-transparent !important",
                                                    "data-[hover=true]:bg-transparent !important",
                                                ],
                                                mainWrapper: [
                                                    "bg-transparent !important",
                                                    "data-[hover=true]:bg-transparent !important",
                                                ],
                                                inputWrapper: [
                                                    "h-9",
                                                    "bg-white/[0.02] dark:bg-black/[0.02] !important",
                                                    "backdrop-blur-xl",
                                                    "border border-violet-500/10",
                                                    "data-[hover=true]:border-violet-500/20",
                                                    "group-data-[focused=true]:border-violet-500/30 !important",
                                                    "group-data-[focused=true]:bg-violet-500/[0.02] !important",
                                                    "group-data-[focused=true]:shadow-[0_0_15px_rgba(139,92,246,0.1)]",
                                                    "group-focus-within:border-violet-500/30 !important",
                                                    "group-focus-within:bg-violet-500/[0.02] !important",
                                                    "group-focus-within:shadow-[0_0_15px_rgba(139,92,246,0.1)]",
                                                    "!cursor-text",
                                                    "rounded-xl",
                                                    "transition-all duration-200",
                                                    "data-[hover=true]:bg-violet-500/[0.02] !important",
                                                    "data-[hover=true]:border-violet-500/20",
                                                    "focus:!bg-violet-500/[0.02]",
                                                    "active:!bg-violet-500/[0.02]",
                                                    "group-hover/input:border-violet-500/20",
                                                    "group-hover/input:bg-violet-500/[0.02] !important",
                                                    !slippageInputIsValid ? [
                                                        "!border-red-500/50",
                                                        "hover:!border-red-500/50",
                                                        "group-data-[focused=true]:!border-red-500/50",
                                                        "group-data-[focused=true]:!shadow-[0_0_15px_rgba(239,68,68,0.1)]",
                                                        "hover:!bg-red-500/[0.02]",
                                                        "group-data-[focused=true]:!bg-red-500/[0.02]",
                                                        "group-focus-within:!border-red-500/50",
                                                        "group-focus-within:!bg-red-500/[0.02]",
                                                        "group-focus-within:!shadow-[0_0_15px_rgba(239,68,68,0.1)]",
                                                    ] : []
                                                ],
                                                endContent: [
                                                    "text-violet-500/60",
                                                    "bg-transparent !important"
                                                ]
                                            }}
                                        />
                                    </div>
                                    
                                    {!!slippageError && (
                                        <div className={`
                                            text-xs py-1.5 px-3
                                            rounded-lg
                                            flex items-center gap-2
                                            ${slippageError === SlippageError.InvalidInput 
                                                ? 'bg-red-500/5 text-red-500 border border-red-500/10' 
                                                : 'bg-orange-500/5 text-orange-500 border border-orange-500/10'}
                                            backdrop-blur-xl
                                            shadow-[0_2px_10px_rgba(0,0,0,0.1)]
                                            animate-slideDown
                                        `}>
                                            <span className="material-symbols-outlined text-base">
                                                {slippageError === SlippageError.InvalidInput ? 'error' : 'warning'}
                                            </span>
                                            
                                            <span className="font-medium">
                                                {slippageError === SlippageError.InvalidInput
                                                    ? 'Enter a valid slippage percentage'
                                                    : slippageError === SlippageError.RiskyLow
                                                        ? 'Transaction may fail due to low slippage'
                                                        : 'High slippage - transaction may be frontrun'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card 
                        shadow='none' 
                        className="w-full bg-white/[0.02] dark:bg-black/[0.02]
                                  border border-violet-500/10
                                  backdrop-blur-xl
                                  p-4 rounded-2xl
                                  hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]
                                  transition-all duration-300"
                    >
                        <div className="flex flex-col gap-2">
                            <span className="text-base font-medium bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-500 text-transparent bg-clip-text">
                                Transaction Deadline
                            </span>
                            <small className="text-sm bg-gradient-to-r from-violet-600/60 via-fuchsia-500/60 to-violet-500/60 text-transparent bg-clip-text">
                                Your transaction will revert if it is pending for more than this long.
                            </small>

                            <div className="flex items-center gap-2 mt-2">
                                <Input
                                    placeholder={(deadline / 60).toString()}
                                    value={deadlineInput}
                                    onBlur={() => parseCustomDeadline((deadline / 60).toString())}
                                    onChange={e => parseCustomDeadline(e.target.value)}
                                    variant="bordered"
                                    classNames={{
                                        base: "h-9",
                                        input: [
                                            "text-violet-500",
                                            "placeholder:text-violet-500/40",
                                            "bg-transparent",
                                            "selection:bg-violet-500/10",
                                        ],
                                        innerWrapper: [
                                            "bg-transparent",
                                            "hover:bg-transparent",
                                            "focus:bg-transparent",
                                        ],
                                        mainWrapper: [
                                            "bg-transparent",
                                            "hover:bg-transparent",
                                            "focus:bg-transparent",
                                        ],
                                        inputWrapper: [
                                            "h-9",
                                            "bg-white/[0.02] dark:bg-black/[0.02]",
                                            "hover:bg-violet-500/[0.02] dark:hover:bg-violet-500/[0.02]",
                                            "backdrop-blur-xl",
                                            "border border-violet-500/10",
                                            "hover:border-violet-500/20",
                                            "group-data-[focused=true]:border-violet-500/30",
                                            "group-data-[focused=true]:bg-violet-500/[0.02]",
                                            "group-data-[focused=true]:shadow-[0_0_15px_rgba(139,92,246,0.1)]",
                                            "!cursor-text",
                                            "rounded-xl",
                                            "transition-all duration-200",
                                            "data-[hover=true]:bg-violet-500/[0.02]",
                                            "data-[hover=true]:border-violet-500/20",
                                            "focus:!bg-violet-500/[0.02]",
                                            "active:!bg-violet-500/[0.02]",
                                            !!deadlineError && [
                                                "!border-red-500/50",
                                                "hover:!border-red-500/50",
                                                "group-data-[focused=true]:!border-red-500/50",
                                                "group-data-[focused=true]:!shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                            ]
                                        ],
                                        endContent: [
                                            "text-violet-500/60",
                                            "bg-transparent"
                                        ]
                                    }}
                                />
                                <span className="text-violet-500/60">Minutes</span>
                            </div>
                        </div>
                    </Card>

                    <Card 
                        shadow='none' 
                        className="w-full bg-white/[0.02] dark:bg-black/[0.02]
                                  border border-violet-500/10
                                  backdrop-blur-xl
                                  p-4 rounded-2xl
                                  hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]
                                  transition-all duration-300"
                    >
                        <div className="flex flex-col gap-2">
                            <span className="text-base font-medium bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-500 text-transparent bg-clip-text">
                                Tax Settings
                            </span>
                            <small className="text-sm bg-gradient-to-r from-violet-600/60 via-fuchsia-500/60 to-violet-500/60 text-transparent bg-clip-text">
                                Allow trading of tokens that incur tax.
                            </small>

                            <div className="mt-2">
                                <Switch 
                                    isSelected={taxesStatus} 
                                    onValueChange={setTaxesStatus}
                                    classNames={{
                                        wrapper: [
                                            "group-data-[selected=true]:bg-gradient-to-r",
                                            "group-data-[selected=true]:from-violet-500",
                                            "group-data-[selected=true]:to-fuchsia-500"
                                        ]
                                    }}
                                >
                                    <span className="text-sm bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-500 text-transparent bg-clip-text">
                                        {taxesStatus ? "Enabled" : "Disabled"}
                                    </span>
                                </Switch>
                            </div>
                        </div>
                    </Card>

                    <Button
                        onPress={handleSaveSettings}
                        className="w-full h-12 rounded-xl
                                 bg-gradient-to-r from-violet-500 to-fuchsia-500
                                 text-white font-semibold
                                 hover:opacity-90
                                 active:scale-[0.98]
                                 transition-all duration-200
                                 relative overflow-hidden
                                 group"
                    >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                      translate-x-[-100%] group-hover:translate-x-[100%] 
                                      transition-transform duration-1000" />
                        
                        <span className="relative">Save Settings</span>
                    </Button>
                </div>
            </div>

            {/* Keyframes ekleyin (eğer yoksa) */}
            <style jsx global>{`
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }

                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </>
    );
}
export const SETTINGS_TAB = memo(_SETTINGS_TAB)

