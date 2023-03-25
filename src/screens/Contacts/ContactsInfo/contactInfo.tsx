import { Button } from '@material-ui/core';
import { CameraAltOutlined, Close, CloudUpload, DeleteOutline, EditOutlined, Email, Home, Phone, Remove, Send, WhatsApp } from '@material-ui/icons';
import React, { useState, useEffect } from 'react';
import customer from '../../../assets/jsons/contacts/contactInfo.json';
import Dialog from '@mui/material/Dialog';
import './contact-info.css';
import { LoadingButton } from '@mui/lab';
import Spinner from '../../../components/Loading/spinner';
import { useNavigate } from 'react-router-dom';
import { API } from '../../../constant/network';
import contacts from '../../../assets/jsons/contacts/contactList.json';
import PhoneInput from 'react-phone-input-2';
import { ValidateDOB, ValidateEmail, ValidateName, ValidateNumber } from '../../../components/validators';
import { apiList } from '../../../constant/apiList';
import { getFromLocalStorage } from '../../../components/LocalStorage/localStorage';
import { toast } from 'react-toastify';
import Transition from '../../../components/Transition';
import Toggle from '../../../components/ToggleSwitch';
import Asterisk from '../../../components/Asterisk';
import Toast from '../../../components/Toast/Toast';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { UploadOutlined } from '@mui/icons-material';
import Skeleton from '@mui/material/Skeleton';
import moment from 'moment';
import Dropdown from '../../../components/Dropdown';
import { gender } from '../../../assets/dropdownData/gender';
import DatePicker from "react-datepicker";

interface contactInfoInterface {
    clickedContactId?: any
    setContactListAction: any
    setThirdTab: any
    setChatListAction: (prop: any) => void
}

