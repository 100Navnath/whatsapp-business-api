import { AssessmentOutlined, ChatOutlined, ContactsOutlined, Group, GroupOutlined, NotificationsNone, PersonOutline, PowerSettingsNewOutlined, SettingsOutlined } from '@material-ui/icons'
import { useState, useEffect, forwardRef } from 'react'
import Chat from '../Chat/Chat'
import ChatList from '../ChatList/ChatList'
import Settings from '../Settings'
import './index.css'
import Billing from '../Settings/Billing'
import Agents from '../Settings/Agents/UserManagement'
import Profile from '../Settings/Profile/Profile'
import { Scrollbars } from 'react-custom-scrollbars';
import NumberManagement from '../Settings/NumberManagement'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import ContactList from '../Contacts/ContactList'
import Contacts from '../Contacts/UploadCSV'
import Notifications from '../Notifications/Notifications'
import Analytics from '../Analytics/analytics'
import { getFromLocalStorage, removeFromLocalStorage, setLocalStorage } from '../../components/LocalStorage/localStorage'
import Badge from '@mui/material/Badge';
import { API } from '../../constant/network'
import BulkSMS from '../BulkSMS/BulkSMS'
import { Button } from '@material-ui/core'
import Dialog from '@mui/material/Dialog';
import { getFCMToken } from '../../firebase'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import IconButton from '@mui/material/IconButton';
import Transition from '../../components/Transition'
import Toast from '../../components/Toast/Toast'
import { apiList } from '../../constant/apiList'
import Spinner from '../../components/Loading/spinner'
import { GroupsTwoTone } from '@mui/icons-material'
import SegmentList from '../Segments/SegmentList'
import SegmentInfo from '../Segments/SegmentInfo'
import CreateSegment from '../Segments/CreateSegment'
import AutoResponder from '../Settings/AutoResponder/AutoResponder'
import Templates from '../Settings/Templates/templates'
import CreateTemplate from '../Settings/Templates/createTemplate'
import { newNotification, notify, onClickNotificationHandle } from '../Notifications/handleNotifications'
import axios from 'axios'

