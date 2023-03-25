import React, { useState, useEffect } from 'react'
import { ChevronRight, Save } from '@material-ui/icons'
import Asterisk from '../../components/Asterisk'
import { Link, useNavigate, redirect } from 'react-router-dom';
import { ValidateEmail, ValidateEmptyField, ValidatePassword } from '../../components/validators';
import TextField from '@mui/material/TextField';
import { API } from '../../constant/network'
import { apiList } from '../../constant/apiList';
import { getFromLocalStorage, removeFromLocalStorage, setLocalStorage } from '../../components/LocalStorage/localStorage';
import LoadingButton from '@mui/lab/LoadingButton';
import { CircularProgress } from '@material-ui/core';
import Button from '@mui/material/Button';
import './signIn.css';
import { getFCMToken } from '../../firebase';
import DeviceDetector from "device-detector-js";
import Toast from '../../components/Toast/Toast';
import { subscribeUser } from '../../subscription';
import axios from 'axios';


export default function LoginForm(props: any) {
    let navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isBtnClick, setIsBtnClick] = useState(false);
    const [loading, setLoading] = useState(false)
    const [passwordError, setPasswordError] = useState(String);

    function validateData() {
        setIsBtnClick(true);
        if (
            !ValidateEmail(email).isError &&
            !ValidateEmptyField(password).isError
        ) login();
    }

    async function login() {
        try {
            const user = await getFromLocalStorage("user")
            const deviceDetector = new DeviceDetector();
            const userAgent = navigator.userAgent;
            const systemInfo = deviceDetector.parse(userAgent);
            // const fcmToken = await getFCMToken();
            var pjson = require('./../../../package.json');

            const body = {
                "deviceType": systemInfo.device?.type,
                "deviceName": "string",
                "os": systemInfo.os?.name,
                "osVersion": systemInfo.os?.version,
                "appVersion": pjson.version,
                "deviceModel": systemInfo.device?.model,
                "appToken": "string",
                fcmToken: "",
                email,
                password
            };
            API.post(`${process.env.REACT_APP_BASE_API}${apiList.login}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        // const res = {
                        //     data: {
                        //         "user": {
                        //             "currentuserId": 2,
                        //             "businessId": 2,
                        //             "businessName": "ABC",
                        //             "firstName": "Navnath",
                        //             "lastName": "Phapale",
                        //             "countryCode": "",
                        //             "phoneNo": "",
                        //             "email": "navnath@werqlabs.com",
                        //             "role": "admin",
                        //             "designation": "",
                        //             "department": "",
                        //             "profileUrl": "",
                        //             "isVerify": true,
                        //             "newuser": false,
                        //             "isMute": false,
                        //             "isBlock": false,
                        //             "isWhatsappNo": false,
                        //             "linkedNumbers": []
                        //         },
                        //         "jwt": {
                        //             "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9zaWQiOiIyIiwicm9sZSI6IiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvdXNlcmRhdGEiOiIyI05hdm5hdGggUGhhcGFsZSMyI0FCQyMiLCJuYmYiOjE2NzQ0NjA2MDYsImV4cCI6MTY3NDQ4OTQwNSwiaWF0IjoxNjc0NDYwNjA2LCJpc3MiOiJ3aGF0c2FwcC1kZXYud2VycWxhYnMuY29tIiwiYXVkIjoiaHR0cHM6Ly93aGF0c2FwcC1kZXYud2VycWxhYnMuY29tL3N3YWdnZXIvaW5kZXguaHRtbCJ9.tlj2IgeS9CT1C5nLsVQ10-094wVFzCyMid6thj3SRMU",
                        //             "validFrom": "0001-01-01T00:00:00",
                        //             "validTo": "0001-01-01T00:00:00",
                        //             "refershToken": "76c169ef-a048-4b6c-930b-5da27d7fd9be",
                        //             "fcmToken": "string",
                        //             "refershTokenValidTo": "2023-01-24T07:56:45.8775906Z"
                        //         }

                        //     }
                        // }

                        // getFCMToken()
                        let tryToSuscribeUser = 1 // try to subsribe user n number of times
                        while (tryToSuscribeUser > 0) {
                            subscribeUser({
                                "businessId": res.data.user.businessId,
                                "userId": res.data.user.currentuserId,
                                oldAuthKey: user && user.swObject ? user.swObject.keys.auth : undefined
                            })
                                .then(async (promise: any) => {
                                    // console.log("promise of subscription : ", subscription);
                                    // const geolocationDb = await axios.get('https://geolocation-db.com/json/')
                                    // if (geolocationDb.data.IPv4) {
                                    //     subscription.ipAddress = res.data.IPv4;
                                    //     API.post(`${process.env.REACT_APP_BASE_API}${apiList.registerSW}`, subscription, {})?.subscribe({
                                    //         next(addSubscriptionRes: any) {
                                    //             if (addSubscriptionRes?.status === 200) {
                                    //                 tryToSuscribeUser = 0
                                    if (promise) {
                                        setLoading(false)
                                        setLocalStorage("user", { ...res.data.user, jwt: res.data.jwt });
                                        props.setUserOnLogin({ ...res.data.user, jwt: res.data.jwt })
                                        if (res.data.user.newuser && typeof res.data.user.newuser === "boolean" && res.data.user.newuser) {
                                            props.setUserId(res.data.user.currentuserId)
                                            props.nextStep();
                                        }
                                        else if (res.data.user.isVerify) {
                                            if (!res.data.user.isbusinessAdd && res.data.user.role === "Admin") {
                                                navigate("/settings/number-management/get-number", { replace: true });
                                                setLocalStorage("isDisable", true);
                                            }
                                            else {
                                                navigate("/chats", { replace: true });
                                                setLocalStorage("isDisable", false);
                                                // return redirect('/chats')
                                            }
                                        }
                                        else navigate("/signup", { replace: true });
                                    }
                                    //             }
                                    //         }
                                    //     });
                                    // } else Toast({ message: "IP address not found" });
                                }).catch((e: any) => {
                                    setLoading(false)
                                    Toast({ message: `${e}`, type: 'error' })
                                })
                            tryToSuscribeUser = tryToSuscribeUser - 1
                        }
                    }
                },
                error(err) {
                    setLoading(false);
                    // if (err.response.data && err.response.data.message) {
                    //     if (err.response.data.message == "Invalid Password.") setPasswordError("Invalid password.");
                    // }
                },
            });
        }
        catch (error) {
            console.log(error);
            Toast({ message: "error", type: 'error' })
        }
        setLoading(true)
    }

    useEffect(() => {
        removeFromLocalStorage("user")
        removeFromLocalStorage("isDisable")
        removeFromLocalStorage("refreshToken")
    }, [])


    return (
        <div className="pb-4" style={{ width: 280 }}>
            <div style={{ textAlign: 'center', fontSize: 26, marginBottom: 25 }}>Login</div>
            <div className="field-wrapper" style={{ width: '100%', marginLeft: 0 }}>
                <input type="email" onChange={(event) => setEmail(event.target.value)} autoFocus={true} defaultValue={email} disabled={loading} />
                <div className="field-placeholder">Email ID<Asterisk /></div>
                <div className='error'>{isBtnClick && ValidateEmail(email, "Email").err}</div>
            </div>
            <div className="field-wrapper" style={{ width: '100%', alignSelf: 'center', marginLeft: 0 }}>
                <input type="password" defaultValue={password} onChange={(event) => setPassword(event.target.value)} disabled={loading} />
                <div className="field-placeholder">Password<Asterisk /></div>
                <div className='error'>{isBtnClick && ValidateEmptyField(password, "Password").err || passwordError}</div>
            </div>
            <LoadingButton
                loading={loading}
                variant="contained"
                size='small'
                loadingIndicator={<CircularProgress size={16} style={{ color: '#fff' }} />}
                onClick={validateData}
                style={{ width: '100%', marginBottom: 10, fontSize: 14, outlineWidth: 0, backgroundColor: '#075E54', textTransform: 'none' }}>
                Login
            </LoadingButton>
            <div className="actions" style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', marginBottom: 10 }}>
                <Button className='forgot-password-btn' onClick={() => navigate('/forgot-password')} variant="text">
                    Forgot Password?
                </Button>
            </div>
            <div style={{ display: 'flex', borderColor: '#000', borderWidth: 1, justifyContent: 'center', fontSize: 12, flexDirection: 'column', alignItems: 'center' }}>
                <div className='secondary-action'>Don't have account?
                    <Button className='forgot-password-btn' onClick={() => navigate('/signup')} variant="text">
                        Sign Up
                    </Button>
                </div>
                <div className='secondary-action' style={{ marginTop: 10 }}>V {process.env.REACT_APP_VERSION}</div>
            </div>
        </div>
    )
}
