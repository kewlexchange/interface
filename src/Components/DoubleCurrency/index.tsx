import { Avatar, AvatarGroup } from '@nextui-org/react';
import React, { useEffect, useState, useRef } from 'react';
import { DEFAULT_TOKEN_LOGO } from '../../constants/misc';

export const DoubleCurrencyIcon = (props: {baseIcon:string,quoteIcon:string})=> {

    return (
        <AvatarGroup size='sm' isBordered>
        <Avatar size='sm' src={props.baseIcon ? props.baseIcon : DEFAULT_TOKEN_LOGO} />
        <Avatar size='sm' src={props.quoteIcon ? props.quoteIcon : DEFAULT_TOKEN_LOGO} />
      </AvatarGroup>

    );
}
