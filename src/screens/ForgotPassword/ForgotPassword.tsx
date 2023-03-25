import { ChatOutlined, ChevronRight } from '@material-ui/icons'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import StepWizard from 'react-step-wizard';
import ResetPassword from './ResetPassword';
import SendEmail from './SendEmail';
import Button from '@mui/material/Button';

export default function ForgotPassword() {
    const { innerHeight: height } = window;
    const [email, setEmail] = useState("")
    const [userId, setUserId] = useState(undefined)
    const [step, setStep] = useState(1)
    const navigate = useNavigate();

    function changeStep(stepNo: number) {
        setStep(stepNo);
    }

    function _setEmail(email: string) {
        setEmail(email);
    }
    function _setUserId(id: any) {
        setUserId(id);
    }

    function login() {
        navigate('/');
    }

    return (
        <div className="login-container" style={{ height }}>
            <div className="row no-gutters h-100">
                <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                    <div className="login-about">
                        <div className="slogan">
                            <div className='logo-container'><ChatOutlined style={{ fontSize: 26, color: '#075E54' }} /></div>
                            <span>Messages</span>
                            <span>Made</span>
                            <span>Easy.</span>
                        </div>
                        <div className="about-desc">
                            Quick Chat is an intelligent and communications tool, built for teams. It provides an integrated platform that makes team communication easy and efficient.
                        </div>
                        {/* <a className="know-more">Know More<ChevronRight /></a> */}
                    </div>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                    <div className="login-wrapper">
                        <div className="login-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className='login-screen' style={{ display: 'flex', flexDirection: 'column', width: 320, overflowY: 'clip', padding: 20, alignItems: 'center' }}>

                                <StepWizard isHashEnabled={false}>
                                    <SendEmail changeStep={changeStep} isHashEnabled={false} setEmail={_setEmail} setUserId={_setUserId} />
                                    <ResetPassword changeStep={changeStep} isHashEnabled={false} email={email} userId={userId} />
                                </StepWizard>

                                <div style={{ display: 'flex', borderColor: '#000', borderWidth: 1, justifyContent: 'center', marginTop: 10 }}>
                                    <div className='secondary-action'>Remember Password?
                                        <Button className='forgot-password-btn' onClick={login} variant="text">
                                            Login
                                        </Button>
                                        {/* <a onClick={login} style={{ marginLeft: 5 }}>Login</a> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
