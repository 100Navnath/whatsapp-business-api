import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Asterisk from '../../components/Asterisk';
import { ValidateConfirmPassword, ValidateEmail, ValidateEmptyField, ValidatePassword } from '../../components/validators';
import { API } from '../../constant/network';
import { apiList } from '../../constant/apiList';
import { getFromLocalStorage } from '../../components/LocalStorage/localStorage';
import Toast from '../../components/Toast/Toast';
import { LoadingButton } from '@mui/lab';
import Spinner from '../../components/Loading/spinner';
import Timer from '../../components/Timer';

export default function ResetPassword(props: any) {
    const navigate = useNavigate();
    const [isBtnClick, setIsBtnClick] = useState(false)
    const [verificationCode, setVerificationCode] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false);

    const [isResendEnabled, setIsResendEnabled] = useState(false)
    const [resendOtpLoading, setResendOtpLoading] = useState(false)
    const [timerAction, setTimerAction] = useState({ name: "addOneMin" })

    async function submit() {
        try {
            setIsBtnClick(true);

            if (
                !ValidateEmptyField(verificationCode).isError &&
                !ValidatePassword(password).isError &&
                !ValidateConfirmPassword(password, confirmPassword).isError
            ) {
                setLoading(true);
                const body = {
                    userId: props.userId,
                    verifyCode: verificationCode,
                    password,
                    confirmPassword
                }
                API.put(`${process.env.REACT_APP_BASE_API}${apiList.resetPassword}`, body, {})?.subscribe({
                    next(res: any) {
                        setLoading(false);
                        if (res.status) {
                            navigate('/');
                            props.nextStep();
                            setIsBtnClick(false);
                            Toast({ message: 'Password has been chanaged successfully Please login with new password', type: 'success' })
                        }
                    },
                    error(err) {
                        setLoading(false);
                        setIsBtnClick(false);
                        Toast({ message: err, type: 'error' })
                    },
                });
            }
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
            setLoading(false);
            setIsBtnClick(false);
        }
    }

    function resendOtp() {
        try {
            console.log(props.email);
            if (!ValidateEmail(props.email).isError) {
                setLoading(true);
                const body = {
                    email: props.email
                }
                API.get(`${process.env.REACT_APP_BASE_API}${apiList.forgotPassword}`, body, {})?.subscribe({
                    next(res: any) {
                        if (res.status === 200) {
                            setLoading(false);
                            setTimerAction({ name: "addOneMin" })
                            setIsResendEnabled(false)
                            Toast({ message: 'OTP sent Successfully', type: 'success' })
                        }
                    },
                    error(err) {
                        setLoading(false);
                    },
                });
            }
        } catch (error: any) {
            setLoading(false);
            console.log(error);
            Toast({ message: error, type: 'error' });
        }
    }

    useEffect(() => {
        if (props.currentStep == 2) {
            setTimerAction({ name: "addOneMin" })
            setIsResendEnabled(false)
        }
    }, [props.currentStep])



    return (
        <>
            <div style={{ textAlign: 'center', fontSize: 26, marginBottom: 10 }}>Reset Password</div>
            <div style={{ color: '#666', textAlign: 'center', fontSize: 12, marginBottom: 25 }}>
                Enter verification code sent on your email
            </div>
            <div className="field-wrapper" style={{ width: '100%', marginLeft: 0 }}>
                <input name='varification-code' type="text" onChange={(event) => setVerificationCode(event.target.value)} />
                <div className="field-placeholder">Verification Code<Asterisk /></div>
                <div className='error'>{isBtnClick && ValidateEmptyField(verificationCode, "Verification Code").err}</div>
            </div>
            <div className="field-wrapper" style={{ width: '100%', marginLeft: 0 }}>
                <input type="password" name='new-password' onChange={(event) => setPassword(event.target.value)} />
                <div className="field-placeholder">New Password<Asterisk /></div>
                <div className='error'>{isBtnClick && ValidatePassword(password, "New Password").err}</div>
            </div>
            <div className="field-wrapper" style={{ width: '100%', marginLeft: 0 }}>
                <input type="password" name='confirm-new-password' onChange={(event) => setConfirmPassword(event.target.value)} />
                <div className="field-placeholder">Confirm New Password<Asterisk /></div>
                <div className='error'>{isBtnClick && ValidateConfirmPassword(password, confirmPassword, "New Password").err}</div>
            </div>
            <button type="submit" className="btn ml-auto button-text" style={{ width: '100%', backgroundColor: '#075E54', color: '#FFF' }} onClick={submit}>Submit</button>
            <div style={{ fontSize: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                {
                    isResendEnabled ?
                        <LoadingButton
                            loading={resendOtpLoading}
                            disabled={!isResendEnabled}
                            className='link'
                            variant="outlined"
                            size='small'
                            loadingIndicator={<Spinner color='#1273eb' />}
                            onClick={resendOtp}
                            style={{ outlineWidth: 0, textTransform: 'none', alignSelf: 'center', marginLeft: 5 }}
                        >
                            {!resendOtpLoading && "Resend"}
                        </LoadingButton> :
                        <Timer initialMinute={1} onTimeout={() => setIsResendEnabled(true)} action={timerAction} />
                }
            </div>
            {/* <LoadingButton
                style={{ width: '100%' }}
                loading={loading}
                variant="contained"
                size='small'
                loadingIndicator={<Spinner style={{ color: '#fff' }} />}
                onClick={submit}
                className="btn btn-primary ml-auto button-text">
                Submit
            </LoadingButton> */}
        </>
    )
}
