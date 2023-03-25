import { Edit, EditOutlined, PersonPinCircleOutlined } from '@material-ui/icons';
import React, { useState, useEffect } from 'react'
import OtpInput from 'react-otp-input';
import { apiList } from '../../constant/apiList';
import { API } from '../../constant/network';
import LoadingButton from '@mui/lab/LoadingButton';

import './signup.css'
import Spinner from '../../components/Loading/spinner';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled, Checkbox, Skeleton } from '@mui/material';
import Toast from '../../components/Toast/Toast';
import { getFromLocalStorage } from '../../components/LocalStorage/localStorage';

export default function Step2(props: any) {
    const [otp, setOtp] = useState(undefined);
    const [loading, setLoading] = useState(false);

    async function sendOtp() {
        try {
            setLoading(true);
            const user = await getFromLocalStorage('user');
            console.log("user : ", user);

            const id = props.userDetails.tempId ? props.userDetails.tempId : user.currentuserId
            const body = {
                emailid: props.userDetails.email,
                userId: id
            }
            console.log("body : ", body);
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.sendOTP}`, body, { "content-type": "application/json", "Accept": "*/*" })?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setLoading(false);
                        props.nextStep()
                        // Toast({ message: `OTP sent successfully ${res.data.otp}`, type: 'success' })
                        Toast({ message: `OTP sent successfully`, type: 'success' })
                        props.setTimer(1);
                        props.setTimerAction({ name: "addOneMin", check: Math.random() });
                    }
                },
                error(err) {
                    setLoading(false);
                    console.log(err);
                    Toast({ message: err, type: 'error' });
                },
            });
        } catch (error: any) {
            console.log(error);
            setLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }

    const GridTooltip = styled(({ className, ...props }: any) => (
        <Tooltip {...props} classes={{ popper: className }} />
    ))(({ theme }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: '#111',
            color: '#FFF',
            maxWidth: 220,
            fontSize: theme.typography.pxToRem(10),
            border: '1px solid #dadde9',
        },
    }));

    return (
        <div style={{ width: 'fit-content', alignSelf: 'center' }}>
            <div style={{ textAlign: 'center', fontSize: 26, marginBottom: 10 }}>Verification</div>
            <div style={{ color: '#666', textAlign: 'center', fontSize: 14, marginBottom: 15 }}>We will send you an OTP on
                <span style={{ marginLeft: 10, fontWeight: 'bold', color: '#444b64', textAlign: 'center', marginBottom: 20 }}>{props.userDetails.email}
                    <a style={{ marginLeft: 5 }} onClick={props.previousStep}><GridTooltip title={"Edit"} placement="bottom"><EditOutlined style={{ fontSize: 15, marginBottom: 5 }} /></GridTooltip></a>
                </span>
            </div>
            <div className="actions">
                {/* <button type="submit" className="btn btn-primary ml-auto button-text" style={{ width: '100%' }} onClick={sendOtp}>Send OTP</button> */}
                <LoadingButton
                    loading={loading}
                    variant="contained"
                    size='small'
                    loadingIndicator={<Spinner />}
                    onClick={sendOtp}
                    style={{ width: '100%', fontSize: 14, outlineWidth: 0, backgroundColor: '#075E54', textTransform: 'none' }}>
                    Send OTP
                </LoadingButton>
            </div>
        </div>
    )
}
