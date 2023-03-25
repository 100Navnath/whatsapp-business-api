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
import EnterMobileNumber from './EnterMobileNumber';
import VerifyOTP from './VerifyOTP';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="down" ref={ref} {...props} />;
});

interface AddMobileNumberProps {
    open: boolean
    closeDialog: VoidFunction
    onAddSuccess?: any //function
}

export default function AddMobileNumber({ open, closeDialog, onAddSuccess }: AddMobileNumberProps) {
    const [contactDetails, setContactDetails] = useState(Object);
    const [dialogVisibility, setDialogVisibility] = useState(open);
    const [isBtnClicked, setIsBtnClicked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState(undefined);
    const [isResendEnabled, setIsResendEnabled] = useState(false)
    const [timer, setTimer] = useState(1);
    const [isTimerEnabled, setIsTimerEnabled] = useState(true)
    const [timerAction, setTimerAction] = useState("addOneMin")
    useEffect(() => {
        setDialogVisibility(open)
    }, [open])

    function closeAddCardDialog() {
        setDialogVisibility(false);
        // setTimeout(() => {
        closeDialog();
        setIsBtnClicked(false);
    }

    function _setContactDetails(obj: any) {
        setContactDetails(obj)
    }

    async function sendOtp(phone?: any) {
        try {
            setLoading(true);
            const user = await getFromLocalStorage("user");
            const body = {
                ...phone,
                userId: user.currentuserId
            }
            console.log("body : ", body);
            API.put(`${process.env.REACT_APP_BASE_API}${apiList.sendOtpOnMobile}`, body, { "content-type": "application/json", "Accept": "*/*" })?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        Toast({ message: `OTP sent successfully ${res.data.otp}`, type: 'success' })
                        setLoading(false);
                        setTimer(1);
                        setOtp(undefined);
                        setIsResendEnabled(false);
                        setTimerAction("addOneMin");
                    }
                },
                error(err) {
                    setLoading(false);
                    console.log(err);
                    Toast({ message: err, type: 'error' })
                },
            });
        } catch (error: any) {
            console.log(error);
            setLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }

    return (
        <Dialog
            open={dialogVisibility}
            TransitionComponent={Transition}
            keepMounted
            // onClose={() => { }}
            aria-describedby="alert-dialog-slide-description"
            transitionDuration={400}
        >
            <div className='dialog-wrapper' style={{ height: 'fit-content', overflowY: 'clip', overflowX: 'hidden' }}>
                {/* <div className='dialog-title' style={{ fontSize: 16 }}>Add Card</div> */}
                <div style={{ padding: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <StepWizard isHashEnabled={false}>
                        <EnterMobileNumber sendOTP={sendOtp} setContactDetails={_setContactDetails} />
                        <VerifyOTP sendOTP={sendOtp} closeDialog={closeDialog} contactDetails={contactDetails} timer={timer} />
                    </StepWizard>
                    {/* {
                        isTimerEnabled &&
                        <Timer initialMinute={timer} onTimeout={() => setIsTimerEnabled(true)} action={{ name: timerAction, check: Math.random() }} />
                    } */}
                </div>
            </div>
        </Dialog >
    )
}
