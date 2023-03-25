import { AttachMoneyOutlined, PersonAddOutlined, PersonOutline, PhoneRounded, DescriptionOutlined, PhoneOutlined, PhonelinkRounded, AdbOutlined } from '@material-ui/icons'
import { useState, useEffect } from 'react'
import './settings.css'
import { useNavigate } from "react-router-dom";
import { getFromLocalStorage } from '../../components/LocalStorage/localStorage';
import Button from '@mui/material/Button';
import { ReactComponent as ChatBotIcon } from '../../assets/img/chat-bot-icon.svg'
import { Article } from '@mui/icons-material';

interface SettingsProps {
    isDisable?: boolean
    activeSubTab: string
    switchSubTab: VoidFunction
}

export default function Settings(props: any) {
    let navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(props.activeSubTab) // getNumber,buyCredit,editProfile
    const [isAdmin, setIsAdmin] = useState(true);
    const [user, setUser] = useState(undefined);

    useEffect(() => {
        props.switchSubTab(activeTab);
    }, [activeTab])

    useEffect(() => {
        // console.log("Image link : ", URL.createObjectURL(require('../../assets/img/logo.png')));
        function imgToBlob(url: any) {
            let img = new Image();
            img.src = url;
            let canvas = document.createElement('canvas');
            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                canvas?.getContext('2d')?.drawImage(img, 0, 0);
                // console.log("Image link : ", URL.createObjectURL(canvas.toBlob(setLink, 'image/png', 1)));
                canvas.toBlob(setLink, 'image/png', 1) // about toBlob function: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
            }
        }

        function setLink(blob: any) {
            console.log("Image link : ", URL.createObjectURL(blob));
        }
        imgToBlob('../../assets/img/logo.png')
    }, [])


    function checkIsAdmin() {
        // API.get(`${process.env.REACT_APP_BASE_API}${apiList.getAgentsActivity}`, cardDetails, {})?.subscribe({
        //     next(res: any) {
        //         if (res.status) {
        setTimeout(() => {
            setIsAdmin(true);
        }, 2000);
        //         }
        //     },
        //     error(err) {
        //         console.log(err);
        //     },
        // });
    }

    async function getUserDetails() {
        const userDetails = await getFromLocalStorage("user");
        if (!(userDetails && userDetails.role && userDetails.role.toUpperCase() === "ADMIN")) {
            setUser(userDetails)
            navigate(-1)
        }
    }

    useEffect(() => {
        // checkIsAdmin()
        getUserDetails();
    }, [])


    return (
        <div className="tab-pane get-number-container" id="tab-settings" role="tabpanel" aria-labelledby="settings-tab">
            <div className="tab-pane-header">
                Settings
            </div>
            <div className="account-settings">
                <div className="account-settings-container">
                    <div className="accordion" id="settingsAccordion">
                        <div className='bottom-line' />
                        <Button>
                            <div className={`account-settings-block ${activeTab === 'profile' ? 'active' : props.isDisable && 'disable'}`}
                                onClick={() => {
                                    if (!props.isDisable) {
                                        setActiveTab('profile')
                                        navigate("/settings/profile")
                                    }
                                }}
                            >
                                <div>Profile</div>
                                <PersonOutline className="toggle-arrow" fontSize='small' />
                            </div>
                        </Button>
                        {/* <Button>
                            <div className={activeTab === 'numberMngmt' ? 'account-settings-block active' : 'account-settings-block inactive'}
                                onClick={() => {
                                    setActiveTab('numberMngmt')
                                    navigate("/settings/number-management");
                                }}
                            >
                                <div>Number Management</div><PhoneOutlined className="toggle-arrow" fontSize='small' />
                            </div>
                        </Button> */}
                        {
                            isAdmin &&
                            // ? "account-settings-block disable" : "account-settings-block"
                            <Button>
                                <div className={`account-settings-block ${activeTab === 'buyCredits' ? 'active' : props.isDisable && 'disable'}`}
                                    onClick={() => {
                                        if (!props.isDisable) {
                                            setActiveTab('buyCredits')
                                            navigate("/settings/billing")
                                        }
                                    }}>
                                    <div>Billing Management</div>
                                    <AttachMoneyOutlined className="toggle-arrow" fontSize='small' />
                                </div>
                            </Button>
                        }
                        <Button
                            onClick={() => {
                                if (!props.isDisable) {
                                    setActiveTab('userMngmt');
                                    navigate("/settings/user-management");
                                }
                            }}
                        >
                            <div className={`account-settings-block ${activeTab === 'userMngmt' ? 'active' : props.isDisable && 'disable'}`}>
                                <div>User Management</div>
                                <PersonAddOutlined className="toggle-arrow" fontSize='small' />
                            </div>
                        </Button>
                        <Button
                            onClick={() => {
                                if (!props.isDisable) {
                                    setActiveTab('autoRes');
                                    navigate("/settings/auto-responder");
                                }
                            }}
                        >
                            <div className={`account-settings-block ${activeTab === 'autoRes' ? 'active' : props.isDisable && 'disable'}`}>
                                <div>Auto Responder</div>
                                {/* <AdbOutlined className="toggle-arrow" fontSize='small' /> */}
                                <ChatBotIcon height={20} width={20} />
                            </div>
                        </Button>
                        <Button
                            onClick={() => {
                                if (!props.isDisable) {
                                    setActiveTab('template');
                                    props.switchSubTab('template');
                                    navigate("/settings/templates");
                                }
                            }}
                        >
                            <div className={`account-settings-block ${activeTab === 'template' ? 'active' : props.isDisable && 'disable'}`}>
                                <div>Templates</div>
                                <Article className="toggle-arrow" fontSize='small' />
                            </div>
                        </Button>
                    </div>
                </div>
            </div>
            <div className='secondary-action' style={{ position: 'absolute', bottom: 0, width: '100%', textAlign: 'center' }}>V {process.env.REACT_APP_VERSION}</div>
        </div >
    )
}
