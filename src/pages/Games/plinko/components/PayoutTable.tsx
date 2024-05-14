import {PLINKO_PAYOUT_DIVIDER} from "../config";
import ClassNames from "classnames";
import * as React from "react";


export type Props = {
    payout: number[];
    showResult: boolean;
    resultColumn: number;
};

type PayoutInfoProps = {
    showResult: boolean;
    colorClass: string;
    multiplier: number;
};

const PayoutInfo = ({showResult, colorClass, multiplier}: PayoutInfoProps) => {
    const classNamesColorStrip = ClassNames("colorStrip", colorClass, {"colorStrip_show": showResult});

    const classNamesEntry = ClassNames("resultEntry", {"resultEntry_show": showResult});

    return (
        <div className={classNamesEntry}>
            <div className={classNamesColorStrip} />
            <span className={"relative"}>{`${multiplier}x`}</span>
        </div>
    );
};

const PayoutTable = ({payout, showResult, resultColumn}: Props) => {
    const len = payout.length;
    const totalPayout = [...payout.slice(1).reverse(), ...payout];
    const color = [...Array(len).keys()].map((x) => `colorStrip colorStrip-${(len - 1) * 2}-${x}`);
    const totalColor = [...color.slice(1).reverse(), ...color];
    return (
        <div className={"payoutTable"}>
            {totalPayout.map((value, index) => (
                <PayoutInfo
                    key={`${len}-${index}`}
                    showResult={showResult && resultColumn === index}
                    multiplier={value / PLINKO_PAYOUT_DIVIDER}
                    colorClass={totalColor[index]}
                />
            ))}
        </div>
    );
};

export default PayoutTable;
