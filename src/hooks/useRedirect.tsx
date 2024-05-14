import React, { useRef } from 'react';
import {redirect} from "react-router-dom";
import { useNavigate } from "react-router-dom";

export function redirectRouteURL(path){
    return redirect(path)
}