import Rand from "rand-seed";
import ReactResizeDetector from "react-resize-detector";
import React, { useEffect, useRef } from "react";

import {PLINKO_PAYOUT} from "../config";
import Ball from "./Ball";
import {startPositions} from "./lookupTables";
import PayoutTable from "./PayoutTable";
import Pins from "./Pins";
import Vector2 from "./Vector2";

import { playFromBegin } from "../util/audio";
import sounds from "../config/sounds";
import useDebounce from "../../../../hooks/useDebounce";
import { BigNumber } from "ethers";
import { sleep } from "../util/time";

type Props = {
    className:string;
    rows: number;
    risk: number;
    nightMode: boolean;
    showResult: boolean;
    resultColumn: number;
    gameInfo:any;
};

type State = {
    size: number;
};

class Plinko extends React.Component<Props, State> {    
    private ctx: CanvasRenderingContext2D | null = null;
    private parent = React.createRef<HTMLDivElement>();
    private pins: Pins;
    private activeBalls: Array<{ball: Ball; targetPos: number; finishedCallBack: () => void}> = [];
    private animationActive = false;
    private ballAcceleration = new Vector2(0, 9.81);
    private currentTime = 0;
    private accumulator = 0;
    private ballRadius: number;
    private k = 0.5;
    private stepsPerSecond = 120;
    private speed = 0.75;
    private audioContext: AudioContext | null = null;
    private soundBuffer: AudioBuffer | null = null;
    private maxConcurrentSounds = 5; // Maximum concurrent sounds allowed
    private lastPlay = 0;
    public constructor(props: Props) {
        super(props);
        const {rows, nightMode} = this.props;

        this.pins = new Pins(rows, "#dedede");
        this.ballRadius = (0.02 * 16) / rows;

        this.state = {
            size: 500,
        };

        this.lastPlay = 0;


    }

  
    public componentDidMount() {
        this.renderToCanvas();
    }

    public componentDidUpdate() {
        const {rows, nightMode} = this.props;

        this.pins = new Pins(rows, "gray");
        this.ballRadius = (0.02 * 16) / rows;
        this.renderToCanvas();
    }

    public addBall = (targetPos: number, resultNum: number,ballInfo?:any,displayFunc?:any): Promise<void> => {
        const startPos = startPositions[this.props.rows][targetPos][resultNum % 16];
        const promise = new Promise<void>((resolve) => {
            this.activeBalls.push({
                ball: new Ball(new Vector2(startPos, -1.1), this.ballRadius, "#ff1256"),
                targetPos,
                finishedCallBack: ()=> resolve(displayFunc(ballInfo)),
            });
        });
        if (!this.animationActive) {
            this.animationActive = true;
            this.accumulator = 0;
            this.currentTime = Date.now();
            requestAnimationFrame(this.animation);
        }

        return promise;
    };

    private renderToCanvas = () => {
        const ctx = this.ctx;

        if (ctx === null) {
            return;
        }

        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.scale(width / 2, height / 2);
        ctx.translate(1.0, 1.0);
        this.pins.draw(ctx);
        this.activeBalls.forEach((x) => x.ball.draw(ctx));
        ctx.restore();
    };

    public simulate = () => {
        const from = -0.1;
        const to = 0.1;

        const steps = 500;
        const range = to - from;

        const results: number[][] = [...Array(this.props.rows + 1)].map((_) => []);

        const rand = new Rand("123456789");
        for (let i = 0; i < steps; i++) {
            const pos = Math.round(from + Math.round(rand.next() * range * 10000)) / 10000;
            const yPos = this.simulateBall(pos);

            if (yPos <= -1 || yPos >= 1) {
                continue;
            }

            const resultPos = Math.floor(((yPos + 1) / 2) * (this.props.rows + 1));

            const resArray = results[resultPos];
            if (resArray.length >= 16) {
                continue;
            }

            resArray.push(pos);
        }

        let resString = "";
        for (let pos = 0; pos < results.length; pos++) {
            resString += `${pos}: [${results[pos].join(", ")}],\n`;
        }
        console.log(resString);
    };

    public simulateBall = (startPos: number) => {
        const ball = new Ball(new Vector2(startPos, -1.1), this.ballRadius, "#ff1256");

        const maxSteps = 100000;
        let steps = 0;
        while (ball.position.y < 1 && steps++ < maxSteps) {
            this.animateBall(ball, 1 / this.stepsPerSecond);
        }

        if (steps >= maxSteps) {
            return -1; // invalid
        }

        return ball.position.x;
    };

