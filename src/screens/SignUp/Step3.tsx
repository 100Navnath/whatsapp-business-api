import { CircularProgress } from '@material-ui/core';
import { ArrowDownwardRounded } from '@material-ui/icons'
import { LoadingButton } from '@mui/lab';
import React, { useState, useEffect } from 'react'
import OtpInput from 'react-otp-input';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/Loading/spinner';
import { getFromLocalStorage, setLocalStorage } from '../../components/LocalStorage/localStorage';
import Timer from '../../components/Timer';
import { ValidateOTP } from '../../components/validators';
import { apiList } from '../../constant/apiList';
import { API } from '../../constant/network';
// import { getFCMToken } from '../../firebase';
import DeviceDetector from "device-detector-js";
import Toast from '../../components/Toast/Toast';
import { subscribeUser } from '../../subscription';

export default function Step3(props: any) {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(undefined);
    const [timer, setTimer] = useState(props.timer);
    const [timerAction, setTimerAction] = useState(props.timerAction)
    const [loading, setLoading] = useState(false);
    const [isBtnClick, setIsBtnClick] = useState(false);
    const [otpError, setOtpError] = useState(String)
    const [isResendEnabled, setIsResendEnabled] = useState(false)
    const [resendOtpLoading, setResendOtpLoading] = useState(false)
    const [userDetails, setUserDetails] = useState(props.userDetails)

    // async function setUser() {
    //     if (!userDetails.email) {
    //         console.log("props userDetails : ", userDetails);
    //         const user = await getFromLocalStorage("user")
    //         // console.log("inside if : ", user);
    //         // setUserDetails(user)
    //     }
    // }

    useEffect(() => {
        if (timerAction.name === "addOneMin" && props.currentStep === 3) {
            setTimer(1);
        }
    }, [timerAction.check])

    useEffect(() => {
        if (props.currentStep == 3) {
            setTimerAction({ name: 'addOneMin', check: Date.now() })
            setIsResendEnabled(false);
        }
    }, [props.currentStep])

    async function verifyOTP() {
        setIsBtnClick(true);
        if (!ValidateOTP(otp).isError) {
            setLoading(true);
            const user = await getFromLocalStorage("user")
            // const fcmToken = await getFCMToken();
            const deviceDetector = new DeviceDetector();
            const userAgent = navigator.userAgent;
            const systemInfo = deviceDetector.parse(userAgent);
            var pjson = require('./../../../package.json');
            const body = {
                "deviceType": systemInfo.device?.type,
                "deviceName": "string",
                "os": systemInfo.os?.name,
                "osVersion": systemInfo.os?.version,
                "appVersion": pjson.version,
                "deviceModel": systemInfo.device?.model,
                "appToken": "string",
                otp: otp,
                currentuserId: props.userDetails.tempId,
                fcmToken: ''
            }
            console.log(body);
            API.post(`${process.env.REACT_APP_BASE_API}${apiList.verifyOTP}`, body, { "content-type": "application/json", "Accept": "*/*" })?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        // navigate('/chats');
                        setLoading(false);
                        subscribeUser({
                            "businessId": res.data.user.businessId,
                            "userId": res.data.user.currentuserId,
                            oldAuthKey: user && user.swObject ? user.swObject.keys.auth : undefined
                        }).then((promise: any) => {
                            if (promise) {
                                props.setAction("clearForm")
                                setIsBtnClick(false);
                                setLocalStorage("isDisable", true);
                                setLocalStorage("user", { ...res.data.user, jwt: res.data.jwt });
                                // setLocalStorage("refreshToken", res.data.jwt.token);
                                navigate("/settings/number-management/get-number", { replace: true });
                            }
                        }).catch((e: any) => {
                            Toast({ message: `${e}`, type: 'error' })
                        })
                    }
                },
                error(err) {
                    setLoading(false);
                },
            });
        }
    }

    async function sendOtp() {
        try {
            setResendOtpLoading(true);
            const body = {
                emailid: props.userDetails.email,
                userId: props.userDetails.tempId
            }
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.sendOTP}`, body, { "content-type": "application/json", "Accept": "*/*" })?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        Toast({ message: `OTP sent successfully`, type: 'success' })
                        setResendOtpLoading(false);
                        setTimer(1);
                        setOtp(undefined);
                        setIsResendEnabled(false);
                        setTimerAction({ name: "addOneMin", check: Math.random() });
                        props.setUserOnSignup(userDetails)
                    }
                },
                error(err) {
                    setResendOtpLoading(false);
                    console.log(err);
                    Toast({ message: err, type: 'error' })
                },
            });
        } catch (error: any) {
            console.log(error);
            setResendOtpLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }

    return (
        <div style={{ width: 'fit-content' }}>
            <div style={{ textAlign: 'center', fontSize: 26, marginBottom: 15 }}>Enter OTP</div>
            <h6 style={{ margin: 10, color: '#666', textAlign: 'center', fontSize: 14 }}>
                OTP sent successfully on
                <span style={{ fontWeight: 'bold', color: '#444', marginLeft: 5 }}>
                    {props.userDetails.email && props.userDetails.email}
                </span>
            </h6>
            <div id="otpInput">
                <OtpInput
                    containerStyle={{ alignItems: 'center', justifyContent: 'center', marginBottom: 5 }}
                    inputStyle={{ height: 30, width: 30, marginTop: 10 }}
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    separator={<div style={{ marginRight: 10 }} />}
                    isDisabled={loading}
                    isInputNum={true}
                />
                <div className='error'>{isBtnClick && ValidateOTP(otp).err || otpError}</div>
            </div>
            <div className="actions">
                {/* <button type="submit" className="btn btn-primary ml-auto button-text" style={{ width: '100%' }}
                    onClick={verifyOTP}>Verify</button> */}
                <LoadingButton
                    loading={loading}
                    disabled={loading}
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
                                    loading={resendOtpLoading}
                                    disabled={!isResendEnabled}
                                    className='resend-btn'
                                    variant="outlined"
                                    size='small'
                                    loadingIndicator={<Spinner color='#075E54' />}
                                    onClick={sendOtp}
                                >
                                    {!resendOtpLoading && "Resend"}
                                </LoadingButton> :
                                <Timer initialMinute={props.timer} onTimeout={() => setIsResendEnabled(true)} action={props.timerAction} />
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}
