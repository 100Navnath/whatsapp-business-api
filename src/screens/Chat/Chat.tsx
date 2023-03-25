import { AccessAlarm, CancelOutlined, Clear, Close, Done, DoneAll, ExpandMore, Image, InfoOutlined, PermPhoneMsgOutlined, PersonOutline, WhatsApp } from '@material-ui/icons'
import { useState, useEffect, useRef, useMemo, createRef } from 'react'
import { useNavigate } from 'react-router-dom';
import './chat.css'
import Dialog from '@mui/material/Dialog';
// import customer from '../../assets/jsons/customer.json';
// import contact from '../../assets/jsons/contacts/contactInfo.json';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material';
// import chatsJson from '../../assets/jsons/chats/chats.json'
import { API } from '../../constant/network';
import { apiList } from '../../constant/apiList';
import Spinner from '../../components/Loading/spinner';
import { getFromLocalStorage } from '../../components/LocalStorage/localStorage';
import { ValidateDOB, ValidateEmail, ValidateEmptyField, ValidateName, ValidateNumber } from '../../components/validators';
import Skeleton from '@mui/material/Skeleton';
import InfiniteScroll from "react-infinite-scroll-component";
import InfiniteScroller from 'react-infinite-scroller';
import IconButton from '@mui/material/IconButton';
import moment from 'moment';
import Transition from '../../components/Transition';
import Toast from '../../components/Toast/Toast';
import ChatForm from './ChatForm';
import { Button, Checkbox } from '@material-ui/core';
import DialogBox from '../../components/Dialog/Dialog';
import Asterisk from '../../components/Asterisk';
import PhoneInput from 'react-phone-input-2';
import Multiselect from 'multiselect-react-dropdown';
import MultiSelectDropdown from '../../components/MultiSelectDropdown/MultiSelectDropdown';
import Dropdown from '../../components/Dropdown';
import { gender } from '../../assets/dropdownData/gender';
import Template from '../../components/Template/Template';
import { dummyTemplates } from '../../assets/jsons/dummyTemplates';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import Scrollbars from 'react-custom-scrollbars'
import TemplateMessage from '../../components/Template/Message';
import { PersonOffOutlined } from '@mui/icons-material';
import InfiniteScroll2 from 'react-infinite-scroller';
import TemplateButtons from '../../components/Template/TemplateButtons';
import { ReactComponent as ChatBotIcon } from '../../assets/img/chat-bot-icon.svg'

interface chatInterface {
    clickedChatId?: any
    switchSubTab: (tab: any) => void
    setChatListAction?: (action: any) => void
}

const ITEM_HEIGHT = 48;

