import { ArrowUpward, AttachMoneyOutlined, CallOutlined, CameraAltOutlined, CameraOutlined, Close, DeleteOutline, EditOutlined, Remove, WhatsApp } from '@material-ui/icons'
import React, { useState, useEffect } from 'react'
import agents from '../../../assets/jsons/agents.json'
// import agentsKpi from '../../../assets/jsons/analytics/kpis.json'
import Pie from '../../../components/Pie'
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import Dialog from '@mui/material/Dialog';
import './profile.css'
import Asterisk from '../../../components/Asterisk';
import { getFromLocalStorage, setLocalStorage } from '../../../components/LocalStorage/localStorage';
import { ValidateDOB, ValidateEmail, ValidateEmptyField, ValidateName, ValidateNumber } from '../../../components/validators';
import PhoneInput from 'react-phone-input-2';
import LoadingButton from '@mui/lab/LoadingButton';
import Spinner from '../../../components/Loading/spinner';
import LineChart from '../../../components/LineChart';
import { apiList } from '../../../constant/apiList';
import { API } from '../../../constant/network';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Toggle from '../../../components/ToggleSwitch';
import Toast from '../../../components/Toast/Toast';
import Kpi from '../../../components/KPI';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { CameraOutdoor, UploadOutlined } from '@mui/icons-material';
import { gender } from '../../../assets/dropdownData/gender';
import Dropdown from '../../../components/Dropdown';
import moment from 'moment';
import DatePicker from "react-datepicker";
import MaskedTextInput from "react-text-mask";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="down" ref={ref} {...props} />;
});
export default function Profile() {
    const [agentInfo, setAgentInfo] = useState<any>(Object);
    const [userAnalytics, setUserAnalytics] = useState<{ messages: any }>(
        {
            messages: {}
        });
    const [kpiData, setKpiData] = useState<any>({
        credits: {
            count: 0,
            percent: 0,
            progress: []
        },
        numbers: {
            count: 0,
            percent: 0,
            progress: []
        }
    })
    const [newData, setNewData] = useState(Object);

    useEffect(() => {
        setNewData(agentInfo)
    }, [agentInfo])

    const [editContactDialog, setEditContactDialog] = useState(false);
    const [loading, setLoading] = useState(false)
    const [isBtnClick, setIsBtnClick] = useState(false)
    const options = [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' }
    ];
    const [image, setImage] = useState<any>(undefined);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [removeProfileLoading, setRemoveProfileLoading] = useState(false);

    async function getDetailsFromLocalStorage() {
        const agent = await getFromLocalStorage("user");
        setAgentInfo(agent);
        getProfileDetails()
    }

    async function getUserAnalytics() {
        try {
            const agent = await getFromLocalStorage("user");
            const body = {
                currentuserId: agent.currentuserId,
                businessId: agent.businessId
            }
            console.log("body of getUserAnalytics : ", body);
            setAnalyticsLoading(true);
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.getAgentsAnalytics}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setLoading(false);
                        setUserAnalytics({
                            ...userAnalytics,
                            "messages": res.data
                        });
                        setAnalyticsLoading(false);
                    }
                },
                error(err) {
                    setAnalyticsLoading(false);
                },
            });
        } catch (error: any) {
            setAnalyticsLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }

    async function getProfileKpi() {
        try {
            const agent = await getFromLocalStorage("user");
            const body = {
                userId: agent.currentuserId,
                businessId: agent.businessId
            }
            // console.log("body of getUserAnalytics : ", body);
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.profileKpi}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setLoading(false);
                        if (Object.keys(res.data).length !== 0) setKpiData(res.data);
                    }
                },
                error(err) {
                    setLoading(false);
                },
            });
        } catch (error: any) {
            setLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }

    function muteNotifications(value: any) {
        try {
            const body = { userId: agentInfo.currentuserId, isMute: value }
            console.log("muteNotifications body : ", body, typeof agentInfo.currentuserId);

            API.put(`${process.env.REACT_APP_BASE_API}${apiList.agentMuteNotification}`, body, { "content-type": "application/json", "Accept": "*/*" })?.subscribe({
                next(res: any) {
                    console.log("res : ", res);
                    if (res.status === 200) {
                        setAgentInfo({ ...agentInfo, isMute: value });
                        setLocalStorage("user", { ...agentInfo, isMute: value });
                    }
                }
            });
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    async function uploadProfilePicture(file: any) {
        try {
            Toast({ message: 'Uploading profile picture', type: 'info' })
            const user = await getFromLocalStorage('user');
            var bodyFormData = new FormData();
            bodyFormData.append('file', file[0]);
            console.log("file : ", file);
            API.post(`${process.env.REACT_APP_BASE_API}${apiList.uploadProfilePicture}?currentuserId=${user.currentuserId}`, bodyFormData, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setAgentInfo({ ...agentInfo, profileUrl: res.data.profileUrl })
                        setLocalStorage("user", { ...user, profileUrl: res.data.profileUrl })
                        Toast({ message: "Profile updated successfully", type: 'success' })
                    };
                }
            });
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    async function getProfileDetails() {
        const agent = await getFromLocalStorage("user");
        const body = {
            userId: agent.currentuserId,
        }
        API.get(`${process.env.REACT_APP_BASE_API}${apiList.getProfile}/${agent.currentuserId}`, {}, {})?.subscribe({
            next(res: any) {
                if (res.status === 200) {
                    setAgentInfo({ ...agentInfo, ...agent, department: res.data.department, designation: res.data.designation });
                }
            },
        });
    }

    useEffect(() => {
        getDetailsFromLocalStorage();
        getUserAnalytics();
        getProfileKpi();
    }, [])

    function closeEditContactDialog() {
        setNewData({ ...agentInfo });
        setEditContactDialog(false)
    }

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

    function onEditContact() {
        setEditContactDialog(true);
    }

    const analytics = {
        totalSmsSent: '53.4K',
        totalSmsReceived: '104.3K',
        totalSmsFaild: '2.7K',
        totalUsers: '568',
        totalContacts: '39',
        totalCreditsUsed: '237K',
        totalNumbersUsed: '25'
    }

    function editProfile() {
        try {
            setLoading(true)
            const body = {
                userId: newData.currentuserId,
                firstName: newData.firstName,
                lastName: newData.lastName,
                phoneNo: newData.phoneNo,
                email: newData.email,
                isWhatsAppNo: newData.isWhatsappNo,
                departmentName: newData.department,
                designationName: newData.designation,
                gender: newData.gender,
                dob: newData.dob,
                roleName: newData.role
            }
            console.log("body : ", body);

            setIsBtnClick(true);
            if (
                !ValidateName(newData.firstName).isError &&
                !ValidateName(newData.lastName).isError &&
                !ValidateNumber(newData.phoneNo).isError &&
                !ValidateEmail(newData.email).isError &&
                !ValidateEmptyField(newData.department).isError &&
                !ValidateEmptyField(newData.designation).isError &&
                !ValidateEmptyField(newData.gender).isError &&
                !ValidateDOB(newData.dob).isError
            ) {

                API.put(`${process.env.REACT_APP_BASE_API}${apiList.editProfile}`, body, {})?.subscribe({
                    next(res: any) {
                        if (res.status === 200) {
                            // setTimeout(() => {
                            Toast({ message: 'Profile updated successfully', type: 'success' });
                            setLoading(false);
                            setLocalStorage("user", newData);
                            setAgentInfo(newData)
                            closeEditContactDialog();
                            setIsBtnClick(false);
                            // }, 2000);
                        }
                    },
                    error(err) {
                        setIsBtnClick(false);
                        setLoading(false);
                    },
                });
            } else setLoading(false)
        } catch (error: any) {
            setIsBtnClick(false);
            Toast({ message: error, type: 'error' })
        }
    }

    async function removeProfile() {
        const user = await getFromLocalStorage('user');
        setRemoveProfileLoading(true);
        API.deleteApi(`${process.env.REACT_APP_BASE_API}${apiList.removeUserProfilePicture}`, {}, {})?.subscribe({
            next(res: any) {
                if (res.status === 200) {
                    Toast({ message: 'Profile picture removed successfully', type: 'success' });
                    setLocalStorage("user", { ...user, profileUrl: "" });
                    setAgentInfo({ ...agentInfo, profileUrl: "" })
                    setRemoveProfileLoading(false);
                }
            },
            error(err) {
                setRemoveProfileLoading(false);
            },
        });
    }

    return (
        <div className='get-number-wrapper'>
            <div className='settings-title'>Profile</div>
            <div className='cards-container'>
                <div className="card">
                    {
                        agentInfo &&
                        <div className="card-header personal-details-card-header">
                            Personal Details
                            <Button onClick={onEditContact} className='edit-btn-wrapper' variant="outlined" size='small' endIcon={<EditOutlined style={{ color: "#075E54" }} />}>
                                Edit
                            </Button>
                        </div>
                    }
                    {
                        agentInfo &&
                        <div className="personal-details-card-body">
                            <div className="container">
                                <div className="image">
                                    {
                                        agentInfo.profileUrl ?
                                            <img src={agentInfo.profileUrl} alt="Avatar" className="image" /> :
                                            <>
                                                {`${agentInfo.firstName}`.substring(0, 1).toUpperCase()}{`${agentInfo.lastName}`.substring(0, 1).toUpperCase()}
                                            </>
                                    }
                                    <span className='profile-edit-icon'>
                                        <Popup contentStyle={{ width: 100 }} trigger={
                                            <IconButton component="label" color="primary" style={{ position: 'absolute', bottom: 0, borderRadius: 100, padding: 3, color: '#075E54', backgroundColor: '#FFF', outlineWidth: 0 }}>
                                                {
                                                    !agentInfo.profileUrl &&
                                                    <input hidden accept="image/*" type="file" onChange={(e) => {
                                                        setImage(e.target.files)
                                                        uploadProfilePicture(e.target.files)
                                                    }} />}
                                                <GridTooltip title={"Update profile picture"} placement="right">
                                                    <CameraAltOutlined style={{ fontSize: 14 }} />
                                                </GridTooltip>
                                            </IconButton>
                                        } position="bottom center">
                                            <span className='profile-pic-popup-content'>
                                                <GridTooltip title={"Upload profile picture"} placement="bottom">
                                                    <IconButton className='popup-btn' component="label" color="primary">
                                                        <input hidden accept="image/*" type="file" onChange={(e) => {
                                                            setImage(e.target.files)
                                                            uploadProfilePicture(e.target.files)
                                                        }} />
                                                        <UploadOutlined style={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </GridTooltip>
                                                <GridTooltip title={"Remove profile picture"} placement="bottom">
                                                    <IconButton component="label" className='popup-btn' color="primary"
                                                        onClick={removeProfile}
                                                    >
                                                        {
                                                            removeProfileLoading ?
                                                                <Spinner color='#075E54' /> :
                                                                <DeleteOutline style={{ fontSize: 16, color: '#fe5044' }} />
                                                        }
                                                    </IconButton>
                                                </GridTooltip>
                                            </span>
                                        </Popup>
                                    </span>
                                </div>
                            </div>
                            <div className='info-container'>
                                <div className='column'>
                                    <div className='title'>Name<br />
                                        <span className='info'>{agentInfo.firstName} {agentInfo.lastName}</span>
                                    </div>
                                    <div className='title'>Contact<br />
                                        <span className='info'>
                                            {
                                                agentInfo.isWhatsappNo &&
                                                <WhatsApp style={{ fontSize: 15, marginRight: 2, color: "#28a745" }} />
                                            }
                                            {agentInfo.countryCode} {agentInfo.phoneNo}
                                        </span>
                                    </div>
                                    <div className='title'>Email<br />
                                        <span className='info'>{agentInfo.email}</span>
                                    </div>
                                    <div className='title'>Gender<br />
                                        <span className='info'>{agentInfo.gender ? agentInfo.gender : "NA"}</span>
                                    </div>
                                </div>
                                <div className='column'>
                                    <div className='title'>Department<br />
                                        <span className='info'>{agentInfo.department ? agentInfo.department : "NA"}</span>
                                    </div>
                                    <div className='title'>Designation<br />
                                        <span className='info'>{agentInfo.designation ? agentInfo.designation : "NA"}</span>
                                    </div>
                                    <div className='title'>Role<br />
                                        <span className='info'>{agentInfo.role}</span>
                                    </div>
                                    <div className='title'>D.O.B.<br />
                                        <span className='info'>{agentInfo.dob ? moment(agentInfo.dob).format('MM/DD/YYYY') : "NA"}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', marginLeft: 10 }}>
                                {typeof agentInfo?.isMute === 'boolean' && <Toggle checked={agentInfo?.isMute} onChange={(e) => muteNotifications(e)} />}
                                <span className='toggle-label'>Mute all notifications</span>
                            </div>
                        </div>
                    }
                </div>
                <div className="card pie-chart-card">
                    <span className="card-header">Messages</span>
                    <div className="card-body body">
                        <div>
                            <div className='indicator-wrapper'>
                                <div className='indicator-box blue'></div>
                                <div className='item-title'>Sent({userAnalytics?.messages?.sent ? userAnalytics?.messages?.sent : 0})</div>
                            </div>
                            <div className='indicator-wrapper'>
                                <div className='indicator-box green'></div>
                                <div className='item-title'>Received({userAnalytics?.messages?.received ? userAnalytics?.messages?.received : 0})</div>
                            </div>
                            <div className='indicator-wrapper'>
                                <div className='indicator-box red'></div>
                                <div className='item-title'>Failed({userAnalytics?.messages?.failed ? userAnalytics?.messages?.failed : 0})</div>
                            </div>
                        </div>
                        <Pie data={userAnalytics.messages} loading={analyticsLoading} />
                    </div>
                </div>
                <div>
                    {
                        kpiData.credits &&
                        <Kpi
                            title='Credit Used'
                            data={kpiData.credits}
                            PrimaryIcon={<AttachMoneyOutlined className='primary-icon' />}
                            tooltip={
                                kpiData.credits.percent !== undefined && kpiData.credits.percent >= 0 ?
                                    `% growth in credits used since last month` :
                                    `% decrement in credits used since last month.`
                            }
                        />
                    }
                    {
                        kpiData.numbers &&
                        <Kpi
                            title='Numbers Used'
                            style={{ marginTop: 15 }}
                            data={kpiData.numbers}
                            PrimaryIcon={<CallOutlined className='primary-icon' />}
                            tooltip={
                                kpiData.numbers.percent !== undefined && kpiData.numbers.percent >= 0 ?
                                    `% growth in credits used since last month` :
                                    `% decrement in credits used since last month.`
                            }
                        />
                    }
                </div>
            </div>

            <Dialog
                open={editContactDialog}
                TransitionComponent={Transition}
                keepMounted
                // onClose={closeEditContactDialog}
                aria-describedby="alert-dialog-slide-description"
                transitionDuration={400}
            >
                <div className='dialog-wrapper width-fit'>
                    <div className='dialog-title'>
                        <span>Edit Profile</span>
                        <Close
                            style={{ backgroundColor: 'red', color: '#FFF', borderRadius: 5, fontSize: 20, padding: 2, alignSelf: 'center' }}
                            onClick={closeEditContactDialog}
                        />
                    </div>
                    <div style={{ flexDirection: 'row', padding: 20 }}>
                        <div style={{ display: 'flex' }}>
                            <div className="field-wrapper">
                                <div className="field-placeholder">First Name<Asterisk /></div>
                                <input type="text" autoFocus={true} defaultValue={newData.firstName} disabled={loading} maxLength={15}
                                    onChange={(e) => setNewData({ ...newData, firstName: e.target.value })}
                                    onKeyUp={(e: any) => (e.keyCode === 8 || e.keyCode === 46) && setNewData({ ...newData, firstName: e.target.value })}
                                />
                                <div className='error'>{isBtnClick && ValidateName(newData.firstName, "First name").err}</div>
                            </div>
                            <div className="field-wrapper">
                                <div className="field-placeholder">Last Name<Asterisk /></div>
                                <input type="text" autoFocus={true} defaultValue={newData.lastName} disabled={loading} maxLength={15}
                                    onChange={(e) => setNewData({ ...newData, lastName: e.target.value })}
                                    onKeyUp={(e: any) => (e.keyCode === 8 || e.keyCode === 46) && setNewData({ ...newData, lastName: e.target.value })}
                                />
                                <div className='error'>{isBtnClick && ValidateName(newData.lastName, "Last Name").err}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div className='margin-b-0'>
                                <div className="field-wrapper" style={{ marginBottom: 0 }}>
                                    <div className="field-placeholder">Phone number<Asterisk /></div>
                                    <PhoneInput
                                        dropdownStyle={{ height: 150, fontSize: 12 }}
                                        containerStyle={{ width: 'fit-content', boxShadow: '0px 0px 0px 0px', fontFamily: 'Poppins', fontSize: 14, borderRadius: 5 }}
                                        country={'in'}
                                        searchPlaceholder="Search"
                                        inputStyle={{ width: 200, fontFamily: 'Poppins', fontSize: 12, borderRadius: 5 }}
                                        value={`${newData.countryCode}${newData.phoneNo}`}
                                        countryCodeEditable={false}
                                        onChange={(number, obj: any) => setNewData({ ...newData, countryCode: `+${obj.dialCode}`, phoneNo: number.slice(obj.dialCode.length) })}
                                        enableSearch={true}
                                        disabled={true}
                                    />
                                    <div className='error'>{isBtnClick && ValidateNumber(newData.phoneNo, "Phone number").err}</div>
                                </div>
                                <div className="checkbox-wrapper" style={{ marginLeft: 10, marginTop: 5, marginBottom: 20 }}>
                                    <input className='input-checkbox' type="checkbox" disabled={loading} checked={newData.isWhatsappNo}
                                        onChange={(e) => setNewData({ ...newData, isWhatsappNo: e.target.checked })} />
                                    <div className="field-placeholder">Is Whatsapp Number?</div>
                                </div>
                            </div>
                            <div className="field-wrapper">
                                <div className="field-placeholder">Email<Asterisk /></div>
                                <input type="text" autoFocus={true} defaultValue={newData.email} disabled={true}
                                    onChange={(e) => setNewData({ ...newData, email: e.target.value })} />
                                <div className='error'>{isBtnClick && ValidateEmail(newData.email, "Email").err}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div className="field-wrapper">
                                {/* <input type="date" value={newData.dob ? moment(newData.dob).format('YYYY-MM-DD') : ""} disabled={loading} maxLength={15}
                                    onChange={(e) => setNewData({ ...newData, dob: e.target.value })} /> */}
                                <div className="field-placeholder" style={{ zIndex: 1 }}>Date Of Birth<Asterisk /></div>
                                <DatePicker
                                    selected={newData.dob ? new Date(newData.dob) : undefined}
                                    onChange={(date: any) => {
                                        if (date) setNewData({ ...newData, dob: date })
                                        else setNewData({ ...newData, dob: '' })
                                    }}
                                    onChangeRaw={(e: any) => {
                                        // setNewData({ ...newData, dob: e })
                                    }}
                                    showPopperArrow={true}
                                    // endDate={new Date()}
                                    maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 16))}
                                    minDate={new Date('01/01/1900')}
                                    placeholderText='MM/DD/YYYY'
                                    customInput={
                                        <MaskedTextInput
                                            type="text"
                                            mask={[/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/]}
                                        />
                                    }
                                />
                                <div className='error'>{isBtnClick && ValidateDOB(newData.dob, "D.O.B").err}</div>
                            </div>
                            <Dropdown
                                options={gender}
                                title="Gender"
                                styles={{ marginTop: 10, marginLeft: 15 }}
                                defaultValue={newData.gender}
                                scrollbarHeight={150}
                                onChange={function (e: any) {
                                    setNewData({ ...newData, gender: e });
                                }}
                                disabled={loading}
                                scrollAfterOptions={3}
                                mandatory={true}
                                err={isBtnClick && ValidateEmptyField(newData.gender, "Gender").err}
                            />
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div className="field-wrapper" style={{ marginTop: 0, height: 40, top: -12 }}>
                                <div className="field-placeholder" style={{ position: 'relative', top: 12, zIndex: 'auto' }}>Department<Asterisk /></div>
                                <input type="text" autoFocus={true} defaultValue={newData.department} disabled={loading} maxLength={15}
                                    onChange={(e) => setNewData({ ...newData, department: e.target.value })}
                                    onKeyUp={(e: any) => (e.keyCode === 8 || e.keyCode === 46) && setNewData({ ...newData, department: e.target.value })}
                                />
                                <div className='error'>{isBtnClick && ValidateEmptyField(newData.department, "Department").err}</div>
                            </div>
                            <div className="field-wrapper" style={{ marginTop: 0, height: 40, top: -12 }}>
                                <div className="field-placeholder" style={{ position: 'relative', top: 12, zIndex: 'auto' }}>Designation<Asterisk /></div>
                                <input type="text" defaultValue={newData.designation} disabled={loading} maxLength={15}
                                    onChange={(e) => setNewData({ ...newData, designation: e.target.value })}
                                    onKeyUp={(e: any) => (e.keyCode === 8 || e.keyCode === 46) && setNewData({ ...newData, designation: e.target.value })}
                                />
                                <div className='error'>{isBtnClick && ValidateEmptyField(newData.designation, "Designation").err}</div>
                            </div>
                        </div>
                        <div className="dialog-action-buttons" style={{ marginTop: 0 }}>
                            <LoadingButton
                                loading={loading}
                                variant="contained"
                                size='small'
                                loadingIndicator={<Spinner />}
                                onClick={editProfile}
                                className='dialog-btn-positive'
                            >
                                {!loading && "Save"}
                            </LoadingButton>
                            <Button variant="outlined" className='dialog-btn-danger' onClick={closeEditContactDialog}>Discard</Button>
                        </div>
                    </div>
                </div>
            </Dialog>

        </div >
    )
}
