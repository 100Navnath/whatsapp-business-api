import { Add, ErrorOutline, SearchOutlined } from '@material-ui/icons'
import React, { useState, useEffect, useRef } from 'react'
import Scrollbars from 'react-custom-scrollbars'
import { Button } from '@material-ui/core';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { useNavigate } from 'react-router-dom';
import { API } from '../../constant/network';
import { apiList } from '../../constant/apiList';
import Spinner from '../../components/Loading/spinner';
import { ValidateEmptyField } from '../../components/validators';
import { getFromLocalStorage } from '../../components/LocalStorage/localStorage';
import InfiniteScroll from 'react-infinite-scroller';
import 'react-toastify/dist/ReactToastify.css';
import IconButton from '@mui/material/IconButton';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material';
import moment from 'moment';
import Toast from '../../components/Toast/Toast';
import allSegments from '../../assets/jsons/Segments/allSegments.json';
import './segmentList.css'
import Dialog from '../../components/Dialog/Dialog';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="down" ref={ref} {...props} />;
});

export default function SegmentList(props: any) {
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
    let navigate = useNavigate();
    const { innerHeight: height } = window;
    const contactCardRef = useRef<any>(null);

    const [segments, setSegments] = useState<Array<any>>([])
    const [totalCount, setTotalCount] = useState(undefined);
    const [totalSegmentsCount, setTotalSegmentsCount] = useState(undefined);
    const [btnClicked, setBtnClicked] = useState(false)
    const [page, setPage] = useState(0);
    const [searchValue, setSearchValue] = useState("");
    const [searchedValue, setSearchedValue] = useState("");
    const [listLoading, setListLoading] = useState(false);
    const [clickedSegmentId, setClickedSegmentId] = useState(0)
    const [createSegmentDialog, setCreateSegmentDialog] = useState(false)
    const [dialogLoading, setDialogLoading] = useState(false)
    const [segmentName, setSegmentName] = useState('')
    const [isDialogBtnClick, setIsDialogBtnClick] = useState(false)
    const [contactsCount, setContactsCount] = useState(0)

    async function getSegmentList(skip = 0, searchValue = '') {
        try {
            setListLoading(true)
            const body = {
                takeIn: 10,
                skipIn: skip,
                searchValue
            }
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.getSegments}`, body, {})?.subscribe({
                next(res: any) {
                    if (res && res.status === 200) {
                        setListLoading(false);
                        if (skip === 0) {
                            setPage(2)
                            setSegments([...res.data.segments])
                        }
                        else {
                            setPage(page + 1)
                            setSegments([...segments, ...res.data.segments])
                        }

                        setTotalSegmentsCount(res.data.count);
                        setTotalCount(res.data.count);
                    }
                },
                error(err) {
                    setListLoading(false);
                },
            });
        } catch (error: any) {
            setListLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }

    function _onSegmentClick(obj: any) {
        navigate("/segments/" + obj.id);
        setClickedSegmentId(obj.id);
        props.switchSubTab('segmentInfo');
        props.setClickedSegment(obj)
    }

    function handlePhoneChange(e: any) {
        const value = e.target.value
        if (value === "") {
            console.log("value is blanked");
            setPage(1);
            setSegments([]);
            setTotalCount(undefined);
            // searchContact(1);
            getSegmentList(0, value)
        } else {
            setSearchValue(value);
        }
    }

    async function getContactsCount() {
        try {
            const user = await getFromLocalStorage("user");
            if (!user) navigate('/')
            const body = { take: 0, skip: 0, userId: user.currentuserId, businessId: user.businessId }
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.getContactList}`, body, {})?.subscribe({
                next(res: any) {
                    if (res && res.status === 200) {
                        setContactsCount(res.data.count)
                    }
                },
                error(err) {
                    setListLoading(false);
                },
            });
        } catch (error) {
            Toast({ message: `${error}`, type: 'error' })
        }
    }

    useEffect(() => {
        const arrayOfUrl = window.location.href.split('/');
        if (arrayOfUrl[arrayOfUrl.length - 2] === "segments") {
            setClickedSegmentId(parseInt(arrayOfUrl[arrayOfUrl.length - 1]))
        }
        if (props.segmentListAction.action == "edit") {
            let newArray = segments;
            const index = segments.findIndex((s) => parseInt(s.id) === parseInt(props.segmentListAction.data.id));
            newArray[index] = { ...newArray[index], name: props.segmentListAction.data.name };
            setSegments([...newArray])
        }
        else if (props.segmentListAction.action == "delete") {
            console.log("segmentListAction : ", props.segmentListAction);

            let newArray = segments.filter(function (obj: any) { return parseInt(obj.id) !== parseInt(props.segmentListAction.data.id) });
            setSegments([...newArray])
            navigate('/segments');
            props.switchSubTab(null);
            props.setClickedSegment(undefined)
        }
        else if (props.segmentListAction.action == "reload") {
            getSegmentList(0)
        }
    }, [props.segmentListAction])

    useEffect(() => {
        const arrayOfUrl = window.location.href.split('/');
        if (arrayOfUrl[arrayOfUrl.length - 2] === "segments") {
            setClickedSegmentId(parseInt(arrayOfUrl[arrayOfUrl.length - 1]))
        }
        getSegmentList(0);
        getContactsCount()
    }, [])

    return (
        // <!-- Segments List Tab -->
        <div style={{ overflowY: 'clip' }}>
            {/* <!-- Tab content header start --> */}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="tab-pane-header">
                    Segments
                </div>
                <GridTooltip title={"Add contacts to create segment"} placement="bottom">
                    <div style={{ marginRight: 13, justifyContent: 'end', display: 'flex', cursor: contactsCount > 0 ? "pointer" : 'not-allowed' }}>
                        <Button
                            disabled={!(contactsCount > 0)}
                            onClick={() => setCreateSegmentDialog(true)}
                            variant="outlined"
                            style={{ height: 30, backgroundColor: '#fff', color: contactsCount > 0 ? '#075E54' : '#808080', fontSize: 12, outlineWidth: 0 }}
                        >
                            Create Segment
                            <Add style={{ fontSize: 16, marginLeft: 5, height: '100%' }} />
                        </Button>
                    </div>
                </GridTooltip>
            </div>

            {/* <!-- Tab content header end --> */}
            <div>
                <div>
                    <div style={{ display: 'flex', flexDirection: 'row', boxShadow: '5px 5px 5px #eaeef7', padding: 10, paddingBottom: 0, alignItems: 'center' }}>
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="Search Segments"
                                onChange={handlePhoneChange} style={{ fontSize: 12 }} />
                        </div>
                        <IconButton
                            style={{ height: 30, padding: 0, outlineWidth: 0 }}
                            onClick={() => {
                                // searchContact(1);
                                if (searchValue.length >= 1) {
                                    setBtnClicked(true)
                                    setPage(1);
                                    setSegments([]);
                                    setTotalCount(undefined);
                                }
                                getSegmentList(0, searchValue)
                            }}>
                            <span style={{ backgroundColor: '#075E54', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, marginLeft: 5, height: 30, width: 35, color: '#FFF' }}>
                                <SearchOutlined fontSize='small' />
                            </span>
                        </IconButton>
                    </div>
                    {
                        btnClicked && ValidateEmptyField(searchValue).isError &&
                        <span style={{ fontSize: 10, color: '#d32f2f', marginLeft: 15 }}>{btnClicked && ValidateEmptyField(searchValue, "Search keyword").err}</span>
                    }
                </div>
                {/* <!-- Search Container End --> */}

                <Scrollbars style={{ height: height - 150 }}>
                    {
                        totalCount !== 0 && segments.length !== 0 ?
                            <InfiniteScroll
                                pageStart={0}
                                loadMore={() => getSegmentList((page - 1) * 10)}
                                hasMore={totalCount && totalCount > segments.length}
                                loader={<div style={{ display: 'flex', width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}
                                ><Spinner color="#075E54" /></div>}
                                useWindow={false}
                            >
                                <div className="group-chat-list">
                                    <ul className="group-chat-cards">
                                        {segments.map((item: any, index: number) =>
                                            <li key={index} onClick={() => _onSegmentClick(item)}>
                                                <a style={{ backgroundColor: clickedSegmentId === item.id ? '#e8f1fc' : '#FFF' }}>
                                                    <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#444', fontWeight: 'bold', textDecoration: 'none' }}>{item.name}</div>
                                                        <div className="stacked-images" >
                                                            {
                                                                item.contacts ?
                                                                    item.contacts.slice(0, 3).map((contact: any, index: any) =>
                                                                        !ValidateEmptyField(contact.profilePicture).isError ?
                                                                            <img key={index} src={contact.profilePicture} alt="Group Image" onError={(error: any) => error.target.src = require("../../assets/img/avatar_placeholder.png")} /> :
                                                                            <div key={index} className="blue">{`${contact.firstName}`.charAt(0).toUpperCase()}{`${contact.lastName}`.charAt(0).toUpperCase()}</div>
                                                                    ) :
                                                                    Array(item.contactsCount >= 3 ? 3 : item.contactsCount).fill(1).map(() =>
                                                                        <img src={require("../../assets/img/avatar_placeholder.png")} alt="Group Image" />)
                                                            }
                                                            {
                                                                item.contactsCount > 3 &&
                                                                <span className="plus">+{item.contactsCount - 3}</span>
                                                            }
                                                        </div>
                                                    </span>
                                                    {
                                                        true &&
                                                        <div className='timestamp' style={{ textAlign: 'left', fontSize: 10, marginTop: 10 }}>
                                                            Created by <i>{item.createdBy}</i> on {moment.utc(item.createdAt).local().format('MM/DD/YYYY')}
                                                        </div>
                                                    }
                                                </a>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </InfiniteScroll> :
                            <div style={{ height: height - 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {
                                    listLoading ?
                                        <Spinner color="#075E54" /> :
                                        <span style={{ width: '80%', textAlign: 'center', display: 'flex', alignItems: 'center', fontSize: 14, color: '#999', flexDirection: 'column' }}>
                                            <ErrorOutline style={{ fontSize: 80, marginRight: 5, marginBottom: 5, color: '#ddd' }} />
                                            Segments not found {searchedValue && `for with searched keyword "${searchedValue}"`}
                                        </span>
                                }
                            </div>
                    }
                </Scrollbars >
            </div >
            {/* <!-- Segments list end --> */}
            <Dialog
                title={"Enter Segment Name"}
                open={createSegmentDialog}
                onClose={() => {
                    setCreateSegmentDialog(false)
                    setSegmentName("")
                    setIsDialogBtnClick(false)
                }}
                loading={dialogLoading}
                onClick={() => {
                    setIsDialogBtnClick(true)
                    if (!ValidateEmptyField(segmentName).isError) {
                        props.switchSubTab("createSegment")
                        props.setClickedSegment({ name: segmentName })
                        setCreateSegmentDialog(false);
                        setClickedSegmentId(0);
                        navigate('/segments')
                        setSegmentName('')
                        setIsDialogBtnClick(false)
                    }
                }}
                DialogBody={() =>
                    <div>
                        <div className="field-wrapper" style={{ width: 350, marginBottom: 0 }}>
                            <input name='segmentName' onChange={(e) => setSegmentName(e.target.value)}
                                value={segmentName} disabled={dialogLoading} />
                            <div className="field-placeholder">Segment Name</div>
                            <div className='error'>{isDialogBtnClick && ValidateEmptyField(segmentName, "Segment Name").err}</div>
                        </div>
                    </div>
                }
                positiveBtnLabel={"Proceed to add contacts"}
            />
        </div >
    )
}
