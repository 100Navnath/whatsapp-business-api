import React, { useState } from 'react'
import Asterisk from '../../components/Asterisk'
import { ValidateEmail } from '../../components/validators'
import { API } from '../../constant/network';
import { apiList } from '../../constant/apiList';
import { LoadingButton } from '@mui/lab';
import Spinner from '../../components/Loading/spinner';
import Toast from '../../components/Toast/Toast';

export default function SendEmail(props: any) {
    const [isBtnClick, setIsBtnClick] = useState(false);
    const [email, setEmail] = useState("second");
    const [loading, setLoading] = useState(false);

    function submit() {
        try {
            setIsBtnClick(true);
            if (!ValidateEmail(email).isError) {
                setLoading(true);
                const body = {
                    email
                }
                API.get(`${process.env.REACT_APP_BASE_API}${apiList.forgotPassword}`, body, {})?.subscribe({
                    next(res: any) {
                        if (res.status === 200) {
                            setLoading(false);
                            props.nextStep();
                            props.setUserId(res.data.userId);
                            props.setEmail(body.email);
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

    return (
        <>
            <div style={{ textAlign: 'center', fontSize: 26, marginBottom: 10 }}>Forgot Password</div>
            <div style={{ color: '#666', textAlign: 'center', fontSize: 12, marginBottom: 25 }}>In order to access your account, please enter the email id you provided during the registration process.</div>
            <div className="field-wrapper" style={{ width: '100%', marginLeft: 0 }}>
                <input type="email" autoFocus={true} onChange={(event) => setEmail(event.target.value)} />
                <div className="field-placeholder">Email ID<Asterisk /></div>
                <div className='error'>{isBtnClick && ValidateEmail(email).err}</div>
            </div>
            {/* <button type="submit" className="btn btn-primary ml-auto button-text" style={{ width: '100%' }} onClick={submit}>Submit</button> */}
            <LoadingButton
                style={{ width: '100%', textTransform: 'none', backgroundColor: '#075E54' }}
                loading={loading}
                variant="contained"
                size='small'
                loadingIndicator={<Spinner style={{ color: '#fff' }} />}
                onClick={submit}
                className="btn btn-primary ml-auto button-text">
                Submit
            </LoadingButton>
        </>
    )
}
