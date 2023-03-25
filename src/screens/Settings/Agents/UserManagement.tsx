import React, { useState, useEffect } from 'react'
import { AnimatedList } from 'react-animated-list'
import agents from '../../../assets/jsons/userManagement/agents.json'
import numbersJson from '../../../assets/jsons/numberMngmt/numbers.json'
import { TransitionProps } from '@mui/material/transitions';
import Slide from '@mui/material/Slide';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { AddIcCall, ArrowDownwardOutlined, Close, EditOutlined, ExpandMore, PersonAddOutlined, PersonOutline } from '@material-ui/icons';
import { styled, Checkbox } from '@mui/material';
import { PersonOffOutlined, PersonRemoveAlt1Outlined } from '@mui/icons-material';
import './userMngmt.css'
import { Button } from '@material-ui/core';
import Dialog from '@mui/material/Dialog';
import Scrollbars from 'react-custom-scrollbars';
import Grid from '../../../components/Grid/Grid';
import Asterisk from '../../../components/Asterisk';
import { API } from '../../../constant/network';
import { apiList } from '../../../constant/apiList';
import PhoneInput from 'react-phone-input-2';
import { ValidateDOB, ValidateEmail, ValidateEmptyField, ValidateName, ValidateNumber, ValidateText } from '../../../components/validators';
import Dropdown from '../../../components/Dropdown';
import LoadingButton from '@mui/lab/LoadingButton';
import Spinner from '../../../components/Loading/spinner';
import { getFromLocalStorage } from '../../../components/LocalStorage/localStorage';
import Toast from '../../../components/Toast/Toast';
import { gender } from '../../../assets/dropdownData/gender';
import moment from 'moment';
import { log } from 'console';
import Popup from 'reactjs-popup';
import IconButton from '@mui/material/IconButton';
import DatePicker from "react-datepicker";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="down" ref={ref} {...props} />;
});
const { innerWidth: width, innerHeight: height } = window;

