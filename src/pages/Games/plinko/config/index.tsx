
export const VERSION = process.env.VERSION || "";
export const BUILD_DATE = new Date(process.env.BUILD_DATE || new Date());

export const SIGNATURE_VERSION = 2;
export const NEW_EIP_GAME_ID = 572;
export const NEW_EIP_GAME_ID_2 = 1759;
export const OLD_EIP_GAME_ID = 638;


export const ACCOUNT_BALANCE_POLL_INTERVAL = 5000;

export const FROM_WEI_TO_BASE = 1e9; // conversion from wei to base unit GWEI
export const FROM_BASE_TO_WEI = 1e9; // conversion from base unit GWEI to wei

export const NETWORK_NAME = "Main";

export const MIN_GAME_SESSION_VALUE = 1e7;
export const MAX_GAME_SESSION_VALUE = 30e9;
export const HOUSE_EDGE = 150;
export const HOUSE_EDGE_DIVISOR = 10000;

export const MIN_BET_VALUE = 1e4;
export const MAX_BET_VALUE = 4e9;
export const MIN_BANKROLL = 9e9;
export const KELLY_FACTOR = 1;

export const RANGE = 100;
export const MIN_NUMBER_DICE_1 = 1;
export const MAX_NUMBER_DICE_1 = 98;
export const MIN_NUMBER_DICE_2 = 2;
export const MAX_NUMBER_DICE_2 = 99;

export const SESSION_TIMEOUT = 48; // in hours

export const PLINKO_MAX_BET_DIVIDER = 10000;

export const PLINKO_MAX_BET: {[key: number]: {[key: number]: number}} = {
    1: {8: 264, 12: 607, 16: 758},
    2: {8: 55, 12: 175, 16: 208},
    3: {8: 24, 12: 77, 16: 68},
};

export const PLINKO_PAYOUT_DIVIDER = 10;

export const PLINKO_PAYOUT: {[key: number]: {[key: number]: number[]}} = {
    1: {
        8: [7, 8, 9, 10, 11],
        12: [6, 7, 8, 9, 10, 11, 12],
        16: [5, 6, 7, 8, 9, 10, 11, 12, 13],
    },
    2: {
        8: [3, 5, 10, 11, 12],
        12: [3, 6, 8, 10, 11, 12, 13],
        16: [2, 5, 7, 8, 10, 11, 12, 13, 14],
    },
    3: {
        8: [1, 3, 10, 12, 13],
        12: [1, 4, 10, 11, 12, 13, 14],
        16: [1, 3, 5, 10, 11, 12, 13, 14, 15],
    },
};
