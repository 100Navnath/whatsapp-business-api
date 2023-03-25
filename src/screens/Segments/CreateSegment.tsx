import React, { useState, useEffect } from 'react'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material';
import './segmentInfo.css'
import { DeleteOutline, EditOutlined } from '@material-ui/icons';
import { Button } from '@material-ui/core';
import { apiList } from '../../constant/apiList';
import { API } from '../../constant/network';
import Toast from '../../components/Toast/Toast';
import { getFromLocalStorage } from '../../components/LocalStorage/localStorage';
import { useNavigate } from 'react-router-dom';
import Grid from '../../components/Grid/Grid';
import ChatForm from '../Chat/ChatForm';
import { LoadingButton } from '@mui/lab';
import Spinner from '../../components/Loading/spinner';
import Scrollbars from 'react-custom-scrollbars';
import { ValidateEmptyField } from '../../components/validators';
import Dialog from '../../components/Dialog/Dialog';
import moment from 'moment';
import { gender } from '../../assets/dropdownData/gender';

interface CreateSegmentProps {
    thirdTab: string
    clickedSegment?: any
    setSegmentListAction: (action: any) => void
    switchSubTab: (tab: any) => void
    setClickedSegment: (obj: any) => void
}

export default function CreateSegment({ thirdTab, clickedSegment, setSegmentListAction, switchSubTab, setClickedSegment }: CreateSegmentProps) {
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
    const navigate = useNavigate();
    const { innerHeight: height, innerWidth: width } = window;

    const [segmentInfo, setSegmentInfo] = useState(clickedSegment);
    const [contacts, setContacts] = useState(Array);
    const [contactsListLoading, setContactsListLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState<Array<any>>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({});
    const take = 10;
    const [editSegmentDialog, setEditSegmentDialog] = useState(false);
    const [newSegmentName, setNewSegmentName] = useState("")
    const [isDialogBtnClicked, setIsDialogBtnClicked] = useState(false);
    const [dialogLoading, setDialogLoading] = useState(false)

    useEffect(() => {
        if (!(clickedSegment && clickedSegment.id)) {
            const arrayOfUrl = window.location.href.split('/');
            setSegmentInfo({ id: arrayOfUrl[arrayOfUrl.length - 1] });
            // getContactInfo();
        }
        getContacts(10, 0)
    }, [])

    useEffect(() => {
        setSegmentInfo(clickedSegment);
        getContacts(10, 0)
    }, [clickedSegment && clickedSegment.id])

    function onEditDialogClose() {
        setEditSegmentDialog(false)
        setNewSegmentName(`${segmentInfo.name}`)
        setIsDialogBtnClicked(false)
        setDialogLoading(false);
    }

    function onEditDialogConfirm() {
        setIsDialogBtnClicked(true)
        if (!ValidateEmptyField(newSegmentName).isError) {
            setSegmentInfo({ ...segmentInfo, name: newSegmentName })
            setEditSegmentDialog(false);
        }
    }

    async function getContacts(take: number, skip: number, searchValue = null) {
        try {
            setContactsListLoading(true)
            const arrayOfUrl = window.location.href.split('/');
            const userDetails = await getFromLocalStorage("user");
            if (!userDetails) {
                navigate("/");
                throw new Error("Log in required!!!");
            }
            const body = {
                id: arrayOfUrl[arrayOfUrl.length - 1],            // Segment id
                skip: skip,
                take: take,
                searchValue
            }
            const body2 = {
                userId: userDetails.currentuserId,
                businessId: userDetails.businessId,
                skip,
                take
            }
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.contactListForCreateSegment}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setContactsListLoading(false)
                        setContacts(res.data.contacts);
                        setTotalCount(res.data.count)
                        setPage(page + 1)
                    }
                }
            });
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    function createSegment() {
        try {
            const result = selectedRows.map(ele => true && { "id": ele.id });
            const body = {
                segmentName: segmentInfo.name,
                addContactInSegments: result    //Array of contact Id  i.e.[{ id:1 }]
            }
            if (result.length < 2) return Toast({ message: "Segment must have atleast 2 contacts", type: 'warning' })
            API.post(`${process.env.REACT_APP_BASE_API}${apiList.createSegment}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        navigate("/segments/" + res.data.id);
                        setClickedSegment({ id: res.data.id, name: segmentInfo.segmentName })
                        switchSubTab('segmentInfo');
                        Toast({ message: "Segment created successfully", type: 'success' });
                        setSegmentListAction({ action: 'reload' })
                        setNewSegmentName(body.segmentName)
                    }
                },
                error(err: any) {
                    if (err.response.data.message === "Segment name is already exits") setEditSegmentDialog(true)
                }
            });
        } catch (error) {
            Toast({ message: `${error}`, type: 'error' })
        }
    }

    return (
        <div className='segment-info-wrapper'>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className='page-title'>{`${segmentInfo.name}`}</div>
                {/* <div className="chat-actions">
                    <GridTooltip title={"Edit"} placement="bottom">
                        <Button onClick={() => { }} className='submit-button' variant="contained" style={{ marginRight: 10 }}>
                            <EditOutlined fontSize='small' />
                        </Button>
                    </GridTooltip>
                    <GridTooltip title={"Delete"} placement="bottom">
                        <Button className='delete-button' variant="contained" onClick={() => { }}>
                            <DeleteOutline fontSize='small' />
                        </Button>
                    </GridTooltip>
                </div> */}
            </div>
            <Scrollbars style={{ height: height - 140 }}>
                <Grid
                    data={contacts}
                    columns={[
                        { header: "Name", value: "name", width: 150 },
                        { header: "Contact", propertyName: "phoneNo", value: (column, index) => <span>{column.phoneNo}</span>, width: 150 },
                        { header: "Email", value: "email", width: 200, charLimit: 30 },
                        { header: "Gender", value: "gender", width: 150, columnSearch: { options: gender } },
                        { header: "D.O.B.", propertyName: "dob", value: (i) => <span>{i.dob ? moment(i.dob).format('MM/DD/YYYY') : 'NA'}</span>, width: 150 },
                        { header: "Secondary Contact", propertyName: "secondaryPhoneNo", value: (column, index) => <span>{column.secondaryPhoneNo ? `${column.countryCode} ${column.secondaryPhoneNo}` : 'NA'}</span>, width: 150 },
                    ]}
                    footer={true}
                    pagination={true}
                    rowsAtATimeSelector={true}
                    setSelectedRows={(rows: any) => {
                        setSelectedRows([...rows.filter((obj: any) => obj.isAssigned === true)]);
                    }}
                    selectedRecords={selectedRows}
                    loading={contactsListLoading}
                    rowsAtATime={10}
                    totalCount={totalCount}
                    onPageChange={(take: number, skip: number, searchValue: string) => getContacts(take, skip)}
                    onColumnSearch={(take: number, skip: number, searchValue: any) => getContacts(take, skip, searchValue)}
                    globalSearch={false}
                    columnSearch={true}
                    setFilters={function setFilters(f: object) {
                        setFilters(f)
                    }}
                    infiniteScroll={false}
                />
            </Scrollbars>
            <div style={{ display: 'flex', width: width - 500, justifyContent: 'flex-end', marginTop: 10 }}>
                <LoadingButton
                    loading={loading}
                    loadingIndicator={<Spinner />}
                    style={{ marginBottom: 10, backgroundColor: '#fe5044' }}
                    className='create-segment-button'
                    variant='contained'
                    onClick={() => {
                        switchSubTab(null);
                        setSelectedRows([]);
                        setSegmentInfo({ ...segmentInfo, segmentName: "" })
                    }}
                >
                    Cancel
                </LoadingButton>
                <LoadingButton
                    loading={loading}
                    loadingIndicator={<Spinner />}
                    disabled={selectedRows.length === 0}
                    style={{ marginBottom: 10 }}
                    className='create-segment-button'
                    variant='contained'
                    onClick={createSegment}
                >
                    <b>Add {selectedRows.length} contacts and create segment</b>
                </LoadingButton>
            </div>
            <Dialog
                title={"Edit Segment Name"}
                open={editSegmentDialog}
                onClose={onEditDialogClose}
                loading={dialogLoading}
                onClick={() => onEditDialogConfirm()}
                DialogBody={() =>
                    <div>
                        <div className="field-wrapper" style={{ width: 350, marginBottom: 0 }}>
                            <input name='segmentName' onChange={(e) => setNewSegmentName(e.target.value)}
                                value={newSegmentName} disabled={dialogLoading} />
                            <div className="field-placeholder">Segment Name</div>
                            <div className='error'>{isDialogBtnClicked && ValidateEmptyField(newSegmentName, "Segment Name").err}</div>
                        </div>
                    </div>}
                positiveBtnLabel={"Update"}
            />
        </div>
    )
}
