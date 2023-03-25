import { ArrowDropDown, CallMade, CallReceived, Close, ErrorOutline, Group, SearchOutlined, SpeakerNotesOff } from '@material-ui/icons'
import React, { useState, useEffect, useRef } from 'react'
import Scrollbars from 'react-custom-scrollbars'
import PhoneInput from 'react-phone-input-2';
import { Button } from '@material-ui/core';
import './contactList.css'
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { useNavigate } from 'react-router-dom';
// import contacts from '../../assets/jsons/contacts/contactList.json';
import { API } from '../../constant/network';
import { apiList } from '../../constant/apiList';
import Spinner from '../../components/Loading/spinner';
import { ValidateDOB, ValidateEmail, ValidateEmptyField, ValidateName, ValidateNumber } from '../../components/validators';
import { LoadingButton } from '@mui/lab';
import { getFromLocalStorage } from '../../components/LocalStorage/localStorage';
import dummyData from '../../assets/dummyData';
import InfiniteScroll from 'react-infinite-scroller';
import Asterisk from '../../components/Asterisk';
import 'react-toastify/dist/ReactToastify.css';
import IconButton from '@mui/material/IconButton';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled, Checkbox } from '@mui/material';
import moment from 'moment';
import Toast from '../../components/Toast/Toast';
import Dropdown from '../../components/Dropdown';
import { gender } from '../../assets/dropdownData/gender';
import Dialog from '../../components/Dialog/Dialog';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Toggle from '../../components/ToggleSwitch';
import Radio from '@mui/material/Radio';
import MaskedTextInput from "react-text-mask";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="down" ref={ref} {...props} />;
});

