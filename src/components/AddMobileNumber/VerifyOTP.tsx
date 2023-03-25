import React, { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog';
import { TransitionProps } from '@mui/material/transitions';
import Slide from '@mui/material/Slide';
import Asterisk from '../Asterisk';
import { Button } from '@material-ui/core'
import { ValidateEmptyField, ValidateMobile, ValidateOTP } from '../validators';
import { LoadingButton } from '@mui/lab';
import Spinner from '../Loading/spinner';
import Cards from 'react-credit-cards';
import "react-credit-cards/es/styles-compiled.css";
import { getFromLocalStorage, setLocalStorage } from '../LocalStorage/localStorage';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { apiList } from '../../constant/apiList';
import { API } from '../../constant/network';
import PhoneInput from 'react-phone-input-2';
import StepWizard from "react-step-wizard";
import OtpInput from 'react-otp-input';
import Toast from '../Toast/Toast';
import Timer from '../Timer';
import { useNavigate } from 'react-router-dom';
import { EditOutlined } from '@material-ui/icons';

export default function VerifyOTP(props: any) {
    const [otp, setOtp] = useState(undefined);
    // const [phone, setPhone] = useState<any>(Object);
    const [isBtnClicked, setIsBtnClicked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isWhatsappNo, setIsWhatsappNo] = useState(false);
    const [otpError, setOtpError] = useState(String)
    const [timer, setTimer] = useState(props.timer);
    const [isResendEnabled, setIsResendEnabled] = useState(false)
    const [timerAction, setTimerAction] = useState("addOneMin")
    const [verifyLoading, setVerifyLoading] = useState(false);
    const navigate = useNavigate();

    async function verifyOTP() {
        setIsBtnClicked(true);

        if (!ValidateOTP(otp).isError) {
            const user = await getFromLocalStorage("user");
            const body = {
                otp,
                userId: user.currentuserId,
                "phone": props.contactDetails.phoneNo,
                "countryCode": props.contactDetails.countryCode,
                "isWhatsAppNo": isWhatsappNo
            }
            console.log(body);
            setVerifyLoading(true);
            API.put(`${process.env.REACT_APP_BASE_API}${apiList.verifyMobileOtp}`, body, { "content-type": "application/json", "Accept": "*/*" })?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        Toast({ message: 'Mobile number verified and added successfully', type: 'success' })
                        setVerifyLoading(false);
                        setIsBtnClicked(false);
                        setLocalStorage("user", { ...user, ...props.contactDetails });
                        props.closeDialog()
                    }
                },
                error(err) {
                    setVerifyLoading(false);
                    // if (err.response && err.response.data && err.response.data.message === "Invalid OTP Entered") setOtpError("Invalid OTP Entered")
                    // else Toast({ message: err.response.data.message, type: 'error' })
                },
            });
        }
    }

    async function sendOtp() {
        try {
            if (!ValidateMobile(props.contactDetails.phoneNo).isError) {
                setLoading(true);
                const user = await getFromLocalStorage("user");
                const body = {
                    "phone": props.contactDetails.phoneNo,
                    "countryCode": props.contactDetails.countryCode,
                    "userId": user.currentuserId,
                    "isWhatsAppNo": isWhatsappNo
                }
                API.put(`${process.env.REACT_APP_BASE_API}${apiList.sendOtpOnMobile}`, body, { "content-type": "application/json", "Accept": "*/*" })?.subscribe({
                    next(res: any) {
                        if (res.status === 200) {
                            setIsBtnClicked(false);
                            Toast({ message: `OTP sent successfully ${res.data.otp}`, type: 'success' })
                            setLoading(false);
                            setTimer(1);
                            setTimerAction("addOneMin")
                            setIsResendEnabled(false)
                        }
                    },
                    error(err) {
                        setIsBtnClicked(false);
                        setLoading(false);
                    },
                });
            }
        } catch (error: any) {
            console.log(error);
            setLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }

    useEffect(() => {
        if (props.currentStep === 3) {
            setTimer(1);
            setTimerAction("addOneMin")
            setIsResendEnabled(false)
        }
    }, [props.currentStep])

    return (
        <div style={{ width: 'fit-content' }}>
            <div style={{ textAlign: 'center', fontSize: 26, marginBottom: 15 }}>Enter OTP</div>
            <span style={{ color: '#666', textAlign: 'center', fontSize: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                OTP sent successfully on
                <span style={{ fontWeight: 'bold', alignSelf: 'center', color: '#444', marginLeft: 5, display: 'flex', alignItems: 'center', width: 'fit-content', justifyContent: 'center' }}>
                    {props.contactDetails.countryCode}{props.contactDetails.phoneNo}
                    <EditOutlined
                        onClick={() =>
                            props.previousStep()
                        }
                        fontSize='small' style={{ color: '#075E54', fontSize: 14, marginLeft: 5 }} />
                </span>
            </span>
            <div id="otpInput">
                <OtpInput
                    containerStyle={{ alignItems: 'center', justifyContent: 'center', marginBottom: 5 }}
                    inputStyle={{ height: 30, width: 30, marginTop: 10 }}
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    separator={<div style={{ marginRight: 10 }} />}
                    isDisabled={verifyLoading}
                    isInputNum={true}
                />
                <div className='error'>{isBtnClicked && ValidateOTP(otp).err || otpError}</div>
            </div>
            <div className="actions">
                {/* <button type="submit" className="btn btn-primary ml-auto button-text" style={{ width: '100%' }}
                onClick={verifyOTP}>Verify</button> */}
                <LoadingButton
                    loading={verifyLoading}
                    variant="contained"
                    size='small'
                    loadingIndicator={<Spinner />}
                    onClick={verifyOTP}
                    style={{ width: '100%', marginBottom: 10, fontSize: 14, outlineWidth: 0, backgroundColor: '#075E54', textTransform: 'none' }}>
                    Verify
                </LoadingButton>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', borderColor: '#000', borderWidth: 1, justifyContent: 'center' }}>
                    <div className='secondary-action'>
                        {
                            isResendEnabled ?
                                <LoadingButton
                                    loading={loading}
                                    disabled={!isResendEnabled}
                                    className='link'
                                    variant="outlined"
                                    size='small'
                                    loadingIndicator={<Spinner color='#075E54' />}
                                    onClick={sendOtp}
                                    style={{ outlineWidth: 0, textTransform: 'none', alignSelf: 'center', marginLeft: 5, border: '1px solid #075E54' }}
                                >
                                    Resend
                                </LoadingButton> :
                                <Timer initialMinute={timer} onTimeout={() => setIsResendEnabled(true)} action={{ name: timerAction, check: Math.random() }} />
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}