    private playSoundIfAllowed = () => {
        const currentTime = Date.now();
        const timeDifference = currentTime - this.lastPlay;

        if (timeDifference >= 80) {
            playFromBegin(sounds.hit);
            this.lastPlay = currentTime;
        }
    };

    private animateBall = (ball: Ball, dt: number) => {
        const initialPos = ball.position;
        const initialV = ball.v;
        const newV = initialV.add(this.ballAcceleration.multiply(dt));
        const newPos = initialPos.add(newV.multiply(dt));
        const collisionInfo = this.pins.getCollisionPin(initialPos, newPos, ball.radius);
        if (collisionInfo === undefined) {
            ball.position = newPos;
            ball.v = newV;
            return;
        }

        const {collisionPoint, normal} = collisionInfo;

        const aM = this.ballAcceleration.magnitude();
        const vM = initialV.magnitude();
        const sM = collisionPoint.subtract(initialPos).magnitude();
        const collisionTime = (-vM + Math.sqrt(initialV.sqrMagnitude() + 4 * aM * sM)) / (2 * aM);
        const tLeft = dt - collisionTime;

        const vCollision = ball.v.add(this.ballAcceleration.multiply(collisionTime));

        
        // check collision
        // const colP = initialPos.add(vCollision.multiply(collisionTime));
        // const diff = colP.subtract(collisionPoint).magnitude();
        // if (diff > 0.00001) {
        //     console.warn("To high diff", diff);
        // }

        // calculate new v
        const tmp = normal.multiply(vCollision.dot(normal) * 2);
        const reflectedV = vCollision.subtract(tmp);
        const finalV = reflectedV.multiply(this.k);

        ball.v = finalV.add(this.ballAcceleration.multiply(tLeft));
        ball.position = collisionPoint.add(ball.v.multiply(tLeft));

        this.playSoundIfAllowed();

        



    };

    private animation = () => {
        const newTime = Date.now();
        const frameTime = newTime - this.currentTime;
        this.currentTime = newTime;
        this.accumulator += frameTime * this.speed;
        const dt = 1000 / this.stepsPerSecond;

        while (this.accumulator >= dt) {
            for (const {ball} of this.activeBalls) {
                this.animateBall(ball, 1 / this.stepsPerSecond);
            }
            this.accumulator -= dt;
        }

        const finishedBalls = this.activeBalls.filter((ballData) => ballData.ball.position.y >= 1);
        this.activeBalls = this.activeBalls.filter((ballData) => ballData.ball.position.y < 1);
        this.renderToCanvas();

        if (this.activeBalls.length > 0) {
            requestAnimationFrame(this.animation);
        }

        for (const ballData of finishedBalls) {
            
            ballData.finishedCallBack();
        }

        if (this.activeBalls.length === 0) {
            this.animationActive = false;
        }
    };

    private saveContext = (ctx: CanvasRenderingContext2D) => {
        this.ctx = ctx;
    };

    private onResize = (width?: number) => {
        if (width === undefined) return;

        this.setState({
            size: width,
        });
        this.renderToCanvas();
    };

    public onDisplayResult = async (ballInfo:any) => {
 
        playFromBegin(sounds.win);

    }

    public onPlay = async (lastGame : any) => {
        for await (const ballItem of lastGame.balls) {
        const resultNum = BigNumber.from(ballItem.luckyNumber).toNumber();
        this.addBall(resultNum, resultNum,ballItem,this.onDisplayResult);
        await sleep(400)
    }
}

    public render() {
        const {size} = this.state;
        const {rows, resultColumn, risk, showResult,gameInfo} = this.props;
        const payout = PLINKO_PAYOUT[risk][rows];


        // TODO: Split in plinko and grid !!!
        return (
            <div className={"w-full  " + this.props.className  }>
                <div className={"w-full h-full"}>
                    <div ref={this.parent} className={"w-full"}>
                        <canvas
                style={{width: "100%"}}
                width={size}
                height={size}
                ref={(node) => (node ? this.saveContext(node.getContext("2d")) : null)}
            />
                        <PayoutTable payout={payout} showResult={showResult} resultColumn={resultColumn} />
                    </div>
                </div>
            </div>
        );
    }
}

export default Plinko;