export default function UserManagement() {
    const [users, setUsers] = useState<Array<any>>(Array);
    const [totalCount, setTotalCount] = useState(undefined);
    const [numbers, setNumbers] = useState<Array<any>>([]);
    const [dialogTitle, setDialogTitle] = useState('')
    const [isBtnClick, setIsBtnClick] = useState(false)
    const [addUserDialog, setAddUserDialog] = useState(false);
    const [removeUserDialog, setRemoveUserDialog] = useState(false);
    const [disableUserDialog, setDisableUserDialog] = useState(false);
    const [assignNumberDialog, setAssignNumberDialog] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(Object)
    const [clickedRow, setClickedRow] = useState<any>({ countryCode: "91" })
    const [loading, setLoading] = useState(false);
    const [submitAssignLoading, setSubmitAssignLoading] = useState(false);
    const [assignDialogDataLoading, setAssignDialogDataLoading] = useState(false)
    const options = [
        { value: 1, label: 'Admin' },
        { value: 2, label: 'User' },
    ];
    const [totalNumbersCount, setTotalNumbersCount] = useState(undefined);
    const [selected, setSelected] = useState<Array<any>>([]);
    const [showAssginedTo, setShowAssginedTo] = useState(-1);
    // const [gridSearch, setGridSearch] = useState(String)
    const [editUserLoading, setEditUserLoading] = useState(false);

    useEffect(() => {
        async function getUserDetailsFromLocalStorage() {
            const userDetails = await getFromLocalStorage("user");
            setLoggedInUser(userDetails);
        }
        getUserDetailsFromLocalStorage()
        getUsers(10, 0, "")
    }, [])


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

    function _setSelectedRows(rows: any) {
        setSelected(rows);
    }

    function openAddUserDialog() {
        setDialogTitle("Add User");
        setClickedRow({ countryCode: '91', dob: '' });
        setAddUserDialog(true)
    }
    function openRemoveUserDialog(index: number) {
        setClickedRow(users[index]);
        setRemoveUserDialog(true)
    }
    function openDisableUserDialog(index: number) {
        setClickedRow(users[index]);
        setDisableUserDialog(true);
    }

    function getNumbers(take: number, skip: number, searchValue: string, userId?: number) {
        try {
            if (clickedRow.userId || userId) {
                setAssignDialogDataLoading(true)
                const user = getFromLocalStorage("user");
                const _userId = userId ? userId : clickedRow.userId
                console.log("searchValue : ", searchValue);
                const body = { businessId: user.businessId, skip, take, userId: _userId }
                if (!searchValue) {
                    API.get(`${process.env.REACT_APP_BASE_API}${apiList.getNumbers}`, body, {})?.subscribe({
                        next(res: any) {
                            if (res.status === 200) {
                                if (res.data.lstAssignedNumber.length > 0) {
                                    setNumbers([...res.data.lstAssignedNumber]);
                                    setSelected([...selected, ...res.data.lstAssignedNumber]);
                                    setTotalNumbersCount(res.data.count);
                                }
                                setAssignDialogDataLoading(false);

                            }
                        },
                        error(err) {
                            setAssignDialogDataLoading(false)
                            console.log(err);
                        },
                    })
                } else {
                    API.get(`${process.env.REACT_APP_BASE_API}${apiList.getNumbers}`, { ...body, searchValue }, {})?.subscribe({
                        next(res: any) {
                            if (res.status === 200) {
                                setNumbers([...res.data.lstAssignedNumber]);
                                setTotalNumbersCount(res.data.count);
                                setAssignDialogDataLoading(false);
                                setSelected([...selected, ...res.data.lstAssignedNumber])
                            }
                        },
                        error(err) {
                            setAssignDialogDataLoading(false)
                            console.log(err);
                        },
                    });
                }
            }
        } catch (error: any) {
            setAssignDialogDataLoading(false);
            Toast({ message: error, type: 'error' })
            console.log(error);
        }
    }

    function openAssignDialog(index: number) {
        setAssignNumberDialog(true);
        setClickedRow(users[index]);
        setNumbers([]);
        setSelected([]);
        getNumbers(10, 0, "", users[index].userId)
    }

    function closeAddUserDialog() {
        setIsBtnClick(false)
        setAddUserDialog(false)
        setClickedRow(
            {
                "firstName": "",
                "lastName": "",
                "userName": "",
                "countryCode": "91",
                "phoneNumber": "",
                "departmentName": "",
                "roleId": 2,
                "designationName": "",
                dob: ""
            }
        );
    }
    function closeRemoveUserDialog() { setRemoveUserDialog(false) }
    function closeDisableUserDialog() { setDisableUserDialog(false) }
    function closeAssignDialog() { setAssignNumberDialog(false) }

    const [checkedRows, setCheckedRows] = useState<{ id: number; name: string }[]>([]);

    function onRowClick({ item }: { item: any }) {
        let isChecked = false
        for (let i = 0; i < checkedRows.length; i++) {
            if (checkedRows[i].id === item.id) {
                isChecked = true
            }
        }
        if (isChecked) setCheckedRows(checkedRows.filter((obj) => obj.id !== item.id));
        else setCheckedRows([...checkedRows, item]);
    }

    async function addAgent() {
        try {
            setIsBtnClick(true);
            const userDetails = await getFromLocalStorage("user")
            const body = {
                ...clickedRow,
                "currentuserId": userDetails.currentuserId,
                "userbusinessId": userDetails.businessId,
                userName: clickedRow.userName ? clickedRow.userName : '',
                gender: clickedRow.gender ? clickedRow.gender : '',
                dob: clickedRow.dob ? clickedRow.dob : ''
            }
            if (
                !ValidateName(clickedRow.firstName).isError &&
                !ValidateName(clickedRow.lastName).isError &&
                !ValidateNumber(clickedRow.phoneNo).isError &&
                !ValidateEmail(clickedRow.userName).isError &&
                !ValidateText(clickedRow.departmentName).isError &&
                !ValidateText(clickedRow.designationName).isError &&
                !ValidateEmptyField(clickedRow.roleId).isError &&
                (!clickedRow.dob || !ValidateDOB(clickedRow.dob).isError) &&
                (!clickedRow.gender || !ValidateEmptyField(clickedRow.gender).isError)
            ) {
                setLoading(true);
                API.post(`${process.env.REACT_APP_BASE_API}${apiList.addAgent}`, body, { "content-type": "application/json", "Accept": "*/*" })?.subscribe({
                    next(res: any) {
                        if (res.status === 200) {
                            Toast({ message: 'User added successfully', type: 'success' })
                            setIsBtnClick(false);
                            setLoading(false)
                            setUsers([
                                ...users,
                                {
                                    ...clickedRow,
                                    userId: res.data.loggedInId,
                                    name: `${clickedRow.firstName} ${clickedRow.lastName}`,
                                    email: clickedRow.userName,
                                    role: clickedRow.roleId === 1 ? "Admin" : "User",
                                    department: clickedRow.departmentName,
                                    designation: clickedRow.designationName,
                                    gender: clickedRow.gender ? clickedRow.gender : '',
                                    dob: clickedRow.dob ? clickedRow.dob : '',
                                    isDisabled: false,
                                    assignedNumbers: [],
                                    phoneNo: `${clickedRow.countryCode}${clickedRow.phoneNo}`
                                }]);
                            setTotalCount(totalCount && totalCount + 1);
                            closeAddUserDialog();
                        }
                    },
                    error(err) {
                        setIsBtnClick(false);
                        setLoading(false)
                    },
                });
            }
        } catch (error: any) {
            closeAddUserDialog();
            setIsBtnClick(false);
            setLoading(false);
            Toast({ message: error, type: 'error' });
        }
    }
    function editAgent() {
        setLoading(true);
        if (
            !ValidateName(clickedRow.firstName).isError &&
            !ValidateName(clickedRow.lastName).isError &&
            !ValidateNumber(clickedRow.phoneNo).isError &&
            !ValidateEmail(clickedRow.userName).isError &&
            !ValidateEmptyField(clickedRow.departmentName).isError &&
            !ValidateEmptyField(clickedRow.departmentName).isError &&
            !ValidateEmptyField(clickedRow.roleId).isError
        ) {
            // API.get(`${process.env.REACT_APP_BASE_API}${apiList.editAgent}`, cardDetails, {})?.subscribe({
            //     next(res: any) {
            //         if (res.status) {
            //             setAllCards([...allCards, cardDetails])
            // setBlockPopup(true)
            setTimeout(() => {
                setLoading(false)
                let newArr = [...users]; // copying the array
                const index = newArr.findIndex(obj => obj.id === clickedRow.id); //get index if object in array
                newArr[index] = clickedRow // replace e.target.value with whatever you want to change it to
                setUsers(newArr);
                closeAddUserDialog()
            }, 1000);
            //         }
            //     },
            //     error(err) {
            //         console.log(err);
            //     },
            // });
        } else
            setLoading(false)
    }

    function assignNumbers() {
        try {
            setSubmitAssignLoading(true)
            const body = {
                // currentUserId: loggedInUser.currentuserId,
                currentUserId: clickedRow.userId,
                lstUserAssignedCustomer: selected
            }
            console.log(body);
            API.post(`${process.env.REACT_APP_BASE_API}${apiList.assignNumbers}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        // setTimeout(() => {
                        setSubmitAssignLoading(false)
                        setAssignNumberDialog(false);
                        setSelected([]);
                        let assignedNumbers = 0;
                        let assignedNumbersArray = [];
                        for (let i = 0; i < selected.length; i++) {
                            if (selected[i].isAssigned) {
                                assignedNumbers = assignedNumbers + 1
                                assignedNumbersArray.push(selected[i].customerName)
                            }
                        }
                        Toast({ message: `${assignedNumbers} ${assignedNumbers > 1 ? "Contacts" : "Contact"} assigned successfully`, type: 'success' })
                        const index = users.findIndex(obj => obj.userId === clickedRow.userId);
                        let newArray = users;
                        newArray[index] = { ...newArray[index], assignedNumbers: assignedNumbersArray }
                        setUsers([...newArray])
                    }
                },
                error(err) {
                    setSubmitAssignLoading(false)
                    console.log(err);
                },
            });
        } catch (error: any) {
            setSubmitAssignLoading(false)
            console.log(error);
            Toast({ message: error, type: 'error' })
        }
    }
    async function getUsers(take: number, skip: number, searchValue: string) {
        try {
            setLoading(true)
            const userDetails = await getFromLocalStorage("user");
            const body = {
                businessId: userDetails.businessId,
                skip,
                take
            }
            if (searchValue === "") {
                API.get(`${process.env.REACT_APP_BASE_API}${apiList.getUsers}`, body, {})?.subscribe({
                    next(res: any) {
                        if (res.status === 200) {
                            // setTimeout(() => {
                            setLoading(false)
                            setUsers(res.data.lstUser);
                            setTotalCount(res.data.count);
                            // }, 1000);
                        }
                    },
                    error(err) {
                        setLoading(false)
                    },
                });
            } else gridGlobalSearch(take, skip, searchValue);
        } catch (error: any) {
            setLoading(false)
            console.log("Error Catched : ", error);
            Toast({ message: error, type: 'error' })
        }
    }
    function disableUser() {
        setAssignDialogDataLoading(true)
        const body = {
            "currentuserId": clickedRow.userId,
            "isBlock": !clickedRow.isDisabled
        }
        API.put(`${process.env.REACT_APP_BASE_API}${apiList.disableUser}`, body, {})?.subscribe({
            next(res: any) {
                if (res.status === 200) {
                    Toast({ message: `${clickedRow.name} ${clickedRow.isDisabled ? 'enabled' : 'disabled'} successfully`, type: 'success' })
                    setAssignDialogDataLoading(false);
                    closeDisableUserDialog()
                    // setTimeout(() => {
                    let newArr = [...users]; // copying the array
                    const index = newArr.findIndex(obj => obj.userId === clickedRow.userId); //get index if object in array
                    newArr[index] = { ...clickedRow, isDisabled: !clickedRow.isDisabled } // replace e.target.value with whatever you want to change it to
                    setUsers(newArr);
                    setClickedRow(Object);
                    closeDisableUserDialog()
                    // }, 1000);
                }
            },
            error(err) {
                setAssignDialogDataLoading(false)
            },
        });
    }
    function removeAgent() {
        try {
            const body = {
                currentuserId: loggedInUser.currentuserId
            }
            setLoading(true)
            API.deleteApi(`${process.env.REACT_APP_BASE_API}${apiList.removeAgent}/${clickedRow.userId}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        Toast({ message: "User removed successfully", type: 'success' })
                        // setTimeout(() => {
                        console.log("delete user res : ", res);
                        setLoading(false);
                        const newArr = users.filter((i, index) => i.userId != clickedRow.userId)
                        setUsers(newArr);
                        setTotalCount(totalCount && totalCount - 1)
                        closeRemoveUserDialog()
                        setClickedRow(Object);
                        // }, 1000);
                    }
                },
                error(err) {
                    setLoading(false);
                },
            });
        } catch (error: any) {
            setLoading(false);
            console.log(error);
            Toast({ message: error, type: 'error' })
        }
    }
    function gridGlobalSearch(take: number, skip: number, searchValue: string) {
        setLoading(true)
        const body = {
            businessId: loggedInUser.businessId,
            skip,
            take,
            searchValue
        }
        API.get(`${process.env.REACT_APP_BASE_API}${apiList.agentsGlobalSearch}`, body, {})?.subscribe({
            next(res: any) {
                if (res.status) {
                    // setTimeout(() => {
                    setUsers(res.data.lstUser);
                    setTotalCount(res.data.count)
                    setLoading(false)
                    // }, 1000);
                }
            },
            error(err) {
                console.log(err);
                setLoading(false)
            },
        });
    }
    function agentsColumnSearch(take: number, skip: number, columnSearch: any) {
        setLoading(true)
        const body = {
            businessId: loggedInUser.businessId,
            skip,
            take,
            searchValue: columnSearch
        }
        console.log("agentsColumnSearch called");

        API.get(`${process.env.REACT_APP_BASE_API}${apiList.agentsColumnSearch}/${loggedInUser.businessId}`, body, {})?.subscribe({
            next(res: any) {
                if (res.status) {
                    // setTimeout(() => {
                    setUsers(res.data.lstUser);
                    setTotalCount(res.data.count)
                    setLoading(false)
                    // }, 1000);
                }
            },
            error(err) {
                console.log(err);
                setLoading(false)
            },
        });
    }

    function onEditUserClicked(user: any) {
        setDialogTitle('Edit');
        setClickedRow(user);
        setAddUserDialog(true);
    }

    const CustomButton = React.forwardRef(({ open, user, index, ...props }: any, ref: any) => (
        <IconButton component="label" color="primary" style={{ color: '#075E54', backgroundColor: '#FFF', outlineWidth: 0 }}
            ref={ref} {...props}
            onClick={() => {
                if (loggedInUser.currentuserId != user.userId) {
                    // editUserRole(user)
                    props.onClick()
                }
            }}
        >
            {/* <GridTooltip title={"Update Role"} placement="top"> */}
            <span style={{ fontSize: 12, color: loggedInUser.currentuserId == user.userId ? '#999' : '#333', fontWeight: 'normal' }}>
                {/* {props.open ? 'Opened' : 'Closed'} */}
                {user.role} <ExpandMore style={{ fontSize: 14 }} /></span>
            {/* </GridTooltip> */}
        </IconButton>
    ));

    function editUserRole(user: any) {
        setEditUserLoading(true);
        // 1 = Admin
        // 2 = User
        const body = {
            "roleId": user.role === "Admin" ? 2 : 1,
            "userId": user.userId
        }
        API.put(`${process.env.REACT_APP_BASE_API}${apiList.editUserRole}`, body, {})?.subscribe({
            next(res: any) {
                if (res.status === 200) {
                    Toast({ message: `${user.name} now has ${user.role === "Admin" ? "User" : "Admin"} access`, type: 'success' })
                    setEditUserLoading(false);
                    let newArr = [...users]; // copying the array
                    const index = newArr.findIndex(obj => obj.userId === user.userId); //get index if object in array
                    newArr[index] = { ...newArr[index], role: user.role === "Admin" ? "User" : "Admin" } // replace e.target.value with whatever you want to change it to
                    setUsers(newArr);
                }
            },
            error(err) {
                setEditUserLoading(false)
            },
        });
    }


    return (
        <div className='user-mngmt'>
            <div className='settings-title'>User Management</div>
            <Grid
                columns={[
                    { header: 'Name', value: "name", width: 120 },
                    { header: 'Contact', value: 'phoneNo', width: 120 },
                    { header: 'Email', value: 'email', width: 200, popupOnHover: true },
                    { header: 'Gender', value: 'gender', propertyName: 'gender', width: 150, columnSearch: { options: gender } },
                    { header: 'D.O.B.', propertyName: 'dob', value: (i) => <span>{i.dob ? moment(i.dob).format('MM/DD/YYYY') : 'NA'}</span>, width: 100, columnSearch: { type: 'daterange' } },
                    { header: 'Department', value: 'department', width: 120, popupOnHover: true },
                    { header: 'Designation', value: 'designation', width: 120, popupOnHover: true },
                    {
                        header: 'Role', propertyName: 'role', value: (i, index) => <span>
                            <Popup contentStyle={{ width: 100 }} closeOnDocumentClick trigger={open => <CustomButton open={open} user={i} index={index} />
                            } position="bottom center">
                                <span>
                                    {
                                        i.role === "Admin" ?
                                            <Button onClick={() => editUserRole(i)} className='edit-user-role-btn'>User</Button> :
                                            <Button onClick={() => editUserRole(i)} className='edit-user-role-btn'>{editUserLoading ? <Spinner color='#000' /> : "Admin"}</Button>
                                    }
                                </span>
                            </Popup>
                        </span>
                    },
                    {
                        header: 'Assigned Contacts',
                        value: (column: any, index: number) =>
                            <span onClick={() => openAssignDialog(index)} style={{ color: '#3366CC', padding: '0px 10px', cursor: 'pointer' }}><b>{column?.assignedNumbers?.length}</b></span>,
                        columnSearch: { type: 'none' }
                    }
                ]}
                loading={loading}
                totalCount={totalCount}
                data={users}
                isActions={true}
                actions={
                    [
                        {
                            component: (index: number) => <PersonRemoveAlt1Outlined className='grid-icon' fontSize='small' style={{ color: `${loggedInUser.countryCode}${loggedInUser.phoneNo}` === users[index].phoneNo ? '#999' : "#fe5044" }} />,
                            tooltip: (index: number) => `${loggedInUser.countryCode}${loggedInUser.phoneNo}` !== users[index].phoneNo ? "Remove User" : "",
                            onClick: (id: any, index: number) => {
                                if (`${loggedInUser.countryCode}${loggedInUser.phoneNo}` !== users[index].phoneNo)
                                    openRemoveUserDialog(index)
                            }
                        },
                        {
                            component: (index: number) =>
                                users[index].isDisabled ?
                                    <PersonOutline className='grid-icon' fontSize='small' style={{ color: `${loggedInUser.countryCode}${loggedInUser.phoneNo}` === users[index].phoneNo ? '#999' : "#3366CC" }} /> :
                                    <PersonOffOutlined className='grid-icon' fontSize='small' style={{ color: `${loggedInUser.countryCode}${loggedInUser.phoneNo}` === users[index].phoneNo ? '#999' : "#3366CC" }} />
                            ,
                            tooltip: (index: number) => `${loggedInUser.countryCode}${loggedInUser.phoneNo}` === users[index].phoneNo ? "" : users[index].isDisabled ? "Enable User" : "Disable User",
                            onClick: (id: any, index: number) => {
                                if (`${loggedInUser.countryCode}${loggedInUser.phoneNo}` !== users[index].phoneNo)
                                    openDisableUserDialog(index)
                            }
                        },
                        // {
                        //     component: <EditOutlined className='grid-icon' fontSize='small' />,
                        //     tooltip: "Edit",
                        //     onClick: (id: any, index: number) => onEditUserClicked(users[index])
                        // },
                        {
                            component: (index: number) => <PersonAddOutlined className='grid-icon' fontSize='small' style={{ color: users[index].isDisabled ? '#ddd' : '#075E54' }} />,
                            tooltip: "Assign Contacts",
                            onClick: (id: any, index: number) => users[index].isDisabled ? {} : openAssignDialog(index)

                        },
                    ]
                }
                toolbarButtons={[{
                    component: <PersonAddOutlined style={{ fontSize: 18, fontWeight: 'bold', marginRight: 4, }} />,
                    tooltip: 'Add User',
                    onClick: openAddUserDialog
                }]}
                footer={true}
                pagination={true}
                onPageChange={(take: number, skip: number, searchValue: string) => getUsers(take, skip, searchValue)}
                onGlobalSearch={(take: number, skip: number, searchValue: string) => gridGlobalSearch(take, skip, searchValue)}
                onColumnSearch={(take: number, skip: number, columnSearch: Object) => agentsColumnSearch(take, skip, columnSearch)}
                rowsAtATime={10}
                globalSearch={false}
                horizontalScroll={true}
                rowsAtATimeSelector={true}
            />

            <Dialog
                open={addUserDialog}
                TransitionComponent={Transition}
                keepMounted
                // onClose={closeAddUserDialog}
                aria-describedby="alert-dialog-slide-description"
                transitionDuration={400}
            >
                <div className='dialog-wrapper' style={{ width: 'fit-content' }}>
                    <div className='dialog-title' style={{ marginBottom: 20, justifyContent: 'space-between', display: 'flex' }}>{dialogTitle}
                        <div onClick={closeAddUserDialog} style={{ height: 25, width: 25, backgroundColor: '#c82333', textAlign: 'center', borderRadius: 5, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Close style={{ fontSize: 16 }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', padding: 10 }}>
                        <div style={{ display: 'flex' }}>
                            <div className="field-wrapper">
                                <input
                                    type="text" autoFocus={true} value={clickedRow.firstName} maxLength={15}
                                    onChange={(e) => setClickedRow({ ...clickedRow, firstName: e.target.value })}
                                />
                                <div className="field-placeholder">First Name<Asterisk /></div>
                                <div className='error'>{isBtnClick && ValidateName(clickedRow.firstName, "First name").err}</div>
                            </div>
                            <div className="field-wrapper">
                                <input type="text" autoFocus={true} value={clickedRow.lastName} maxLength={15}
                                    onChange={(e) => setClickedRow({ ...clickedRow, lastName: e.target.value })} />
                                <div className="field-placeholder">Last Name<Asterisk /></div>
                                <div className='error'>{isBtnClick && ValidateName(clickedRow.lastName, "Last name").err}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div className='phone-number-input-field' style={{ alignItems: 'flex-start', display: 'flex', flexDirection: 'column', marginRight: 20 }}>
                                <div className="field-wrapper" style={{ marginBottom: 0 }}>
                                    {/* <input type="text" autoFocus={true} defaultValue={clickedRow.contact} /> */}
                                    <div className="field-placeholder">Contact Number<Asterisk /></div>
                                    <PhoneInput
                                        containerStyle={{ width: 'fit-content', boxShadow: '0px 0px 0px 0px', fontFamily: 'Poppins', fontSize: 14, borderRadius: 5 }}
                                        country={'in'}
                                        dropdownStyle={{ height: 180 }}
                                        searchPlaceholder="Search"
                                        searchStyle={{ width: '85%', fontFamily: 'Poppins', fontSize: 12, padding: 5 }}
                                        inputStyle={{ width: 200, fontFamily: 'Poppins', fontSize: 12, borderRadius: 5 }}
                                        value={`${clickedRow.countryCode}${clickedRow.phoneNo}`}
                                        countryCodeEditable={false}
                                        onChange={(number, obj: any) => setClickedRow({ ...clickedRow, countryCode: `+${obj.dialCode}`, phoneNo: number.slice(obj.dialCode.length) })}
                                        enableSearch={true}
                                        disabled={loading}
                                    />
                                </div>
                                <div className='error'>{isBtnClick && ValidateNumber(clickedRow.phoneNo, "Phone number").err}</div>
                                <div className="checkbox-wrapper" style={{ marginLeft: 10 }}>
                                    <input className='input-checkbox' checked={clickedRow.isWhatsAppNo} disabled={loading} type="checkbox" onChange={(e) => setClickedRow({ ...clickedRow, isWhatsAppNo: e.target.checked })} />
                                    <div className="field-placeholder">Is WhatsApp Number?</div>
                                </div>
                            </div>
                            <div className="field-wrapper">
                                <input type="text" autoFocus={true} value={clickedRow.userName} maxLength={30}
                                    onChange={(e) => setClickedRow({ ...clickedRow, userName: e.target.value })}
                                />
                                <div className="field-placeholder">Email<Asterisk /></div>
                                <div className='error'>{isBtnClick && ValidateEmail(clickedRow.userName, "Email").err}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div className="field-wrapper">
                                <input type="text" autoFocus={true} value={clickedRow.departmentName} maxLength={30}
                                    onChange={(e) => setClickedRow({ ...clickedRow, departmentName: e.target.value })} />
                                <div className="field-placeholder">Department<Asterisk /></div>
                                <div className='error'>{isBtnClick && ValidateText(clickedRow.departmentName, "Department").err}</div>
                            </div>
                            <div className="field-wrapper">
                                <input type="text" autoFocus={true} value={clickedRow.designationName} maxLength={30}
                                    onChange={(e) => setClickedRow({ ...clickedRow, designationName: e.target.value })} />
                                <div className="field-placeholder">Designation<Asterisk /></div>
                                <div className='error'>{isBtnClick && ValidateText(clickedRow.designationName, "Designation").err}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <Dropdown
                                options={options}
                                title="Role"
                                defaultValue={options.filter((e: any) => e.value === clickedRow.roleId)[0]}
                                scrollbarHeight={70}
                                onChange={function (e: any) {
                                    setClickedRow({ ...clickedRow, roleId: e.value });
                                }}
                                err={isBtnClick && ValidateNumber(clickedRow.roleId, "Role", 1, 1).err}
                                disabled={loading}
                                styles={{ marginLeft: 10, marginRight: 15 }}
                                mandatory={true}
                            />
                            <Dropdown
                                options={gender}
                                title="Gender"
                                defaultValue={clickedRow.gender}
                                scrollbarHeight={150}
                                onChange={function (e: any) {
                                    setClickedRow({ ...clickedRow, gender: e });
                                }}
                                disabled={loading}
                                scrollAfterOptions={3}
                            />
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div className="field-wrapper mobile-input" style={{ marginBottom: 0, marginTop: 20 }}>
                                <DatePicker
                                    selected={clickedRow.dob ? new Date(clickedRow.dob) : null}
                                    onChange={(date) => {
                                        console.log("on change date ", date);
                                        setClickedRow({ ...clickedRow, dob: date })
                                    }}
                                    showPopperArrow={true}
                                    maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 16))}
                                    minDate={new Date('01/01/2000')}
                                    placeholderText='MM/DD/YYYY'

                                />
                                {/* <input type="date" value={clickedRow.dob && moment(clickedRow.dob).format('YYYY-MM-DD')} disabled={loading} maxLength={15}
                                    onChange={(e) => setClickedRow({ ...clickedRow, dob: e.target.value })} /> */}
                                <div className="field-placeholder">D.O.B.</div>
                                <div className='error'>{isBtnClick && clickedRow?.dob && ValidateDOB(clickedRow?.dob).err}</div>
                            </div>
                        </div>
                    </div>
                    <div className="dialog-action-buttons">
                        <LoadingButton
                            loading={loading}
                            variant="contained"
                            size='small'
                            loadingIndicator={<Spinner />}
                            onClick={dialogTitle == "Add User" ? addAgent : editAgent}
                            className='dialog-btn-positive'
                        >
                            {
                                dialogTitle == "Add User" ? !loading && "Add" : !loading && "Confirm"
                            }
                        </LoadingButton>
                        <Button variant="outlined" className='dialog-btn-danger' onClick={closeAddUserDialog}>Cancel</Button>
                    </div>
                </div>
            </Dialog>

            <Dialog
                open={disableUserDialog}
                TransitionComponent={Transition}
                keepMounted
                // onClose={closeDisableUserDialog}
                aria-describedby="alert-dialog-slide-description"
                transitionDuration={400}
            >
                <div className='dialog-wrapper' style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div className='dialog-title' style={{ marginBottom: 15 }}>{clickedRow.isDisabled ? "Enable User" : "Disable User"}</div>
                    Are you sure you want to {clickedRow.isDisabled ? "Enable" : "Disable"} <span style={{ fontWeight: 'bold' }}>{clickedRow.name}</span>?
                    <div className='dialog-action-buttons'>
                        <Button variant="outlined" className='dialog-btn-positive' onClick={disableUser}>{assignDialogDataLoading ? <Spinner /> : "Confirm"}</Button>
                        <Button variant="outlined" className='dialog-btn-danger' onClick={closeDisableUserDialog}>Cancel</Button>
                    </div>
                </div>
            </Dialog>

            <Dialog
                open={removeUserDialog}
                TransitionComponent={Transition}
                keepMounted
                // onClose={closeRemoveUserDialog}
                aria-describedby="alert-dialog-slide-description"
                transitionDuration={400}
            >
                <div className='dialog-wrapper'>
                    <div className='dialog-title' style={{ marginBottom: 20 }}>Remove User</div>
                    Are you sure you want to Remove <span style={{ fontWeight: 'bold' }}>{clickedRow.name}</span>?
                    <div className="dialog-action-buttons">
                        <LoadingButton
                            loading={loading}
                            variant="contained"
                            size='small'
                            loadingIndicator={<Spinner />}
                            onClick={removeAgent}
                            className='dialog-btn-positive'
                        >
                            {
                                !loading && "Confirm"
                            }
                        </LoadingButton>
                        <Button variant="outlined" className='dialog-btn-danger' onClick={closeRemoveUserDialog}>Cancel</Button>
                    </div>
                </div>
            </Dialog>

            <Dialog
                open={assignNumberDialog}
                TransitionComponent={Transition}
                keepMounted
                // onClose={closeAssignDialog}
                aria-describedby="alert-dialog-slide-description"
                transitionDuration={400}
            >
                <div className='dialog-wrapper' style={{ width: 600, backgroundColor: '#f5f8fd', overflowY: 'clip' }}>
                    <div className='dialog-title' style={{ marginBottom: 10, justifyContent: 'space-between', display: 'flex' }}>Assign Contacts
                        <div onClick={closeAssignDialog} style={{ height: 25, width: 25, backgroundColor: '#c82333', textAlign: 'center', borderRadius: 5, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Close style={{ fontSize: 16 }} /></div>
                    </div>
                    <Scrollbars style={{ height: height / 100 * 70 }}>
                        <div style={{ padding: 10 }}>
                            <Grid
                                data={numbers}
                                columns={[
                                    { header: "Name", value: 'customerName' },
                                    { header: "Number", value: 'contactNumber' },
                                    { header: "Email", value: 'email', width: 180 },
                                    { header: "DOB", value: (i) => <span>{i.dob ? moment.utc(i.dob).local().format('MM/DD/YYYY') : "NA"}</span>, propertyName: 'dob', columnSearch: { type: 'daterange' } },
                                ]}
                                loading={assignDialogDataLoading}
                                pagination={true}
                                footer={true}
                                setSelectedRows={_setSelectedRows}
                                totalCount={totalNumbersCount}
                                selectedRecords={selected}
                                onPageChange={(take: number, skip: number, searchValue: string) => getNumbers(take, skip, searchValue)}
                                onColumnSearch={(take: number, skip: number, searchValue: any) => getNumbers(take, skip, searchValue)}
                                globalSearch={false}
                                rowsAtATime={10}
                                rowsAtATimeSelector={true}
                            />
                        </div>
                    </Scrollbars>
                    <div className="dialog-action-buttons" style={{ margin: 0, padding: 7 }}>
                        <LoadingButton
                            className={JSON.stringify(selected) === JSON.stringify(numbers) ? 'dialog-btn-positive disabled' : 'dialog-btn-positive'}
                            loading={submitAssignLoading}
                            variant="contained"
                            size='small'
                            loadingIndicator={<Spinner />}
                            onClick={assignNumbers}
                            disabled={JSON.stringify(selected) === JSON.stringify(numbers)}
                        >
                            {!submitAssignLoading && "Confirm"}
                        </LoadingButton>
                        <Button variant="outlined" className='dialog-btn-danger' onClick={closeAssignDialog}>Cancel</Button>
                    </div>
                </div>
            </Dialog>
        </div >
    )
}
