import { TextField, withStyles, makeStyles } from '@material-ui/core';
import { Add, CallMade, CallReceived, Close, ErrorOutline, SearchOutlined, Send } from '@material-ui/icons';
import React, { useState, forwardRef, useEffect, useRef } from 'react'
import Scrollbars from 'react-custom-scrollbars'
import { useNavigate } from 'react-router-dom';
import customer from '../../assets/jsons/customer.json'
import recentChats from '../../assets/jsons/chats/recentChats.json'
// import searchedResultsContacts from '../../assets/jsons/chats/newChat/searchResult.json'
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import Dialog from '@mui/material/Dialog';
import './chatlist.css';
import { SelectChangeEvent } from '@mui/material/Select';
import { API } from '../../constant/network';
import { apiList } from '../../constant/apiList';
import Spinner from '../../components/Loading/spinner';
import { ValidateEmptyField, ValidateLength, ValidateMobile } from '../../components/validators';
import { LoadingButton } from '@mui/lab';
import { fontSize } from '@mui/system';
import { getFromLocalStorage, setLocalStorage } from '../../components/LocalStorage/localStorage';
import PhoneInput from 'react-phone-input-2';
import InfiniteScroll from 'react-infinite-scroller';
import IconButton from '@mui/material/IconButton';
import OutsideClickDetector from '../../components/OutsideClickDetector/OutsideClickDetector';
import moment from 'moment';
import Toast from '../../components/Toast/Toast';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { DocumentScannerOutlined, TextSnippetOutlined } from '@mui/icons-material';


const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="down" ref={ref} {...props} />;
});

const CssTextField = withStyles({
    root: {
        '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
                borderColor: '#075E54',
            },
        },
    },
})(TextField);

