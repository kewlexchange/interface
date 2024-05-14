import {Action, AnyAction} from "redux";


export function fixedLengthAddElement<T>(array: T[], element: T, maxLength: number): T[] {
    if (array.length >= maxLength) {
        return [...array.slice(array.length - maxLength + 1), element];
    } else {
        return [...array, element];
    }
}

export function fixedLengthAddElementFront<T>(array: T[], element: T, maxLength: number): T[] {
    if (array.length >= maxLength) {
        return [element, ...array.slice(0, maxLength - 1)];
    } else {
        return [element, ...array];
    }
}


export type $Values<T extends {[key: string]: unknown}> = T[keyof T];

export type ActionType<T extends {[id: string]: (...args: any[]) => any}> = ReturnType<$Values<T>>;

export type ActionCreateType<T extends {[key: string]: unknown}> = (...args: any[]) => {type: $Values<T>};





export function createConstant<T>(p: T, prefix: string): T {
    const res = prefix + "/" + (p as any);
    return res as any;
}

export function assertNever(t: never): never {
    return t;
}

export function isLocalStorageAvailable() {
    const mod = "test";
    try {
        localStorage.setItem(mod, mod);
        localStorage.removeItem(mod);
        return true;
    } catch (e) {
        return false;
    }
}

export function isSessionStorageAvailable() {
    const mod = "test";
    try {
        sessionStorage.setItem(mod, mod);
        sessionStorage.removeItem(mod);
        return true;
    } catch (e) {
        return false;
    }
}

export function truncate(str: string, n: number) {
    if (n < 3) {
        throw new Error("n needs to be at least 3");
    }

    return str.length > n ? str.substr(0, n - 3) + "..." : str;
}
