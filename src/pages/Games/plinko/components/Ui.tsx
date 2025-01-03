import * as React from "react";
import {WithTranslation, withTranslation} from "react-i18next";

import {MIN_BET_VALUE} from "../config";
import {popCnt} from "../util/math";
import Plinko from "./Plinko";

export interface Props extends WithTranslation {
    disableRiskRowUpdate: boolean;
    ref: any;
    rows: number;
    risk: number;
    value: number;
    maxBetValue: number;
    result: {betNum: number; num: number; won: boolean; userProfit: number};
    showResult: boolean;
    showHelp: boolean;
    nightMode: boolean;
    onRiskChange(risk: number): void;
    onRowsChange(rows: number): void;
    onToggleHelp(): void;
    onValueChange(value: number): void;
    onPlaceBet(): void;
}

export type State = {
    angle: number;
};

class Ui extends React.PureComponent<Props, State> {
    public plinko = React.createRef<Plinko>();

    constructor(props: Props) {
        super(props);

        this.state = {
            angle: 0,
        };
    }

    /* tslint:disable:no-unused-variable */
    private onSimulate = () => {
        this.plinko.current?.simulate();
    };

    render() {
        const {
            disableRiskRowUpdate,
            value,
            rows,
            risk,
            maxBetValue,
            result,
            showResult,
            showHelp,
            nightMode,
            onToggleHelp,
            onValueChange,
            onRiskChange,
            onRowsChange,
            onPlaceBet,
            t,
        } = this.props;

        const resultCol = popCnt(result.num); // TODO: Move up to plinko?

        return (
          
                <div>
                    <div className={"w-full"}>
                        <Plinko
                            ref={this.plinko}
                            rows={rows}
                            risk={risk}
                            nightMode={nightMode}
                            showResult={showResult}
                            resultColumn={resultCol}
                        />
                    </div>
            
                        <div >
                            <div className="games__form-group">
                                <span>{t("betAmountEth")}</span>
                                <input
                                    value={value}
                                    min={MIN_BET_VALUE}
                                    step={MIN_BET_VALUE}
                                    max={maxBetValue}
                                    onChange={onValueChange}
                                />
                            </div>
                     
                                    <div>
                                        <span>{t("risk")}</span>
                                        <select
                                            disabled={disableRiskRowUpdate}
                                            value={risk.toString()}
                                            onChange={(val) => onRiskChange(Number.parseInt(val.target.value, 10))}
                                        >
                                            <option value={1}>{t("lowRisk")}</option>
                                            <option value={2}>{t("mediumRisk")}</option>
                                            <option value={3}>{t("highRisk")}</option>
                                        </select>
                                    </div>
                        
                                        <span>{t("Rows")}</span>
                                        <select
                                            disabled={disableRiskRowUpdate}
                                            value={rows.toString()}
                                            onChange={(val) => onRowsChange(Number.parseInt(val.target.value, 10))}
                                        >
                                            <option value={8}>8</option>
                                            <option value={12}>12</option>
                                            <option value={16}>16</option>
                                        </select>
                              
                   
                            <button className="betbutton"  color="success" onPress={onPlaceBet}>
                                {t("bet")}
                            </button>
                            <button className="betbutton"  color="default" onPress={this.onSimulate}>
                                {t("simulate")}
                            </button>
                        </div>
         
            
            </div>
        );
    }
}

export default Ui;