export default function ChatList(props: any) {

    const GridTooltip = styled(({ className, ...props }: any) => (
        <Tooltip {...props} classes={{ popper: className }} />
    ))(({ theme }: { theme: any }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: '#111',
            color: '#FFF',
            maxWidth: 220,
            fontSize: theme.typography.pxToRem(10),
            border: '1px solid #dadde9',
        },
    }));
    const { innerWidth: width, innerHeight: height } = window;
    const [chatlist, setChatList] = useState<Array<any>>([])
    const [addContactDialog, setAddContactDialog] = useState(false);
    let navigate = useNavigate();
    const [clickedContactId, setClickedContactId] = useState<any>(undefined);
    const [search, setSearch] = useState('');
    const [searchedContactsDropdown, setSearchedContactsDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [listLoading, setListLoading] = useState(false);
    const [newChat, setNewChat] = useState(Object)
    const [isBtnClick, setIsBtnClick] = useState(false);
    const [newChatBtnClick, setNewChatBtnClick] = useState(false);
    const [newChatSearchedPhone, setNewChatSearchedPhone] = useState<any>(undefined)
    const [searchedResultsContacts, setSearchedResultsContacts] = useState<Array<any>>([])
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(undefined)
    const [newChatLoading, setNewChatLoading] = useState(false)
    const [newChatSearchLoading, setNewSearchChatLoading] = useState(false)
    const [searched, setSearched] = useState("")
    const chatCardRef = useRef<any>(null);

    const [loggedInUser, setLoggedInUser] = useState<any>(null);

    const handleChange = (event: SelectChangeEvent) => {
        if (event.target.value === "" || !event.target.value) {
            setPage(1);
            getRecentChats(0, event.target.value)
            setSearch(event.target.value)
        }
        setTotalCount(undefined);
        setSearch(event.target.value);
    };

    async function markChatAsRead(id: number) {
        let updatedArr = [...chatlist]
        const objIndex = chatlist.findIndex(((obj: any) => obj?.id === id));
        updatedArr[objIndex] = { ...chatlist[objIndex], unreadCount: 0 }
        setChatList([...updatedArr]);

        let recentChats: Array<any> = await getFromLocalStorage("recentChats");
        const arr = recentChats?.filter((obj: any) => obj.id !== id);
        setLocalStorage("recentChats", [...arr]);
    }

    async function _onContactClick(chat: any) {
        // const id = chat.isDeleted ? 0 : chat.id
        navigate(`/chats/${chat.id}`);
        props.switchSubTab('chat');
        setClickedContactId(chat)
        props.setClickedChatId({ ...chat });
        // let updatedArr = [...chatlist]
        // const objIndex = chatlist.findIndex(((obj: any) => obj?.id === chat.id));
        // updatedArr[objIndex] = { ...chat, unreadCount: 0 }
        // setChatList([...updatedArr]);

        // let recentChats: Array<any> = await getFromLocalStorage("recentChats");
        // const arr = recentChats.filter((obj: any) => obj.id !== chat.id);
        // setLocalStorage("recentChats", [...arr]);
    }

    const onClickNotification = new BroadcastChannel('onClickNotification');
    onClickNotification.onmessage = (event: any) => {
        if (event?.data?.type === "ReceivedNewMessage") {
            _onContactClick({ ...event?.data?.Data })
        }
    };

    function onClickAddChat() {
        setAddContactDialog(true);
    }

    async function getRecentChats(skip = 0, searchValue = "") {
        try {
            setListLoading(true)
            if (searchValue === "") {
                const user = await getFromLocalStorage("user");
                if (!user) {
                    navigate("/");
                }
                const body = {
                    userId: user.currentuserId,
                    businessId: user.businessId,
                    takeIn: 10,
                    skipIn: skip
                }

                const list: Array<any> = await getFromLocalStorage("recentChats")
                let recentChats: Array<any> = []
                if (list && list.length > 0) {
                    recentChats = [...list]
                }

                API.get(`${process.env.REACT_APP_BASE_API}${apiList.getRecentChats}`, body, {})?.subscribe({
                    next(res: any) {
                        if (res.status === 200) {
                            setListLoading(false)
                            const resList = [...res?.data?.lstrecentchat]
                            //[{id:10},{id:11}]
                            let arr: Array<any> = []
                            resList.map((a: any, index: number) => {
                                const foundObject = recentChats.find((b: any) => b.id == a.id)
                                if (!foundObject) {
                                    // resList.splice(index, 1);
                                    arr.push(resList[index])
                                }
                            })

                            if (skip === 0) setChatList([...recentChats, ...arr]);
                            else setChatList([...chatlist, ...res?.data?.lstrecentchat])
                            setTotalCount(res.data.count);
                            setPage(page + 1)
                            const arrayOfUrl = window.location.href.split('/');
                            const id = parseInt(arrayOfUrl[arrayOfUrl.length - 1]);
                            if (id > 0) {
                                let arr = [...recentChats, ...resList].filter((obj: any) => obj.id === id)
                                setClickedContactId(arr[0])
                                props.setClickedChatId(arr[0]);
                            }
                        }
                    },
                    error(err) {
                        setListLoading(false)
                    },
                });
            } else if (searchValue !== "") searchChat((page - 1) * 10, searchValue)
        } catch (error: any) {
            console.log("Catched error in getRecentChats", error);
            setListLoading(false)
            Toast({ message: error, type: 'error' })
        }
    }

    async function sendMessageToNewChat() {
        try {
            setNewChatBtnClick(true);
            if (((newChatSearchedPhone && !ValidateEmptyField(newChatSearchedPhone.phoneNo).isError) ||
                (newChat && !ValidateEmptyField(newChat.phoneNo).isError)) &&
                newChat &&
                !ValidateEmptyField(newChat.lastMessage).isError
            ) {
                const user = await getFromLocalStorage("user");
                if (!user) {
                    navigate("/");
                }
                const body = {
                    "userId": user.currentuserId,
                    "userBusinessId": user.businessId,
                    "customerId": newChat.id ? newChat.id : 0,
                    "smsText": newChat.lastMessage,
                    "smsStatus": "pending",
                    "smsType": "send",
                    "smsTo": newChat.to,
                }
                setNewChatLoading(true);
                API.post(`${process.env.REACT_APP_BASE_API}${apiList.sendMessage}`, body, {})?.subscribe({
                    next(res: any) {
                        if (res.status === 201 || res.status === 200) {
                            let arr = chatlist;
                            const newChatObject = {
                                "id": body.customerId,
                                "name": newChat.name ? newChat.name : "Unknown",
                                "contact": body.smsTo,
                                "lastMessage": body.smsText,
                                "createdAt": Date.now(),
                                "incoming": false
                            }
                            const index = chatlist.findIndex(function (obj: any) { return obj.contact.split("-").join("") == body.smsTo.split("-").join("") })
                            if (index >= 0) {
                                chatlist.splice(index, 1)
                                chatlist.splice(0, 0, newChatObject)
                            }
                            else chatlist.splice(0, 0, newChatObject);
                            setNewChatLoading(false);
                            setNewChat({ lastMessage: "", contact: ``, to: `` });
                            setNewChatBtnClick(false);
                            setAddContactDialog(false);
                            setNewChatSearchedPhone({ ...newChatSearchedPhone, phoneNo: "" })
                            Toast({ message: 'Message sent successfully', type: 'success' });
                        }
                    },
                    error(err) {
                        setNewChatLoading(false);
                        setNewChatBtnClick(false);
                    },
                });
            }
        } catch (error: any) {
            setNewChatLoading(false);
            setNewChatBtnClick(false)
            Toast({ message: error, type: 'error' })
        }
    }

    async function searchChat(skip = 0, searchValue = "") {
        try {
            setIsBtnClick(true);
            if (
                !ValidateEmptyField(searchValue).isError
            ) {
                setChatList([]);
                const user = await getFromLocalStorage("user");
                if (!user) {
                    navigate("/");
                }
                const body = {
                    userId: user.currentuserId,
                    businessId: user.businessId,
                    takeIn: 10,
                    skipIn: skip,
                    searchValue: searchValue
                }
                setLoading(true);
                API.get(`${process.env.REACT_APP_BASE_API}${apiList.searchRecentChats}`, body, {})?.subscribe({
                    next(res: any) {
                        if (res.status === 200) {
                            setLoading(false);
                            setIsBtnClick(false);
                            if (skip === 0) setChatList([...res.data.lstrecentchat])
                            else setChatList([...chatlist, ...res.data.lstrecentchat])
                            setTotalCount(res.data.count)
                            setPage(page + 1)
                            setSearched(search)
                        }
                    },
                    error(err) {
                        setLoading(false)
                    },
                });
            }
        } catch (error: any) {
            setLoading(false);
            setIsBtnClick(false)
            Toast({ message: error, type: 'error' })
        }
    }

    async function searchContacts(showList = false, contact = newChatSearchedPhone) {
        try {
            const user = await getFromLocalStorage("user");
            if (!user) {
                navigate("/");
            }
            const body = {
                userId: user.currentuserId,
                businessId: user.businessId,
                skip: 0,
                take: 100,
                searchValue: `${contact.countryCode}${contact.phoneNo}`
            }
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.searchContactList}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setNewSearchChatLoading(false);
                        setSearchedResultsContacts(res.data.lstCustomer);
                        if (res.data.lstCustomer.length > 1) {
                            setSearchedContactsDropdown(true);
                        } else setSearchedContactsDropdown(false || showList)
                        if (res.data.lstCustomer.length === 1 &&
                            res.data.lstCustomer[0].phoneNo === `${contact.countryCode}${contact.phoneNo}`
                        ) {
                            setNewChat({
                                id: res.data.lstCustomer[0].id,
                                to: res.data.lstCustomer[0].phoneNo,
                                contact: res.data.lstCustomer[0].phoneNo,
                                name: res.data.lstCustomer[0].name,
                            })
                            setNewChatSearchedPhone({ ...newChatSearchedPhone, phoneNo: res.data.lstCustomer[0].phoneNo.slice(newChatSearchedPhone.countryCode.length) });
                        } else {
                            // console.log("in else : ", `${contact.countryCode}-${contact.phoneNo}`);
                            setNewChat({ to: `${contact.countryCode}-${contact.phoneNo}`, lastMessage: newChat.lastMessage, id: 0 })
                        }
                        // else setNewChat({ ...newChat, to: "" })
                    }
                },
                error(err) {
                    setNewSearchChatLoading(false);
                },
            });
        } catch (error: any) {
            setNewSearchChatLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }

    function onClickBulkChat() {
        try {
            navigate('/chats/bulk-sms');
            props.switchSubTab('bulkSMS');
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    async function getLoggedInUserInfo() {
        const user = await getFromLocalStorage('user');
        if (!user) navigate('/')
        else {
            setLoggedInUser(user)
        }
    }

    useEffect(() => {
        getLoggedInUserInfo();
        getRecentChats(0)
    }, [])

    useEffect(() => {
        if (props.chatListAction.action === "reloadChatList") {
            setPage(1)
            getRecentChats(0);
            props.switchSubTab(null);
            navigate('/chats');
        }
        //updateChat action is used to update unknown chat data after adding it to contact
        else if (props.chatListAction.action === "updateChat") {
            if (props.chatListAction.data && props.chatListAction.data.contact) {
                let newArray = chatlist;
                const index = newArray.findIndex(function (obj: any) { return obj.contact.split("-").join("") == props.chatListAction.data.contact.split("-").join("") })
                if (index >= 0) {
                    newArray[index] = props.chatListAction.data
                    setChatList([...newArray])
                } else {
                    setPage(1)
                    getRecentChats(0);
                }
            }
        }
        //updateMsg action is used to place that chat to 1st position in list and update last message in recent chats list
        else if (props.chatListAction.action === "updateMsg") {
            if (props.chatListAction.data && props.chatListAction.data.contact) {
                let newArray = chatlist;
                const index = newArray.findIndex(function (obj: any) { return obj.contact.split("-").join("") == props.chatListAction.data.contact.split("-").join("") })
                if (index >= 0) {
                    let arr = [...chatlist]
                    arr.splice(index, 1)
                    arr.splice(0, 0, props.chatListAction.data)
                    setChatList(arr);
                } else {
                    chatlist.splice(0, 0, props.chatListAction.data)
                }
            }
        }
        else if (props.chatListAction.action === "markChatAsRead") {
            if (props.chatListAction.data) {
                markChatAsRead(props.chatListAction.data.id)
            }
        }
    }, [props.chatListAction])

    useEffect(() => {
        setIsBtnClick(false)
    }, [addContactDialog])

    const swListener = new BroadcastChannel('swListener');
    swListener.onmessage = async (event: any) => {
        // console.log("onmassage ", event);
        const data = event.data
        if (data && (data.Type === "ReceivedNewMessage" || data.Type === "Send New Mesaage Auto Response")) {
            const arrayOfUrl = window.location.href.split('/');
            const id = parseInt(arrayOfUrl[arrayOfUrl.length - 1]);

            const objIndex = chatlist.findIndex(((obj: any) => obj?.id === data.Data.id));
            const updatedChatObj = { ...data.Data, lastMessage: data.Data.message, unreadCount: chatlist[objIndex]?.unreadCount ? chatlist[objIndex]?.unreadCount + 1 : 1 }
            if (data?.Data?.id !== id) {
                if (objIndex === -1) {
                    console.log("abcabc");

                    setChatList([updatedChatObj, ...chatlist])
                }
                else if (objIndex > -1) {
                    let updatedArr = [...chatlist]
                    updatedArr.splice(objIndex, 1)
                    setChatList([updatedChatObj, ...updatedArr])
                }
                const chatlist1 = await getFromLocalStorage("recentChats");
                let list: Array<any> = [];
                if (chatlist1 && chatlist1.length > 0) list = [...chatlist1]
                const objIndex1 = list.findIndex(((obj: any) => obj?.id === data.Data.id));
                if (objIndex1 === -1) setLocalStorage("recentChats", [updatedChatObj, ...list])
                else if (objIndex1 > -1) {
                    let updatedArr = [...list]
                    updatedArr.splice(objIndex1, 1)
                    setLocalStorage("recentChats", [updatedChatObj, ...updatedArr])
                }
            } else {
                let updatedArr = [...chatlist]
                updatedArr[objIndex] = { ...updatedArr[objIndex], lastMessage: data.Data.message };
                setChatList([...updatedArr])
            }
        }
    }

    return (
        <div className="tab-pane">
            {/* <!-- Header content header start --> */}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="tab-pane-header">
                    Chats
                </div>
                <div style={{ marginRight: 13, justifyContent: 'end', display: 'flex' }}>
                    <Button variant="outlined" style={{ height: 30, backgroundColor: '#fff', color: '#075E54', fontSize: 12, outlineWidth: 0, marginRight: 10, borderColor: '#075E54' }}
                        onClick={onClickBulkChat}
                    >
                        Send Bulk SMS
                    </Button>
                    <Button variant="outlined" style={{ height: 30, backgroundColor: '#fff', color: '#075E54', fontSize: 12, outlineWidth: 0, borderColor: '#075E54' }} onClick={onClickAddChat}>
                        Chat
                        <Add style={{ fontSize: 16, marginLeft: 5 }} />
                    </Button>
                </div>
            </div>
            {/* <!-- Header content header end --> */}

            {/* <!-- Chat users container start --> */}
            <div className="chat-users-container">
                {/* <!-- Search Container Start --> */}
                <div style={{ padding: 10, paddingBottom: 0, }}>
                    <div style={{ display: 'flex', flexDirection: 'row', boxShadow: '5px 5px 5px #eaeef7', alignItems: 'center' }}>
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="Search Chat"
                                onChange={handleChange} style={{ fontSize: 12 }} />
                        </div>
                        <IconButton
                            style={{ backgroundColor: '#075E54', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, marginLeft: 5, height: 30, width: 35, color: '#FFF' }}
                            color="primary" aria-label="upload picture" component="label"
                            onClick={() => {
                                setPage(1)
                                searchChat(0, search)
                            }}
                        >
                            {
                                loading ?
                                    <Spinner /> :
                                    <SearchOutlined fontSize='small' />
                            }
                        </IconButton>
                    </div>
                    <div style={{ color: '#d32f2f', fontSize: 11, textAlign: 'left' }}>{isBtnClick && ValidateEmptyField(search, "Search value").err}</div>
                </div>
                {/* <!-- Search Container End --> */}


                <div className="users-container" >
                    {/* <!-- Users container scroll start --> */}
                    <Scrollbars style={{ height: height - 115 }}>
                        {/* <div style={{ fontSize: 10, textAlign: 'right', marginRight: 15 }}><b>{totalCount}</b> recent chats</div> */}
                        {/* <!-- Contacts list start --> */}
                        {
                            totalCount !== 0 && chatlist.length !== 0 ?
                                <InfiniteScroll
                                    pageStart={0}
                                    loadMore={() => getRecentChats((page - 1) * 10)}
                                    hasMore={totalCount && totalCount > chatlist.length}
                                    loader={<div style={{ display: 'flex', width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}
                                    ><Spinner color="#075E54" /></div>}
                                    useWindow={false}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                                        {
                                            chatlist.map((recentChat: any, index: number) => {
                                                const t = recentChat?.templateJson?.components?.filter((obj: any) => { return obj.type === 'HEADER' })[0]?.text
                                                const headerText = t ? t : ""
                                                const bodyText = recentChat?.templateJson?.components?.filter((obj: any) => { return obj.type === 'BODY' })[0]?.text
                                                return (
                                                    <div ref={chatCardRef} key={index} className='contact-wrapper' style={{ backgroundColor: clickedContactId && clickedContactId.id === recentChat.id && clickedContactId.contact === recentChat.contact ? '#e8f1fc' : '#FFF', width: '95%' }} onClick={() => _onContactClick(recentChat)}>
                                                        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center' }}>
                                                            {
                                                                recentChat.profilePhoto ?
                                                                    <img className="contact-avatar" src={recentChat.profilePhoto} alt="Avatar" /> :
                                                                    <div className="contact-avatar" style={{ backgroundColor: '#60a49b' }}>
                                                                        {
                                                                            recentChat?.isDeleted || !recentChat.name || recentChat.id === 0 ?
                                                                                "?" :
                                                                                recentChat?.name?.split(" ").map((n: any) => n[0]).join("").substring(0, 2).toUpperCase()
                                                                        }
                                                                    </div>
                                                            }
                                                            <div style={{ width: chatCardRef.current?.offsetWidth - 90, minWidth: 250 }}>
                                                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <div>
                                                                        <div className="name">
                                                                            {recentChat.isDeleted || !recentChat.name || recentChat.id === 0 ? (recentChat?.contact?.charAt(0) !== "+" && "+") + recentChat?.contact?.split("-").join("") : recentChat.name}
                                                                        </div>
                                                                        {!recentChat.isDeleted && recentChat.id !== 0 && <div className='contact-number'>{recentChat.contact.split("-").join("")}</div>}
                                                                    </div>
                                                                    <span style={{ display: 'flex' }}>
                                                                        {
                                                                            recentChat?.unreadCount > 0 &&
                                                                            <span style={{ display: 'flex', backgroundColor: '#25D366', height: 16, padding: '2px 2px', width: 'fit-content', minWidth: 15, marginRight: 5, fontSize: 10, justifyContent: 'center', alignItems: 'center', color: '#fff', borderRadius: 50 }}>
                                                                                {recentChat.unreadCount > 99 ? "99+" : recentChat.unreadCount}
                                                                            </span>
                                                                        }
                                                                        {
                                                                            recentChat.incoming ?
                                                                                <CallReceived className='received-msg-icon' /> :
                                                                                <CallMade className='received-msg-icon' />
                                                                        }
                                                                    </span>
                                                                </div>
                                                                {
                                                                    recentChat.whatsappTemplateId && recentChat.templateJson ?
                                                                        <div className="message"><span style={{ fontWeight: 'bold', color: '#444' }}> {headerText} </span>{bodyText.substring(0, (99 - headerText.length))}{`${headerText}${bodyText}`.length > 100 ? '...' : ''}</div> :
                                                                        <div className="message">{`${recentChat.lastMessage.substring(0, 100)}${recentChat.lastMessage.length > 100 ? '...' : ''}`}</div>

                                                                }
                                                                {
                                                                    recentChat.createdAt &&
                                                                    <div className="timestamp">{moment.utc(recentChat.createdAt).local().format('DD/MM/YYYY, hh:mm A')}</div>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            )
                                        }
                                    </div>
                                </InfiniteScroll> :
                                <div style={{ height: height - 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {
                                        listLoading || loading ?
                                            <Spinner color="#075E54" /> :
                                            <span style={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column', fontSize: 14, color: '#999' }}>
                                                <ErrorOutline style={{ fontSize: 80, marginRight: 5, marginBottom: 5, color: '#ddd' }} />
                                                Recent chats not found {searched && `with keyword "${searched}"`}
                                            </span>
                                    }
                                </div>
                        }
                    </Scrollbars>
                    {/* <!-- Users container scroll end --> */}
                </div>

            </div>
            {/* <!-- Chat users container end --> */}
            <Dialog
                open={addContactDialog}
                TransitionComponent={Transition}
                keepMounted
                // onClose={() => setAddContactDialog(false)}
                aria-describedby="alert-dialog-slide-description"
                transitionDuration={400}
            >
                <div className='dialog-wrapper' style={{ width: 'fit-content' }}>
                    <div className='dialog-title' style={{ marginBottom: 0 }}>New Chat<Close onClick={() => setAddContactDialog(false)} className='close-dialog' /></div>
                    <div style={{ padding: 30, width: 'fit-content' }}>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <PhoneInput
                                containerStyle={{ width: 'fit-content', fontFamily: 'Poppins', fontSize: 14 }}
                                country={'in'}
                                searchStyle={{ fontFamily: 'Poppins', fontSize: 12, padding: 5 }}
                                inputStyle={{ fontFamily: 'Poppins', fontSize: 12 }}
                                searchPlaceholder={"Search"}
                                dropdownStyle={{ alignItems: 'flex-start', display: 'flex', flexDirection: 'column' }}
                                value={`${newChatSearchedPhone?.countryCode}${newChatSearchedPhone?.phoneNo}`}
                                onChange={(number, obj: any) => {
                                    setNewChatSearchedPhone({ countryCode: `+${obj.dialCode}`, phoneNo: number.slice(obj.dialCode.length) })
                                    setSearchedContactsDropdown(false);
                                    if (number.slice(obj.dialCode.length).length > 7) searchContacts(false, { countryCode: `+${obj.dialCode}`, phoneNo: `${number.slice(obj.dialCode.length)}` })
                                }}
                                enableSearch={true}
                                countryCodeEditable={false}
                            />
                            <span className='' style={{ backgroundColor: '#075E54', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, marginLeft: 5, width: 45, color: '#FFF' }}>
                                {newChatSearchLoading ? <Spinner color='#FFF' /> : <SearchOutlined onClick={() => {
                                    setNewSearchChatLoading(true)
                                    searchContacts(true)
                                }} />}
                            </span>
                        </div>
                        <div style={{ color: '#d32f2f', fontSize: 11, textAlign: 'left', marginTop: 3 }}>{newChatBtnClick && ValidateLength(`${newChatSearchedPhone?.phoneNo ? newChatSearchedPhone?.phoneNo : ""}`, 3, 15, "Contact field").err}</div>
                        <div style={{ color: '#167368', fontSize: 11, textAlign: 'left', marginTop: 3 }}>{
                            searchedResultsContacts.length === 1 &&
                                searchedResultsContacts[0].phoneNo === newChat.to ?
                                `Sending message to ${searchedResultsContacts[0].name}` :
                                searchedResultsContacts.length === 0 && newChatSearchedPhone && !ValidateMobile(newChatSearchedPhone.phoneNo).isError &&
                                `Sending message to unknown`
                        }</div>
                        {searchedContactsDropdown &&
                            <OutsideClickDetector
                                action={() => setSearchedContactsDropdown(false)}
                                children={<Scrollbars style={{ height: 150, width: 270, backgroundColor: '#FFF', position: 'absolute', zIndex: 100, marginTop: 5, boxShadow: "1px 1px 1px 1px #888", borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
                                    {
                                        searchedResultsContacts.length > 0 ?
                                            searchedResultsContacts.map((i: any) =>
                                                <div
                                                    style={{ width: "100%", textAlign: 'left', marginBottom: 5, cursor: 'pointer', border: '1px solid #ddd', padding: 5, borderRadius: 5 }}
                                                    onClick={() => {
                                                        setSearchedResultsContacts([i])
                                                        setNewChatSearchedPhone({ ...newChatSearchedPhone, phoneNo: searchedResultsContacts[0].phoneNo.slice(newChatSearchedPhone.countryCode.length) });
                                                        setNewChat({ ...i, lastMessage: "", contact: `${i.phoneNo}`, to: `${i.phoneNo}` })
                                                        setSearchedContactsDropdown(false);
                                                    }}
                                                >
                                                    <span style={{ fontSize: 12 }}>{i.firstName} {i.lastName}</span><br />
                                                    <span style={{ color: '#666', fontSize: 10, margin: 0 }}>{i.countryCode} {i.phoneNo}</span>
                                                </div>
                                            ) :
                                            <span style={{ fontSize: 12 }}>No record found for {newChatSearchedPhone.countryCode}{newChatSearchedPhone.phoneNo}</span>
                                    }
                                </Scrollbars>}
                            />
                        }
                        <CssTextField
                            style={{ marginTop: 20 }}
                            className='text-field'
                            id="outlined-basic"
                            // label="Message"
                            placeholder='Enter message...'
                            variant="outlined"
                            value={newChat.lastMessage}
                            multiline={true}
                            disabled={!(newChatSearchedPhone && ValidateMobile(newChatSearchedPhone.phoneNo))}
                            inputProps={{ style: { fontSize: 12, padding: 0 } }} // font size of input text
                            onChange={(e: any) => setNewChat({ ...newChat, lastMessage: e.target.value })}
                        // autoFocus={true}
                        />
                        <div style={{ color: '#d32f2f', fontSize: 11, textAlign: 'left' }}>{newChatBtnClick && ValidateEmptyField(`${newChat.lastMessage ? newChat.lastMessage : ""}`, "Message").err}</div>


                        <div className="dialog-action-buttons" style={{ display: 'flex', paddingRight: 0, alignItems: 'center', justifyContent: 'center', direction: 'rtl' }}>
                            <span>
                                <LoadingButton
                                    loading={newChatLoading}
                                    variant="contained"
                                    size='small'
                                    loadingIndicator={<Spinner />}
                                    onClick={sendMessageToNewChat}
                                    className='dialog-btn-positive'
                                    disabled={false}
                                >
                                    <span style={{ direction: 'ltr' }}>Send <Send style={{ marginLeft: 10, fontSize: 16 }} /></span>
                                </LoadingButton>
                            </span>
                            <Button variant="outlined" className='dialog-btn-danger' onClick={() => {
                                setAddContactDialog(false);
                                setNewChatBtnClick(false);
                                setNewChat({ lastMessage: "", contact: '', to: '' });
                                setNewChatSearchedPhone({ ...newChatSearchedPhone, phoneNo: "" });
                            }}>Cancel</Button>
                        </div>

                    </div>
                </div>
            </Dialog >

        </div >
    )
}
