import { useState, useEffect, useContext } from 'react'
import { ChatOutlined, ChevronRight } from '@material-ui/icons'
import { useNavigate, UNSAFE_NavigationContext, useNavigation } from 'react-router-dom';
import { removeFromLocalStorage } from '../../components/LocalStorage/localStorage';
import StepWizard from 'react-step-wizard';
import LoginForm from './LoginForm';
import ChangePassword from './ChangePassword';
import logo_outlined from '../../assets/img/logo_outlined.png'

export default function Login(props: any) {
    let navigate = useNavigate();
    const { innerHeight: height } = window;
    const [userId, setUserId] = useState(undefined);

    const userDetails = {
        "userId": 1,
        "firstName": "Fname",
        "lastName": "Lname",
        "countryCode": "+91",
        "phoneNo": "8877887788",
        "email": "test@test.com",
        "role": "Admin",
        "designation": "Developer",
        "department": "Development",
        "accessToken": "asfgdfrtgf",
        "refreshToken": "jgtrdfrtnh",
        "isWhatsappNumber": true,
    }

    function logout() {
        removeFromLocalStorage("user");
        removeFromLocalStorage("isDisable");
    }

    useEffect(() => {
        // logout()
    }, [])

    return (
        <div className="login-container" style={{ height }}>
            <div className="row no-gutters h-100">
                <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                    <div className="login-about">
                        <div className="slogan">
                            <div className='logo-container'><ChatOutlined style={{ fontSize: 26, color: '#075E54' }} /></div>
                            {/* <img style={{ height: 50, width: 50, backgroundColor: '#FFF', padding: 10, borderRadius: 5 }} src={logo_outlined} /> */}
                            <span>Messages</span>
                            <span>Made</span>
                            <span>Easy.</span>
                        </div>
                        <div className="about-desc">
                            Quick Chat is an intelligent and communications tool, built for teams. It provides an integrated platform that makes team communication easy and efficient.
                        </div>
                        {/* <a className="know-more">Know More <ChevronRight /></a> */}
                    </div>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12">
                    <div className="login-wrapper">
                        <div className="login-screen" style={{ display: 'flex', flexDirection: 'column', width: 330, overflowY: 'clip', padding: 20, alignItems: 'center' }}>
                            <StepWizard isHashEnabled={false}>
                                <LoginForm isHashEnabled={false} setUserId={(id: any) => setUserId(id)} setUserOnLogin={props.setUserOnLogin} />
                                <ChangePassword id={userId} />
                            </StepWizard>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