export default function Chat({ clickedChatId, switchSubTab, setChatListAction }: chatInterface) {
    const { innerHeight: height } = window;
    const [chats, setChats] = useState<Array<any>>([]);
    const [customerInfo, setCustomerInfo] = useState(clickedChatId)
    const [image, setImage] = useState<any>(undefined);
    const [infoDialog, setInfoDialog] = useState(false);
    const [loading, setLoading] = useState(false)
    const [dialogLoading, setDialogLoading] = useState(false)
    const navigate = useNavigate();
    const [agentInfo, setAgentInfo] = useState<any>({ linkedNumbers: [] });
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0)
    const [contactsCount, setContactsCount] = useState(0)
    const [message, setMessage] = useState<any>({ text: "" })
    const [newContactInfo, setNewContactInfo] = useState(Object);
    const [addContactDialog, setAddContactDialog] = useState(false);
    const [isBtnClick, setIsBtnClick] = useState(false);
    const imageRef: any = useRef(null);
    const [selectedNumbers, setSelectedNumbers] = useState<any>([])
    const [selectTemplateDialog, setSelectTemplateDialog] = useState(false)
    const [templates, setTemplates] = useState<Array<any>>([]);
    const [templateListLoading, setTemplateListLoading] = useState(false)
    const [actionOnMsg, setActionOnMsg] = useState<{ name: string, msgIndex: number, chatId: number }>({ name: '', msgIndex: -1, chatId: -1 });
    const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(-1);
    const [header, setHeader] = useState<any>(undefined)
    // const [body, setBody] = useState<any>(undefined)
    const [bodyVariables, setBodyVariables] = useState<string[]>([])
    const [btnVariables, setBtnVariables] = useState<any[]>([])
    const [variables, setVariables] = useState([
        {
            "type": "HEADER",
            "parameters": [
                {
                    "type": "text",
                    "text": "Saurabh singh"
                }
            ]
        },
        {
            "type": "BODY",
            "parameters": [
                {
                    "type": "text",
                    "text": "after three months"
                },
                {
                    "type": "text",
                    "text": "12 PM"
                }
            ]
        },
        {
            "type": "BUTTON",
            "parameters": [
                {
                    "type": "text",
                    "text": ""
                }
            ]
        },
    ])
    const [chatHoverIndex, setChatHoverIndex] = useState(-1)
    const [contacts, setContacts] = useState<Array<any>>([]);
    const [contactListLoading, setContactListLoading] = useState(false)
    // const [selectedContacts, setSelectedContacts] = useState<Array<any>>([])
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [contactListPage, setContactListPage] = useState(1);

    const [forwardMsgDialog, setForwardMsgDialog] = useState(false);
    const [msgInfoDialog, setMsgInfoDialog] = useState(false);

    const [templatePage, setTemplatePage] = useState(1)
    const [totalTemplates, setTotalTemplates] = useState(0);
    const [blinkAnimationIndex, setBlinkAnimationIndex] = useState(-1)
    const [enterVariableValuesDiolog, setEnterVariableValuesDiolog] = useState(false)
    const refs = chats.reduce((acc: any, value: any, index) => {
        acc[index] = createRef();
        return acc;
    }, {});

    const scrollToMessage = (index: any) => {
        let i = index;
        // if (chats[i + 1]) i = i + 1
        if (i > 1) {
            refs[i].current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            });
            setBlinkAnimationIndex(index);
            setTimeout(() => {
                setBlinkAnimationIndex(-1);
            }, 2000);
        }
    }

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    function onMessageActionClick(name: string, msgIndex: number, chatId: number) {
        setActionOnMsg({ name, msgIndex, chatId })
        if (name === "Forward") {
            setForwardMsgDialog(true);
            setContactListLoading(true)
            getContactList(0)
        }
        else if (name === "Message Info") {
            setMsgInfoDialog(true)
        }
        else if (name === "Copy") {
            navigator.clipboard.writeText(chats[msgIndex].message)
        }
        handleClose()
    }

    async function getDetailsFromLocalStorage(customer = customerInfo) {
        const agent = await getFromLocalStorage("user");
        setAgentInfo(agent);
        if (agent.linkedNumbers.length >= 1) setSelectedNumbers(agent.linkedNumbers)
        getChats(customer, 1, agent.linkedNumbers);
    }

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

    function onMessageChange(e: any) {
        if (e.target.value === '/') {
            getTemplates(1)
            setTemplateListLoading(true);
            setSelectTemplateDialog(true);
        } else
            setMessage({ ...message, text: e.target.value });
    }

    async function getChats(chatId = customerInfo, pageNo: number, selected = selectedNumbers) {
        setLoading(true)
        if (chatId) {
            const user = await getFromLocalStorage("user");
            if (!user) {
                navigate("/");
            }
            let obj: any = {};
            for (let i = 0; i < selected.length; i++) {
                obj[i] = selected[i].number
            }
            const body = {
                userId: user.currentuserId,
                businessId: user.businessId,
                customerId: chatId.id,
                contact: chatId.contact,
                skip: (pageNo - 1) * 10,
                take: 10,
                // userPhoneNo: { "0": "+18665985667", 1: "+19797979797", 2: "+19898989898" },
                // userPhoneNo: obj
            }
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.getChatHistory}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setLoading(false)
                        if (res.data.lstChatHistoryById) {
                            if (pageNo === 1) setChats([...res.data.lstChatHistoryById]);
                            else setChats([...chats, ...res.data.lstChatHistoryById]);
                        } else setChats([]);
                        setTotalCount(res.data.count);
                        setPage(pageNo + 1);

                        if (customerInfo?.unreadCount > 0) {
                            setChatListAction && setChatListAction({
                                action: "markChatAsRead", data: { id: body.customerId },
                            });
                        }
                    }
                },
                error(err) {
                    setLoading(false)
                },
            });
        }
    }

    function getContactInfo(chatId?: any, openDialog = false) {
        setInfoDialog(openDialog);
        if (chatId > 0 && !(customerInfo && customerInfo.isDeleted)) {
            setDialogLoading(true)
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.getContactInfo}/${chatId}`, {}, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setDialogLoading(false)
                        setCustomerInfo({ ...res.data, contact: `${res.data.countryCode}${res.data.phoneNo}`, name: `${res.data.firstName} ${res.data.lastName}` });
                    }
                },
                error(err) {
                    setDialogLoading(false)
                },
            });
        }
    }

    function getTemplates(p = templatePage) {
        const body = {
            skipIn: (p - 1) * 10,
            takeIn: 10,
            status: "Approved"
        }
        API.get(`${process.env.REACT_APP_BASE_API}${apiList.templateList}`, body, {})?.subscribe({
            next(res: any) {
                if (res.status === 201 || res.status === 200) {
                    setTemplateListLoading(false);
                    setTemplatePage(p + 1)
                    if (p === 1) setTemplates([...res.data.templatelist])
                    else setTemplates([...templates, ...res.data.templatelist])
                    setTotalTemplates(res.data.count)
                }
            },
            error(err: any) {
                setTemplateListLoading(false);
            }
        });
    }

    async function sendMessage({ smsFrom = '' }: { smsFrom?: string }) {
        try {
            if (!ValidateEmptyField(message.text.trim()).isError || image) {
                if (!dialogLoading) {
                    setDialogLoading(true)
                    const user = await getFromLocalStorage("user");
                    if (!user) {
                        navigate("/");
                    }
                    const body: any = {
                        "customerId": clickedChatId && clickedChatId.isDeleted === true ? 0 : clickedChatId && clickedChatId.id ? clickedChatId.id : customerInfo.id,
                        "smsText": message.text,
                        "smsStatus": "pending",
                        "smsType": "send",
                        "smsTo": clickedChatId && clickedChatId.contact ? `${clickedChatId.contact}` : `${customerInfo.countryCode}${customerInfo.phoneNo}`,
                        "recipientType": "individual",
                        "text": "text"
                    }
                    let sendMessageEndpoint = apiList.sendMessage;
                    if (actionOnMsg.msgIndex > -1) {
                        body['selectedChatId'] = chats[actionOnMsg.msgIndex].chatId
                        sendMessageEndpoint = apiList.replyToMessage
                    }
                    API.post(`${process.env.REACT_APP_BASE_API}${sendMessageEndpoint}`, body, {})?.subscribe({
                        next(res: any) {
                            if (res.status === 201 || res.status === 200) {
                                let chatObj: any = {
                                    chatId: res.data,
                                    message: message.text,
                                    incoming: false,
                                    firstName: agentInfo.firstName,
                                    createdAt: new Date().toISOString(),
                                    userName: user.firstName + user.lastName,
                                    userContact: user.countryCode + user.phoneNo,
                                    status: 'success',
                                    repliedMsgFromName: body.selectedChatId > -1 ? chats.find((obj: any) => obj.chatId === body.selectedChatId).name : '',
                                    repliedMsgFromNumber: body.selectedChatId > -1 ? chats.find((obj: any) => obj.chatId === body.selectedChatId).phoneNo : 0
                                }
                                if (actionOnMsg.msgIndex > -1) chatObj.replayChatId = actionOnMsg.chatId
                                setDialogLoading(false)
                                if (image) {
                                    chatObj.image = image
                                }
                                setChats([chatObj, ...chats]);
                                // setMessage('');
                                setImage(undefined);
                                setMessage({ text: "" })

                                const contactInfo = {
                                    "id": body.customerId,
                                    "name": customerInfo.name,
                                    "contact": customerInfo.contact.split('-').join(""),
                                    "createdAt": Date.now(),
                                    "secondaryPhoneNo": res.data.secondaryPhoneNo,
                                    lastMessage: message.text
                                }
                                setChatListAction && setChatListAction({
                                    action: "updateMsg", data: contactInfo,
                                });
                                if (body?.selectedChatId) {
                                    setActionOnMsg({ name: '', msgIndex: -1, chatId: -1 })
                                }
                            }
                        },
                        error(err) {
                            let chatObj: any = {
                                message: message.text,
                                incoming: false,
                                firstName: agentInfo.firstName,
                                createdAt: new Date().toISOString(),
                                userName: user.firstName + user.lastName,
                                userContact: user.countryCode + user.phoneNo,
                                status: 'failed'
                            }
                            setChats([chatObj, ...chats]);
                            setDialogLoading(false);
                            setMessage({ text: "" })
                        },
                    });
                }
            }
        } catch (error: any) {
            setDialogLoading(false)
            Toast({ message: error, type: 'error' })
            console.log("Catch error while sending message", error);
        }
    }

    async function sendTemplate() {
        try {
            if (selectedTemplateIndex !== -1) {
                setDialogLoading(true);
                const user = await getFromLocalStorage("user");
                if (!user) {
                    navigate("/");
                }
                const body = {
                    "whatsapptemplateId": templates[selectedTemplateIndex]?.whatsappTemplateId ? templates[selectedTemplateIndex]?.whatsappTemplateId : null,
                    "customerId": clickedChatId && clickedChatId.id ? clickedChatId.id : customerInfo.id,
                    "smsStatus": "pending",
                    "smsType": "send",
                    "smsTo": clickedChatId && clickedChatId.contact ? `${clickedChatId.contact}` : `${customerInfo.countryCode}${customerInfo.phoneNo}`,
                    "recipientType": "individual",
                    "templateName": templates[selectedTemplateIndex].templateJson.name,
                    "templateLanguage": templates[selectedTemplateIndex].templateJson.language
                }
                API.post(`${process.env.REACT_APP_BASE_API}${apiList.sendTemplate}`, body, {})?.subscribe({
                    next(res: any) {
                        if (res.status === 201 || res.status === 200) {
                            // Toast({ message: "Template sent successfully", type: 'success' })
                            let chatObj: any = {
                                chatId: res.data,
                                message: message.text,
                                incoming: false,
                                firstName: agentInfo.firstName,
                                createdAt: new Date().toISOString(),
                                userName: user.firstName + user.lastName,
                                userContact: user.countryCode + user.phoneNo,
                                templateJson: templates[selectedTemplateIndex].templateJson,
                                whatsappTemplateId: templates[selectedTemplateIndex].whatsappTemplateId,
                                status: 'success',
                            }
                            if (image) {
                                chatObj.image = image
                            }
                            setChats([chatObj, ...chats]);
                            setSelectTemplateDialog(false);
                            setSelectedTemplateIndex(-1);
                            setDialogLoading(false);
                        }
                    },
                    error(err) {
                        setSelectTemplateDialog(false);
                    },
                });
            }
            else Toast({ message: "Please select template", type: 'error' })
        } catch (error) {
            console.log(error);
            setDialogLoading(false);
        }
    }

    function validateTemplate() {
        const header = templates[selectedTemplateIndex]?.templateJson?.components.filter((e: any) => e.type === "HEADER")[0]
        const body = templates[selectedTemplateIndex]?.templateJson?.components.filter((e: any) => e.type === "BODY")[0]

        setHeader(header);
        const arrayOfVariables = body.text.match(/({{[0-9]}})+/g);
        const arr = arrayOfVariables?.filter((item: string, index: number) => arrayOfVariables?.indexOf(item) === index);
        const arrayOfBtnVariables = templates[0].templateJson?.components?.filter((e: any) => e.type == "BUTTONS")[0]?.buttons?.map((obj: any) => obj.url)[0]?.text?.match(/({{[0-9]}})+/g);

        if (arr && arr.length > 0) setBodyVariables([...arr])
        if (arrayOfBtnVariables && arrayOfBtnVariables.length > 0) setBtnVariables(arrayOfBtnVariables)
        if (header?.text?.includes('{{1}}') || arr && arr.length !== 0 || arrayOfBtnVariables && arrayOfBtnVariables?.length !== 0) setEnterVariableValuesDiolog(true)
        else sendTemplate()
    }

    useEffect(() => {
        if (!(clickedChatId && clickedChatId.id)) {
            const arrayOfUrl = window.location.href.split('/');
            const id = parseInt(arrayOfUrl[arrayOfUrl.length - 1]);
            if (id > 0) {
                getContactInfo(id);
                getDetailsFromLocalStorage({ id });
            }
            else if (parseInt(arrayOfUrl[arrayOfUrl.length - 1]) === 0 && !(clickedChatId && clickedChatId.contact)) {
                navigate("/chats");
                switchSubTab(null);
            }
        }
    }, [])


    const swListener = new BroadcastChannel('swListener');
    swListener.onmessage = (event: any) => {
        const data = event.data
        const chat = [...chats]
        const messageObj = event.data.Data
        if (data && (data.Type === "ReceivedNewMessage" || data.Type === "Send New Message Auto Response")) {
            const arrayOfUrl = window.location.href.split('/');
            const id = parseInt(arrayOfUrl[arrayOfUrl.length - 1]);
            if (messageObj.id === id) {
                setChats([messageObj, ...chat])
                setTotalCount(totalCount + 1);
                if (customerInfo?.unreadCount > 0) setCustomerInfo({ ...customerInfo, unreadCount: customerInfo?.unreadCount ? customerInfo.unreadCount + 1 : 1 })
            }
        }
        if (data && data.Type === "ReadReceiptUpdates") {
            const arrayOfUrl = window.location.href.split('/');
            const id = parseInt(arrayOfUrl[arrayOfUrl.length - 1]);
            // if (data.Data.customerId === id) {
            let chatArr = [...chats]
            const objIndex = chatArr.findIndex(((obj: any) => obj.chatId === data.Data.Id));
            if (objIndex !== -1) {
                chatArr[objIndex] = { ...chatArr[objIndex], status: data?.Data?.MessageStatus }
                setChats([...chatArr])
            }
            // }
        }
    }

    useEffect(() => {
        if (clickedChatId && JSON.stringify(clickedChatId.id)) {
            setChats([]);
            const customerObj = {
                id: clickedChatId.id,
                firstName: clickedChatId.firstName,
                lastName: clickedChatId.lastName,
                name: clickedChatId.isDeleted ? "Unknown" : clickedChatId.name,
                phoneNo: clickedChatId.phoneNo,
                contact: clickedChatId.contact,
                profilePhoto: clickedChatId.profilePhoto,
                isDeleted: clickedChatId.isDeleted,
                unreadCount: clickedChatId.unreadCount
            }
            setCustomerInfo(customerObj)
            setMessage({ text: "" })
            getDetailsFromLocalStorage(customerObj);
        }
    }, [clickedChatId])

    function onAddContactDialogClose() {
        setAddContactDialog(false);
        setIsBtnClick(false);
        setNewContactInfo({
            firstName: "",
            lastName: "",
            secondaryPhoneNo: "",
            email: "",
            isWhatsAppNo: false
        });
    }

    async function addContactValidation() {
        setIsBtnClick(true);
        if (
            !ValidateName(newContactInfo.firstName).isError &&
            !ValidateName(newContactInfo.lastName).isError &&
            (!ValidateEmptyField(customerInfo.contact).isError || customerInfo.isDeleted) &&
            (newContactInfo.secondaryPhoneNo ? !ValidateNumber(newContactInfo.secondaryPhoneNo).isError : true) &&
            (newContactInfo.dob ? !ValidateDOB(newContactInfo.dob).isError : true) &&
            (newContactInfo.email ? !ValidateEmail(newContactInfo.email).isError : true)
        ) addContact();

    }

    async function addContact() {
        try {
            const user = await getFromLocalStorage("user")
            const body = {
                customerId: customerInfo.id,
                "userId": user.currentuserId,
                "businessId": user.businessId,
                ...newContactInfo,
                countryCode: customerInfo?.countryCode,
                phoneNo: customerInfo.contact,
                secondaryPhoneNo: customerInfo.secondaryPhoneNo ? customerInfo.secondaryPhoneNo : "",
                gender: newContactInfo.gender ? newContactInfo.gender : "",
                dob: newContactInfo.dob ? newContactInfo.dob : ""
            }
            setDialogLoading(true)
            API.post(`${process.env.REACT_APP_BASE_API}${apiList.addSingleContact}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setDialogLoading(false);
                        setIsBtnClick(false);
                        setNewContactInfo(Object)
                        onAddContactDialogClose();
                        const contactInfo = {
                            "id": res.data.id,
                            "name": newContactInfo.firstName + " " + newContactInfo.lastName,
                            "contact": customerInfo.contact.split('-').join(""),
                            "createdAt": Date.now(),
                            "secondaryPhoneNo": res.data.secondaryPhoneNo,
                            lastMessage: chats.length >= 0 ? chats[chats.length - 1].message : ""
                        }
                        setCustomerInfo(contactInfo)
                        navigate('/chats/' + res.data.id)
                        setChatListAction && setChatListAction({
                            action: "updateChat", data: contactInfo,
                        });
                        Toast({ message: "Contact added successfully", type: "success" })
                    }
                },
                error(err) {
                    setDialogLoading(false);
                },
            });
        } catch (error: any) {
            setDialogLoading(false);
            setIsBtnClick(false);
            Toast({ message: error, type: 'error' })
        }
    }

    function onClickContact(index: number) {
        const checked = !(contacts[index].isChecked ? contacts[index].isChecked : false)
        let arr = contacts;
        arr[index] = { ...arr[index], isChecked: checked }
        setContacts([...arr])
    }

    async function getContactList(skip: any) {
        // setContactListLoading(true);
        const user = await getFromLocalStorage("user");
        const body = {
            userId: user.currentuserId,
            businessId: user.businessId,
            take: 10,
            skip
        }
        API.get(`${process.env.REACT_APP_BASE_API}${apiList.getContactList}`, body, {})?.subscribe({
            next(res: any) {
                if (res.status === 200) {
                    setContacts([...contacts, ...res.data.lstCustomer]);
                    setContactsCount(res.data.count)
                    setContactListLoading(false);
                    setContactListPage(contactListPage + 1)
                }
            },
            error(err) {
                setDialogLoading(false);
            },
        });
    }

    const msgActions = ["Reply", "Forward", "Message Info", "Copy"];

    return (
        <div className="chat-content-wrapper" >
            {/* <!-- Active User Chatting Start --> */}
            <div className="active-user-chatting">
                {
                    customerInfo && customerInfo.contact ?
                        <div className="active-user-info">
                            <div className="toggle-sidebar" id="toggle-sidebar">
                                <span className="toggle-icon"></span>
                            </div>
                            {
                                customerInfo.profilePhoto ?
                                    <img className="contact-avatar" src={customerInfo.profilePhoto} alt="Avatar" /> :
                                    <div className="bg-chat-avatar green">
                                        {customerInfo.name && customerInfo.id !== 0 ?
                                            customerInfo.name.split(" ").map((n: any) => n[0]).join("").substring(0, 2).toUpperCase() :
                                            "?"
                                        }
                                    </div>
                            }
                            <div className="avatar-info">
                                <h5>{customerInfo?.name && customerInfo.id !== 0 ? customerInfo?.name : (customerInfo?.contact?.charAt(0) !== "+" && "+") + customerInfo?.contact}</h5>
                                {
                                    customerInfo?.name && customerInfo.id !== 0 && <div className='contact-number'>
                                        {
                                            customerInfo.id === 0 ? customerInfo.contact.split("-").join("") : customerInfo.contact
                                        }
                                    </div>
                                }
                            </div>
                        </div> :
                        <span style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Skeleton variant="circular" style={{ width: 50, height: 50 }} />
                            <span style={{ marginLeft: 5 }}>
                                <Skeleton variant="text" style={{ width: 150 }} sx={{ fontSize: 12 }} />
                                <Skeleton variant="text" style={{ width: 150 }} sx={{ fontSize: 10 }} />
                            </span>
                        </span>
                }
                <div className="chat-actions">
                    {/* {
                        agentInfo && agentInfo.linkedNumbers && agentInfo.linkedNumbers.length > 1 &&
                        <MultiSelectDropdown
                            options={agentInfo.linkedNumbers} // Options to display in the dropdown
                            onChange={(e: any) => {
                                if (e.length > 0) {
                                    setSelectedNumbers([...e]);
                                    getChats(customerInfo, 1, e)
                                } else if (e.length === 0) Toast({ message: 'Atleast one contact need to be selected', type: 'warning' })
                            }}
                            defaultValue={selectedNumbers}
                            displayValue='number'
                        />
                    } */}
                    {
                        (clickedChatId && clickedChatId.id !== 0 || customerInfo && customerInfo.id > 0) && !(customerInfo && customerInfo.isDeleted) ?
                            <GridTooltip title="Contact Information" placement="bottom">
                                <IconButton
                                    style={{ outlineWidth: 0 }}
                                    onClick={() => {
                                        const id = clickedChatId && clickedChatId.id ? clickedChatId.id : customerInfo.id
                                        getContactInfo(id, true)
                                    }}
                                >
                                    {/* <a> */}
                                    <InfoOutlined style={{ color: '#075E54' }} fontSize='small' />
                                    {/* </a> */}
                                </IconButton>
                            </GridTooltip> :
                            <GridTooltip title="Add to contacts" placement="bottom">
                                <Button
                                    style={{ outlineWidth: 0, padding: 5, paddingLeft: 8, paddingRight: 8, color: "#FFF", backgroundColor: '#075E54' }}
                                    onClick={() => setAddContactDialog(true)}
                                >
                                    <span style={{ fontSize: 10, fontWeight: '600' }}>Add to contacts</span>
                                </Button>
                            </GridTooltip>
                    }
                </div>
            </div>
            {/* <!-- Active User Chatting End --> */}

            {/* <!-- Chat Container Start --> */}
            <div className="chat-container" style={{ height: height - (120 + (actionOnMsg.name === "Reply" && actionOnMsg.msgIndex > 0 ? 80 : 0)) }}>
                <ul className="chat-box">
                    <div
                        className='chats-container-div'
                        id="scrollableDiv"
                        style={{
                            height: height - (120 + (actionOnMsg.name === "Reply" && actionOnMsg.msgIndex > 0 ? 80 : 0)),
                            overflowY: "auto",
                            overflowX: "clip",
                            display: "flex",
                            flexDirection: "column-reverse",
                        }}
                    >
                        {/*Put the scroll bar always on the bottom*/}
                        <InfiniteScroll
                            dataLength={chats.length}
                            next={() => getChats(customerInfo, page)}
                            className='chats-infinite-scroll'
                            style={{}} //To put endMessage and loader to the top.
                            inverse={true}
                            hasMore={totalCount && totalCount > chats.length ? true : false}
                            loader={<div style={{ display: 'flex', width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}
                            ><Spinner color="#075E54" /></div>}
                            scrollableTarget="scrollableDiv"
                        >
                            {
                                chats.map((chat: any, index: number) =>
                                    <>
                                        {
                                            customerInfo?.unreadCount > 0 && (chats.length - (chats.length - customerInfo.unreadCount)) === index &&
                                            <div className='unread-msg-divider'>
                                                <div className='line' />
                                                <span className='unread-msg'>{customerInfo.unreadCount} Unread {customerInfo.unreadCount > 1 ? "Messages" : "Message"}</span>
                                                <div className='line' />
                                            </div>}
                                        {
                                            chat.incoming ?
                                                <li key={index} ref={refs[index]} className={blinkAnimationIndex === index ? 'chat-left bg-fade' : 'chat-left'}>
                                                    <div className="chat-text-wrapper">
                                                        <div className='chat-text' style={{ minWidth: 150, fontFamily: 'Poppins', fontSize: 12, marginLeft: 20 }}
                                                            onMouseEnter={() => setChatHoverIndex(index)}
                                                            onMouseLeave={() => {
                                                                setChatHoverIndex(-1);
                                                                setAnchorEl(null)
                                                            }}
                                                        >
                                                            {
                                                                chatHoverIndex === index &&
                                                                <span>
                                                                    <IconButton
                                                                        aria-label="more"
                                                                        id="long-button"
                                                                        aria-controls={open ? 'long-menu' : undefined}
                                                                        aria-expanded={open ? 'true' : undefined}
                                                                        aria-haspopup="true"
                                                                        onClick={handleClick}
                                                                        className='expand-more-icon left'
                                                                    >
                                                                        <ExpandMore style={{ color: '#777' }} />
                                                                    </IconButton>
                                                                    <Menu
                                                                        id="long-menu"
                                                                        MenuListProps={{
                                                                            'aria-labelledby': 'long-button',
                                                                        }}
                                                                        anchorEl={anchorEl}
                                                                        open={open}
                                                                        onClose={handleClose}
                                                                        PaperProps={{
                                                                            style: {
                                                                                maxHeight: ITEM_HEIGHT * 4.5,
                                                                                width: '20ch',
                                                                            },
                                                                        }}
                                                                    >
                                                                        {msgActions.filter((i: any) => i !== "Message Info").map((option: any) => (
                                                                            <MenuItem key={option} selected={option === 'Pyxis'} onClick={() => onMessageActionClick(option, index, chat.chatId)}>
                                                                                <span className='menu-item'> {option}</span>
                                                                            </MenuItem>
                                                                        ))}
                                                                    </Menu>
                                                                </span>
                                                            }
                                                            {
                                                                (chat?.replayChatId !== 0 && parseInt(chat.replayChatId) > 0) &&
                                                                <span style={{ display: 'block', backgroundColor: '#ddddddaa', borderLeftWidth: 3, borderLeftStyle: 'solid', textAlign: 'left', borderRadius: 4, borderLeftColor: '#06cf9c', width: '100%', height: 'fit-content', padding: '5px 10px 5px 10px' }}
                                                                    onClick={() => scrollToMessage(chats.findIndex((obj: any) => obj.chatId == chat.replayChatId))}
                                                                >
                                                                    <span style={{ fontSize: 11, fontWeight: 'bold', color: '#06cf9c' }}>{chat.repliedMsgFromNumber === customerInfo?.phoneNo ? "You" : chat.repliedMsgFromName}</span><br />
                                                                    <p style={{ color: '#667781', fontSize: 11, lineHeight: '17px', maxHeight: '34px', display: 'flex', flexWrap: 'wrap', overflowWrap: 'anywhere', overflowY: 'clip', marginBottom: 0 }}>
                                                                        {chats.find((obj: any) => obj.chatId == chat.replayChatId)?.message ?
                                                                            chats.find((obj: any) => obj.chatId == chat.replayChatId).message :
                                                                            chat.repliedMsgBody
                                                                        }
                                                                    </p>
                                                                </span>
                                                            }
                                                            {
                                                                chat.image &&
                                                                <img style={{ height: 100, width: 100 }} src={chat.image} alt="" />
                                                            }
                                                            <div>{chat.message}</div>
                                                            <div className='chat-hour read' style={{ textAlign: 'right', fontSize: 10 }} >
                                                                {chat.createdAt && moment.utc(chat.createdAt).local().format('MM/DD/YYYY, hh:mm A')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                                :
                                                <li className={blinkAnimationIndex === index ? 'chat-right bg-fade' : 'chat-right'} key={index} ref={refs[index]}>
                                                    <div className="chat-text-wrapper">
                                                        <div className='chat-text' style={{ minWidth: 150, width: '100%', fontFamily: 'Poppins', fontSize: 12, marginRight: 20 }}
                                                            onMouseEnter={() => setChatHoverIndex(index)}
                                                            onMouseLeave={() => {
                                                                setChatHoverIndex(-1);
                                                                setAnchorEl(null)
                                                            }}
                                                        >
                                                            {
                                                                chatHoverIndex === index &&
                                                                <span>
                                                                    <IconButton
                                                                        aria-label="more"
                                                                        id="long-button"
                                                                        aria-controls={open ? 'long-menu' : undefined}
                                                                        aria-expanded={open ? 'true' : undefined}
                                                                        aria-haspopup="true"
                                                                        onClick={handleClick}
                                                                        className='expand-more-icon right'
                                                                    >
                                                                        <ExpandMore style={{ color: '#777' }} />
                                                                    </IconButton>
                                                                    <Menu
                                                                        id="long-menu"
                                                                        MenuListProps={{
                                                                            'aria-labelledby': 'long-button',
                                                                        }}
                                                                        anchorEl={anchorEl}
                                                                        open={open}
                                                                        onClose={handleClose}
                                                                        PaperProps={{
                                                                            style: {
                                                                                maxHeight: ITEM_HEIGHT * 4.5,
                                                                                width: '20ch',
                                                                            },
                                                                        }}
                                                                    >
                                                                        {msgActions.map((option: any) => (
                                                                            <MenuItem key={option} selected={option === 'Pyxis'} onClick={() => onMessageActionClick(option, index, chat.chatId)}>
                                                                                <span className='menu-item'> {option}</span>
                                                                            </MenuItem>
                                                                        ))}
                                                                    </Menu>
                                                                </span>
                                                            }
                                                            {
                                                                chat?.replayChatId && parseInt(chat.replayChatId) > -1 &&
                                                                <span className='reply-tag-container' onClick={() => scrollToMessage(chats.findIndex((obj: any) => obj.chatId == chat.replayChatId))}>
                                                                    <span className='name'>{chat.repliedMsgFromNumber === agentInfo.phoneNo ? "You" : chat.repliedMsgFromName ? chat.repliedMsgFromName : chats.find((obj: any) => obj.chatId == chat.replayChatId)?.name}</span><br />
                                                                    <p className='msg-body'>{chat.repliedMsgBody ? chat.repliedMsgBody : chats.find((obj: any) => obj.chatId == chat.replayChatId)?.message}</p>
                                                                </span>
                                                            }
                                                            <>
                                                                {
                                                                    chat.image &&
                                                                    <img style={{ height: 100, width: 100, marginBottom: 5 }} src={chat.image} alt="" />
                                                                }
                                                                {chat.templateJson && chat.templateJson.name ?
                                                                    <TemplateMessage
                                                                        styles={{ backgroundColor: '#d9fdd3', boxShadow: '0 0px 0.5px #d9fdd3', padding: 0, marginRight: 0 }}
                                                                        template={chat.templateJson}
                                                                    />
                                                                    :
                                                                    <div>{chat.message}</div>}
                                                                <div className='chat-hour read' style={{ textAlign: 'right', fontSize: 10 }} >
                                                                    {
                                                                        chat.segmentName &&
                                                                        <span style={{ fontSize: 10, marginLeft: 4 }}>Sent through segment <b>{chat.segmentName}</b></span>
                                                                    }
                                                                    <div>
                                                                        {
                                                                            chat.repliedMsgFromName === "Robot Chat" &&
                                                                            <ChatBotIcon height={13} width={13} style={{ marginRight: 5 }} fill='#6a717d' />
                                                                        }
                                                                        {chat.createdAt && moment.utc(chat.createdAt).local().format('MM/DD/YYYY, hh:mm A')}
                                                                        {/* {chat.createdAt && moment(chat.createdAt).format('DD/MM/YYYY, hh:mm a')} */}
                                                                        <span style={{ fontSize: 12, marginLeft: 4 }}>
                                                                            {
                                                                                chat.status === "success" ?
                                                                                    <AccessAlarm className='read-reciept-icon' /> :
                                                                                    chat.status === "sent" ?
                                                                                        <Done className='read-reciept-icon' /> :
                                                                                        chat.status === "delivered" ?
                                                                                            <DoneAll className='read-reciept-icon' /> :
                                                                                            chat.status === "read" ?
                                                                                                <DoneAll className='read-reciept-icon read' /> :
                                                                                                chat.status === "failed" &&
                                                                                                <Close className='read-reciept-icon failed' />
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        </div>
                                                    </div>
                                                </li>
                                        }
                                    </>
                                )
                            }
                        </InfiniteScroll>
                    </div>
                </ul>
            </div >
            {
                actionOnMsg.name === "Reply" && actionOnMsg.msgIndex > -1 &&
                <div style={{ backgroundColor: '#f5f8fd', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ display: 'block', backgroundColor: '#ddddddaa', borderLeftWidth: 3, borderLeftStyle: 'solid', borderRadius: 4, borderLeftColor: '#06cf9c', width: '80%', height: 'fit-content', padding: '5px 10px 5px 10px' }}>
                        <span style={{ fontSize: 11, fontWeight: 'bold', color: '#06cf9c' }}>{chats[actionOnMsg.msgIndex]?.userContact === `${agentInfo.countryCode} ${agentInfo.phoneNo}` ? "You" : chats[actionOnMsg.msgIndex]?.userName}</span><br />
                        <p style={{ color: '#667781', fontSize: 11, lineHeight: '17px', maxHeight: '34px', display: 'flex', overflowY: 'hidden', marginBottom: 0 }}>{chats[actionOnMsg.msgIndex]?.message}</p>
                    </span>
                    <Button style={{ margin: 10, padding: 5 }} onClick={() => setActionOnMsg({ name: '', msgIndex: -1, chatId: -1 })}><Clear style={{ color: '#8696a0' }} /></Button>
                </div>
            }
            {/* <!-- Chat Container End --> */}
            <ChatForm
                loading={dialogLoading}
                sendMessage={sendMessage}
                onChange={onMessageChange}
                value={message.text}
                disabled={(message && ValidateEmptyField(message.text).isError)}
                inputProps={{
                    // disabled: customerInfo && typeof customerInfo.optout === "boolean" ? customerInfo.optout : false
                }}
                placeholder='Type your message here or enter "/" to select template...'
            />

            {/* <!-- Chat form start --> */}
            <Dialog
                open={infoDialog}
                TransitionComponent={Transition}
                keepMounted
                // onClose={() => setInfoDialog(false)}
                aria-describedby="alert-dialog-slide-description"
                transitionDuration={400}
            >
                <div className='dialog-wrapper' style={{ width: 400, minHeight: 250 }}>
                    <div className='dialog-title' style={{ display: 'flex', width: '100%', marginBottom: 0, justifyContent: 'space-between', alignItems: 'center' }}>
                        {!dialogLoading && customerInfo && customerInfo.firstName ? <div>Contact Info</div> : <Spinner color='#075E54' />}
                        <Close onClick={() => setInfoDialog(false)} className='close-dialog' />
                    </div>
                    <div style={{ padding: 20, display: 'flex', textAlign: 'left', alignItems: 'center', justifyContent: 'center', minHeight: 250 }}>
                        {
                            !dialogLoading ?
                                <div className='info-container' style={{ width: '100%', justifyContent: 'space-between', margin: 0, marginRight: 0 }}>
                                    <div className='column'>
                                        <div className='title'>Name<br />
                                            <span className='info'>
                                                {
                                                    customerInfo && customerInfo.firstName &&
                                                    `${customerInfo.firstName} ${customerInfo.lastName}`
                                                }
                                            </span>
                                        </div>
                                        <div className='title'>Contact<br />
                                            <span className='info'>
                                                {
                                                    customerInfo && customerInfo.phoneNo ?
                                                        <span>
                                                            {
                                                                customerInfo.isWhatsAppNo &&
                                                                <WhatsApp style={{ fontSize: 15, marginRight: 2, color: '#075E54' }} />
                                                            }
                                                            {customerInfo.contact}
                                                        </span>
                                                        : "NA"
                                                }
                                            </span>
                                        </div>
                                        <div className='title'>Email<br />
                                            <span className='info'>{customerInfo && customerInfo.email ? customerInfo.email : "NA"}</span>
                                        </div>
                                    </div>
                                    <div className='column'>
                                        <div className='title'>Secondary Contact<br />
                                            <span className='info'>{customerInfo && customerInfo.secondaryPhoneNo ? `${customerInfo.countryCode}${customerInfo.secondaryPhoneNo}` : "NA"}</span>
                                        </div>
                                        <div className='title'>Gender<br />
                                            <span className='info'>{customerInfo && customerInfo.gender ? `${customerInfo.gender}` : "NA"}</span>
                                        </div>
                                        <div className='title'>D.O.B.<br />
                                            <span className='info'>{customerInfo && customerInfo.dob ? moment(customerInfo.dob).format('MM/DD/YYYY') : "NA"}</span>
                                        </div>
                                    </div>
                                </div>
                                :
                                <Spinner color='#075E54' />
                        }
                    </div>
                </div>
            </Dialog >

            <DialogBox
                title={"Add to contacts"}
                open={addContactDialog}
                onClose={onAddContactDialogClose}
                loading={dialogLoading}
                onClick={addContactValidation}
                DialogBody={() =>
                    <div style={{ padding: 10 }}>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <div className="field-wrapper">
                                <div className="field-placeholder">First Name<Asterisk /></div>
                                <input type="text" maxLength={15} autoFocus={true} value={newContactInfo.firstName} disabled={dialogLoading}
                                    onChange={(e) => setNewContactInfo({ ...newContactInfo, firstName: e.target.value })} />
                                <div className='error'>{isBtnClick && ValidateName(newContactInfo.firstName, "First name").err}</div>
                            </div>
                            <div className="field-wrapper">
                                <div className="field-placeholder">Last Name<Asterisk /></div>
                                <input type="text" maxLength={15} value={newContactInfo.lastName} disabled={dialogLoading}
                                    onChange={(e) => setNewContactInfo({ ...newContactInfo, lastName: e.target.value })} />
                                <div className='error'>{isBtnClick && ValidateName(newContactInfo.lastName, "Last name").err}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <div className='phone-number-input-field' style={{ marginLeft: 10, alignItems: 'flex-start', display: 'flex', flexDirection: 'column', marginTop: 10 }}>
                                <div className="field-wrapper" style={{ margin: 0 }}>
                                    <div className="field-placeholder">Phone number<Asterisk /></div>
                                    <PhoneInput
                                        containerStyle={{ width: 'fit-content', boxShadow: '0px 0px 0px 0px', fontFamily: 'Poppins', fontSize: 14 }}
                                        country={'in'}
                                        searchPlaceholder="Search"
                                        searchStyle={{ fontFamily: 'Poppins', fontSize: 12, padding: 5 }}
                                        inputStyle={{ width: 200, fontFamily: 'Poppins', fontSize: 12, boxShadow: '0px 0px 0px 0px', borderRadius: 5 }}
                                        value={customerInfo ? customerInfo?.contact : ""}
                                        countryCodeEditable={false}
                                        enableSearch={true}
                                        disabled={true}
                                    />
                                </div>
                                <div className='error'>{isBtnClick && ValidateEmptyField(customerInfo.contact, "Phone number").err}</div>
                                <div className="checkbox-wrapper">
                                    <input className='input-checkbox' checked={newContactInfo.isWhatsAppNo} disabled={dialogLoading} type="checkbox" onChange={(e) => setNewContactInfo({ ...newContactInfo, isWhatsAppNo: e.target.checked })} />
                                    <div className="field-placeholder">Is WhatsApp Number?</div>
                                </div>
                            </div>
                            <div className="field-wrapper">
                                <div className="field-placeholder">Email</div>
                                <input type="text" autoFocus={true} value={newContactInfo.email} disabled={dialogLoading}
                                    onChange={(e) => setNewContactInfo({ ...newContactInfo, email: e.target.value })} />
                                <div className='error'>{newContactInfo.email && isBtnClick && ValidateEmail(newContactInfo.email, "Email").err}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div className="field-wrapper mobile-input">
                                <input type="text" value={newContactInfo.secondaryPhoneNo} disabled={dialogLoading} maxLength={15}
                                    onChange={(e) => setNewContactInfo({ ...newContactInfo, secondaryPhoneNo: e.target.value })} />
                                <div className="field-placeholder">Secondary Number</div>
                                <div className='error'>{newContactInfo.secondaryPhoneNo && isBtnClick && ValidateNumber(newContactInfo.secondaryPhoneNo).err}</div>
                            </div>
                            <Dropdown
                                options={gender}
                                title="Gender"
                                styles={{ marginTop: 10 }}
                                defaultValue={newContactInfo.gender}
                                scrollbarHeight={150}
                                onChange={function (e: any) {
                                    setNewContactInfo({ ...newContactInfo, gender: e });
                                }}
                                disabled={dialogLoading}
                            />
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div className="field-wrapper mobile-input" style={{ marginBottom: 0 }}>
                                <input type="date" value={newContactInfo.dob} disabled={dialogLoading} maxLength={15}
                                    onChange={(e) => setNewContactInfo({ ...newContactInfo, dob: e.target.value })} />
                                <div className="field-placeholder">D.O.B.</div>
                                <div className='error'>{newContactInfo.dob && isBtnClick && ValidateDOB(newContactInfo.dob, 'D.O.B.').err}</div>
                            </div>
                        </div>
                    </div>
                }
                positiveBtnLabel={"Add"}
            />
            <DialogBox
                title={"Select Template"}
                open={selectTemplateDialog}
                onClose={() => setSelectTemplateDialog(false)}
                loading={dialogLoading}
                onClick={validateTemplate}
                DialogBody={() =>
                    <div style={{ width: 'fit-content' }}>
                        {
                            !templateListLoading ?
                                <Scrollbars style={{ height: height / 100 * 65, width: 650 }}>
                                    <InfiniteScroll2
                                        pageStart={1}
                                        loadMore={() => getTemplates(templatePage)}
                                        hasMore={totalTemplates && totalTemplates > templates.length ? true : false}
                                        loader={<div style={{ display: 'flex', width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}
                                        ><Spinner color="#075E54" /></div>}
                                        useWindow={false}
                                    >
                                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start' }} className='templates-container'>
                                            {
                                                templates.length > 0 ?
                                                    templates.map((template: any, templateIndex: number) =>
                                                        <Template
                                                            key={templateIndex}
                                                            isChecked={templateIndex === selectedTemplateIndex}
                                                            statusVisible={true} template={template}
                                                            onChangeCheck={(val: boolean) => setSelectedTemplateIndex(templateIndex)}
                                                            isSelectable={true}
                                                        />
                                                    ) :
                                                    <div style={{ fontSize: 14, color: '#90a4ac', width: '100%', height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                                        {
                                                            templateListLoading ?
                                                                <Spinner color='#075E54' /> :
                                                                <>
                                                                    <img height={150} src='https://www.freeiconspng.com/thumbs/document-icon/document-icon-26.png' />
                                                                    <span style={{ marginTop: 10 }}>Dont have any templates</span>
                                                                    <Button
                                                                        className='create-template-btn'
                                                                        style={{ marginTop: 10, padding: '3px 20px' }}
                                                                        onClick={() => {
                                                                            // switchSubTab('createTemplate');
                                                                            navigate('/settings/templates/create-template')
                                                                        }}>
                                                                        Create Template
                                                                    </Button>
                                                                </>
                                                        }
                                                    </div>
                                            }
                                        </div>
                                    </InfiniteScroll2>
                                </Scrollbars>
                                :
                                <Spinner style={{ margin: 50 }} color='#075e45' />
                        }
                    </div>
                }
                positiveBtnLabel={"Send"}
                btnContainerStyles={{ margin: '0px 0px 5px 0px' }}
            />
            <DialogBox
                title={"Forward To..."}
                open={forwardMsgDialog}
                onClose={() => setForwardMsgDialog(false)}
                loading={false}
                onClick={() => { }}
                btnContainerStyles={{ margin: '0px 0px 5px 0px' }}
                DialogBody={() =>
                    <Scrollbars style={{ height: height / 100 * 60, width: 350 }}>

                        {
                            contactListLoading ?
                                <span><Spinner color='#074e34' /></span> :
                                <InfiniteScroller
                                    pageStart={0}
                                    loadMore={() => getContactList((contactListPage - 1) * 10)}
                                    hasMore={contactsCount && contactsCount > contacts.length ? true : false}
                                    loader={<div style={{ display: 'flex', width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}
                                    ><Spinner color="#075E54" /></div>}
                                    useWindow={false}
                                >
                                    {contacts.map((i: any, index: number) =>
                                        <div className="active-user-chatting" style={{ flexDirection: 'column', textAlign: 'start', alignItems: 'start', cursor: 'pointer' }}
                                            onClick={() => onClickContact(index)}
                                        >
                                            <div className="active-user-info" style={{ margin: "5px 0px 5px 0px", width: 300 }}>
                                                <Checkbox checked={i.isChecked ? i.isChecked : false} style={{ color: '#074e34' }} />
                                                <div className="toggle-sidebar" id="toggle-sidebar">
                                                    <span className="toggle-icon"></span>
                                                </div>
                                                {
                                                    i.profilePhoto ?
                                                        <img className="contact-avatar" src={i.profilePhoto} alt="Avatar" /> :
                                                        <div className="bg-chat-avatar green">
                                                            {
                                                                i.name.split(" ").map((n: any) => n[0]).join("").substring(0, 2).toUpperCase()
                                                            }
                                                        </div>
                                                }
                                                <div className="avatar-info">
                                                    <h5>{i.name}</h5>
                                                    <div className='contact-number'>{i.countryCode}{i.phoneNo}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </InfiniteScroller>
                        }
                    </Scrollbars>
                }
                positiveBtnLabel={"Send"}
            />
            <DialogBox
                title={"Message Info"}
                open={msgInfoDialog}
                onClose={() => setMsgInfoDialog(false)}
                loading={false}
                btnContainerStyles={{ margin: '0px 0px 5px 0px' }}
                hideActionBtns={true}
                DialogBody={() =>
                    <div style={{ padding: 10, width: 400 }}>
                        {
                            chats && chats[actionOnMsg.msgIndex] &&
                            <div className='info-container' style={{ margin: 0, marginRight: 0, flexDirection: 'column' }}>
                                <div className='column' style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                                    <div className='title' style={{ width: '40%', marginRight: '10%' }}>Message sent by<br />
                                        <span className='info'>
                                            {
                                                chats[actionOnMsg.msgIndex].userName === "Robot Chat" ?
                                                    "Auto Responder" : <>{chats[actionOnMsg.msgIndex].userName}<br />({chats[actionOnMsg.msgIndex].userContact})</>
                                            }
                                        </span>
                                    </div>
                                    <div className='title' style={{ width: '40%' }}>Message sent from<br />
                                        <span className='info'>
                                            {chats[actionOnMsg.msgIndex].smsFrom}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                }
                positiveBtnLabel={"Send"}
            />
            <DialogBox
                title={"Add sample content"}
                open={enterVariableValuesDiolog}
                loading={false}
                onClose={() => setEnterVariableValuesDiolog(false)}
                onClick={() => sendTemplate()}
                DialogBody={() =>
                    <div>
                        <div className="field-wrapper" style={{ width: 350, marginBottom: 0 }}>
                            <p style={{ fontSize: 12, textAlign: 'left', lineHeight: 1.5 }}>To help us understand what kind of message that you want to send, you have the option to provide specific content examples for your template. You can add a sample template for one or all languages that you are submitting.Make sure that you don't include any actual user or customer information, and only provide sample content in your examples.</p>

                            {
                                header && header?.format === 'TEXT' && header?.text?.includes('{{1}}') ?
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'start' }}>Header</div>
                                        <div className="field-wrapper" style={{ marginLeft: 0, marginBottom: 10 }}>
                                            <input type="text" onChange={(e) => {
                                                // setHeader({ ...header, example: { ...header.example, header_text: [e.target.value] } })
                                                setVariables([{ ...variables[0], parameters: [{ type: 'text', text: e.target.value }] }, variables[1]])
                                            }}
                                                defaultValue={header?.example?.header_text[0]}
                                                placeholder={`Enter value for {{1}}`}
                                            />
                                            <div className='error'>{isBtnClick && ValidateEmptyField(header.example.header_text[0], "Business Name").err}</div>
                                        </div>
                                    </div> :
                                    (header?.format === 'IMAGE' || header?.format === 'VIDEO' || header?.format === 'DOCUMENT') &&
                                    // <FileUploader
                                    //     classes="upload_area"
                                    //     handleChange={handleChange}
                                    //     types={header?.format === 'IMAGE' ? ['jpg', 'png'] : fileTypes}
                                    //     multiple={false}
                                    // // onDrop={() => { }}
                                    // />
                                    <div>
                                        <Button component="label" color="primary" style={{ padding: 3, color: '#075E54', backgroundColor: '#FFF', outlineWidth: 0, border: '1px solid #075E54', textTransform: 'none' }}>
                                            {
                                                <input hidden accept={header?.format === 'IMAGE' ? "image/*" : header?.format === 'VIDEO' ? "video/mp4" : header?.format === 'DOCUMENT' ? "application/pdf" : "/*"} type="file" onChange={() => { }} />
                                            }
                                            <Image style={{ fontSize: 18, marginRight: 5 }} /> Choose jpg or png file
                                        </Button>
                                    </div>
                            }
                            {
                                bodyVariables.length > 0 &&
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'start' }}>Body</div>
                                    {
                                        bodyVariables.map((key: any, index: number) =>
                                            <div key={index} className="field-wrapper" style={{ marginLeft: 0, marginBottom: 10 }}>
                                                <input type="text" onChange={(e) => {
                                                    // setBody({ ...body, example: { ...body.example, body_text: [[]] } })
                                                    let parameters = variables[1].parameters
                                                    parameters[index].text = e.target.value;
                                                    setVariables([variables[0], { ...variables[1], parameters }])
                                                }}
                                                    defaultValue={variables[1].parameters[index].text}
                                                    placeholder={`Enter value for {{${key}}}`}
                                                />
                                                {/* <div className="field-placeholder">Business Name<Asterisk /></div> */}
                                                {/* <div className='error'>{isBtnClick && ValidateEmptyField(userDetails.businessName, "Business Name").err}</div> */}
                                            </div>
                                        )
                                    }
                                </div>
                            }
                            {
                                btnVariables.length > 0 &&
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'start' }}>URL</div>
                                    <div className="field-wrapper" style={{ marginLeft: 0, marginBottom: 10 }}>
                                        <input type="text" onChange={(e) => {
                                            let parameters = variables[1].parameters
                                            parameters[0].text = e.target.value;
                                            setVariables([variables[0], variables[1], { ...variables[2], parameters }])
                                        }}
                                            defaultValue={header?.example?.header_text[0]}
                                            placeholder={`Enter value for {{1}}}`}
                                        />
                                        <div className='error'>{isBtnClick && ValidateEmptyField(header.example.header_text[0], "Business Name").err}</div>
                                    </div>
                                </div>

                            }

                        </div>
                    </div>}
                positiveBtnLabel={"Add"}
                negativeBtnLabel={'Cancel'}
            />
        </div >
    )
}
