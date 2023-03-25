import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Asterisk from '../../components/Asterisk';
import { setLocalStorage } from '../../components/LocalStorage/localStorage';
import { ValidateConfirmPassword, ValidateEmptyField, ValidatePassword } from '../../components/validators';
import { apiList } from '../../constant/apiList';
import { API } from '../../constant/network';
import Toast from '../../components/Toast/Toast';
import { Button } from '@material-ui/core';

export default function ChangePassword(props: any) {
    let navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    const [isBtnClick, setIsBtnClick] = useState(false)
    const [oldPassword, setOldPassword] = useState(String)
    const [newPassword, setNewPassword] = useState(String)
    const [confirmPassword, setConfirmPassword] = useState(String)

    function changePassword() {
        setIsBtnClick(true);
        const body = {
            oldPassword,
            newPassword,
            confirmPassword,
            "userId": props.id
        };
        if (
            !ValidateEmptyField(oldPassword).isError &&
            !ValidatePassword(newPassword).isError &&
            !ValidateConfirmPassword(newPassword, confirmPassword).isError
        ) {
            API.put(`${process.env.REACT_APP_BASE_API}${apiList.changePassword}`, body, {})?.subscribe({
                next(res: any) {
                    console.log("changePassword res : ", res);
                    if (res.status === 200) {
                        setLoading(false)
                        navigate("/chats", { replace: true });
                    }
                    setIsBtnClick(false);
                },
                error(err) {
                    setLoading(false)
                    setIsBtnClick(false);
                    Toast({ message: err, type: 'error' });
                    console.log(err);
                },
            });
        }
    }

    return (
        <>
            <div style={{ textAlign: 'center', fontSize: 26, marginBottom: 10 }}>Change Password</div>
            <div style={{ color: '#666', textAlign: 'center', fontSize: 12, marginBottom: 25 }}>
                Enter verification code sent on your email
            </div>
            <div className="field-wrapper" style={{ width: '100%', marginLeft: 0 }}>
                <input type="text" autoFocus={true} onChange={(event) => setOldPassword(event.target.value)} defaultValue={oldPassword} />
                <div className="field-placeholder">Old Password<Asterisk /></div>
                <div className='error'>{isBtnClick && ValidateEmptyField(oldPassword, 'Old password').err}</div>
            </div>
            <div className="field-wrapper" style={{ width: '100%', marginLeft: 0 }}>
                <input type="password" autoFocus={true} onChange={(event) => setNewPassword(event.target.value)} defaultValue={newPassword} />
                <div className="field-placeholder">New Password<Asterisk /></div>
                <div className='error'>{isBtnClick && ValidatePassword(newPassword, 'New password').err}</div>
            </div>
            <div className="field-wrapper" style={{ width: '100%', marginLeft: 0 }}>
                <input type="password" autoFocus={true} onChange={(event) => setConfirmPassword(event.target.value)} />
                <div className="field-placeholder">Confirm New Password<Asterisk /></div>
                <div className='error'>{isBtnClick && ValidateConfirmPassword(newPassword, confirmPassword, 'Confirm new password').err}</div>
            </div>
            <Button type="submit" className="button-text" style={{ width: '100%', backgroundColor: '#075E54',color:'#fff' }} onClick={changePassword}>Submit</Button>
        </>
    )
}
