import React, { useEffect, useState } from 'react'
import './autoResponder.css'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material';
import { Button, TextField } from '@material-ui/core';
import { AddOutlined, Block, DeleteOutline, EditOutlined, NearMeOutlined, PlusOneOutlined } from '@material-ui/icons';
import { Circle, HdrPlusOutlined, NearMeDisabledOutlined } from '@mui/icons-material';
import Grid from '../../../components/Grid/Grid';
import Scrollbars from 'react-custom-scrollbars'
import moment from 'moment';
import Dialog from '../../../components/Dialog/Dialog';
import { ValidateEmptyField, ValidateName } from '../../../components/validators';
import { API } from '../../../constant/network';
import { apiList } from '../../../constant/apiList';
import { getFromLocalStorage } from '../../../components/LocalStorage/localStorage';
import { ReactComponent as ChatBotIcon } from '../../../assets/img/chat-bot-icon.svg'

interface AutoResponderProps {
    thirdTab: string
    clickedSegment?: any
    setSegmentListAction: (action: any) => void
    switchSubTab: (tab: any) => void
    setClickedSegment: (obj: any) => void
}

export default function AutoResponder({ thirdTab, clickedSegment, setClickedSegment, switchSubTab, setSegmentListAction }: AutoResponderProps) {
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
    const { innerHeight: height, innerWidth: width } = window;

    const [autoResponders, setAutoResponders] = useState<Array<any>>([])
    const [loading, setLoading] = useState(false)
    const [totalCount, setTotalCount] = useState(0)
    const [autoResDialog, setAutoResDialog] = useState(false);
    const [dialogLoading, setDialogLoading] = useState(false);
    const [autoResInfo, setAutoResInfo] = useState<any>({
        keywordName: "",
        keywordResponse: ""
    })
    const [isBtnClicked, setIsBtnClicked] = useState(false);
    const [clickedIndex, setClickedIndex] = useState(-1);
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const [disableEnableConfirmation, setDisableEnableConfirmation] = useState(false);
    useEffect(() => {
        getAllAutoRes()
    }, [])

    function onCloseAutoResDialog() {
        setAutoResDialog(false);
        setIsBtnClicked(false);
        setAutoResInfo({
            keywordName: '',
            keywordResponse: ''
        })
    }

    function getAllAutoRes(skip = 0, take = 10, searchValue = {}) {
        const body = {
            skipIn: skip,
            takeIn: take
        }
        setClickedIndex(-1)
        API.get(`${process.env.REACT_APP_BASE_API}${apiList.getAllAutoRes}`, body, {})?.subscribe({
            next(res: any) {
                if (res.status === 200) {
                    setDialogLoading(false)
                    setAutoResponders(res.data.autoResponse)
                    setTotalCount(res.data.count)
                    onCloseAutoResDialog();
                }
            },
            error(err) {
                setDialogLoading(false)
            },
        });
    }

    async function onConfirmAutoResDialog() {
        const body = autoResInfo
        const user = await getFromLocalStorage('user')
        setDialogLoading(true)
        API.post(`${process.env.REACT_APP_BASE_API}${apiList.createAutoRes}`, body, {})?.subscribe({
            next(res: any) {
                if (res.status === 200) {
                    setDialogLoading(false)
                    setAutoResponders([{ autoResponseId: res.data.autoResponseId, ...autoResInfo, createdBy: `${user.firstName} ${user.lastName}`, createdAt: Date.now() }, ...autoResponders])
                    onCloseAutoResDialog();
                    setClickedIndex(-1)
                }
            },
            error(err) {
                setDialogLoading(false)
            },
        });
    }

    async function updateAutoRes() {
        const body = autoResInfo
        const user = await getFromLocalStorage('user')
        setDialogLoading(true)
        API.put(`${process.env.REACT_APP_BASE_API}${apiList.updateAutoRes}`, body, {})?.subscribe({
            next(res: any) {
                if (res.status === 200) {
                    setDialogLoading(false)
                    onCloseAutoResDialog();
                    autoResponders[clickedIndex] = autoResInfo
                    setClickedIndex(-1)
                }
            },
            error(err) {
                setDialogLoading(false)
            },
        });
    }

    function validateAutoResInfo() {
        setIsBtnClicked(true);
        if (
            !ValidateName(autoResInfo.keywordName).isError &&
            !ValidateEmptyField(autoResInfo.keywordResponse).isError
        ) autoResInfo.autoResponseId ? updateAutoRes() : onConfirmAutoResDialog()
    }

    function deleteAutoRes() {
        setDialogLoading(true)
        API.deleteApi(`${process.env.REACT_APP_BASE_API}${apiList.deleteAutoRes}/${autoResponders[clickedIndex].autoResponseId}`, {}, {})?.subscribe({
            next(res: any) {
                if (res.status === 200) {
                    setClickedIndex(-1);
                    setDialogLoading(false)
                    onCloseAutoResDialog();
                    const newArray = autoResponders.filter((a: any) => a.autoResponseId !== autoResponders[clickedIndex].autoResponseId);
                    setAutoResponders(newArray)
                    setDeleteConfirmation(false)
                }
            },
            error(err) {
                setDialogLoading(false)
            },
        });
    }

    function disableEnable() {
        setDialogLoading(true)
        const body = {
            "autoResponseId": autoResponders[clickedIndex].autoResponseId,
            "isBlock": autoResponders[clickedIndex].isBlock ? 0 : 1
        }
        API.put(`${process.env.REACT_APP_BASE_API}${apiList.enableDisableAutoResponder}`, body, {})?.subscribe({
            next(res: any) {
                if (res.status === 200) {
                    setClickedIndex(-1);
                    setDialogLoading(false)
                    onCloseAutoResDialog();
                    let newArray = [...autoResponders]
                    const objIndex = newArray.findIndex((obj: any) => obj.autoResponseId === autoResponders[clickedIndex].autoResponseId);
                    newArray[objIndex] = { ...newArray[objIndex], isBlock: !autoResponders[clickedIndex].isBlock }
                    setAutoResponders(newArray)
                    setDisableEnableConfirmation(false)
                }
            },
            error(err) {
                setDialogLoading(false)
            },
        });
    }

    function onCloseDeleteConfirmation() {
        setDeleteConfirmation(false)
    }

    return (
        <div className='auto-responder-wrapper'>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className='page-title'>Auto Responder</div>
                {
                    dialogLoading === false && autoResponders.length !== 0 &&
                    <GridTooltip title={"Create Auto Responder"} placement="bottom">
                        <Button disabled={autoResponders && autoResponders.length >= 10} onClick={() => setAutoResDialog(true)} variant="contained"
                            style={{ marginRight: 10, fontSize: 11, display: 'flex', alignItems: 'center', padding: 4, paddingLeft: 10, paddingRight: 10, justifyContent: 'center', fontWeight: 'bold', outlineWidth: 0, backgroundColor: autoResponders && autoResponders.length >= 10 ? '#999' : '#075E54', color: '#FFF' }}>
                            Create Auto Responder <AddOutlined fontSize='small' style={{ marginLeft: 3 }} />
                        </Button>
                    </GridTooltip>
                }
            </div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 10, paddingLeft: 10, marginBottom: 10 }}>
                <span><Circle style={{ fontSize: 6, marginRight: 5 }} />Auto Responders allow you to send instant, automated text message responses to people after they've texted a specific keyword to your number.</span><br />
                <span><Circle style={{ fontSize: 6, marginRight: 5 }} />You can set maximum 10 auto responder</span>
            </div>
            <Scrollbars style={{ height: height - 140 }}>
                {
                    autoResponders.length !== 0 ?
                        <Grid
                            data={autoResponders}
                            columns={[
                                { header: "Created By", value: 'createdBy', charLimit: 30 },
                                { header: "Date", propertyName: 'createdAt', value: (column: any) => <span>{moment.utc(column.createdAt).local().format('MM/DD/YYYY')}</span> },
                                { header: "Keyword", value: "keywordName", charLimit: 15 },
                                { header: "Response", value: "keywordResponse", width: 250, charLimit: 30, popupOnHover: true },
                            ]}
                            footer={true}
                            pagination={true}
                            rowsAtATimeSelector={true}
                            loading={loading}
                            rowsAtATime={10}
                            totalCount={totalCount}
                            onPageChange={(take: number, skip: number, searchValue: any) => getAllAutoRes(skip, take, searchValue)}
                            globalSearch={false}
                            columnSearch={false}
                            infiniteScroll={false}
                            clickToExpand={false}
                            actions={[
                                {
                                    component: (index: number) => <EditOutlined className='grid-icon' fontSize='small' />,
                                    tooltip: 'Edit',
                                    onClick: (id: any, index: number) => {
                                        setAutoResDialog(true)
                                        setAutoResInfo({
                                            ...autoResponders[index]
                                        })
                                        setClickedIndex(index);
                                    }
                                },
                                {
                                    component: (index: number) => <DeleteOutline className='grid-icon' fontSize='small' style={{ color: '#fe5044' }} />,
                                    tooltip: 'Delete',
                                    onClick: (id: any, index: number) => {
                                        setClickedIndex(index)
                                        setDeleteConfirmation(true)
                                    }
                                },
                                {
                                    component: (index: number) => autoResponders[index].isBlock ? <NearMeOutlined className='grid-icon' fontSize='small' style={{ color: '#eed202' }} /> : <NearMeDisabledOutlined className='grid-icon' fontSize='small' style={{ color: '#eed202' }} />,
                                    onClick: (id: any, index: number) => {
                                        setClickedIndex(index)
                                        setDisableEnableConfirmation(true)
                                    },
                                    tooltip: (index: any) => autoResponders[index].isBlock ? "Enable" : "Disable",
                                },
                            ]}
                            isActions={true}
                        /> :
                        !dialogLoading &&
                        <div style={{ width: '100%', height: height - 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <ChatBotIcon height={150} width={150} fill='#90a4ac' />
                            <span style={{ marginTop: 10, marginBottom: 15, color: '#666', fontSize: '13' }}>Dont have any auto responder</span>
                            <GridTooltip title={"Create Auto Responder"} placement="bottom">
                                <Button disabled={autoResponders && autoResponders.length >= 10} onClick={() => setAutoResDialog(true)} variant="contained"
                                    style={{ marginRight: 10, fontSize: 11, display: 'flex', alignItems: 'center', padding: 4, paddingLeft: 10, paddingRight: 10, justifyContent: 'center', fontWeight: 'bold', outlineWidth: 0, backgroundColor: autoResponders && autoResponders.length >= 10 ? '#999' : '#075E54', color: '#FFF' }}>
                                    Create Auto Responder <AddOutlined fontSize='small' style={{ marginLeft: 3 }} />
                                </Button>
                            </GridTooltip>
                        </div>
                }
            </Scrollbars>
            <Dialog
                title={autoResInfo.autoResponseId ? "Update Auto Responder" : "Create Auto Responder"}
                open={autoResDialog}
                onClose={onCloseAutoResDialog}
                loading={dialogLoading}
                onClick={validateAutoResInfo}
                DialogBody={() =>
                    <div style={{ padding: 10, width: 400 }}>
                        <div style={{ display: 'flex', height: 'fit-content', flex: 1, position: 'relative', marginBottom: 20, flexDirection: 'column' }}>
                            <div className='input-title-text'>Keyword Name</div>
                            <TextField
                                style={{ margin: 0 }}
                                name='keywordName'
                                className='text-field'
                                id="outlined-basic"
                                variant="outlined"
                                value={autoResInfo.keywordName}
                                multiline={false}
                                disabled={dialogLoading}
                                inputProps={{ style: { fontSize: 12 }, maxLength: 15 }} // font size of input text
                                onChange={(e: any) => setAutoResInfo({ ...autoResInfo, keywordName: e.target.value })}
                                margin="normal"
                                size="small"
                            />
                            <div style={{ color: '#d32f2f', fontSize: 11, textAlign: 'left' }}>{isBtnClicked && ValidateName(`${autoResInfo.keywordName}`, "Keyword Name").err}</div>
                        </div>

                        <div style={{ display: 'flex', height: 'fit-content', flex: 1, position: 'relative', flexDirection: 'column' }}>
                            <span className='input-title-text' >Keyword Response</span>
                            <TextField
                                style={{ margin: 0 }}
                                className='text-field'
                                id="outlined-basic"
                                variant="outlined"
                                name='keywordRes'
                                value={autoResInfo.keywordResponse}
                                multiline={true}
                                disabled={dialogLoading}
                                inputProps={{ style: { fontSize: 12, }, maxLength: 320 }} // font size of input text
                                onChange={(e: any) => setAutoResInfo({ ...autoResInfo, keywordResponse: e.target.value })}
                                margin='normal'
                                size='small'
                            />
                            <div style={{ color: '#d32f2f', fontSize: 11, textAlign: 'left' }}>{isBtnClicked && ValidateEmptyField(`${autoResInfo.keywordResponse}`, "Message").err}</div>
                        </div>
                    </div>}
                positiveBtnLabel={autoResInfo.autoResponseId > 0 ? "Update" : "Create"}
            />
            <Dialog
                title={"Alert!"}
                open={deleteConfirmation}
                onClose={onCloseDeleteConfirmation}
                loading={dialogLoading}
                onClick={deleteAutoRes}
                DialogBody={() =>
                    <div style={{ padding: 10, width: 400 }}>
                        Are you sure you want to delete auto responder for <b>{clickedIndex >= 0 && autoResponders[clickedIndex] && autoResponders[clickedIndex].keywordName}</b>
                    </div>}
                positiveBtnLabel={"Delete"}
            />
            <Dialog
                title={"Alert!"}
                open={disableEnableConfirmation}
                onClose={() => setDisableEnableConfirmation(false)}
                loading={dialogLoading}
                onClick={disableEnable}
                DialogBody={() =>
                    <div style={{ padding: 10, width: 400 }}>
                        Are you sure you want to {autoResponders[clickedIndex]?.isBlock ? 'Enable' : 'Disable'} auto responder for <b>{clickedIndex >= 0 && autoResponders[clickedIndex] && autoResponders[clickedIndex].keywordName}</b>
                    </div>}
                positiveBtnLabel={autoResponders[clickedIndex]?.isBlock ? 'Enable' : 'Disable'}
            />
        </div>
    )
}