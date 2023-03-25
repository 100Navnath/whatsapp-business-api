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
export default function EnterMobileNumber(props: any) {
    const [phone, setPhone] = useState<any>(Object);
    const [isWhatsappNo, setIsWhatsappNo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isBtnClicked, setIsBtnClicked] = useState(false);
    const [timer, setTimer] = useState(props.timer);
    const [isTimerEnabled, setIsTimerEnabled] = useState(false)
    const [timerAction, setTimerAction] = useState("addOneMin")

    async function sendOtp() {
        try {
            setIsBtnClicked(true);
            props.setContactDetails({ ...phone, isWhatsappNo })
            if (!ValidateMobile(phone.phoneNo).isError) {
                setLoading(true);
                // const body = {
                //     "userId": 221,
                //     "countryCode": "+91",
                //     "phone": "9876543210",
                //     "isWhatsAppNo": true
                // }
                const user = await getFromLocalStorage("user")
                const body = {
                    "phone": phone.phoneNo,
                    "countryCode": phone.countryCode,
                    "userId": user.currentuserId,
                    "isWhatsAppNo": isWhatsappNo
                }
                API.put(`${process.env.REACT_APP_BASE_API}${apiList.sendOtpOnMobile}`, body, { "content-type": "application/json", "Accept": "*/*" })?.subscribe({
                    next(res: any) {
                        if (res.status === 200) {
                            setIsBtnClicked(false);
                            Toast({ message: `OTP sent successfully ${res.data.otp}`, type: 'success' })
                            setLoading(false);
                            props.nextStep();
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

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <div style={{ marginBottom: 30, color: "#212", fontSize: 14, fontFamily: 'Poppins' }}>Add mobile number to proceed</div>
            <div className='phone-number-input-field' style={{ width: 250 }}>
                <div className='field-wrapper' style={{ width: 250, margin: 0 }}>
                    <div className="field-placeholder">Phone Number<Asterisk /></div>
                    <PhoneInput
                        dropdownStyle={{ height: 200, alignItems: 'flex-start', display: 'flex', flexDirection: 'column' }}
                        containerStyle={{ width: 'fit-content', fontFamily: 'Poppins', fontSize: 14 }}
                        country={'in'}
                        searchStyle={{ fontFamily: 'Poppins', fontSize: 12, padding: 5 }}
                        inputStyle={{ width: 250, fontFamily: 'Poppins', fontSize: 12, boxShadow: '0px 0px 0px 0px', borderRadius: 5 }}
                        value={`${phone.countryCode}${phone.phoneNo}`}
                        countryCodeEditable={false}
                        onChange={(number, obj: any) => setPhone({ ...phone, countryCode: `+${obj.dialCode}`, phoneNo: number.slice(obj.dialCode.length) })}
                        enableSearch={true}
                        disabled={loading}
                        searchPlaceholder={"Search"}
                    />
                </div>
                <div className='error'>{isBtnClicked && ValidateMobile(phone.phoneNo, "Phone number").err}</div>
                <div className="checkbox-wrapper" style={{ alignSelf: 'flex-start' }}>
                    <input className='input-checkbox' type="checkbox" onChange={(e) => setIsWhatsappNo(e.target.checked)} />
                    <div className="field-placeholder">Is WhatsApp Number?</div>
                </div>
            </div>
            <div className="dialog-action-buttons" style={{ marginBottom: 0 }}>
                <LoadingButton
                    loading={loading}
                    variant="outlined"
                    size='small'
                    loadingIndicator={<Spinner />}
                    onClick={sendOtp}
                    // className='dialog-btn-positive'
                    style={{ height: 32, backgroundColor: '#075E54', color: '#FFF', fontSize: 13, width: 250, textTransform: 'none', outlineWidth: 0 }}
                >
                    {!loading && "Verify"}
                </LoadingButton>
                {/* {
                    isTimerEnabled &&
                    <Timer initialMinute={timer} onTimeout={() => setIsTimerEnabled(true)} action={{ name: timerAction, check: Math.random() }} />
                } */}
            </div>
        </div>
    )
}