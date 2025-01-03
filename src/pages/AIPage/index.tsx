import IPage from "../../interfaces/page";
import React, { useEffect, useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import useModal, {
    ModalConnect,
    ModalError,
    ModalLoading,
    ModalNoProvider,
    ModalSelectCryptoCurrency,
    ModalSuccessTransaction
} from "../../hooks/useModals";

import Identicon from "../../Components/Identicon";
import { useWeb3React } from "@web3-react/core";
import { getHour, sendHTTPRequest, uriToHttp } from "../../utils/index"
import {
    generateRandomTailwindColor, generateTweetText,
    getNativeCurrencyByChainId,
    getShordAccount,
    unixTimeToDateTime
} from "../../utils";
import { TagsInput } from "react-tag-input-component";
import { useDiamondContract } from "../../hooks/useContract";
import { ethers } from "ethers";
import { isAddress, parseEther } from "ethers/lib/utils";
import { use } from "i18next";
import AI_PROCESSING_ANIMATION from "../../assets/images/animation/ai-processing.json";
import { AnimationHeader } from "../../Components/AnimationHeader";
import useBlockNumber from "../../hooks/useBlockNumber";
import UniwalletModal from "../../Components/Modal/UniwalletModal";
import { TCommandTypes } from "../../constants/commands";
import { useSocket } from "../../hooks/useSocketProvider";
import { Button, Card,Image } from "@nextui-org/react";

const AIPage: React.FunctionComponent<IPage> = props => {
    const {
        transcript,
        listening,
        interimTranscript,
        finalTranscript,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();
    const { connector, account, provider, chainId } = useWeb3React()
    const IMONDIAMOND = useDiamondContract(chainId, true);
    const { state: isConnect, toggle: toggleConnectModal } = useModal()
    const [showSettings, setShowSettings] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [voiceList, setVoiceList] = useState<[] | null>(null)
    const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0)
    const [messageInput, setMessageInput] = useState("")
    const [showLanguages, setShowLanguages] = useState(false)
    const [pitchValue, setPitchValue] = useState(1)
    const [rateValue, setRateValue] = useState(1)
    const messageContainer = useRef<HTMLDivElement>(null);
    const [userPrompts, setUserPropmts] = useState([])
    const { socket } = useSocket();

    const [prompts, setPrompts] = useState(["Intelligent Monsters"]);
    const { state: isTransactionSuccess, toggle: toggleTransactionSuccess } = useModal();
    const { state: isShowLoading, toggle: toggleLoading } = useModal();
    const { state: isErrorShowing, toggle: toggleError } = useModal()
    const { state: isCryptoSelectShowing, toggle: toggleCryptoSelectShowing } = useModal()
    const textareaRef = useRef(null);

    const [transaction, setTransaction] = useState({ hash: '', summary: '', error: null })
    const { state: isNoProvider, toggle: toggleNoProvider } = useModal()
    const [statusText, setStatusText] = useState("Waiting for confirmation...")
    const blockNumber = useBlockNumber()
    const [cryptocurrencyList, setCryptocurrencyList] = useState([])
    const [activeCryptocurrency, setActiveCryptoCurrency] = useState(null)
    const [messages, setMessages] = useState<any[]>([]);

    const synth: SpeechSynthesis = window.speechSynthesis;

    const defaultTokens = [
        {
            "ID": 609,
            "AssetType": 1,
            "Pair": 4066,
            "Name": "Chiliz",
            "Ticker": "CHZ",
            "Sector": null,
            "Industry": null,
            "Exchange": null,
            "Country": null,
            "Slug": "CHILIZ",
            "Thumb": "https://s2.coinmarketcap.com/static/img/coins/128x128/4066.png",
            "Logo": "https://s2.coinmarketcap.com/static/img/coins/128x128/4066.png",
            "Description": null,
            "FavoritedBy": [],
            "Followers": [],
            "Comments": null,
            "CreatedAt": "2023-10-01T07:58:57.605299Z",
            "UpdatedAt": "2023-10-02T05:47:27.273404Z",
            "DeletedAt": null
        },
        {
            "ID": 539,
            "AssetType": 1,
            "Pair": 1,
            "Name": "Bitcoin",
            "Ticker": "BTC",
            "Sector": null,
            "Industry": null,
            "Exchange": null,
            "Country": null,
            "Slug": "BITCOIN",
            "Thumb": "https://s2.coinmarketcap.com/static/img/coins/128x128/1.png",
            "Logo": "https://s2.coinmarketcap.com/static/img/coins/128x128/1.png",
            "Description": null,
            "FavoritedBy": [],
            "Followers": [],
            "Comments": null,
            "CreatedAt": "2023-10-01T07:58:56.567147Z",
            "UpdatedAt": "2023-10-02T05:47:27.183983Z",
            "DeletedAt": null
        },
        {
            "ID": 540,
            "AssetType": 1,
            "Pair": 1027,
            "Name": "Ethereum",
            "Ticker": "ETH",
            "Sector": null,
            "Industry": null,
            "Exchange": null,
            "Country": null,
            "Slug": "ETHEREUM",
            "Thumb": "https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png",
            "Logo": "https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png",
            "Description": null,
            "FavoritedBy": [],
            "Followers": [],
            "Comments": null,
            "CreatedAt": "2023-10-01T07:58:56.589734Z",
            "UpdatedAt": "2023-10-02T05:47:27.185147Z",
            "DeletedAt": null
        },
        {
            "ID": 560,
            "AssetType": 1,
            "Pair": 5805,
            "Name": "Avalanche",
            "Ticker": "AVAX",
            "Sector": null,
            "Industry": null,
            "Exchange": null,
            "Country": null,
            "Slug": "AVALANCHE",
            "Thumb": "https://s2.coinmarketcap.com/static/img/coins/128x128/5805.png",
            "Logo": "https://s2.coinmarketcap.com/static/img/coins/128x128/5805.png",
            "Description": null,
            "FavoritedBy": [],
            "Followers": [],
            "Comments": null,
            "CreatedAt": "2023-10-01T07:58:56.815429Z",
            "UpdatedAt": "2023-10-02T05:47:27.211366Z",
            "DeletedAt": null
        },
        {
            "ID": 577,
            "AssetType": 1,
            "Pair": 11841,
            "Name": "Arbitrum",
            "Ticker": "ARB",
            "Sector": null,
            "Industry": null,
            "Exchange": null,
            "Country": null,
            "Slug": "ARBITRUM",
            "Thumb": "https://s2.coinmarketcap.com/static/img/coins/128x128/11841.png",
            "Logo": "https://s2.coinmarketcap.com/static/img/coins/128x128/11841.png",
            "Description": null,
            "FavoritedBy": [],
            "Followers": [
                {
                    "ID": 4,
                    "Username": "ersan",
                    "Balance": 9999.9922,
                    "City": null,
                    "Country": null,
                    "Bio": "Blockchain & Smart Contract Geliştiricisi",
                    "CoverImage": "https://api.kewl.exchange/static/images/profiles/4/profile/cover.jpg",
                    "ProfileImage": "https://api.kewl.exchange/static/images/profiles/4/profile/profile.png",
                    "WalletAddress": "0x97A6C342323A10369C2a3C1e89725107fCaFC75E",
                    "WalletSignature": null,
                    "EmailVerified": false,
                    "IsOnline": false,
                    "Notifications": true,
                    "IsVerified": true,
                    "IsBot": false,
                    "HasPendingSubscriptionRequest": true,
                    "LastAiPromptCreationDate": "2023-12-02T14:18:22.839131Z",
                    "LastChatMessageCreationDate": "2023-10-04T07:08:32.669786Z",
                    "LastCommentCreationDate": "2023-11-20T02:39:05.781403Z",
                    "PendingSubsriptionId": 13,
                    "VerifiedAt": "2024-09-25T05:17:51.206319Z",
                    "VerificationExpiration": "2024-10-25T05:17:51.206319Z",
                    "SocketID": null,
                    "Followers": null,
                    "Followings": null,
                    "BlockedUsers": null,
                    "FollowedEquities": null,
                    "CreatedAt": "2023-09-14T02:31:18.677056Z",
                    "UpdatedAt": "2023-12-02T14:18:22.839812Z",
                    "DeletedAt": null
                }
            ],
            "Comments": null,
            "CreatedAt": "2023-10-01T07:58:57.100678Z",
            "UpdatedAt": "2023-10-02T05:47:27.231958Z",
            "DeletedAt": null
        },
        {
            "ID": 580,
            "AssetType": 1,
            "Pair": 11840,
            "Name": "Optimism",
            "Ticker": "OP",
            "Sector": null,
            "Industry": null,
            "Exchange": null,
            "Country": null,
            "Slug": "OPTIMISM-ETHEREUM",
            "Thumb": "https://s2.coinmarketcap.com/static/img/coins/128x128/11840.png",
            "Logo": "https://s2.coinmarketcap.com/static/img/coins/128x128/11840.png",
            "Description": null,
            "FavoritedBy": [],
            "Followers": [],
            "Comments": null,
            "CreatedAt": "2023-10-01T07:58:57.142655Z",
            "UpdatedAt": "2023-10-02T05:47:27.235686Z",
            "DeletedAt": null
        },
        {
            "ID": 545,
            "AssetType": 1,
            "Pair": 2010,
            "Name": "Cardano",
            "Ticker": "ADA",
            "Sector": null,
            "Industry": null,
            "Exchange": null,
            "Country": null,
            "Slug": "CARDANO",
            "Thumb": "https://s2.coinmarketcap.com/static/img/coins/128x128/2010.png",
            "Logo": "https://s2.coinmarketcap.com/static/img/coins/128x128/2010.png",
            "Description": null,
            "FavoritedBy": [],
            "Followers": [],
            "Comments": null,
            "CreatedAt": "2023-10-01T07:58:56.651809Z",
            "UpdatedAt": "2023-10-02T05:47:27.192704Z",
            "DeletedAt": null
        },
        {
            "ID": 543,
            "AssetType": 1,
            "Pair": 52,
            "Name": "XRP",
            "Ticker": "XRP",
            "Sector": null,
            "Industry": null,
            "Exchange": null,
            "Country": null,
            "Slug": "XRP",
            "Thumb": "https://s2.coinmarketcap.com/static/img/coins/128x128/52.png",
            "Logo": "https://s2.coinmarketcap.com/static/img/coins/128x128/52.png",
            "Description": null,
            "FavoritedBy": [],
            "Followers": [],
            "Comments": null,
            "CreatedAt": "2023-10-01T07:58:56.631651Z",
            "UpdatedAt": "2023-10-02T05:47:27.189017Z",
            "DeletedAt": null
        },
        {
            "ID": 548,
            "AssetType": 1,
            "Pair": 1958,
            "Name": "TRON",
            "Ticker": "TRX",
            "Sector": null,
            "Industry": null,
            "Exchange": null,
            "Country": null,
            "Slug": "TRON",
            "Thumb": "https://s2.coinmarketcap.com/static/img/coins/128x128/1958.png",
            "Logo": "https://s2.coinmarketcap.com/static/img/coins/128x128/1958.png",
            "Description": null,
            "FavoritedBy": [],
            "Followers": [],
            "Comments": null,
            "CreatedAt": "2023-10-01T07:58:56.678021Z",
            "UpdatedAt": "2023-10-02T05:47:27.1966Z",
            "DeletedAt": null
        },
        {
            "ID": 542,
            "AssetType": 1,
            "Pair": 1839,
            "Name": "BNB",
            "Ticker": "BNB",
            "Sector": null,
            "Industry": null,
            "Exchange": null,
            "Country": null,
            "Slug": "BNB",
            "Thumb": "https://s2.coinmarketcap.com/static/img/coins/128x128/1839.png",
            "Logo": "https://s2.coinmarketcap.com/static/img/coins/128x128/1839.png",
            "Description": null,
            "FavoritedBy": [],
            "Followers": [],
            "Comments": null,
            "CreatedAt": "2023-10-01T07:58:56.61794Z",
            "UpdatedAt": "2023-10-02T05:47:27.187451Z",
            "DeletedAt": null
        },
        {
            "ID": 546,
            "AssetType": 1,
            "Pair": 5426,
            "Name": "Solana",
            "Ticker": "SOL",
            "Sector": null,
            "Industry": null,
            "Exchange": null,
            "Country": null,
            "Slug": "SOLANA",
            "Thumb": "https://s2.coinmarketcap.com/static/img/coins/128x128/5426.png",
            "Logo": "https://s2.coinmarketcap.com/static/img/coins/128x128/5426.png",
            "Description": null,
            "FavoritedBy": [],
            "Followers": [],
            "Comments": null,
            "CreatedAt": "2023-10-01T07:58:56.658113Z",
            "UpdatedAt": "2023-10-02T05:47:27.194263Z",
            "DeletedAt": null
        },
        {
            "ID": 547,
            "AssetType": 1,
            "Pair": 74,
            "Name": "Dogecoin",
            "Ticker": "DOGE",
            "Sector": null,
            "Industry": null,
            "Exchange": null,
            "Country": null,
            "Slug": "DOGECOIN",
            "Thumb": "https://s2.coinmarketcap.com/static/img/coins/128x128/74.png",
            "Logo": "https://s2.coinmarketcap.com/static/img/coins/128x128/74.png",
            "Description": null,
            "FavoritedBy": [],
            "Followers": [],
            "Comments": null,
            "CreatedAt": "2023-10-01T07:58:56.671949Z",
            "UpdatedAt": "2023-10-02T05:47:27.195505Z",
            "DeletedAt": null
        },
        {
            "ID": 552,
            "AssetType": 1,
            "Pair": 3890,
            "Name": "Polygon",
            "Ticker": "MATIC",
            "Sector": null,
            "Industry": null,
            "Exchange": null,
            "Country": null,
            "Slug": "POLYGON",
            "Thumb": "https://s2.coinmarketcap.com/static/img/coins/128x128/3890.png",
            "Logo": "https://s2.coinmarketcap.com/static/img/coins/128x128/3890.png",
            "Description": null,
            "FavoritedBy": [],
            "Followers": [],
            "Comments": null,
            "CreatedAt": "2023-10-01T07:58:56.750386Z",
            "UpdatedAt": "2023-10-02T05:47:27.201663Z",
            "DeletedAt": null
        },
        {
            "ID": 564,
            "AssetType": 1,
            "Pair": 7083,
            "Name": "Uniswap",
            "Ticker": "UNI",
            "Sector": null,
            "Industry": null,
            "Exchange": null,
            "Country": null,
            "Slug": "UNISWAP",
            "Thumb": "https://s2.coinmarketcap.com/static/img/coins/128x128/7083.png",
            "Logo": "https://s2.coinmarketcap.com/static/img/coins/128x128/7083.png",
            "Description": null,
            "FavoritedBy": [],
            "Followers": [],
            "Comments": null,
            "CreatedAt": "2023-10-01T07:58:56.892376Z",
            "UpdatedAt": "2023-10-02T05:47:27.215986Z",
            "DeletedAt": null
        },
        {
            "ID": 638,
            "AssetType": 1,
            "Pair": 8104,
            "Name": "1inch Network",
            "Ticker": "1INCH",
            "Sector": null,
            "Industry": null,
            "Exchange": null,
            "Country": null,
            "Slug": "1INCH",
            "Thumb": "https://s2.coinmarketcap.com/static/img/coins/128x128/8104.png",
            "Logo": "https://s2.coinmarketcap.com/static/img/coins/128x128/8104.png",
            "Description": null,
            "FavoritedBy": [],
            "Followers": [],
            "Comments": null,
            "CreatedAt": "2023-10-01T07:58:58.035192Z",
            "UpdatedAt": "2023-10-02T05:47:27.311175Z",
            "DeletedAt": null
        }

    ]

    const defaultQuestions = [
        `Could you analyze the technical and fundamental aspects of ${activeCryptocurrency && activeCryptocurrency.Name} and provide support and resistance levels?`,
        `Could you please provide a fundamental analysis of ${activeCryptocurrency && activeCryptocurrency.Name} for me?`,
        `Can you perform technical analysis on ${activeCryptocurrency && activeCryptocurrency.Name}?`,
        `Can you perform technical and fundamental analysis on ${activeCryptocurrency && activeCryptocurrency.Name}?`,
        `Could you analyze the technical and fundamental aspects of ${activeCryptocurrency && activeCryptocurrency.Name} and provide the price movement direction based on support and resistance levels?`,
        `What is ${activeCryptocurrency && activeCryptocurrency.Name} and how does it work?`
    ]


    const initChatSocket = () => {
        if (!socket) {
            return
        }
        socket.on("ai_message", (data: any) => {
            //setMessages(messages => [...messages, JSON.parse(data)]);
            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages];
                const parsedData = JSON.parse(data);


                const index = updatedMessages.findIndex(msg => msg.ID === parsedData.ID);

                if (index !== -1) {
                    updatedMessages[index] = parsedData;
                } else {
                    updatedMessages.push(parsedData);
                }

                return updatedMessages;
            });
        });
    }
    useEffect(() => {
        if (socket) {
            initChatSocket()
        }

    }, [socket])

    const startListening = () => {
        const language = voiceList && voiceList.length > 0 ? voiceList[selectedVoiceIndex]?.lang : 'en-US';
        SpeechRecognition.startListening({ language: language, continuous: true });
    }
    const stopListening = () => {
        SpeechRecognition.stopListening();
    }

    const speak = (message) => {
        let oldListeningStatus = isListening;
        oldListeningStatus && setIsListening(false);
        const utterance = new SpeechSynthesisUtterance(message);
        if (voiceList && voiceList.length > 0) {
            utterance.voice = voiceList[selectedVoiceIndex];
        }
        utterance.pitch = pitchValue;
        utterance.rate = rateValue;
        resetTranscript()
        window.speechSynthesis.speak(utterance);
        oldListeningStatus && setIsListening(true);
    }

    const addMessage = (message, is_send) => {
        if (message.length <= 0) { return; }
        setPrompts([...prompts, message])
    }

    const fetchCryptocurrencies = async () => {
        setCryptocurrencyList(defaultTokens)
        setActiveCryptoCurrency(defaultTokens[0])

    }

    useEffect(() => {
        fetchCryptocurrencies()
    }, [])

    useEffect(() => {
        if (!voiceList) { return; }
        if (voiceList.length === 0) { return };

        voiceList.map((item, index) => {
            if (item?.lang == "en-US") {
                setSelectedVoiceIndex(index)
            }
        })

    }, [voiceList])

    const initVoices = async () => {

        if ('speechSynthesis' in window) {
            const voices: SpeechSynthesisVoice[] = synth.getVoices();
            setVoiceList(voices)
            synth.onvoiceschanged = () => {
                const _voices: SpeechSynthesisVoice[] = synth.getVoices();
                setVoiceList(_voices)
            }
        } else {
            console.log("EXCEPTION:INIT_VOICES")
        }

    }

    const initDefaults = async () => {
        await initVoices();

    }



    useEffect(() => {
        const _proposerAddress = location.pathname.replace("/ai/", "")




    }, [chainId, account, blockNumber])

    useEffect(() => {
        initDefaults();
    }, [])

    useEffect(() => {
        
        setMessageInput(finalTranscript)
        //resetTranscript();
    }, [finalTranscript]);


    useEffect(() => {
        if (isListening) {
            startListening();
        } else {
            stopListening();
        }

    }, [isListening]);

    const handleOnRateChange = (e) => {
        setRateValue(e.target.value)
    }


    const handleOnPitchChange = (e) => {
        setPitchValue(e.target.value)
    }

    const handleSendMessage = async () => {

        if (messageInput.length == 0) {
            setTransaction({ hash: '', summary: '', error: { message: "Prompts cannot be empty!" } });
            toggleError();
            return;
        }

        const chatsResponse = await sendHTTPRequest(TCommandTypes.ACT_AI_QUERY,
            [
                { key: "userId", value: 0 },
                { key: "equityId", value: activeCryptocurrency.ID },
                { key: "token", value: "IMON" },
                { key: "message", value: messageInput },
                { key: "prompt", value: "" }
            ])



        if (chatsResponse.payload.Status) {
            console.log(chatsResponse.statusText)
        }



    }

    useEffect(() => {
        autoExpandTextarea()
    }, [messageInput])
    const onSelect = async (tokenItem) => {
        setMessageInput("")
        setActiveCryptoCurrency(tokenItem)
        toggleCryptoSelectShowing()
    }

    const autoExpandTextarea = () => {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        console.log(textarea.scrollHeight)
        textarea.style.height = `${textarea.scrollHeight}px`;
        textarea.style.minHeight = `${textarea.scrollHeight}px`;
    };


    const getAnswer = (entry: any) => {
        entry = JSON.parse(entry)
        if (entry.choices?.length > 0) {
            let answer = entry.choices[0].message.content;
            const formattedAnswer = answer.replace(/\n/g, '<br>');
            return formattedAnswer;
        } else {
            return ""
        }
    }


    useEffect(() => {
        if (isConnect) {
            if (isAddress(account)) {
                toggleConnectModal();
            }
        }

    }, [account])

    useEffect(() => {
        if (messageContainer.current) {
            messageContainer.current.scrollTop = messageContainer.current.scrollHeight;
        }
    }, [messages.length]);

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);
    return (

        <>
            <ModalSelectCryptoCurrency onSelect={onSelect} tokenList={cryptocurrencyList} isClosable={true} isShowing={isCryptoSelectShowing} hide={toggleCryptoSelectShowing} />
            <UniwalletModal />
            <ModalConnect isShowing={isConnect} hide={toggleConnectModal} />
            <ModalError
                isShowing={isErrorShowing}
                hide={toggleError}
                error={transaction.error}
            />
            <ModalLoading text={statusText} isClosable={true} hide={toggleLoading} isShowing={isShowLoading} />
            <ModalSuccessTransaction transaction={transaction} hide={toggleTransactionSuccess} isShowing={isTransactionSuccess} />

            <Card className={"container w-full my-5 mx-auto"}>
                <div className={"w-full flex flex-col items-center gap-2 "}>
                    <div className={"w-full grid grid-cols-2 sm:grid-cols-1 gap-2 items-center justify-between gap-2 p-2 rounded-lg"}>
                        <div className={"w-full flex flex-row items-center  justify-start gap-2"}>
                            <div className={"w-[50px]"}>
                                <img className={"w-full h-full rounded-lg"} src={"/images/imon-pink.svg"} alt={"Intelligent Monsters"} />
                            </div>
                            <div className={"flex flex-col"}>
                                <span className={"font-bold"}>AI Trade Chat Bot</span>
                                <span className={"text-sm"}>IMON AI ChatBot: Your Ultimate Cryptocurrency Analysis Companion</span>
                            </div>
                        </div>
                        <div className={"w-full flex flex-row items-center justify-end gap-2"}>

                            <button onPress={() => {
                                setUserPropmts([])
                            }} className={"bg-background border-default border border-1 rounded-full p-2 flex items-center justify-center hover:bg-white/30"}>
                                <span translate={"no"} className="material-symbols-outlined">
                                    refresh
                                </span>
                            </button>

                            {
                                !isListening && <button onPress={() => {
                                    setIsListening(true);
                                }} className={"bg-background border-default border border-1 rounded-full p-2 flex items-center justify-center hover:bg-white/30"}>
                                    <span translate={"no"} className="material-symbols-outlined">
                                        auto_detect_voice
                                    </span>

                                </button>
                            }

                            {
                                isListening && <button onPress={() => {
                                    setIsListening(false)
                                }} className={"bg-background border-default border border-1 rounded-full p-2 flex items-center justify-center hover:bg-white/30"}>
                                    <span translate={"no"} className="material-symbols-outlined">
                                        mic_off
                                    </span>
                                </button>
                            }


                            <button onPress={() => {
                                setShowSettings(!showSettings)
                            }} className={"bg-background border-default border border-1 rounded-full p-2 flex items-center justify-center hover:bg-white/30"}>
                                <span translate={"no"} className="material-symbols-outlined">
                                    settings
                                </span>
                            </button>

                        </div>
                    </div>
                    <div className={"w-full flex flex-col gap-2"}>
                        {
                            showSettings && <>

                                <div className={"w-full grid grid-cols-2 gap-2 p-2"}>
                                    <div className={"w-full bg-background border-default border border-1 rounded-lg p-2 flex flex-col gap-2"}>
                                        <div className="w-full flex flex-row items-center justify-between">
                                            <label className={"font-bold text-xs whitespace-nowrap"}>Rate</label>
                                            <span className="rate-value">{rateValue}</span>
                                        </div>
                                        <input onChange={(e) => {
                                            handleOnRateChange(e)
                                        }} type="range" min={0.5} max={2} step={0.1} defaultValue={rateValue} id="rate" />
                                    </div>
                                    <div className={"w-full bg-background border-default border border-1 rounded-lg  p-2 flex flex-col gap-2"}>
                                        <div className="w-full flex flex-row items-center justify-between">
                                            <label className={"font-bold text-xs whitespace-nowrap"}>Pitch</label>
                                            <div className="pitch-value">{pitchValue}</div>
                                        </div>
                                        <input onChange={(e) => {
                                            handleOnPitchChange(e);
                                        }} type="range" min={0} max={2} step={0.1} defaultValue={pitchValue} id="pitch" />
                                    </div>
                                    {
                                        voiceList && voiceList.length > 0 &&
                                        <button onPress={() => {
                                            setShowLanguages(!showLanguages)
                                        }} className={"sm:col-span-2 w-full bg-background border-default border border-1 rounded-lg p-2 flex flex-col gap-2"}>
                                            <span className={"font-bold text-xs whitespace-nowrap"}>{voiceList[selectedVoiceIndex]?.name}</span>
                                            <span className={"text-sm"}>{voiceList[selectedVoiceIndex]?.lang}</span>
                                        </button>
                                    }
                                </div>

                                <div className={"w-full flex flex-col gap-2"}>
                                    <div className={"w-full max-h-[300px] overflow-y-scroll overflow-x-hidden grid sm:grid-cols-5  p-2 grid-cols-2 rounded-lg gap-2"}>
                                        {
                                            showLanguages && voiceList && voiceList.length > 0 && voiceList.map((voice, index) => (
                                                <button onPress={() => {
                                                    setSelectedVoiceIndex(index)
                                                    setShowLanguages(false)
                                                }} className={(index == selectedVoiceIndex ? "bg-white/30" : "") + " border-default border rounded-lg hover:bg-white/30 p-2 flex flex-col gap-2"}>
                                                    <span className={"font-bold text-xs whitespace-nowrap"}>{voice?.name}</span>
                                                    <span className={"text-sm"}>{voice?.lang}</span>
                                                </button>

                                            ))
                                        }
                                    </div>
                                </div>
                            </>
                        }


                    </div>
                </div>
        
                <div className={"w-full p-2 rounded-lg"}>
                    <div className="w-full swap">
                        <div className="input-group input-group-vertical">
                            <span>Enter a Prompt</span>

                            <div className="w-full">

                                <div className=" rounded-xl w-full">
                                    <div className="w-full rounded-xl pb-0 mb-4">
                                        <div className="ai-inputs pb-0">
                                            <div className="input sm:order-1">

                                                {

                                                    <div onPress={() => {
                                                        toggleCryptoSelectShowing()
                                                    }} className="token-selector">
                                                        <img className="rounded-full" src={activeCryptocurrency && activeCryptocurrency.Logo} alt={activeCryptocurrency && activeCryptocurrency.Name} />
                                                        <div>{activeCryptocurrency && activeCryptocurrency.Ticker}</div>
                                                        <span className="material-symbols-outlined font-bold -ml-1">
                                                            expand_more
                                                        </span>
                                                    </div>
                                                }


                                                <textarea ref={textareaRef}
                                                    onInput={(e) => {
                                                        setMessageInput(e.target.value)
                                                    }}
                                                    className={"prompt rounded-lg h-full"} value={messageInput} onChange={(e) => {

                                                    }} inputMode="text" autoComplete="off" autoCorrect="off" type="text"
                                                    placeholder={`Could you please provide a fundamental analysis of ${activeCryptocurrency && activeCryptocurrency.Name} for me?`} minLength={0} maxLength={500} spellCheck="false" />
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={"w-full flex flex-col items-center justify-start gap-2 py-2"}>
                                <div className={"w-full flex flex-col gap-2"}>

                                    {
                                        defaultQuestions.map((item, index) => {
                                            return (
                                                <Button key={`ai-question-item` + index} onPress={() => {
                                                    setMessageInput(item)
                                                }} className="flex flex-row gap-2 items-center justify-start min-h-[50px] w-full text-xs">
                                                    <img className="w-5 h-5 rounded-full" src={activeCryptocurrency && activeCryptocurrency.Logo} alt="IMON Question" />
                                                    <span>{item}</span>
                                                </Button>
                                            )

                                        })
                                    }

                                </div>

                            </div>
                            <div className="flex items-center justify-center">
                                <Button color="default" onPress={() => {
                                    handleSendMessage()
                                }} className="btn btn-primary w-[50%] rounded-lg p-2">
                                    Ask IMON
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={"w-full"}>
                    <div className={"rounded-lg relative overflow-x-auto p-5"}>

                        <div ref={messageContainer} className={"grid grid-cols-1 gap-2"}>
                            {
                                messages && messages.length > 0 && messages.map((messageItem: any, index) => (

                                    <div key={index} className={"w-full flex flex-col gap-2 py-3"} >

                                        <div className="flex self-end gap-2 w-full justify-end">
                                            <div className="w-full sm:max-w-[50%] sm:min-w-[50%]">
                                                <div className="flex justify-start items-start px-3 py-1 rounded-lg rounded-br-none bg-primary-50 text-primary-600 dark:text-primary ">
                                                    <p className="font-sans">{messageItem.Question}</p>
                                                </div>
                                                <div className={"w-full flex flex-row gap-2 items-center justify-around"}>
                                                    <p className="w-full text-xs font-light">
                                                        {getHour(messageItem.CreatedAt)}
                                                    </p>
                                                    <p className="text-end w-full">@{getShordAccount(account ? account : ethers.constants.AddressZero)}</p>
                                                </div>
                                            </div>
                                            <div className="self-center">
                                                <Identicon size={32} account={account} />
                                            </div>
                                        </div>

                                        {
                                            messageItem.Processed ?
                                                <div className="flex gap-2 self-start items-start justify-start">
                                                    <div className="self-center h-full">
                                                        <Identicon size={32} account="0x9631be8566fC71d91970b10AcfdEe29F21Da6C27" />
                                                    </div>
                                                    <div className="w-full">
                                                        <div className="flex justify-center items-center px-3 py-1 rounded-lg rounded-tl-none bg-success-50 text-success-600 dark:text-success">
                                                            <p className="font-sans" dangerouslySetInnerHTML={{ __html: getAnswer(messageItem.Answer) }}></p>
                                                        </div>

                                                        <div className={"w-full flex gap-2 flex-row items-center justify-around"}>
                                                            <p className="w-full text-xs font-light">
                                                                {getHour(messageItem.CreatedAt)}
                                                            </p>
                                                            <p className="text-end w-full">@IMON</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                :
                                                <div className="w-full gap-2 flex flex-row font-bold  text-lg text-pink-960 items-center justify-start">
                                                    <svg className="animate-spin h-10 w-10 text-pink-960" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing... Please Wait...
                                                </div>


                                        }

                                    </div>
                                ))
                            }
                            {
                                messages.length > 0 ? <>
                                    {
                                        userPrompts.map((promptItem, index) => {
                                            return (
                                                <div key={`msg${index}`} className={"chat " + (index % 2 === 0 ? "chat-start" : "chat-end")}>
                                                    <div className="chat-image avatar">
                                                        <div className="w-10 rounded-full">
                                                            <Identicon account={account} size={40} />
                                                        </div>
                                                    </div>
                                                    <div className="chat-header">
                                                        <span>{unixTimeToDateTime(promptItem.createdAt)}</span>
                                                    </div>
                                                    <div className={"chat-bubble  bg-no-repeat bg-cover w-full flex flex-col gap-2 " + generateRandomTailwindColor(userPrompts.length - index)} >
                                                        {
                                                            promptItem.is_processed ? <>
                                                                <div className={"w-full rounded-lg flex flex-col items-center justify-center"}>
                                                                    <img className={"w-full h-full rounded-xl p-2"} src={uriToHttp(promptItem.ipfs)[0]} />
                                                                </div>
                                                            </> : <>
                                                                <div className={"w-full bg-white/30 rounded-lg flex flex-col items-center justify-center gap-2"}>
                                                                    <AnimationHeader repeat={true} width={"100px"} height={"100px"}
                                                                        className={"w-full"} dataSource={AI_PROCESSING_ANIMATION} />
                                                                    <span>Processing... Please Wait...</span>
                                                                </div>
                                                            </>
                                                        }

                                                        <div className={"w-full flex flex-col gap-2 rounded-lg bg-white/30 p-2"}>
                                                            {promptItem.prompts.join()}
                                                        </div>

                                                        <div className={"w-full flex flex-col gap-2 rounded-lg bg-white/30 p-2"}>
                                                            <a target={"_blank"} href={generateTweetText(promptItem)} className={"btn btn-primary cursor-pointer flex flex-row"}>
                                                                <span translate={"no"} className="material-symbols-outlined">
                                                                    share
                                                                </span>
                                                                Tweet
                                                            </a>
                                                        </div>



                                                    </div>
                                                </div>
                                            )

                                        })
                                    }
                                </> : <>
                                    <span>Your artificial intelligence prompts will appear here.</span>
                                </>
                            }
                        </div>



                    </div>
                </div>
            </Card>
        </>
    )
}


export default AIPage;
