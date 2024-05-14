import IPage from "../../interfaces/page";
import React, { useEffect } from "react";
import ErsanImage from "../../assets/images/about/ersan.gif";
import MarsImage from "../../assets/images/about/mars.gif";
import AhmetImage from "../../assets/images/about/ahmet.jpeg";
import AdnanImage from "../../assets/images/about/adnan.jpeg"
import YarkinImage from "../../assets/images/about/yarkin.jpeg"
import CananImage from "../../assets/images/about/canan.jpeg"
import ChangImage from "../../assets/images/about/chang.jpeg"

import { Tabs, Tab, Card, CardBody, Image, CardHeader, CardFooter } from "@nextui-org/react";

const AboutPage: React.FunctionComponent<IPage> = props => {

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);
    return (

        <>

            <div className="flex w-full flex-col">
            </div>
            <div className={"container mx-auto"}>

                <div className={"w-full rounded-xl p-5 mb-5"}>
                    <h1 className={"text-2xl border-b transparent-border-color mb-2"}>Authors</h1>

                    <div className={"grid sm:grid-cols-3 grid-cols-1 gap-5"}>

                        <Card className="py-4">
                            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                                <p className="text-2xl uppercase font-bold">ERSAN YAKIT</p>
                                <h4 className="font-bold text-large">Blockchain & Smart Contract Developer</h4>
                            </CardHeader>
                            <CardBody className="overflow-visible py-2 flex items-center justify-center">
                                <Image
                                    alt="Card background"
                                    className="object-cover rounded-xl w-[300px] h-[400px]"
                                    src={ErsanImage}
                                    height={300}
                                />
                            </CardBody>
                            <CardFooter>
                                <div className={"grid grid-cols-3 gap-2 text-center"}>
                                    <a target={"_blank"} href={"https://linkedin.com/in/ersanyakit"}>Linkedin</a>
                                    <a target={"_blank"} href={"https://twitter.com/ersanyakit"}>Twitter</a>
                                    <a target={"_blank"} href={"https://github.com/ersanyakit"}>Github</a>

                                </div>
                            </CardFooter>
                        </Card>


                        <Card className="py-4">
                            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                                <p className="text-2xl uppercase font-bold">MARS</p>
                                <h4 className="font-bold text-large">Smart Contract Security Audits</h4>
                            </CardHeader>
                            <CardBody className="overflow-visible py-2 flex items-center justify-center">
                                <Image
                                    alt="Card background"
                                    className="object-cover rounded-xl w-[300px] h-[400px]"
                                    src={MarsImage}
                                />
                            </CardBody>
                            <CardFooter>
                                <div className={"grid grid-cols-3 gap-2 text-center"}>
                                    <a target={"_blank"} href={"https://www.linkedin.com/company/imonai/"}>Linkedin</a>
                                    <a target={"_blank"} href={"https://twitter.com/imondotai"}>Twitter</a>
                                    <a target={"_blank"} href={"https://github.com/imonai"}>Github</a>

                                </div>
                            </CardFooter>
                        </Card>



                    </div>
                </div>
                <div className={"w-full  rounded-xl p-5"}>
                    <h1 className={"text-2xl border-b transparent-border-color mb-2"}>Contributors</h1>

                    <div className={"grid sm:grid-cols-3 grid-cols-1 gap-5"}>


                        <Card className="py-4">
                            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                                <p className="text-2xl uppercase font-bold">YARKIN SAKARYA</p>
                                <h4 className="font-bold text-large">Art Director</h4>
                            </CardHeader>
                            <CardBody className="overflow-visible py-2 flex items-center justify-center">
                                <Image
                                    alt="Card background"
                                    className="object-cover rounded-xl w-[300px] h-[400px]"
                                    src={YarkinImage}
                                    height={300}
                                />
                            </CardBody>
                            <CardFooter>
                                <div className={"grid grid-cols-3 gap-2 text-center"}>
                                    <a target={"_blank"} href={"https://www.linkedin.com/in/yarkinsakarya6b7982185/"}>Linkedin</a>
                                    <a target={"_blank"} href={"https://www.instagram.com/yarkn_sakarya/"}>Instagram</a>
                                    <a target={"_blank"} href={"https://www.artstation.com/yarkin/"}>Art Station</a>

                                </div>
                            </CardFooter>
                        </Card>


                        <Card className="py-4">
                            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                                <p className="text-2xl uppercase font-bold">CANAN İNCEL</p>
                                <h4 className="font-bold text-large">NFT Artist</h4>
                            </CardHeader>
                            <CardBody className="overflow-visible py-2 flex items-center justify-center">
                                <Image
                                    alt="Card background"
                                    className="object-cover rounded-xl w-[300px] h-[400px]"
                                    src={CananImage}
                                    height={300}
                                />
                            </CardBody>
                            <CardFooter>
                                <div className={"grid grid-cols-3 gap-2 text-center"}>
                                    <a target={"_blank"} href={"https://www.instagram.com/cananincl/"}>Instagram</a>


                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>

                <div className={"w-full  rounded-xl p-5"}>
                    <h1 className={"text-2xl border-b transparent-border-color mb-2"}>Advisors</h1>

                    <div className={"grid sm:grid-cols-3 grid-cols-1 gap-5"}>

                    <Card className="py-4">
                            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                                <p className="text-2xl uppercase font-bold">DR. KUCUK</p>
                                <h4 className="font-bold text-large">Academic Advisor - DPhil Oxford University</h4>
                            </CardHeader>
                            <CardBody className="overflow-visible py-2 flex items-center justify-center">
                                <Image
                                    alt="Card background"
                                    className="object-cover rounded-xl w-[300px] h-[400px]"
                                    src={AhmetImage}
                                    height={300}
                                />
                            </CardBody>
                            <CardFooter>
                                <div className={"grid grid-cols-4 gap-2 text-center"}>
                                <a target={"_blank"} href={"https://www.linkedin.com/in/ox1/"}>Linkedin</a>
                                            <a target={"_blank"} href={"https://www.youtube.com/watch?v=RCDJBq3itRI"}>Youtube</a>
                                            <a target={"_blank"} href={"https://www.cs.ox.ac.uk/people/ahmet.kucuk/"}>Oxford</a>
                                            <a target={"_blank"} href={"https://en.wikipedia.org/wiki/Confidential_computing"}>Wiki</a>



                                </div>
                            </CardFooter>
                        </Card>

                        <Card className="py-4">
                            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                                <p className="text-2xl uppercase font-bold">CHANG HWAN KIM</p>
                                <h4 className="font-bold text-large">Marketing Advisor</h4>
                            </CardHeader>
                            <CardBody className="overflow-visible py-2 flex items-center justify-center">
                                <Image
                                    alt="Card background"
                                    className="object-cover rounded-xl w-[300px] h-[400px]"
                                    src={ChangImage}
                                    height={300}
                                />
                            </CardBody>
                            <CardFooter>
                                <div className={"grid grid-cols-3 gap-2 text-center"}>
                                <a target={"_blank"} href={"https://www.instagram.com/klzce"}>Instagram</a>
                                            <a target={"_blank"} href={"https://www.linkedin.com/in/chang-kim-022868108/"}>Linkedin</a>
                                  
                                </div>
                            </CardFooter>
                        </Card>


                        <Card className="py-4">
                            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                                <p className="text-2xl uppercase font-bold">ADNAN BİLGEN</p>
                                <h4 className="font-bold text-large">Academic Advisor - Ph.D. Sr. Java Software Eng.</h4>
                            </CardHeader>
                            <CardBody className="overflow-visible py-2 flex items-center justify-center">
                                <Image
                                    alt="Card background"
                                    className="object-cover rounded-xl w-[300px] h-[400px]"
                                    src={AdnanImage}
                                    height={300}
                                />
                            </CardBody>
                            <CardFooter>
                                <div className={"grid grid-cols-3 gap-2 text-center"}>
                                <a target={"_blank"} href={"https://www.linkedin.com/in/adnan-bilgen/"}>Linkedin</a>
                                </div>
                            </CardFooter>
                        </Card>
                  

                    </div>
                </div>
                <div className={"w-fullrounded-xl p-5 mt-5"}>
                    <h1 className={"text-2xl border-b  mb-2"}>Special Thanks Goes To</h1>

                    <blockquote
                        className="p-4 my-4 border-l-4 rounded-xl">
                        <p className="text-xl italic font-medium leading-relaxed text-pink-960  dark:text-pink-960 ">"
                            Thank you for your investment and support in my project. Without your support, it wouldn't have been possible to achieve this success. I am grateful for your constant presence and support.
                            "</p>
                    </blockquote>
                    <ul>
                        <li>✨ Nick Mudge - <span>Author of EIP-2535 Diamonds</span></li>
                        <li>✨ Nick Barry - <span>SolidState, upgradeable-first Solidity smart contract development library</span></li>
                        <li>✨ Uniswap Developers - <span>Uniswap Exchange</span></li>
                        <li>✨ OpenZeppelin Developers - <span>OpenZeppelin Contracts is a library for secure smart contract development.</span></li>
                        <li>✨ Aytek Üstündağ</li>
                        <li>✨ Doğa Öztüzün</li>
                        <li>✨ Emrah Okay</li>
                        <li>✨ Sedat Okay</li>
                        <li>✨ Cihan Şimşek</li>
                        <li>✨ Özgür Koç</li>
                        <li>✨ Bari Okan Doğan</li>
                        <li>✨ Mustafa Can Kaya</li>
                        <li>✨ Metin Aktaş</li>
                        <li>✨ Ahmet Cafoğlu</li>
                        <li>✨ Aytaç Eminoğlu</li>
                    </ul>

                </div>
            </div>
        </>
    )
}


export default AboutPage;
