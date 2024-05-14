import { Slider, Image, Badge } from "@nextui-org/react";
import IPage from "../../interfaces/page";
import React, { useEffect, useState } from "react";

const TOSPage: React.FunctionComponent<IPage> = props => {
    const [amount, setAmount] = useState(1);

    useEffect(() => {
        document.title = props.title + " - KEWL EXCHANGE";
    }, []);
    return (

        <>
            <div className={"w-full px-2 py-5"}>
                <div className={"min-w-xl max-w-xl w-full sm:w-full mx-auto flex flex-col gap-5 my-5"}>

                    <h1>Terms and Conditions for KEWL Platform</h1>
                    <p><strong>1. Introduction</strong></p>
                    <p>Welcome to KEWL. These Terms and Conditions govern your use of the KEWL platform and the purchase, sale, and management of crypto tokens launched on our platform. By using our services, you agree to be bound by these Terms and Conditions.</p>
                    <p><strong>2. User Responsibility for Losses</strong></p>
                    <p>2.1. Users are solely responsible for any financial losses incurred while using the KEWL platform. This includes losses that arise from market fluctuations, technical issues, or user errors. KEWL does not assume liability for any financial losses that users may experience while engaging in activities related to the purchase, sale, or trading of crypto tokens on our platform.</p>
                    <p>2.2. It is the responsibility of each user to understand the risks associated with crypto token transactions and to take appropriate measures to safeguard their investments. Users should conduct thorough research and consider seeking advice from financial experts before making investment decisions.</p>
                    <p>2.3. KEWL strives to provide a stable and reliable platform but cannot guarantee immunity from external factors that may affect market conditions or the technological infrastructure.</p>
                    <p><strong>3. Token Launchpad Presales</strong></p>
                    <p>KEWL holds the right to conduct up to four rounds of token launchpad presales if the initial presales are deemed successful. This decision is at the discretion of KEWL’s management team and based on market conditions and project performance.</p>
                    <p><strong>4. Intellectual Property</strong></p>
                    <p>4.1. All content included on the KEWL platform, such as text, graphics, logos, images, as well as the compilation thereof, and any software used on the site, is the property of KEWL or its suppliers and protected by copyright and international copyright laws.</p>
                    <p><strong>5. Liability Limitation</strong></p>
                    <p>5.1. KEWL will not be liable for any indirect, incidental, special, consequential or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data or other intangible losses resulting from the use of or inability to use the service.</p>
                    <p><strong>6. Communications Policy</strong></p>
                    <p>6.1. To maintain a positive and constructive environment, KEWL reserves the right to remove any individuals from our communication channels if they are found to be spreading negative comments or misinformation about our crypto assets. This measure is intended to help stabilize the prices of our assets.</p>
                    <p>6.2. If you have any concerns or issues, please address them directly with our support team via private chat. Our administrators are committed to assisting you respectfully and discreetly.</p>
                    <p><strong>7. Refund Policy</strong></p>
                    <p>7.1. Refunds are only available under the following conditions:</p>
                    <p>7.1.1. The project launch is officially canceled.</p>
                    <p>7.1.2. The softcap for the project is not reached within the stipulated timeframe.</p>
                    <p>7.2. All refund requests must be submitted through the official channels provided on the KEWL platform. Refunds will be processed in the original form of payment within a reasonable period of time.</p>
                    <p><strong>8. Damages and Losses</strong></p>
                    <p>8.1. KEWL is not responsible for any damages or losses caused by third parties. Customers are advised to conduct their own research and due diligence regarding the tokens or assets they decide to purchase on our platform.</p>
                    <p><strong>9. Modifications to Terms and Conditions</strong></p>
                    <p>9.1. KEWL reserves the right to update or change these Terms and Conditions at any time. Changes will become effective immediately upon posting on the platform. Your continued use of the platform after such changes constitutes your agreement to the new Terms and Conditions.</p>
                    <p><strong>10. Contact Information</strong></p>
                    <p>10.1. Questions about the Terms and Conditions should be sent to us at <a href="mailto:kewlexchange@gmail.com">kewlexchange@gmail.com</a>.</p>
                    <p><strong>11. Third-Party Links and Content</strong></p>
                    <p>11.1. The platform may contain links to third-party websites or resources. You acknowledge and agree that KEWL is not responsible or liable for: (i) the availability or accuracy of such websites or resources; or (ii) the content, products, or services on or available from such websites or resources.</p>
                    <p><strong>12. Special Conditions for Refunds Involving Malicious Activities</strong></p>
                    <p>12.1. In cases where a user is found to be using multiple wallets or bot accounts to negatively impact the launch or participation of other users in our launches, KEWL reserves the right to apply penalties to any refund requests made by such users.</p>
                    <p>13. Refunds requested under these circumstances will be subject to a deduction of 20% from the total refundable amount, where 10% is a platform fee and another 10% is a project fee. This measure is intended to mitigate the adverse effects on our platform and other users caused by such abusive behaviors.</p>
                    <p>14. KEWL aims to ensure fairness and transparency in all transactions. However, engaging in activities that disrupt the normal operations of our launches will lead to penalties as outlined above.</p>


                </div>
            </div>

            <div className="w-full p-2">
            Last Update : April 28th, Sunday, at 20:21 UTC+3
            </div>
        </>
    )
}


export default TOSPage;
