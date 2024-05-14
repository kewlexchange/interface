import React, { Fragment, memo, useEffect, useState } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import {title} from "../Primitives";
import {useWeb3React} from "@web3-react/core";
import {useChiliatorGameContract} from "../../hooks/useContract";
import useModal, {
    ModalConnect,
    ModalError,
    ModalLoading,
    ModalNoProvider,
    ModalSuccessTransaction
} from "../../hooks/useModals";
import {parseEther} from "ethers/lib/utils";
import UniwalletModal from "../Modal/UniwalletModal";

const _UnityGameContainer: React.FC = () => {

    const { unityProvider, UNSAFE__unityInstance, isLoaded, loadingProgression, unload,sendMessage } = useUnityContext({
        loaderUrl: '/games/chiliator/gamedata/chiliator.loader.js',
        dataUrl: '/games/chiliator/gamedata/chiliator.data.gz',
        frameworkUrl: '/games/chiliator/gamedata/chiliator.framework.js.gz',
        codeUrl: '/games/chiliator/gamedata/chiliator.wasm.gz',
    });
    const loadingPercentage = Math.round(loadingProgression * 100);
    const [devicePixelRatio, setDevicePixelRatio] = useState(window.devicePixelRatio);


    sendMessage("Canvas", "TestBtn", "test value");

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

let obj = {'test': 'sdfasd'}
    return (
        <>

            <Fragment>
                <div style={{ height: 'calc(100vh - 210px)' }} className="w-full p-2 mx-auto">
                    {isLoaded === false && (
                        <div className="w-full h-full w-screen h-screen flex flex-col items-center justify-center loading-overlay">
                            <p className={title({size: "sm",color: "violet"})}>Loading... ({loadingPercentage}%)</p>
                        </div>
                    )}
                    <Unity unityProvider={unityProvider} devicePixelRatio={devicePixelRatio} className="w-full h-full" />
                </div>
            </Fragment>
        </>

    );
};

export const UnityGameContainer = memo(_UnityGameContainer);