export default function ContactList(props: any) {
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
    const { innerHeight: height } = window;
    const [contactList, setContactList] = useState<Array<Object>>([]);
    const [addContactLoading, setAddContactLoadingLoading] = useState(false); //using for add contact /search contact
    let navigate = useNavigate();
    const [searchValue, setSearchValue] = useState("");
    const [addContactDialog, setAddContactDialog] = useState(false);
    const [newContact, setNewContact] = useState<any>({ countryCode: "+91", isAssignAdmin: false, isAssignEveryone: true })
    const [clickedContactId, setClickedContactId] = useState(0)
    const [visibility, setVisibility] = useState(false);
    const [isBtnClick, setIsBtnClick] = useState(false)
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(undefined)
    const [listLoading, setListLoading] = useState(false);
    const contactCardRef = useRef<any>(null);
    const [searchedValue, setSearchedValue] = useState("");
    const [searchBtnClicked, setSearchBtnClicked] = useState(false);
    const [totalContacts, setTotalContacts] = useState(0);

    function openAddContactDialog() {
        const firstName = `${dummyData.firstNames[Math.floor(Math.random() * 993)]}`;
        const lastName = `${dummyData.firstNames[Math.floor(Math.random() * 993)]}`;
        const dummyContact = {
            firstName: firstName,
            lastName: lastName,
            countryCode: "1",
            phoneNo: `9${Math.floor(Math.random() * 1000000000)}`,
            secondaryPhoneNo: `9${Math.floor(Math.random() * 1000000000)}`,
            email: `${firstName}${lastName}@email.com`.toLowerCase(),
            isWhatsAppNo: false
        }
        setNewContact(Object)
        setAddContactDialog(true)
        setVisibility(false);
    }
    
    function closeAddContactDialog() {
        // setSearchValue('');
        setAddContactDialog(false);
        setVisibility(false);
        setIsBtnClick(false);
        setNewContact({
            ...newContact,
            firstName: "",
            lastName: "",
            phoneNo: "",
            secondaryPhoneNo: "",
            email: "",
            isWhatsAppNo: false,
            dob: ""
        });
    }

    function deleteContact() {
        try {
            setContactList(contactList.filter((x: any) => x.id !== clickedContactId))
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    function editContact() {
        try {
            let newArr = contactList
            console.log("Inside edit ", clickedContactId);

            const index = contactList.findIndex((contact: any) => contact.id === clickedContactId);
            newArr[index] = { ...contactList[index], ...props.contactListAction.data }
            setContactList([...newArr])
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    async function searchContact(pageNo?: number) {
        try {
            setSearchBtnClicked(true)
            if (searchValue.length >= 1) {
                const pageNumber = pageNo ? pageNo : page
                setListLoading(true);
                const user = await getFromLocalStorage("user");
                const body = {
                    userId: user.currentuserId,
                    businessId: user.businessId,
                    take: 10,
                    skip: (pageNumber - 1) * 10,
                    searchValue
                }
                API.get(`${process.env.REACT_APP_BASE_API}${apiList.searchContactList}`, body, {})?.subscribe({
                    next(res: any) {
                        if (res.status === 200) {
                            setSearchBtnClicked(false)
                            setListLoading(false);
                            setTotalCount(res.data.count);
                            if (pageNumber === 1) setContactList([...res.data.lstCustomer])
                            else setContactList([...contactList, ...res.data.lstCustomer]);
                            setPage(page + 1);
                            setSearchedValue(searchValue)
                        }
                    },
                    error(err) {
                        setSearchBtnClicked(false)
                        setListLoading(false);
                        console.log(err);
                    },
                });
            } else setListLoading(false);
        } catch (error: any) {
            setSearchBtnClicked(false)
            setListLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }

    useEffect(() => {
        if (props.contactListAction.action === "delete") deleteContact()
        else if (props.contactListAction.action === "edit") editContact()
        else if (props.contactListAction.action === 'reload') getContactList(0)
    }, [props.contactListAction])

    function onClickSingleContact(params: any) {
        setVisibility(false);
        props.switchSubTab('addContact');
    }

    function onClickUploadCSV(params: any) {
        navigate('/contacts/upload-contacts');
        setVisibility(false);
        props.switchSubTab('contacts');
        props.switchThirdTab('uploadCSV');
    }

    function _onContactClick(id: number) {
        navigate("/contacts/contact-info/" + id);
        setClickedContactId(id);
        // props.switchSubTab('contacts');
        // props.switchThirdTab('contactInfo');
        props.setClickedContactId(id);
    }

    async function getContactList(skip = 0, search = searchValue) {
        try {
            setListLoading(true)
            const user = await getFromLocalStorage("user");
            const body = {
                userId: user.currentuserId,
                businessId: user.businessId,
                take: 10,
                skip
            }
            if (search === "") {
                API.get(`${process.env.REACT_APP_BASE_API}${apiList.getContactList}`, body, {})?.subscribe({
                    next(res: any) {
                        if (res.status === 200) {
                            // setTimeout(() => {
                            setListLoading(false);
                            if (skip === 0) setContactList([...res.data.lstCustomer])
                            else setContactList([...contactList, ...res.data.lstCustomer]);
                            setPage(page + 1)
                            setTotalContacts(res.data.count);
                            setTotalCount(res.data.count);
                            // }, 2000);
                        }
                    },
                    error(err) {
                        setListLoading(false);
                    },
                });
            }
            // else searchContact(page);
        } catch (error: any) {
            setListLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }

    useEffect(() => {
        getContactList(0, searchValue);
        if (!clickedContactId) {
            const arrayOfUrl = window.location.href.split('/');
            const id = arrayOfUrl[arrayOfUrl.length - 1];
            setClickedContactId(Number(id));
        }
    }, [])

    useEffect(() => {
        if (!searchValue) {
            getContactList(0, searchValue);
        }
    }, [searchValue])

    async function addContactValidation() {
        setIsBtnClick(true);
        if (
            !ValidateName(newContact.firstName).isError &&
            !ValidateName(newContact.lastName).isError &&
            !ValidateNumber(newContact.phoneNo).isError &&
            // !ValidateDOB(newContact.dob).isError &&
            (!newContact.secondaryPhoneNo || !ValidateNumber(newContact.secondaryPhoneNo).isError) &&
            (!newContact.dob || !ValidateDOB(newContact.dob).isError) &&   // optional dob validation
            (!newContact.gender || !ValidateEmptyField(newContact.gender).isError) &&
            (!newContact.email || !ValidateEmail(newContact.email).isError)
            // !ValidateEmail(newContact.email).isError
        ) addContact();
    }

    async function addContact() {
        try {
            const user = await getFromLocalStorage("user")
            const body = {
                customerId: 0,
                "userId": user.currentuserId,
                "businessId": user.businessId,
                ...newContact,
                isWhatsAppNo: true,
                secondaryPhoneNo: newContact.secondaryPhoneNo ? newContact.secondaryPhoneNo : "",
                gender: newContact.gender ? newContact.gender : "",
                dob: newContact.dob ? newContact.dob : "",
                email: newContact.email ? newContact.email : ""
            }
            setAddContactLoadingLoading(true)
            API.post(`${process.env.REACT_APP_BASE_API}${apiList.addSingleContact}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setAddContactLoadingLoading(false);
                        setIsBtnClick(false);
                        if (contactList.length === 0) {
                            getContactList(0)
                        }
                        else if (res.data.id > 0) contactList.unshift({ ...res.data, createdAt: new Date().getTime() })
                        // setContactList([{ ...res.data, createdAt: new Date().getTime() }, ...contactList]);
                        setNewContact(Object)
                        closeAddContactDialog();
                        Toast({ message: "Contact added successfully", type: "success" })
                    }
                },
                error(err) {
                    setAddContactLoadingLoading(false);
                },
            });
        } catch (error: any) {
            setAddContactLoadingLoading(false);
            setIsBtnClick(false);
            Toast({ message: error, type: 'error' })
        }
    }

    function handlePhoneChange(e: any) {
        if (e.target.value.length === 0 && e.target.value === "") {
            console.log("value is blanked", e.target.value);
            setPage(1);
            setContactList([]);
            setTotalCount(undefined);
            getContactList(0, e.target.value)
            setSearchValue(e.target.value)
        } else setSearchValue(e.target.value);
    }

    return (
        // <!-- Contacts Tab -->
        <div style={{ overflowY: 'clip' }}>
            {/* <!-- Tab content header start --> */}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="tab-pane-header">
                    Contacts (<Group /><span style={{ fontSize: 17 }}> {totalContacts}</span>)
                </div>
                <div style={{ marginRight: 13, justifyContent: 'end', display: 'flex' }}>
                    <Button variant="outlined" style={{ height: 30, backgroundColor: '#fff', color: '#075E54', fontSize: 12 }} onClick={() => setVisibility(!visibility)}>
                        Add
                        {/* <PersonAddOutlined style={{ fontSize: 18, marginLeft: 5 }} /> */}
                        <ArrowDropDown style={{ fontSize: 18, marginLeft: 5, height: '100%' }} />
                    </Button>
                    {
                        visibility &&
                        <div className='options-wrapper' style={{ width: 'fit-content', marginTop: 30 }}>
                            <div style={{ width: '95%', cursor: 'pointer', padding: 5, whiteSpace: 'nowrap' }} className='option' onClick={openAddContactDialog}>Single Contact</div>
                            <div style={{ width: '95%', cursor: 'pointer', padding: 5 }} className='option' onClick={onClickUploadCSV}>Upload CSV</div>
                        </div>
                    }
                </div>
            </div>

            {/* <!-- Tab content header end --> */}
            {/* <!-- Invite Friend start --> */}

            <div>
                <div>
                    <div style={{ display: 'flex', flexDirection: 'row', boxShadow: '5px 5px 5px #eaeef7', padding: 10, paddingBottom: 0, alignItems: 'center' }}>
                        {/* <PhoneInput
                            containerStyle={{ width: 'fit-content', fontFamily: 'Poppins', fontSize: 14 }}
                            country={'in'}
                            searchPlaceholder="Search"
                            searchStyle={{ fontFamily: 'Poppins', fontSize: 12, padding: 5 }}
                            inputStyle={{ fontFamily: 'Poppins', fontSize: 12 }}
                            value={`${phone.countryCode}${phone.phoneNo}`}
                            onChange={handlePhoneChange}
                            enableSearch={true}
                        /> */}
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="Search Contact"
                                onChange={handlePhoneChange} style={{ fontSize: 12 }} />
                        </div>
                        <IconButton
                            style={{ height: 30, padding: 0, outlineWidth: 0 }}
                            onClick={() => {
                                searchContact(1);
                                if (searchValue.length >= 1) {
                                    setSearchBtnClicked(true)
                                    setPage(1);
                                    setContactList([]);
                                    setTotalCount(undefined);
                                }
                                // getContactList(0, phone)
                            }}>
                            <span style={{ backgroundColor: '#075E54', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, marginLeft: 5, height: 30, width: 35, color: '#FFF' }}>
                                <SearchOutlined fontSize='small' />
                            </span>
                        </IconButton>
                    </div>
                    {
                        searchBtnClicked && ValidateEmptyField(searchValue).isError &&
                        <span style={{ fontSize: 10, color: '#d32f2f', marginLeft: 15 }}>{searchBtnClicked && ValidateEmptyField(searchValue, "Search keyword").err}</span>
                    }
                </div>
                {/* <!-- Search Container End --> */}

                <Scrollbars style={{ height: height - 115 }}>
                    {
                        totalCount !== 0 && contactList.length !== 0 ?
                            <InfiniteScroll
                                pageStart={0}
                                loadMore={() => getContactList((page - 1) * 10)}
                                hasMore={totalCount && totalCount > contactList.length}
                                loader={<div style={{ display: 'flex', width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}
                                ><Spinner color="#075E54" /></div>}
                                useWindow={false}
                            >
                                {contactList.map((item: any, index: number) =>
                                    <div className='contact-wrapper' ref={contactCardRef} style={{ backgroundColor: clickedContactId === item.id ? '#e8f1fc' : '#FFF', width: '95%', margin: '2%' }} onClick={() => _onContactClick(item.id)}>
                                        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center' }}>
                                            {
                                                item.profilePhoto ?
                                                    <img className="contact-avatar" src={item.profilePhoto} alt="Avatar" /> :
                                                    <span className="contact-avatar green">{item.firstName.charAt(0).toUpperCase()}{item.lastName.charAt(0).toUpperCase()}</span>
                                            }
                                            <div style={{ width: contactCardRef.current?.offsetWidth - 90, minWidth: 250 }}>
                                                <div style={{ display: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div className="name">{item.firstName} {item.lastName}</div>
                                                        <div className='contact-number'>{item.countryCode} {item.phoneNo}</div>
                                                    </div>
                                                    <span>
                                                        {
                                                            item.optout && <GridTooltip title="Opt out" placement="bottom"><SpeakerNotesOff className='received-msg-icon' style={{ margin: 3, color: '#fe5044' }} /></GridTooltip>
                                                        }
                                                        {
                                                            item.lastMessage &&
                                                            <>
                                                                {
                                                                    item.incoming ?
                                                                        <CallReceived className='received-msg-icon' /> :
                                                                        <CallMade className='received-msg-icon' />
                                                                }
                                                            </>
                                                        }
                                                    </span>
                                                </div>
                                                {
                                                    item.lastMessage &&
                                                    <div className="message">{`${item.lastMessage.substring(0, 100)}${item.lastMessage.length > 100 ? '...' : ''}`}</div>
                                                }
                                                {
                                                    item.createdAt &&
                                                    <div className="timestamp">{moment.utc(parseInt(item.createdAt)).local().format('MM/DD/YYYY, hh:mm A')}</div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </InfiniteScroll> :
                            <div style={{ height: height - 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {
                                    listLoading ?
                                        <Spinner color="#075E54" /> :
                                        <span style={{ width: '80%', textAlign: 'center', display: 'flex', alignItems: 'center', fontSize: 14, color: '#999', flexDirection: 'column' }}>
                                            <ErrorOutline style={{ fontSize: 80, marginRight: 5, marginBottom: 5, color: '#ddd' }} />
                                            Contacts not found {searchedValue && `for with searched keyword "${searchedValue}"`}
                                        </span>
                                }
                            </div>
                    }
                </Scrollbars>
            </div>
            {/* <!-- Contacts list end --> */}

            <Dialog
                title={"Add Contact"}
                open={addContactDialog}
                onClose={closeAddContactDialog}
                loading={addContactLoading}
                onClick={addContactValidation}
                DialogBody={() => <div style={{ padding: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div className="field-wrapper">
                            <div className="field-placeholder">First Name<Asterisk /></div>
                            <input type="text" maxLength={15} autoFocus={true} value={newContact.firstName} disabled={addContactLoading}
                                onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })} />
                            <div className='error'>{isBtnClick && ValidateName(newContact.firstName, "First name").err}</div>
                        </div>
                        <div className="field-wrapper">
                            <div className="field-placeholder">Last Name<Asterisk /></div>
                            <input type="text" maxLength={15} value={newContact.lastName} disabled={addContactLoading}
                                onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })} />
                            <div className='error'>{isBtnClick && ValidateName(newContact.lastName, "Last name").err}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div className='phone-number-input-field' style={{ margin: 10, alignItems: 'flex-start', display: 'flex', flexDirection: 'column' }}>
                            <div className="field-wrapper" style={{ margin: 0 }}>
                                <div className="field-placeholder">WhatsApp number<Asterisk /></div>
                                <PhoneInput
                                    containerStyle={{ width: 'fit-content', boxShadow: '0px 0px 0px 0px', fontFamily: 'Poppins', fontSize: 14 }}
                                    searchPlaceholder="Search"
                                    searchStyle={{ fontFamily: 'Poppins', fontSize: 12, padding: 5 }}
                                    inputStyle={{ width: 200, fontFamily: 'Poppins', fontSize: 12, boxShadow: '0px 0px 0px 0px', borderRadius: 5 }}
                                    value={`${newContact.countryCode}${newContact.phoneNo}`}
                                    countryCodeEditable={false}
                                    onChange={(number, obj: any) => setNewContact({ ...newContact, countryCode: `+${obj.dialCode}`, phoneNo: number.slice(obj.dialCode.length) })}
                                    enableSearch={true}
                                    disabled={addContactLoading}
                                />
                            </div>
                            <div className='error'>{isBtnClick && ValidateNumber(newContact.phoneNo, "Phone number").err}</div>
                            {/* <div className="checkbox-wrapper">
                                <input className='input-checkbox' checked={newContact.isWhatsAppNo} disabled={addContactLoading} type="checkbox" onChange={(e) => setNewContact({ ...newContact, isWhatsAppNo: e.target.checked })} />
                                <div className="field-placeholder">Is WhatsApp Number?</div>
                            </div> */}
                        </div>
                        <div className="field-wrapper">
                            <div className="field-placeholder">Email</div>
                            <input type="text" autoFocus={true} value={newContact.email} disabled={addContactLoading}
                                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} />
                            <div className='error'>{newContact.email && isBtnClick && ValidateEmail(newContact.email, "Email").err}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', margin: 10 }}>
                        <div className="field-wrapper mobile-input" style={{ marginLeft: 0 }}>
                            <input type="text" value={newContact.secondaryPhoneNo} disabled={addContactLoading} maxLength={15}
                                onChange={(e) => setNewContact({ ...newContact, secondaryPhoneNo: e.target.value })} />
                            <div className="field-placeholder">Secondary Number</div>
                            <div className='error'>{newContact.secondaryPhoneNo && isBtnClick && ValidateNumber(newContact.secondaryPhoneNo).err}</div>
                        </div>
                        <Dropdown
                            options={gender}
                            title="Gender"
                            styles={{ margin: 10 }}
                            defaultValue={newContact.gender}
                            scrollbarHeight={150}
                            onChange={function (e: any) {
                                setNewContact({ ...newContact, gender: e });
                            }}
                            disabled={addContactLoading}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="field-wrapper mobile-input" style={{ marginBottom: 0 }}>
                            <DatePicker
                                selected={newContact.dob}
                                onChange={(date) => setNewContact({ ...newContact, dob: date })}
                                showPopperArrow={true}
                                maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 16))}
                                minDate={new Date('01/01/2000')}
                                placeholderText='MM/DD/YYYY'
                                customInput={
                                    <MaskedTextInput
                                        type="text"
                                        mask={[/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/]}
                                    />
                                }
                            />
                            <div className="field-placeholder">D.O.B.</div>
                            <div className='error'>{isBtnClick && newContact.dob && ValidateDOB(newContact.dob, 'D.O.B.').err}</div>
                        </div>
                        <div style={{ marginTop: 10 }}>
                            <div style={{ display: 'flex', marginLeft: 10 }}>
                                {/* <Checkbox
                                    className='checkbox'
                                    size='small'
                                    checked={newContact.isAssignEveryone}
                                    onChange={(e: any) => {
                                        setNewContact({ ...newContact, isAssignEveryone: e.target.checked })
                                    }}
                                    onKeyDown={(e: any) => e.key === "Enter" && e.target.click()}
                                />
                                <span className='toggle-label'>Assign to all users</span> */}
                                <Radio
                                    className='radio-btn'
                                    checked={newContact.isAssignEveryone}
                                    onChange={(e) => setNewContact({ ...newContact, isAssignEveryone: true, isAssignAdmin: false })}
                                    value="a"
                                    name="radio-button-demo"
                                    inputProps={{ 'aria-label': 'A' }}
                                    style={{}}
                                    size='small'
                                />
                                <span onClick={() => setNewContact({ ...newContact, isAssignEveryone: true, isAssignAdmin: false })} className='category-title'>Assign to Everyone</span>
                            </div>
                            <div style={{ display: 'flex', marginLeft: 10 }}>
                                <Radio
                                    className='radio-btn'
                                    checked={newContact.isAssignAdmin}
                                    onChange={(e) => setNewContact({ ...newContact, isAssignEveryone: false, isAssignAdmin: true })}
                                    value="a"
                                    name="radio-button-demo"
                                    inputProps={{ 'aria-label': 'A' }}
                                    style={{}}
                                    size='small'
                                />
                                <span onClick={() => setNewContact({ ...newContact, isAssignEveryone: false, isAssignAdmin: true })} className='category-title'>Assign to all Admins</span>
                            </div>
                        </div>
                        {/* <div className="field-wrapper mobile-input" style={{ marginBottom: 0 }}>
                            <input type="date" value={newContact.dob} disabled={addContactLoading} maxLength={15}
                                onChange={(e) => setNewContact({ ...newContact, dob: e.target.value })} />
                            <div className="field-placeholder">D.O.B.</div>
                            <div className='error'>{isBtnClick && newContact.dob && ValidateDOB(newContact.dob, 'D.O.B.').err}</div>
                        </div> */}
                    </div>
                </div>}
                positiveBtnLabel={'Add'}
            />
        </div>
    )
}