export default function ContactInfo({ clickedContactId, setContactListAction, setThirdTab, setChatListAction }: contactInfoInterface) {
    const navigate = useNavigate()
    const { innerWidth: width, innerHeight: height } = window;
    const [contactInfo, setContactInfo] = useState(Object)
    const [newData, setNewData] = useState(Object);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [editContactDialog, setEditContactDialog] = useState(false);
    const [dialogLoading, setDialogLoading] = useState(false);
    const [isBtnClick, setIsBtnClick] = useState(false);
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<any>(undefined)
    // const [clickedContact, setClickedContact] = useState(clickedContactId); //clicked contact id
    const [removeProfileLoading, setRemoveProfileLoading] = useState(false);

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

    useEffect(() => {
        setNewData(contactInfo);
    }, [contactInfo])

    function closeEditContactDialog() {
        setEditContactDialog(false);
        setNewData(contactInfo);
    }

    function getContactInfo() {
        try {
            if (clickedContactId) {
                setLoading(true);
                API.get(`${process.env.REACT_APP_BASE_API}${apiList.getContactInfo}/${clickedContactId}`, {}, {})?.subscribe({
                    next(res: any) {
                        if (res.status === 200) {
                            setLoading(false);
                            setContactInfo(res.data);
                        }
                    },
                    error(err) {
                        setLoading(false);
                    },
                });
            }
        } catch (error: any) {
            setLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }

    useEffect(() => {
        console.log("clickedContactId", clickedContactId);

        // setClickedContact(clickedContactId);
        getContactInfo();
    }, [clickedContactId])

    useEffect(() => {
        if (!(clickedContactId && clickedContactId)) {
            const arrayOfUrl = window.location.href.split('/');
            clickedContactId = arrayOfUrl[arrayOfUrl.length - 1];
            setContactInfo({ ...contactInfo, id: arrayOfUrl[arrayOfUrl.length - 1] })
            getContactInfo();
        }
    }, [])

    function deleteContact() {
        try {
            const user = getFromLocalStorage("user");
            setDialogLoading(true);
            API.deleteApi(`${process.env.REACT_APP_BASE_API}${apiList.deleteContact}/${clickedContactId ? clickedContactId : contactInfo.id}`, { userId: user.currentuserId }, {})?.subscribe({
                next(res: any) {
                    if (res.status) {
                        // setTimeout(() => {
                        navigate('/contacts')
                        setContactListAction({ action: 'delete', data: contactInfo });
                        setDialogLoading(false);
                        setDeleteDialog(false);
                        setThirdTab(null);
                        Toast({ message: "Contact deleted successfully.", type: 'success' })
                        // }, 2000);
                    }
                },
                error(err) {
                    console.log(err);
                },
            });
        } catch (error: any) {
            setDialogLoading(false);
            setIsBtnClick(false);
            Toast({ message: error, type: 'error' })
        }
    }

    function editContact() {
        try {
            setIsBtnClick(true)
            if (
                !ValidateName(newData.firstName).isError &&
                !ValidateName(newData.lastName).isError &&
                !ValidateNumber(newData.phoneNo).isError &&
                (!newData.secondaryPhoneNo || !ValidateNumber(newData.secondaryPhoneNo).isError) &&
                (!newData.email || !ValidateEmail(newData.email).isError) &&
                (!newData.dob || !ValidateDOB(newData.dob).isError)
                // !ValidateDOB(newData.dob).isError
                // !ValidateEmail(newData.email).isError
            ) {
                const user = getFromLocalStorage("user")
                const countryCode = newData.countryCode.charAt(0) === "+" ? newData.countryCode : `+${newData.countryCode}`
                const body = {
                    id: clickedContactId,
                    userId: user.currentuserId,
                    businessId: user.businessId,
                    ...{ ...newData, countryCode },
                    dob: newData.dob ? moment(newData.dob).format('YYYY-MM-DD') : ""
                }
                setDialogLoading(true)
                API.put(`${process.env.REACT_APP_BASE_API}${apiList.editContact}`, body, {})?.subscribe({
                    next(res: any) {
                        if (res.status === 200) {
                            Toast({ message: "Contact updated successfully", type: 'success' });
                            setIsBtnClick(false)
                            // setTimeout(() => {
                            setContactInfo(newData);
                            setContactListAction({
                                action: 'edit', data:
                                    { firstName: newData.firstName, lastName: newData.lastName, countryCode: newData.countryCode, phoneNo: newData.phoneNo }
                            });
                            setDialogLoading(false);
                            closeEditContactDialog();
                            // }, 2000);
                        }
                    },
                    error(err) {
                        setIsBtnClick(false)
                        setDialogLoading(false)
                    },
                });
            }
        } catch (error: any) {
            setIsBtnClick(false)
            setDialogLoading(false);
            Toast({ message: error, type: 'error' })
            console.log(error);
        }
    }

    function markOptOut(isOptOut: boolean) {
        try {
            const user = getFromLocalStorage("user")
            const body = {
                isOptOut,
                customerId: clickedContactId ? clickedContactId : contactInfo.id ? contactInfo.id : Toast({ message: "Something went wrong", type: 'info' }),
                userId: user.currentuserId,
                businessId: user.businessId,
            }
            API.put(`${process.env.REACT_APP_BASE_API}${apiList.otpOutContact}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status) {
                        // setTimeout(() => {
                        setContactInfo({ ...contactInfo, optout: isOptOut });
                        setContactListAction({
                            action: 'edit', data:
                                { firstName: newData.firstName, lastName: newData.lastName, countryCode: newData.countryCode, phoneNo: newData.phoneNo, optout: isOptOut }
                        });
                        setDialogLoading(false);
                        closeEditContactDialog()
                        Toast({ message: `Opt ${body.isOptOut ? "out" : "in"} successfully`, type: 'success' })
                        // }, 2000);
                    }
                }
            });
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    async function uploadContactProfilePic(image: any) {
        try {
            if (image[0]) {
                const user = getFromLocalStorage("user");
                var bodyFormData = new FormData();
                bodyFormData.append('file', image[0]);
                Toast({ message: 'Uploading Profile picture', type: 'info' })
                API.post(`${process.env.REACT_APP_BASE_API}${apiList.uploadContactProfilePic}?customerId=${contactInfo.id}&userId=${user.currentuserId}`, bodyFormData, {})?.subscribe({
                    next(res: any) {
                        if (res.status === 200) {
                            setContactInfo({ ...contactInfo, profilePhoto: res.data.profileUrl })
                            setContactListAction({
                                action: 'edit', data:
                                    { ...contactInfo, profilePhoto: res.data.profileUrl }
                            });
                        }
                    }
                });
            }
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    async function removeProfile() {
        const user = await getFromLocalStorage('user');
        setRemoveProfileLoading(true);
        // setTimeout(() => {
        //     setRemoveProfileLoading(false)
        //     Toast({ message: 'Profile picture removed successfully', type: 'success' });
        //     setContactInfo({ ...contactInfo, profilePhoto: "" })
        // }, 1000);
        API.deleteApi(`${process.env.REACT_APP_BASE_API}${apiList.removeContactProfilePicture}`, { id: contactInfo.id }, {})?.subscribe({
            next(res: any) {
                if (res.status === 200) {
                    Toast({ message: 'Profile picture removed successfully', type: 'success' });
                    setRemoveProfileLoading(false);
                }
            },
            error(err) {
                setRemoveProfileLoading(false);
            },
        });
    }

    return (
        <div className='contact-info-wrapper' style={{ height: height - 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className='page-title'>Contact Information</div>
                <div className="chat-actions">
                    <GridTooltip title={"Edit"} placement="bottom">
                        <Button onClick={() => setEditContactDialog(true)} className='submit-button' variant="contained" style={{ marginRight: 10 }}>
                            <EditOutlined fontSize='small' />
                        </Button>
                    </GridTooltip>
                    <GridTooltip title={"Delete"} placement="bottom">
                        <Button className='delete-button' variant="contained" onClick={() => setDeleteDialog(true)}>
                            <DeleteOutline fontSize='small' />
                        </Button>
                    </GridTooltip>
                </div>
            </div>
            <div style={{ display: 'flex', marginTop: 20, flexDirection: 'column', alignItems: 'center' }}>
                {
                    contactInfo.firstName && !loading ?
                        <div className='contact-info-card'>
                            <div>
                                <div className="image">
                                    {
                                        contactInfo.profilePhoto ?
                                            <img src={contactInfo.profilePhoto} alt="Avatar" className="image" /> :
                                            <>
                                                {`${contactInfo.firstName}`.substring(0, 1).toUpperCase()}{`${contactInfo.lastName}`.substring(0, 1).toUpperCase()}
                                            </>
                                    }
                                    <span style={{ position: 'absolute', bottom: 5, right: 35, borderRadius: 100, color: '#075E54', backgroundColor: '#FFF', outlineWidth: 0 }}>
                                        <Popup contentStyle={{ width: 100 }} trigger={
                                            // <span style={{ backgroundColor: '#ddd' }}>
                                            <IconButton component="label" color="primary" style={{ position: 'absolute', bottom: 0, borderRadius: 100, padding: 3, color: '#075E54', backgroundColor: '#fff', outlineWidth: 0 }}>
                                                {
                                                    !contactInfo.profilePhoto &&
                                                    <input hidden accept="image/*" type="file" onChange={(e) => {
                                                        setImage(e.target.files)
                                                        uploadContactProfilePic(e.target.files)
                                                    }} />
                                                }
                                                <GridTooltip title={"Update profile picture"} placement="right">
                                                    <CameraAltOutlined style={{ fontSize: 14, borderRadius: 50 }} />
                                                </GridTooltip>
                                            </IconButton>
                                            // </span>
                                        } position="bottom center">
                                            <span style={{ display: 'flex', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-around' }}>
                                                <GridTooltip title={"Upload profile picture"} placement="bottom">
                                                    <IconButton component="label" style={{ color: '#075E54', padding: 5, outlineWidth: 0 }} color="primary">
                                                        <input hidden accept="image/*" type="file" onChange={(e) => {
                                                            setImage(e.target.files)
                                                            uploadContactProfilePic(e.target.files)
                                                        }} />
                                                        <EditOutlined style={{ fontSize: 14 }} />
                                                    </IconButton>
                                                </GridTooltip>
                                                <GridTooltip title={"Remove profile picture"} placement="bottom">
                                                    <IconButton
                                                        component="label" style={{ color: '#fe5044', padding: 5, outlineWidth: 0 }} color="primary"
                                                        onClick={removeProfile}
                                                    >
                                                        {
                                                            removeProfileLoading ?
                                                                <Spinner color='#075E54' /> :
                                                                <DeleteOutline style={{ fontSize: 16 }} />
                                                        }
                                                    </IconButton>
                                                </GridTooltip>
                                            </span>
                                        </Popup>
                                    </span>
                                </div>
                            </div>
                            <div className='container' style={{ marginLeft: 80 }}>
                                <div className='title'>Name<br />
                                    <span className='info'>{contactInfo.firstName} {contactInfo.lastName}</span>
                                </div>
                                <div className='title'>Contact<br />
                                    <span className='info'>
                                        {
                                            contactInfo.isWhatsAppNo &&
                                            <WhatsApp style={{ fontSize: 15, marginRight: 2, color: "#075E54" }} />
                                        }
                                        {contactInfo.countryCode}{contactInfo.phoneNo}
                                    </span>
                                </div>
                                <div className='title'>Gender<br />
                                    <span className='info'>
                                        {contactInfo.gender ? contactInfo.gender : "NA"}
                                    </span>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <Toggle checked={contactInfo.optout} onChange={(e) => markOptOut(e)} />
                                    <span className='toggle-label'>Opt Out</span>
                                </div>
                                {
                                    contactInfo.segments && contactInfo.segments.length > 0 &&
                                    <div className='title' style={{ marginTop: 20, flexWrap: "nowrap", marginBottom: 5 }}>This contact is added in these segments
                                        <div className='segments-container'>
                                            {/* {contactInfo.segments.map((i: any) => */}
                                            {contactInfo.segments.map((i: any) =>
                                                <div className='segment' onClick={() => {
                                                    navigate('/segments/' + i.id)
                                                }}>{i.segmentName}</div>
                                            )}
                                        </div>
                                        {/* :
                                            <div className='info'><b>NA</b></div> */}
                                    </div>
                                }
                            </div>
                            <div className='container'>
                                <div className='title'>Email<br />
                                    <span className='info'>{contactInfo.email ? contactInfo.email : "NA"}</span>
                                </div>
                                <div className='title'>Secondary Contact<br />
                                    <span className='info'>
                                        {
                                            contactInfo.secondaryPhoneNo ?
                                                `${contactInfo.countryCode}${contactInfo.secondaryPhoneNo}` : `NA`
                                        }
                                    </span>
                                </div>
                                <div className='title'>D.O.B.<br />
                                    <span className='info'>
                                        {
                                            contactInfo.dob ?
                                                moment(contactInfo.dob).format('MM/DD/YYYY') : `NA`
                                        }
                                    </span>
                                </div>
                                <LoadingButton
                                    variant="contained"
                                    size='small'
                                    loadingIndicator={<Spinner />}
                                    onClick={() => {
                                        navigate('/chats/' + contactInfo.id)
                                    }}
                                    className=""
                                    style={{ fontSize: 11, display: 'flex', alignItems: 'center', outlineWidth: 0, backgroundColor: '#075E54' }}
                                >
                                    Send Message <Send style={{ marginLeft: 5, fontSize: 15 }} fontSize='small' />
                                </LoadingButton>
                                {
                                    contactInfo.userassignlist && contactInfo.userassignlist.length > 0 &&
                                    <div className='title' style={{ marginTop: 20, flexWrap: "nowrap", marginBottom: 5 }}>Assigned To
                                        <div className='segments-container'>
                                            {contactInfo.userassignlist.map((i: any) =>
                                                <div className='segment'
                                                // onClick={() => navigate('/segments/' + i.id)}
                                                >
                                                    {i.userName}<br />
                                                    <span style={{ fontWeight: 'normal', fontSize: 10 }}>{i.userContact}</span>
                                                </div>

                                            )}
                                        </div>
                                    </div>
                                }
                            </div>
                        </div> :
                        <div className='contact-info-card'>
                            <Skeleton variant="circular" style={{ width: 100, height: 100 }} />
                            {
                                Array(2).fill(null).map(() =>
                                    <div className='container' style={{ marginLeft: 80 }}>
                                        {
                                            Array(4).fill(null).map(() =>
                                                <span className='title'>
                                                    <Skeleton className='title' variant="text" style={{ width: 100, marginBottom: 0 }} />
                                                    <Skeleton className='info' variant="text" style={{ width: 150 }} />
                                                </span>)
                                        }
                                    </div>)
                            }
                        </div>
                }
            </div>
            <Dialog
                open={deleteDialog}
                TransitionComponent={Transition}
                keepMounted
                // onClose={() => setDeleteDialog(false)}
                aria-describedby="alert-dialog-slide-description"
                transitionDuration={400}
            >
                <div className='dialog-wrapper' style={{ width: 'fit-content' }}>
                    <div className='dialog-title'>Confirm
                        <Close onClick={() => setDeleteDialog(false)} className='close-dialog' />
                    </div>
                    <div style={{ padding: 20 }}>
                        <div style={{ marginBottom: 20 }}>Are you sure you want to delete <b>{contactInfo.firstName} {contactInfo.lastName}</b>?</div>
                        <div style={{}}>
                            <Button variant="outlined" className='dialog-btn-danger' onClick={() => setDeleteDialog(false)}>Cancel</Button>
                            <LoadingButton
                                className='dialog-btn-positive'
                                loading={dialogLoading}
                                variant="contained"
                                size='small'
                                loadingIndicator={<Spinner />}
                                onClick={deleteContact}
                            >
                                {!dialogLoading && "Delete"}
                            </LoadingButton>
                        </div>
                    </div>
                </div>
            </Dialog >
            <Dialog
                open={editContactDialog}
                TransitionComponent={Transition}
                keepMounted
                // onClose={closeEditContactDialog}
                aria-describedby="alert-dialog-slide-description"
                transitionDuration={400}
            >
                <div className='dialog-wrapper' style={{ width: 'fit-content' }}>
                    <div className='dialog-title' style={{ marginBottom: 20 }}>Edit Contact
                        <Close onClick={closeEditContactDialog} className='close-dialog' />
                    </div>
                    <div style={{ flexDirection: 'row', padding: 10 }}>
                        <div style={{ display: 'flex' }}>
                            <div className="field-wrapper">
                                <input type="text" autoFocus={true} value={newData.firstName}
                                    onChange={(e: any) => setNewData({ ...newData, firstName: e.target.value })}
                                />
                                <div className="field-placeholder">First Name<Asterisk /></div>
                                <div className='error'>{isBtnClick && ValidateName(newData.firstName, "First name").err}</div>
                            </div>
                            <div className="field-wrapper">
                                <input type="text" autoFocus={true} value={newData.lastName}
                                    onChange={(e: any) => setNewData({ ...newData, lastName: e.target.value })} />
                                <div className="field-placeholder">Last Name<Asterisk /></div>
                                <div className='error'>{isBtnClick && ValidateName(newData.lastName, "Last name").err}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div className='margin-b-0'>
                                <div className="field-wrapper">
                                    <div className="field-placeholder">Phone number<Asterisk /></div>
                                    <PhoneInput
                                        containerStyle={{ width: 'fit-content', boxShadow: '0px 0px 0px 0px', fontFamily: 'Poppins', fontSize: 14, borderRadius: 5 }}
                                        country={'in'}
                                        searchPlaceholder='Search'
                                        searchStyle={{ fontFamily: 'Poppins', fontSize: 12, padding: 5 }}
                                        inputStyle={{ width: 200, fontFamily: 'Poppins', fontSize: 12, borderRadius: 5 }}
                                        value={`${newData.countryCode}${newData.phoneNo}`}
                                        countryCodeEditable={false}
                                        onChange={(number, obj: any) => setNewData({ ...newData, countryCode: `+${obj.dialCode}`, phoneNo: number.slice(obj.dialCode.length) })}
                                        enableSearch={true}
                                        disabled={true}
                                    />
                                    <div className='error'>{isBtnClick && ValidateNumber(newData.phoneNo, "Phone number").err}</div>
                                </div>
                                {/* <div className="checkbox-wrapper" style={{ marginLeft: 10, marginTop: 5, marginBottom: 20 }}>
                                    <input className='input-checkbox' checked={newData.isWhatsAppNo} type="checkbox" disabled={loading}
                                        onChange={(e) => setNewData({ ...newData, isWhatsAppNo: e.target.checked })} />
                                    <div className="field-placeholder">Is Whatsapp number?</div>
                                </div> */}
                            </div>
                            <div className="field-wrapper" style={{ marginBottom: 0 }}>
                                <div className="field-placeholder">Email</div>
                                <input type="text" autoFocus={true} value={newData.email}
                                    onChange={(e: any) => setNewData({ ...newData, email: e.target.value })} />
                                <div className='error'>{isBtnClick && newData.email && ValidateEmail(newData.email, "Email").err}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div className="field-wrapper mobile-input">
                                <input type="text" value={newData.secondaryPhoneNo}
                                    onChange={(e: any) => setNewData({ ...newData, secondaryPhoneNo: e.target.value })} />
                                <div className="field-placeholder">Secondary Number</div>
                                {/* <div className='error'>{isBtnClick && ValidateNumber(newData.secondaryPhoneNo, "Email").err}</div> */}
                            </div>
                            <Dropdown
                                options={gender}
                                title="Gender"
                                styles={{ marginTop: 10 }}
                                defaultValue={newData.gender}
                                scrollbarHeight={150}
                                onChange={function (e: any) {
                                    setNewData({ ...newData, gender: e });
                                }}
                                disabled={loading}
                            />
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div className="field-wrapper mobile-input">
                                {/* <input type="date" value={moment(newData.dob).format('YYYY-MM-DD')} disabled={loading} maxLength={15}
                                    onChange={(e) => setNewData({ ...newData, dob: e.target.value })} /> */}
                                <DatePicker
                                    selected={newData.dob ? new Date(newData.dob) : undefined}
                                    onChange={(date: any) => {
                                        if (date) setNewData({ ...newData, dob: date })
                                        else setNewData({ ...newData, dob: '' })
                                    }}
                                    showPopperArrow={true}
                                    // endDate={new Date()}
                                    maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 16))}
                                    minDate={new Date('01/01/1900')}
                                    placeholderText='MM/DD/YYYY'
                                />
                                <div className="field-placeholder">D.O.B.</div>
                                <div className='error'>{isBtnClick && newData.dob && ValidateDOB(newData.dob, 'D.O.B.').err}</div>
                            </div>
                        </div>
                    </div>
                    <div className="dialog-action-buttons">
                        <LoadingButton
                            className='dialog-btn-positive'
                            loading={dialogLoading}
                            variant="contained"
                            size='small'
                            loadingIndicator={<Spinner />}
                            onClick={editContact}
                        >
                            {!dialogLoading && "Save"}
                        </LoadingButton>
                        <Button variant="outlined" className='dialog-btn-danger' onClick={closeEditContactDialog}>Discard</Button>
                    </div>
                </div>
            </Dialog>
        </div >
    )
}
