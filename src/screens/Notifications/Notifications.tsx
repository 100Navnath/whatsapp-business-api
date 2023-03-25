import React, { forwardRef, useState, useEffect } from 'react'
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import notificationsJson from '../../assets/jsons/notifications/getNotifications.json'
import './notifications.css'
import { LockClockOutlined } from '@mui/icons-material';
import { AccessTime, Clear } from '@material-ui/icons';
import { Button } from '@material-ui/core';
import { Skeleton } from '@mui/material';
import { apiList } from '../../constant/apiList';
import { API } from '../../constant/network';
import { getFromLocalStorage, setLocalStorage } from '../../components/LocalStorage/localStorage';
import Spinner from '../../components/Loading/spinner';
import LoadingButton from '@mui/lab/LoadingButton';
import InfiniteScroll from 'react-infinite-scroller';
import Scrollbars from 'react-custom-scrollbars'
import moment from 'moment';
import Toast from '../../components/Toast/Toast';
import { onClickNotificationHandle } from './handleNotifications';
import { useNavigate } from 'react-router-dom';

interface notificationsProps {
    setNotificationCount: (count: number) => void
}

export default function Notifications({ setNotificationCount }: notificationsProps) {
    let navigate = useNavigate()
    const { innerWidth: width, innerHeight: height } = window;
    const [notifications, setNotifications] = useState<Array<any>>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1)
    const [take, setTake] = useState(10)
    const [user, setUser] = useState(Object)
    const [notificationButtonLoading, setNotificationButtonLoading] = useState(false)
    const [markAllReadLoading, setMarkAllReadLoading] = useState(false)
    const [deleteBtnLoading, setDeleteBtnLoading] = useState(false);
    const [clickedNotificationIndex, setClickedNotificationIndex] = useState(-1);
    const [totalCount, setTotalCount] = useState(undefined);

    async function getNotifications(pageNo = 1) {
        try {
            setLoading(true);
            const user = await getFromLocalStorage("user");
            const body = {
                businessId: user.businessId,
                userId: user.currentuserId,
                skip: (pageNo - 1) * take,
                take
            }
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.getNotifications}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setLoading(false);
                        setPage(pageNo);
                        setTotalCount(res.data.totalNotificationsCount);
                        if (pageNo === 1) setNotifications([...res.data.lstNotifications]);
                        else setNotifications([...notifications, ...res.data.lstNotifications]);
                        setUser({ ...user, totalUnreadNotifications: res.data.totalUnreadNotifications });
                        setNotificationCount(res.data.totalUnreadNotifications);
                        setLocalStorage("user", { ...user, totalUnreadNotifications: res.data.totalUnreadNotifications })
                    }
                }
            });
        } catch (error: any) {
            setLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }

    function markAsReadUnread(index: any, status: boolean) {
        try {
            // console.log("inside markAsReadUnread");
            setClickedNotificationIndex(index);
            setNotificationButtonLoading(true);
            const body = {
                "notificationId": notifications[index].notificationId,
                "isRead": status,
                "userbusinessId": user.businessId,
                "userId": user.currentuserId
            }
            API.put(`${process.env.REACT_APP_BASE_API}${apiList.markAsRead}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setNotificationButtonLoading(false);
                        let newArray: Array<any> = notifications
                        newArray[index] = { ...newArray[index], notificationStatus: status }
                        const updatedNotoficationCount = status ? user.totalUnreadNotifications - 1 : user.totalUnreadNotifications + 1
                        setNotifications([...newArray]);
                        setUser({ ...user, totalUnreadNotifications: updatedNotoficationCount })
                        setNotificationCount(updatedNotoficationCount);
                        setLocalStorage("user", { ...user, totalUnreadNotifications: updatedNotoficationCount })
                    }
                },
                error(err) {
                    setNotificationButtonLoading(false);
                },
            });
        } catch (error: any) {
            setNotificationButtonLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }

    function markAllAsRead(index: any) {
        try {
            setMarkAllReadLoading(true);
            const body = {
                userId: user.currentuserId,
                userbusinessId: user.businessId,
                isRead: true
            }
            API.put(`${process.env.REACT_APP_BASE_API}${apiList.markAllAsRead}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setMarkAllReadLoading(false);
                        let newArray = notifications
                        newArray.forEach((el) => { el.notificationStatus = true })
                        setNotifications([...newArray]);
                        setUser({ ...user, totalUnreadNotifications: 0 })
                        setNotificationCount(0);
                        setLocalStorage("user", { ...user, totalUnreadNotifications: 0 })
                    }
                }
            });
        } catch (error: any) {
            setMarkAllReadLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }

    function clearSingleNotifiation(index: number) {
        try {
            // setDeleteBtnLoading(true);
            const body = {
                userId: user.currentuserId,
                businessId: user.businessId,
                notification_id: notifications[index].notificationId
            }
            API.deleteApi(`${process.env.REACT_APP_BASE_API}${apiList.deleteNotification}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setNotifications(notifications.filter(function (item: any, itemIndex) {
                            return itemIndex !== index
                        }));
                    }
                }
            });
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    function clearAllNotifiation() {
        try {
            setDeleteBtnLoading(true);
            setLoading(true);
            const body = {
                userId: user.currentuserId,
                businessId: user.businessId
            }
            API.deleteApi(`${process.env.REACT_APP_BASE_API}${apiList.deleteAllNotification}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setDeleteBtnLoading(false);
                        setLoading(false);
                        setNotifications([]);
                        setTotalCount(undefined);
                        setUser({ ...user, totalUnreadNotifications: 0 });
                        setNotificationCount(0);
                        setLocalStorage("user", { ...user, totalUnreadNotifications: 0 })
                    }
                },
                error(err) {
                    setDeleteBtnLoading(false);
                },
            });
        } catch (error: any) {
            setDeleteBtnLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }

    async function setUserDetails() {
        const userDetails = await getFromLocalStorage("user");
        setUser(userDetails);
    }

    useEffect(() => {
        setUserDetails()
        getNotifications();
    }, [])

    async function decreamentNotificationBadge() {
        const userDetails = await getFromLocalStorage('user');
        const updatedObj = { ...userDetails, totalUnreadNotifications: userDetails?.totalUnreadNotifications ? userDetails.totalUnreadNotifications - 1 : 0 }
        setLocalStorage("user", updatedObj)
        setUser(updatedObj)
    }

    return (
        <div className='notifications-wrapper'>
            {/* <!-- Header content header start --> */}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="tab-pane-header" style={{ margin: 20 }}>
                    Notifications
                </div>
                <span>
                    <LoadingButton
                        disableElevation={true}
                        disabled={user.totalUnreadNotifications === 0}
                        className='shadow-sm mark-all-as-read-btn'
                        loading={markAllReadLoading}
                        variant="contained"
                        size='small'
                        loadingIndicator={<Spinner />}
                        onClick={markAllAsRead}
                    >
                        {!markAllReadLoading && "Mark all as read"}
                    </LoadingButton>
                    <LoadingButton
                        className='shadow-sm mark-all-as-read-btn'
                        loading={deleteBtnLoading}
                        variant="contained"
                        size='small'
                        loadingIndicator={<Spinner />}
                        onClick={clearAllNotifiation}
                        style={{ backgroundColor: notifications.length === 0 ? '#0000001f' : '#FF666E' }}
                        disabled={notifications.length === 0}
                    >
                        {!deleteBtnLoading && "Clear all"}
                    </LoadingButton>
                </span>
            </div>
            <Scrollbars style={{ height: height - 100, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <InfiniteScroll
                    pageStart={0}
                    loadMore={() => getNotifications(page + 1)}
                    hasMore={totalCount && totalCount > notifications.length}
                    loader={<div style={{ display: 'flex', height: 50, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
                    ><Spinner color="#1273eb" /></div>}
                    useWindow={false}
                >
                    {
                        !loading || notifications.length !== 0 ?
                            notifications.map((n: any, index: number) =>
                                <div key={index} className='shadow-sm' style={{ width: width - 120, display: 'flex', justifyContent: 'space-between', flexDirection: 'row', padding: 10, alignItems: 'center', marginTop: 5, borderRadius: 5, backgroundColor: n.notificationStatus ? '#FFF' : '#cedef5', marginBottom: 10, marginLeft: 10, cursor: 'pointer' }}
                                    onClick={(e: any) => {
                                        e.stopPropagation()
                                        const event = {
                                            data: {
                                                "type": n.notificationType === 'Template Status Changed' ? 'TemplateStatusChanged' : n.notificationType,
                                                id: n.customerId
                                            }
                                        }
                                        markAsReadUnread(index, true)
                                        decreamentNotificationBadge()
                                        onClickNotificationHandle(event, (path: string) => navigate(path))
                                    }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                        <img className="contact-avatar" src={require('../../assets/img/avatar_placeholder.png')} />
                                        <div>
                                            <div style={{ width: width - 390, justifyContent: 'center' }}>
                                                <span style={{ fontSize: 14, }}>{n.textMessage}</span>
                                                {/* <div style={{ fontSize: 10, color: "#666", textAlign: 'end', right: 120,position:'absolute' }}>{new Date(JSON.parse(n.createdAt)).toDateString()}</div> */}
                                            </div>
                                            <AccessTime style={{ fontSize: 11, color: "#666" }} /><span style={{ fontSize: 11, color: "#666" }}> {moment.utc(n.notificationDateTime).local().format('MM/DD/YYYY, hh:mm A')}</span>
                                            {/* <AccessTime style={{ fontSize: 11 }} /><span style={{ fontSize: 11, color: "#666" }}> {new Date(n.notificationDateTime).toDateString()} at {new Date(n.notificationDateTime).toLocaleTimeString()}</span> */}
                                        </div>
                                    </div>
                                    <span>
                                        {
                                            <LoadingButton
                                                className='shadow-sm'
                                                loading={index === clickedNotificationIndex && notificationButtonLoading}
                                                variant="outlined"
                                                size='small'
                                                loadingIndicator={<Spinner color='#1273eb' />}
                                                onClick={(e: any) => {
                                                    e.stopPropagation()
                                                    markAsReadUnread(index, !n.notificationStatus)
                                                }}
                                                style={{ height: 30, width: 140, backgroundColor: '#fff', color: '#1273eb', fontSize: 12, outlineWidth: 0 }}
                                            >
                                                {
                                                    index === clickedNotificationIndex ?
                                                        !notificationButtonLoading ?
                                                            n.notificationStatus ? "Mark as unread" : "Mark as read" : null :
                                                        n.notificationStatus ? "Mark as unread" : "Mark as read"
                                                }
                                            </LoadingButton>
                                        }
                                        <Clear style={{ marginLeft: 5, color: '#8d8d8d', fontSize: 20 }} onClick={(e: any) => {
                                            e.stopPropagation()
                                            clearSingleNotifiation(index)
                                        }} />
                                    </span>
                                </div>
                            ) :
                            Array(7).fill(1).map((_, index: number) =>
                                <span key={index} style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center', padding: 10, margin: 5, backgroundColor: '#FFF', borderRadius: 5 }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                                        <Skeleton variant="circular" style={{ width: 50, height: 50 }} />
                                        <span style={{ width: '100%', marginLeft: 5 }}>
                                            <Skeleton variant="text" style={{ width: '70%' }} sx={{ fontSize: 14 }} />
                                            <Skeleton variant="text" style={{ width: '20%' }} sx={{ fontSize: 10 }} />
                                        </span>
                                    </div>
                                    <Skeleton variant="rectangular" style={{ width: 100, marginRight: 20 }} />
                                </span>
                            )
                    }
                    {
                        notifications.length == 0 && !loading &&
                        <div style={{ height: height - 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
                            <img src={require("../../assets/img/notification_icon.png")} />
                            <div style={{ marginTop: 10 }}>No new notifications found</div><br />
                        </div>
                    }
                </InfiniteScroll>
            </Scrollbars>
        </div >
    )
}
