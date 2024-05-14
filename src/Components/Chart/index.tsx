import React, { useEffect, useState, useRef } from 'react';
import {usePAIRContract} from "../../hooks/useContract";
import {useWeb3React} from "@web3-react/core";
import useBlockNumber from "../../hooks/useBlockNumber";
import {ColorType, createChart} from "lightweight-charts";
import {BigNumber} from "@ethersproject/bignumber";
export const Chart = (props: {base,quote,pair})=> {
    const [transactionData,setTransactionData] = useState([])
    const [chartOHLCData,setChartOHLCData] = useState([])
    const PAIRContract = usePAIRContract()
    const { connector, account, provider, chainId } = useWeb3React()
    const blockNumber = useBlockNumber()

     const ChartComponent = props => {
        const {
            data,
            colors: {
                backgroundColor = '#FFF',
                lineColor = '#2962FF',
                textColor = 'black',
                areaTopColor = '#2962FF',
                areaBottomColor = 'rgba(41, 98, 255, 0.28)',
            } = {},
        } = props;

        const chartContainerRef = useRef();

        useEffect(
            () => {
                const handleResize = () => {
                    chart.applyOptions({ width: chartContainerRef.current.clientWidth });
                };

                // @ts-ignore
                const chart = createChart(chartContainerRef.current, {
                    layout: {
                        background: { type: ColorType.Solid, color: backgroundColor },
                        textColor,
                    },
                    width: chartContainerRef.current.clientWidth,
                    height: 300,
                    grid: {
                        vertLines: {
                            color: 'rgba(197, 203, 206, 0.5)',
                        },
                        horzLines: {
                            color: 'rgba(197, 203, 206, 0.5)',
                        },
                    },
                    rightPriceScale: {
                        borderColor: 'rgba(197, 203, 206, 0.8)',
                        visible: true,
                    },
                    timeScale: {
                        borderColor: 'rgba(197, 203, 206, 0.8)',
                    },
                });
                var candleSeries = chart.addCandlestickSeries({
                    upColor: 'green',
                    downColor: 'red',
                    borderDownColor: 'red',
                    borderUpColor: 'green',
                    wickDownColor: 'red',
                    wickUpColor: 'green',
                })

                candleSeries.setData(data)
                candleSeries.applyOptions({
                    priceFormat: {
                        type: 'price',
                        precision: 8,
                        minMove: 0.0001,
                    },
                });
                chart.timeScale().fitContent()
                window.addEventListener('resize', handleResize);

                return () => {
                    window.removeEventListener('resize', handleResize);

                    chart.remove();
                };
            },
            [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]
        );

        return (
            <div
                ref={chartContainerRef}
            />
        );
    };
    const convertToOHLC = (trades, timeframe) => {
        if (!trades || trades.length === 0) {
            return null;
        }

        const ohlcData = [];
        const ohlcTimestamps = new Set();

        trades.forEach((trade) => {
            ohlcTimestamps.add(Math.floor(trade.timestamp / timeframe) * timeframe);
        });

        Array.from(ohlcTimestamps).sort().forEach((timestamp) => {
            const ohlcSubset = trades.filter((trade) => timestamp <= trade.timestamp && trade.timestamp < timestamp + timeframe);

            if (ohlcSubset.length > 0) {
                const openPrice = ohlcSubset[0].price;
                const highPrice = Math.max(...ohlcSubset.map((trade) => trade.price));
                const lowPrice = Math.min(...ohlcSubset.map((trade) => trade.price));
                const closePrice = ohlcSubset[ohlcSubset.length - 1].price;

                const date = new Date(BigNumber.from(timestamp).toNumber() * 1000);
                const year = date.getFullYear();
                const month = date.getMonth() + 1; // Add 1 since getMonth() returns 0-indexed value
                const day = date.getDate();
                const time = { year, month, day };

                ohlcData.push({ time:timestamp, open: openPrice, high: highPrice, low: lowPrice, close: closePrice });
            }
        });



        setChartOHLCData(ohlcData)
    };

    useEffect(()=>{
        const timeFrame = 3600;
        convertToOHLC(transactionData,timeFrame)
    },[transactionData])
    const fetchTransactions = async () => {
        console.log("1")
        if(!props.pair){
            return;
        }
        console.log("2")
        const pairContract =  await PAIRContract(props.pair.pair) ;
    

        const logs = await pairContract.queryFilter("Swap");
        console.log("EVENT",logs)

        let chartData = []
        for (const log of logs) {
            console.log("LOG",log)
            const blockInfo = await log.getBlock()
            const parsedLog = pairContract.interface.parseLog(log);
             if(parsedLog.name==="Swap"){
                
                 var baseAmount =0
                 var quoteAmount  = 0
                 var price = 0
                 let side = ""
                 if((parsedLog.args.amount0In == 0) && (parsedLog.args.amount1Out == 0)){
                     side = "BUY"
                     baseAmount = parsedLog.args.amount0Out;
                     quoteAmount = parsedLog.args.amount1In;
                     price = quoteAmount / baseAmount;

                 }else{
                     side = "SELL"
                     baseAmount = parsedLog.args.amount1Out;
                     quoteAmount = parsedLog.args.amount0In;
                     price =    baseAmount/quoteAmount;
                 }
                 chartData.push({side:side,timestamp:blockInfo.timestamp,price:price})
             }
        }
        setTransactionData(chartData)
    }


    useEffect(()=>{
        if(!chainId){return;}
        fetchTransactions()
    },[chainId,props.base,props.quote,props.pair.pair])
    return (
        <div className={"rounded-lg bg-black w-full overflow-hidden"}>
    	<ChartComponent {...props} data={chartOHLCData}></ChartComponent>
        </div>
    );
}
