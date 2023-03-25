import React, { useState, useEffect, useRef } from 'react'
import Grid from '../../components/Grid/Grid'
import './bulkSMS.css'
import contactsJSON from '../../assets/jsons/bulkSMS/getContacts..json'
import { API } from '../../constant/network'
import Dialog from '@mui/material/Dialog';
import { Close, DeleteOutline, Edit, Group, PlusOne } from '@material-ui/icons'
import ChatForm from '../Chat/ChatForm'
import Scrollbars from 'react-custom-scrollbars'
import { apiList } from '../../constant/apiList'
import { useNavigate } from 'react-router-dom'
import { getFromLocalStorage } from '../../components/LocalStorage/localStorage'
import Transition from '../../components/Transition'
import Toast from '../../components/Toast/Toast'
import Spinner from '../../components/Loading/spinner'
import { LoadingButton } from '@mui/lab';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { Skeleton, styled } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import allSegments from '../../assets/jsons/Segments/allSegments.json'
import { ValidateEmptyField } from '../../components/validators'
import Asterisk from '../../components/Asterisk'
import { Button } from '@material-ui/core'
import moment from 'moment'
import DialogBox from '../../components/Dialog/Dialog';
import Template from '../../components/Template/Template'
import InfiniteScroll from 'react-infinite-scroller';