export default function Index(props: any) {
    let navigate = useNavigate()
    const [userDetails, setUserDetails] = useState(Object);
    const [clickedContactId, setClickedContactId] = useState(null);
    const [clickedChatId, setClickedChatId] = useState(undefined);
    const [clickedSegment, setClickedSegment] = useState(undefined);
    const [segmentListAction, setSegmentListAction] = useState({ action: 'none' })
    const [contactListAction, setContactListAction] = useState({ action: 'none' })
    const [chatListAction, setChatListAction] = useState({ action: 'none' })
    const [isDisable, setIsDisable] = useState(false);
    const [activeTab, setActiveTab] = useState(props.activeTab);  //chatlist,settings,contacts,analytics
    const [activeSubTab, setActiveSubTab] = useState(props.activeSubTab); //getNumber ,buyCredits
    const [thirdTab, setThirdTab] = useState(props.thirdTab)
    const [notificationCount, setNotificationCount] = useState(
        userDetails && userDetails.totalUnreadNotifications ? JSON.parse(userDetails.totalUnreadNotifications) : 0
    );
    const [logoutDialog, setLogoutDialog] = useState(false)
    const [isTokenFound, setIsTokenFound] = useState<any>(false);
    const [redirectTo, setRedirectTo] = useState(undefined);
    const [logoutLoading, setLogoutLoading] = useState(false);

    // const swListener = new BroadcastChannel('swListener');
    // const onClickNotification = new BroadcastChannel('onClickNotification');
    // swListener.onmessage = (event: any) => newNotification(event, increamentNotificationBadge);
    // swListener.onmessage = (event: any) => console.log("New message");
    // onClickNotification.onmessage = (event: any) => onClickNotificationHandle(event, redirect);

    function increamentNotificationBadge() {
        setNotificationCount(notificationCount + 1);
        setLocalStorage("user", { ...userDetails, totalUnreadNotifications: notificationCount + 1 });
        setUserDetails({ ...userDetails, totalUnreadNotifications: notificationCount + 1 })
    }

    function redirect(path: string, activeTab: string, activeSubTab: string) {
        navigate(path)
    }

    function switchTab(tabName: string) {
        setActiveTab(tabName);
    }

    function switchSubTab(tabName: string) {
        setActiveSubTab(tabName);
    }

    function switchThirdTab(tabName: string) {
        setThirdTab(tabName)
    }

    function goHome() {
        navigate('/chats');
    }

    async function logout() {
        navigate('/', { replace: true });
        setLogoutLoading(true)
        const token = await getFromLocalStorage("user");
        const res = await axios.get('https://geolocation-db.com/json/')
        const body = {
            "userId": userDetails.currentuserId,
            "refreshToken": `${token.jwt.token}`,
            ipAddress: res.data.IPv4
        }
        API.put(`${process.env.REACT_APP_BASE_API}${apiList.logout}`, body, {})?.subscribe({
            next(res: any) {
                if (res.status === 200) {
                    removeFromLocalStorage("user");
                    removeFromLocalStorage("isDisable");
                    removeFromLocalStorage("recentChats");
                    setLogoutLoading(false);
                    navigator.serviceWorker.ready.then((reg) => {
                        reg.pushManager.getSubscription().then((subscription: any) => {
                            subscription
                                .unsubscribe()
                                .then((successful: any) => {
                                    console.log("Service worker unsubscribed successfully")

                                })
                                .catch((e: any) => {
                                    console.log("Error while unsubscribe service worker", e)
                                });
                        });
                    });
                    // navigator.serviceWorker.getRegistrations().then(function (registrations) {
                    //     for (let registration of registrations) {
                    //         registration.unregister().then((p: any) =>
                    //             console.log("Service worker unregistered successfully")
                    //         ).catch((e: any) =>
                    //             console.log("Error while unregister service worker", e)
                    //         )
                    //     }
                    // }).catch((e: any) =>
                    //     console.log("Error while getRegistration : ", e)
                    // );
                }
            },
            error(err) {
                setLogoutLoading(false)
            },
        });
    }
    function getTabContentWidth() {
        if (activeTab === "settings") return 275
        if (activeTab === "analytics") return 0
        if (activeTab === "profile") return 0
        if (activeTab === "notifications") return 0
        else return 375
    }

    function getMainContainerPadding() {
        if (activeTab === "settings") return "0 0 0 340px"
        else if (activeTab === "analytics") return "0 0 0 50px"
        else if (activeTab === "profile") return "0 0 0px 65px"
        else if (activeTab === "notifications") return "0px 0px 0px 65px"
        else return "0 0 0 440px"
    }

    async function getUserDetails() {
        try {
            const i = await getFromLocalStorage("isDisable");
            if (i) {
                navigate("/settings/number-management/get-number", { replace: true });
            }
            const user = await getFromLocalStorage("user");
            if (user) {
                setUserDetails(user);
                setNotificationCount(
                    user.totalUnreadNotifications ? JSON.parse(user.totalUnreadNotifications) : 0
                );
                setActiveTab(props.activeTab);
                setActiveSubTab(props.activeSubTab);
                setThirdTab(props.thirdTab);
                if (user.role.toUpperCase() !== "ADMIN" && activeTab === "settings") {
                    if (activeSubTab === "profile") navigate('/profile', { replace: true })
                    else navigate("/unauthorize-access-denied", { replace: true })
                }
            } else {
                navigate("/");
            }
            setIsDisable(i);
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    function setIsDisableAsFalse() {
        setIsDisable(false);
        setLocalStorage("isDisable", false);
    }

    useEffect(() => {
        getUserDetails();
    }, [])

    return (
        <>
            {/* <!-- Loading wrapper start --> */}
            {/* <div id="loading-wrapper">
                <div className="spinner-border"></div>
            </div> */}
            {/* <!-- Loading wrapper end --> */}

            {/* <!-- Page wrapper start --> */}
            {
                userDetails.businessId &&
                <div className="page-wrapper">
                    {/* <!-- Sidebar wrapper start --> */}
                    <nav className="sidebar-wrapper" style={{ width: getTabContentWidth() + 75 }}>
                        {/* <!-- Sidebar content start --> */}
                        <div className="sidebar-tabs">
                            {/* <!-- Tabs Nav Start --> */}
                            <div className="nav" role="tablist" aria-orientation="vertical">
                                <a onClick={goHome} className="logo">
                                    <img src={require('../../assets/img/logo.png')} alt="Quick Chat" />
                                </a>
                                <IconButton
                                    className="icon-button"
                                    onClick={() => {
                                        if (!(isDisable)) {
                                            navigate("/chats");
                                            setActiveTab('chatlist');
                                            setActiveSubTab(null);
                                        }
                                    }}
                                >
                                    <a className={activeTab == "chatlist" ? "nav-link show active" : isDisable ? "nav-link disable" : "nav-link"}>
                                        <ChatOutlined className={isDisable ? 'nav-icon disable' : 'nav-icon'} />
                                        <span className="nav-link-text">Chats</span>
                                    </a>
                                </IconButton>

                                <IconButton
                                    className="icon-button"
                                    onClick={() => {
                                        if (!(isDisable)) {
                                            navigate('/contacts')
                                            setActiveTab('contacts');
                                            setActiveSubTab(null);
                                        }
                                    }}
                                >
                                    <a className={activeTab == "contacts" ? "nav-link show active" : isDisable ? "nav-link disable" : "nav-link"} id="groups-tab" data-toggle="pill" role="tab" aria-controls="tab-groups" aria-selected="false">
                                        <ContactsOutlined className={isDisable ? 'nav-icon disable' : 'nav-icon'} />
                                        <span className="nav-link-text">Contacts</span>
                                    </a>
                                </IconButton>

                                <IconButton
                                    className="icon-button"
                                    onClick={() => {
                                        if (!(isDisable)) {
                                            navigate('/segments')
                                            setActiveTab('segments');
                                            setActiveSubTab(null);
                                        }
                                    }}
                                >
                                    <a className={activeTab == "segments" ? "nav-link show active" : isDisable ? "nav-link disable" : "nav-link"} id="groups-tab" data-toggle="pill" role="tab" aria-controls="tab-groups" aria-selected="false">
                                        <GroupsTwoTone className={isDisable ? 'nav-icon disable' : 'nav-icon'} />
                                        <span className="nav-link-text">Segments</span>
                                    </a>
                                </IconButton>

                                <IconButton
                                    className="icon-button"
                                    onClick={() => {
                                        if (!(isDisable)) {
                                            navigate('/analytics');
                                            setActiveTab('analytics');
                                            setActiveSubTab(null)
                                        }
                                    }}
                                >
                                    <a className={activeTab == "analytics" ? "nav-link show active" : isDisable ? "nav-link disable" : "nav-link"} id="groups-tab" data-toggle="pill" role="tab" aria-controls="tab-groups" aria-selected="false"

                                    >
                                        <AssessmentOutlined className={isDisable ? 'nav-icon disable' : 'nav-icon'} />
                                        <span className="nav-link-text">Analytics</span>
                                    </a>
                                </IconButton>

                                {
                                    userDetails && userDetails.role == "Admin" &&
                                    <IconButton
                                        className="icon-button"
                                        onClick={() => {
                                            if (!(isDisable)) {
                                                navigate('/settings/profile');
                                                setActiveTab('settings');
                                                setActiveSubTab("profile");
                                            }
                                        }}
                                    >
                                        <a className={activeTab == "settings" ? "nav-link show active" : "nav-link"} id="settings-tab" data-toggle="pill" role="tab" aria-controls="tab-settings" aria-selected="false"

                                        >
                                            <SettingsOutlined className='nav-icon' />
                                            <span className="nav-link-text">Settings</span>
                                        </a>
                                    </IconButton>
                                }
                                {
                                    userDetails && userDetails.role != "Admin" &&
                                    <IconButton
                                        className="icon-button"
                                        onClick={() => {
                                            if (!(isDisable)) {
                                                navigate('/profile');
                                                setActiveTab('profile')
                                                setActiveSubTab('profile');
                                                // setActiveSubTab(null);
                                            }
                                        }}
                                    >
                                        <a className={activeSubTab == "profile" ? "nav-link show active" : "nav-link"}>
                                            <PersonOutline className='nav-icon' />
                                            <span className="nav-link-text">Profile</span>
                                        </a>
                                    </IconButton>
                                }

                                <IconButton
                                    className="icon-button"
                                    onClick={() => {
                                        if (!(isDisable)) {
                                            navigate('/notifications')
                                            setActiveTab('notifications');
                                            setActiveSubTab(null);
                                        }
                                    }}>
                                    <a className={activeTab == "notifications" ? "nav-link show active" : isDisable ? "nav-link disable" : "nav-link"}>
                                        <div>
                                            {
                                                notificationCount > 0 &&
                                                <span className='badge'>{notificationCount > 99 ? '99+' : notificationCount}</span>
                                            }
                                            <NotificationsNone className={isDisable ? 'nav-icon disable' : 'nav-icon'} />
                                        </div>
                                        {/* <NotificationsNone className={isDisable ? 'nav-icon disable' : 'nav-icon'} /> */}
                                        <span className="nav-link-text">Notifications</span>
                                    </a>
                                </IconButton>

                                <IconButton
                                    className="nav-link mt-auto icon-button" onClick={() => setLogoutDialog(true)}>
                                    <a className="nav-link mt-auto">
                                        <PowerSettingsNewOutlined className='nav-icon' />
                                        <span className="nav-link-text">Logout</span>
                                    </a>
                                </IconButton>

                            </div>
                            {/* <!-- Tabs Nav End --> */}

                            {/* <!-- Tabs Content Start --> */}
                            <div className="tab-content" style={{ width: getTabContentWidth() }}>
                                <Scrollbars>
                                    {
                                        activeTab === "chatlist" &&
                                        <ChatList switchSubTab={switchSubTab} setClickedChatId={(id: any) => setClickedChatId(id)} chatListAction={chatListAction} />
                                    }
                                    {
                                        userDetails && userDetails.role == "Admin" && activeTab === 'settings' &&
                                        < Settings switchSubTab={switchSubTab} activeSubTab={activeSubTab} isDisable={isDisable} />
                                    }
                                    {
                                        activeTab === 'contacts' &&
                                        <ContactList switchSubTab={switchSubTab} switchThirdTab={switchThirdTab}
                                            setClickedContactId={(id: any) => setClickedContactId(id)}
                                            contactListAction={contactListAction} />
                                    }
                                    {
                                        activeTab === 'segments' &&
                                        <SegmentList switchSubTab={switchSubTab} switchThirdTab={switchThirdTab}
                                            setClickedSegment={(obj: any) => setClickedSegment(obj)} segmentListAction={segmentListAction}
                                        />
                                    }
                                </Scrollbars>
                            </div>
                            {/* <!-- Tabs Content End --> */}
                        </div>
                        {/* <!-- Sidebar content end --> */}
                    </nav>
                    {/* <!-- Sidebar wrapper end --> */}

                    <div className="main-container" style={{ padding: getMainContainerPadding() }} >
                        <Scrollbars>
                            {
                                activeSubTab === 'chat' &&
                                <Chat clickedChatId={clickedChatId} switchSubTab={switchSubTab} setChatListAction={(action: any) => setChatListAction(action)} />
                            }
                            {
                                activeSubTab === 'bulkSMS' &&
                                <BulkSMS setChatListAction={(action: any) => setChatListAction(action)} />
                            }
                            {
                                activeSubTab === 'numberMngmt' &&
                                <NumberManagement thirdTab={thirdTab} switchThirdTab={switchThirdTab} setIsDisable={setIsDisableAsFalse} />
                            }
                            {
                                activeSubTab === 'buyCredits' &&
                                <Billing />
                            }
                            {
                                activeSubTab === 'userMngmt' &&
                                <Agents />
                            }
                            {
                                activeSubTab === 'profile' &&
                                <Profile />
                            }
                            {
                                activeSubTab === 'template' &&
                                <Templates switchSubTab={switchSubTab} />
                            }
                            {
                                activeSubTab === 'createTemplate' &&
                                <CreateTemplate switchSubTab={switchSubTab} />
                            }
                            {
                                activeSubTab === 'contacts' &&
                                <Contacts thirdTab={thirdTab}
                                    clickedContactId={clickedContactId}
                                    setContactListAction={(action: any) => setContactListAction(action)}
                                    chatListAction={chatListAction}
                                    setChatListAction={(action: any) => setChatListAction(action)}
                                />
                            }
                            {
                                activeTab === 'analytics' &&
                                <Analytics />
                            }
                            {
                                activeSubTab === 'segmentInfo' &&
                                <SegmentInfo thirdTab={thirdTab} clickedSegment={clickedSegment} setSegmentListAction={(action: any) => setSegmentListAction(action)} />
                            }
                            {
                                activeSubTab === 'createSegment' &&
                                <CreateSegment thirdTab={thirdTab} clickedSegment={clickedSegment} setSegmentListAction={(action: any) => setSegmentListAction(action)}
                                    switchSubTab={switchSubTab}
                                    setClickedSegment={(obj: any) => setClickedSegment(obj)}
                                />
                            }
                            {
                                activeSubTab === 'autoRes' &&
                                <AutoResponder thirdTab={thirdTab} clickedSegment={clickedSegment} setSegmentListAction={(action: any) => setSegmentListAction(action)}
                                    switchSubTab={switchSubTab}
                                    setClickedSegment={(obj: any) => setClickedSegment(obj)}
                                />
                            }
                            {
                                activeTab === 'notifications' &&
                                <Notifications setNotificationCount={(count: number) => setNotificationCount(count)} />
                            }
                            {
                                !activeSubTab && activeTab != 'analytics' && activeTab != 'notifications' &&
                                <div className='empty-screen-wrapper'>
                                    <img src={require('../../assets/img/empty-display.png')} />
                                </div>
                            }
                        </Scrollbars>
                    </div>
                    <Dialog
                        open={logoutDialog}
                        TransitionComponent={Transition}
                        keepMounted
                        // onClose={() => setLogoutDialog(false)}
                        aria-describedby="alert-dialog-slide-description"
                        transitionDuration={400}
                    >
                        <div className='dialog-wrapper'>
                            <div className='dialog-title' style={{ marginBottom: 20 }}>Logout Confirmation</div>
                            Are you sure you want to logout ?
                            <div className="dialog-action-buttons">
                                <Button variant="outlined" className='dialog-btn-positive' onClick={logout}>
                                    {logoutLoading ? <Spinner /> : "Confirm"}
                                </Button>
                                <Button variant="outlined" className='dialog-btn-danger' onClick={() => setLogoutDialog(false)}>Cancel</Button>
                            </div>
                        </div>
                    </Dialog>
                </div >
            }
            {/* <!-- Page wrapper end --> */}
        </>
    )
}
