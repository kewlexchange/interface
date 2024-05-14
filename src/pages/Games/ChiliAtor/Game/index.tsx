import React, { Fragment, memo, useEffect, useState } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { useWeb3React } from "@web3-react/core";

import { parseEther } from "ethers/lib/utils";
import { title } from "../../../../Components/Primitives";

const _UnityGameContainer: React.FC<{ sendPacked: any }> = (props) => {
    const { connector, account, provider, chainId } = useWeb3React()

    const { unityProvider, UNSAFE__unityInstance, isLoaded, loadingProgression, unload, sendMessage } = useUnityContext({
        loaderUrl: '/ponygames/chiliator/Build/chiliator.loader.js',
        dataUrl: '/ponygames/chiliator/Build/chiliator.data.gz',
        frameworkUrl: '/ponygames/chiliator/Build/chiliator.framework.js.gz',
        codeUrl: '/ponygames/chiliator/Build/chiliator.wasm.gz',
    });
    const loadingPercentage = Math.round(loadingProgression * 100);
    const [devicePixelRatio, setDevicePixelRatio] = useState(window.devicePixelRatio);

    useEffect(() => {
        global.window.handleGetAccountFunc = handleGetAccount;
    }, [])

    useEffect(() => {
        if(isLoaded){
            if(account){
                sendMessage("Handler", "SetUser", account);
            }
        }
    }, [isLoaded,account])

    const handleGetAccount = () => {
        console.log("acc tetiklendi")
        customSendMessage("Handler", "SetUser", account);
        console.log("acc gitti")
    }
    const customSendMessage = (targetObjectName, methodName, ...args) => {
        // İstediğiniz herhangi bir özel işlemi burada yapabilirsiniz
        // Orijinal sendMessage fonksiyonunu çağırın
        sendMessage(targetObjectName, methodName, ...args);

    };
    const updateDevicePixelRatio = function () {
        setDevicePixelRatio(window.devicePixelRatio);
    };

    const mediaMatcher = window.matchMedia(`screen and (resolution: ${devicePixelRatio}dppx)`);

    useEffect(() => {
        const initialize = () => {
            mediaMatcher.addEventListener('change', updateDevicePixelRatio);
        };

        initialize();

        return () => {
            mediaMatcher.removeEventListener('change', updateDevicePixelRatio);
        };
    }, [mediaMatcher, updateDevicePixelRatio]);

    const handleUnload = async () => {
        try {
            await UNSAFE__unityInstance.Quit();
            unityProvider.setIsLoaded(false);
            unload();
        } catch (error) {
            console.error('Error during unload:', error);
            // Handle the error as needed
        }
    };

    useEffect(() => {
        return () => {
            console.log('Component Unmounted');
            if (isLoaded) {
                console.log('Unload Started');
                handleUnload();
                console.log('Unload End');
            }
        };
    }, [isLoaded, handleUnload]);

    let obj = { 'test': 'sdfasd' }
    return (
        <>

            <Fragment>
                <div style={{ height: 'calc(100vh - 210px)' }} className="w-full p-2 mx-auto">
                    {isLoaded === false && (
                        <div className="w-full h-full flex flex-col items-center justify-center loading-overlay">
                            <p className={title({ size: "sm", color: "yellow" })}>Loading... ({loadingPercentage}%)</p>
                        </div>
                    )}
                    <Unity unityProvider={unityProvider} devicePixelRatio={devicePixelRatio} className="w-full h-full" />
                </div>
            </Fragment>
        </>

    );
};

export const UnityGameContainer = memo(_UnityGameContainer);
