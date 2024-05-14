import {AnimationHeader} from "../AnimationHeader";

export const Logo = (props: {className:string})=> {

    return (
        <>
            <AnimationHeader repeat={true} width={"256px"} height={"256px"} className={props.className} dataSource={"/images/animation/logo.json"}/>

        </>
    );
}
