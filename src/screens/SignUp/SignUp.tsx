import React, { useState, useEffect } from 'react'
import './signup.css'
import { ChatOutlined, ChevronRight } from '@material-ui/icons'
import StepWizard from "react-step-wizard";
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import { useNavigate } from 'react-router-dom';
import logo_outlined from '../../assets/img/logo_outlined.png'

export default function SignUp(props: any) {
    const { innerHeight: height } = window;
    const [email, setEmail] = useState("");
    const [userDetails, setUserDetails] = useState(Object)
    const [data, setData] = useState(Object)
    const [action, setAction] = useState("")
    const [timer, setTimer] = useState(1);
    const [timerAction, setTimerAction] = useState({ name: "addOneMin" })

    function _setEmail(email: string) {
        setEmail(email);
    }

    return (
        <div className="login-container" style={{ height, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
            <div className="row no-gutters h-100">
                <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                    <div className="login-about">
                        <div className="slogan">
                            {/* <img style={{ height: 50, width: 50, backgroundColor: '#FFF', padding: 10, borderRadius: 5 }} src={logo_outlined} /> */}
                            <div className='logo-container'><ChatOutlined style={{ fontSize: 26, color: '#075E54' }} /></div>
                            <span>Messages</span>
                            <span>Made</span>
                            <span>Easy.</span>
                        </div>
                        <div className="about-desc">
                            Quick Chat is an intelligent and communications tool, built for teams. It provides an integrated platform that makes team communication easy and efficient.
                        </div>
                        {/* <a className="know-more">Know More <ChevronRight /></a> */}
                    </div>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="login-wrapper">
                        <div className="login-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className='login-screen' style={{ display: 'flex', flexDirection: 'column', width: 470, overflowY: 'clip', padding: 20, alignItems: 'center' }}>
                                <StepWizard isHashEnabled={true}>
                                    <Step1
                                        setEmail={_setEmail} setUserDetails={(data: any) => setUserDetails(data)}
                                        action={action}
                                        setUserOnSignup={props.setUserOnSignup}
                                    />
                                    <Step2
                                        userDetails={userDetails} setTimer={(t: number) => setTimer(t)}
                                        setTimerAction={(action: any) => setTimerAction(action)}
                                        setUserDetails={(data: any) => setUserDetails(data)}
                                    />
                                    <Step3
                                        userDetails={userDetails} timer={timer}
                                        setAction={(action: string) => setAction(action)}
                                        setUserOnSignup={props.setUserOnSignup}
                                        timerAction={timerAction}
                                    />
                                </StepWizard>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