export default function BulkSMS(props: any) {
    const navigate = useNavigate();
    const { innerWidth: width, innerHeight: height } = window;
    const [contacts, setContacts] = useState(Array)
    const [selectedRows, setSelectedRows] = useState<Array<any>>([])
    const [loading, setLoading] = useState(false);
    const [sendMessageLoading, setSendMessageLoading] = useState(false);
    const [selectedRowsDialog, setSelectedRowsDialog] = useState(false);
    const [totalCount, setTotalCount] = useState(0)
    const [loggedInUser, setLoggedInUser] = useState<any>(undefined);
    const [selectedSegments, setSelectedSegments] = useState<Array<any>>([]);
    const [segmentDialog, setSegmentDialog] = useState(false);
    const [isBtnClicked, setIsBtnClicked] = useState(false);
    const [clickedSegment, setClickedSegment] = useState(Object);
    const [segmentLoading, setSegmentLoading] = useState(false);
    const [message, setMessage] = useState({ text: "" })
    const [selectTemplateDialog, setSelectTemplateDialog] = useState(false)
    const [templates, setTemplates] = useState<Array<any>>([]);
    const [templateListLoading, setTemplateListLoading] = useState(false)
    const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(-1);
    const [page, setPage] = useState(1)
    const [totalTemplates, setTotalTemplates] = useState(0);

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

    async function getContacts(take: number, skip: number, searchValue: string) {
        try {
            setLoading(true)
            const userDetails = await getFromLocalStorage("user");
            if (!userDetails) {
                navigate("/");
                throw new Error("Log in required!!!");
            }
            setLoggedInUser(userDetails);
            const body = {
                userId: userDetails.currentuserId,
                businessId: userDetails.businessId,
                skip,
                take
            }
            // setTimeout(() => {
            //     setLoading(false)
            //     setContacts([...contactsJSON]);
            //     setTotalCount(5)
            // }, 1000);
            if (searchValue === "") {
                API.get(`${process.env.REACT_APP_BASE_API}${apiList.getContactList}`, body, {})?.subscribe({
                    next(res: any) {
                        // setTimeout(() => {
                        if (res.status === 200) {
                            setLoading(false)
                            setContacts(res.data.lstCustomer);
                            setTotalCount(res.data.count)
                        }
                        // }, 2000);
                    }
                });
            } else if (searchValue) {
                API.get(`${process.env.REACT_APP_BASE_API}${apiList.searchContactList}`, { ...body, searchValue }, {})?.subscribe({
                    next(res: any) {
                        // setTimeout(() => {
                        if (res.status === 200) {
                            setLoading(false)
                            setContacts(res.data.lstCustomer);
                            setTotalCount(res.data.count)
                        }
                        // }, 2000);
                    }
                });
            }
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    async function sendMessage({ smsFrom = '' }: { smsFrom?: string }) {
        try {
            const userDetails = await getFromLocalStorage("user");
            if (!userDetails) navigate("/")
            if (message.text) {
                setSendMessageLoading(true)
                let sendSmsBulk = []
                for (let i = 0; i < selectedRows.length; i++) {
                    let phoneNo = `${selectedRows[i].countryCode}${selectedRows[i].phoneNo}`
                    let smsFromPhoneNo = smsFrom
                    if (smsFromPhoneNo.charAt(0) !== "+") {
                        smsFromPhoneNo = `+${smsFromPhoneNo}`
                    }
                    if (phoneNo.charAt(0) !== "+") {
                        phoneNo = `+${phoneNo}`
                    }
                    sendSmsBulk.push({
                        customerId: selectedRows[i].id,
                        "smsText": message.text,
                        "smsStatus": "pending",
                        "smsType": "send",
                        "smsTo": phoneNo,
                        "recipientType": "individual",
                        "text": "text"
                    })
                }
                const body = {
                    sendSmsBulk
                }
                console.log("bulk sms body : ", body);

                API.post(`${process.env.REACT_APP_BASE_API}${apiList.sendBulkMessage} `, body, {})?.subscribe({
                    next(res: any) {
                        if (res.status === 200 || res.status === 201) {
                            setSendMessageLoading(false);
                            props.setChatListAction({ action: "reloadChatList" })
                            Toast({ message: 'Message sent successfully to ' + sendSmsBulk.length + ' contacts', type: 'success' });
                            setMessage({ text: "" })
                        }
                    },
                    error(err) {
                        setSendMessageLoading(false)
                    },
                });
            } else Toast({ message: "Message field cannot be empty", type: 'warning' })
        } catch (error: any) {
            setSendMessageLoading(false)
            Toast({ message: error, type: 'error' })
        }
    }
    async function sendTemplate() {
        try {
            const userDetails = await getFromLocalStorage("user");
            if (!userDetails) navigate("/")
            console.log("selected rows ", selectedRows);

            if (selectedRows.length !== 0) {
                setSendMessageLoading(true)
                let sendSmsBulk = []
                for (let i = 0; i < selectedRows.length; i++) {
                    let phoneNo = `${selectedRows[i].countryCode}${selectedRows[i].phoneNo}`
                    if (phoneNo.charAt(0) !== "+") {
                        phoneNo = `+${phoneNo}`
                    }
                    sendSmsBulk.push({
                        "whatsapptemplateId": templates[selectedTemplateIndex]?.whatsappTemplateId,
                        customerId: selectedRows[i].id,
                        "smsStatus": "pending",
                        "smsType": "send",
                        "smsTo": phoneNo,
                        "recipientType": "individual",
                        "templateName": templates[selectedTemplateIndex]?.templateJson?.name,
                        "templateLanguage": templates[selectedTemplateIndex]?.templateJson?.language,
                        "templateJson": templates[selectedTemplateIndex]?.templateJson
                    })
                }
                const body = {
                    sendTemplateSmsBulk: [...sendSmsBulk]
                }
                console.log("bulk sms body : ", body);

                API.post(`${process.env.REACT_APP_BASE_API}${apiList.sendBulkTemplate} `, body, {})?.subscribe({
                    next(res: any) {
                        if (res.status === 200 || res.status === 201) {
                            setSendMessageLoading(false);
                            props.setChatListAction({ action: "reloadChatList" })
                            Toast({ message: 'Message sent successfully to ' + sendSmsBulk.length + ' contacts', type: 'success' });
                            setMessage({ text: "" })
                        }
                    },
                    error(err) {
                        setSendMessageLoading(false)
                    },
                });
            } else Toast({ message: "Select atleast one contact", type: 'error' })
        } catch (error: any) {
            setSendMessageLoading(false)
            Toast({ message: error, type: 'error' })
        }
    }

    function onEditIconClick(obj: any) {
        console.log("segment obj: ", obj);

        setClickedSegment(obj)
        setSegmentDialog(true)
    }

    useEffect(() => {
        getContacts(10, 0, "");
    }, [])

    function getTemplates(p = page) {
        const body = {
            skipIn: (p - 1) * 10,
            takeIn: 10,
            status: "Approved"
        }
        API.get(`${process.env.REACT_APP_BASE_API}${apiList.templateList}`, body, {})?.subscribe({
            next(res: any) {
                if (res.status === 201 || res.status === 200) {
                    setTemplateListLoading(false);
                    if (p === 1) setTemplates([...res.data.templatelist])
                    else setTemplates([...templates, ...res.data.templatelist])
                    setPage(p + 1)
                    setTotalTemplates(res.data.count)
                }
            },
            error(err: any) {
                setTemplateListLoading(false);
            }
        });
    }

    return (
        <div className="bulk-sms-wrapper chat-content-wrapper">
            <div className='page-title'>
                Bulk SMS
            </div>
            <Scrollbars style={{ height: height - 150 }} >
                {/* <div style={{ height: 30 }} /> */}
                {/* <div className='segment-wrapper'>
                    {allSegments.map((segment: any, index) => {
                        return (
                            <div className='segment'>
                                <span>
                                    <span style={{ fontSize: 12, color: '#000', marginRight: 8 }}>
                                        <Group className='icon' style={{ color: '#000' }} /> {segment.contactsCount}
                                    </span>
                                    <span style={{ marginRight: 8 }} >{segment.name}</span>
                                    <GridTooltip title="Edit" placement="bottom"><Edit onClick={() => onEditIconClick(segment)} className='icon' style={{ marginRight: 2 }} /></GridTooltip>
                                    <GridTooltip title="Delete" placement="bottom">
                                        <DeleteOutline onClick={() => { }} className='icon' style={{ color: "#FF5858" }} />
                                    </GridTooltip>
                                </span>
                            </div>
                        )
                    })}
                    <GridTooltip title="Add Segment" placement="bottom">
                        <IconButton
                            style={{ outlineWidth: 0, padding: 0 }}
                            onClick={() => setSegmentDialog(true)}
                        >
                            <div className='segment' style={{ width: 30, fontSize: 14 }}>
                                <span><b>+</b></span>
                            </div>
                        </IconButton>
                    </GridTooltip>
                </div> */}
                <div style={{ height: 10 }} />
                <span style={{ fontSize: 12, marginLeft: 10 }}
                // onClick={() => {
                //     if (selectedRows.length > 0)
                //         setSelectedRowsDialog(true)
                // }}
                >{selectedRows.length} Contacts Selected</span>
                <Grid
                    data={contacts}
                    columns={[
                        { header: "Name", value: (column) => <span>{column.firstName} {column.lastName}</span>, width: 150 },
                        { header: "Contact", value: (column, index) => <span>{column.countryCode} {column.phoneNo}</span>, width: 120 },
                        { header: "Email", value: "email", width: 200 },
                        { header: "Secondary Contact", value: "secondaryPhoneNo", width: 150 },
                        { header: "Gender", value: "gender", width: 150 },
                        { header: "D.O.B.", propertyName: "dob", value: (i) => <span>{i.dob ? moment(i.dob).format('MM/DD/YYYY') : 'NA'}</span>, width: 150 },
                    ]}
                    footer={true}
                    pagination={true}
                    rowsAtATimeSelector={true}
                    setSelectedRows={(rows: any) => {
                        setSelectedRows([...rows]);
                    }}
                    selectedRecords={selectedRows}
                    loading={loading}
                    rowsAtATime={10}
                    totalCount={totalCount}
                    onPageChange={(take: number, skip: number, searchValue: string) => getContacts(take, skip, searchValue)}
                    // api={{
                    //     url: `${process.env.REACT_APP_BASE_API}${apiList.getContactList}`,
                    //     body: {
                    //         userId: loggedInUser && loggedInUser.currentuserId,
                    //         businessId: loggedInUser && loggedInUser.businessId
                    //     },
                    //     listFieldName: "lstCustomer",
                    //     countFieldName: "data.count"
                    // }}
                    globalSearch={false}
                    columnSearch={false}
                />
            </Scrollbars>
            {/* <ChatForm
                disabled={selectedRows.length === 0}
                loading={sendMessageLoading}
                sendMessage={sendMessage}
                onChange={(e: any) => {
                    if (e.target.value === '/') {
                        getTemplates(1)
                        setTemplateListLoading(true);
                        setSelectTemplateDialog(true);
                    } else
                        setMessage({ ...message, text: e.target.value })
                }}
                value={message.text}
                placeholder={'Type your message here or enter "/" to select template...'}
            /> */}
            <div style={{ position: 'absolute', bottom: 8 }}>
                <Button
                    disabled={selectedRows.length < 2}
                    style={{ width: width - 460, outlineWidth: 0, color: selectedRows.length < 2 ? '#999' : '#075E54', fontSize: 11, border: selectedRows.length < 2 ? '1px solid #999' : '1px solid #075E54' }}
                    variant='outlined'
                    onClick={() => {
                        getTemplates()
                        setTemplateListLoading(true)
                        setSelectTemplateDialog(true)
                    }}
                >
                    Select and send Template...
                </Button>
                <div style={{ fontSize: 9, padding: 0, marginTop: 3 }}>*You can only send templates by segment and bulk messages.</div>
            </div>

            <Dialog
                open={selectedRowsDialog}
                TransitionComponent={Transition}
                keepMounted
                // onClose={() => setSelectedRowsDialog(false)}
                aria-describedby="alert-dialog-slide-description"
                transitionDuration={400}
            >
                <div className='dialog-wrapper' style={{ width: "fit-content", height: '90%', maxHeight: "90%" }}>
                    <div className='dialog-title' style={{ display: 'flex', marginBottom: 0, justifyContent: 'space-between', alignItems: 'center' }}>
                        Selected Contacts
                        <Close onClick={() => setSelectedRowsDialog(false)} className='close-dialog' />
                    </div>
                    <div style={{ width: 600, height: 200 }}>
                        <Grid
                            data={selectedRows}
                            columns={[
                                {
                                    header: "Name", value: (column) => {
                                        console.log("column : ", column);
                                        return <span></span>
                                    }
                                },
                                { header: "Contact", value: (column, index) => <span>{column.countryCode} {column.phoneNo}</span> },
                                { header: "Secondary Contact", value: "secondaryContact", width: 150 },
                                { header: "Email", value: "email", width: 200 }
                            ]}
                            footer={false}
                            pagination={false}
                            rowsAtATimeSelector={false}
                            rowsAtATime={selectedRows.length}
                            columnSearch={false}
                            globalSearch={false}
                        />
                    </div>
                </div>
            </Dialog >
            <Dialog
                open={segmentDialog}
                TransitionComponent={Transition}
                keepMounted
                // onClose={() => setSegmentDialog(false)}
                aria-describedby="alert-dialog-slide-description"
                transitionDuration={400}
            >
                <div className='dialog-wrapper' style={{ width: "fit-content", height: '90%', maxHeight: "90%" }}>
                    <div className='dialog-title' style={{ display: 'flex', marginBottom: 0, justifyContent: 'space-between', alignItems: 'center' }}>
                        Enter Segment Name
                        <Close onClick={() => setSegmentDialog(false)} className='close-dialog' />
                    </div>
                    <div style={{ width: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                        <div className="field-wrapper" style={{ marginBottom: 0, width: 300 }}>
                            <input name='segment-name' onChange={(e) => setClickedSegment({ ...clickedSegment, name: e.target.value })}
                                defaultValue={clickedSegment.name} disabled={segmentLoading} />
                            <div className="field-placeholder">Segment Name<Asterisk /></div>
                            <div className='error'>{isBtnClicked && ValidateEmptyField(clickedSegment.name, "Segment Name").err}</div>
                        </div>
                        {clickedSegment.name}
                        <div className="dialog-action-buttons">
                            <Button variant="outlined" className='dialog-btn-danger' onClick={() => setSegmentDialog(false)}>Cancel</Button>
                            <Button variant="outlined" className='dialog-btn-positive' onClick={() => { }}>
                                {segmentLoading ? <Spinner /> : "Submit"}
                            </Button>
                        </div>
                    </div>
                </div>
            </Dialog>
            <DialogBox
                title={"Select Template"}
                open={selectTemplateDialog}
                onClose={() => setSelectTemplateDialog(false)}
                loading={sendMessageLoading}
                onClick={sendTemplate}
                DialogBody={() =>
                    <div style={{ width: 610 }}>
                        {
                            !templateListLoading ?
                                <Scrollbars style={{ height: height / 100 * 70 }}>
                                    <InfiniteScroll
                                        pageStart={1}
                                        loadMore={() => getTemplates(page)}
                                        hasMore={totalTemplates && totalTemplates > templates.length ? true : false}
                                        loader={<div style={{ display: 'flex', width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}
                                        ><Spinner color="#075E54" /></div>}
                                        useWindow={false}
                                    >
                                        <div style={{ display: 'flex', flexWrap: 'wrap' }} className='templates-container'>
                                            {
                                                templates.length > 0 ?
                                                    templates.map((template: any, templateIndex: number) =>
                                                        <Template
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
                                    </InfiniteScroll>
                                </Scrollbars>
                                :
                                <Spinner style={{ margin: 50 }} color='#075e45' />
                        }
                    </div>
                }
                positiveBtnLabel={"Send"}
                btnContainerStyles={{ margin: '0px 0px 5px 0px' }}
            />
        </div>
    )
}
