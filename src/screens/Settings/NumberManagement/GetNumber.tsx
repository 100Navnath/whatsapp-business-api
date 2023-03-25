import React, { useEffect, useState } from 'react'
import './getNumber.css'
import { SearchOutlined, ArrowBack, SwapHoriz, Autorenew, Edit, CreditCardOutlined } from '@material-ui/icons';
import { Button } from '@material-ui/core';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { AnimatedList } from 'react-animated-list';
import getNumbers from '../../../assets/jsons/numberMngmt/getNumbers.json'
import Grid from '../../../components/Grid/Grid';
import AddDialog from '../../../components/AddCardDialog/AddDialog';
import { getFromLocalStorage, setLocalStorage } from '../../../components/LocalStorage/localStorage';
import Spinner from '../../../components/Loading/spinner';
import LoadingButton from '@mui/lab/LoadingButton';
import { API } from '../../../constant/network';
import { apiList } from '../../../constant/apiList';
import { Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import { AddCardOutlined } from '@mui/icons-material';
import { ValidateEmptyField, ValidateLength, ValidateMobile, ValidateNumber } from '../../../components/validators';
import Toast from '../../../components/Toast/Toast';
import AddMobileNumber from '../../../components/AddMobileNumber/AddMobileNumber';
import Asterisk from '../../../components/Asterisk';
import { TextField } from '@material-ui/core';
import {
    createStyles,
    fade,
    Theme,
    withStyles,
    makeStyles,
    createMuiTheme
} from "@material-ui/core/styles";
const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="down" ref={ref} {...props} />;
});

export default function GetNumber(props: any) {
    const navigate = useNavigate()
    const [phone, setPhone] = useState(Object);
    const [searchedNumber, setSearchedNumber] = useState(Object)
    const [numbers, setNumbers] = useState<Array<any>>(Array)
    const [open, setOpen] = React.useState(false);
    const [searchBtnClicked, setSearchBtnClicked] = useState(false)
    const [addCardDialog, setAddCardDialog] = useState(false);
    const [cardDetails, setCardDetails] = useState(Object)
    const [loading, setLoading] = useState(false)
    const [getNumberLoading, setGetNumberLoading] = useState(false)
    const [countryAbbrevation, setCountryAbbrevation] = useState(undefined)
    const [numberPriceInCountry, setNumberPriceInCountry] = useState(undefined)
    const [userDetails, setUserDetails] = useState(Object);
    const [cardList, setCardList] = useState<Array<any>>(Array);
    const [isCardAdded, setIsCardAdded] = useState(false)
    const [showCards, setShowCards] = useState(false);
    const [selectedCard, setSelectedCard] = useState(Object);
    const [clickedNumber, setClickedNumber] = useState<any>(undefined);
    const [addMobileNumberDialog, setAddMobileNumberDialog] = useState(false)
    //
    const [isBtnClicked, setIsBtnClicked] = useState(false);
    const [businessDetails, setBusinessDetails] = useState<any>({
        // appId: "686593493194270",
        // phoneNoId: "106407642346260",
        // whatsappBusinessId: "107089365611368",
        // testNumber: "+15550865940",
        // token: "EAAJwdAFEVh4BAEgAt177c4XrEZBENOEhCGYiGomkmTKxmEzKfBQXTyexg5KjmLLER6XRyo3N9Q3v08OriZCV2CZAZA2OJZC5ogNov4woSwNTaEItyrbJVZAZBkyiPjwgoFA6JAEh5mehIiUcAiXSYQhdGJixEossCefP4Ky1bKuA3fG9t0fvre5",
    });

    async function getUserDetails() {
        try {
            const user = await getFromLocalStorage("user");
            if (user) {
                setUserDetails(user);
                checkIsCardAdded(user);
                getCardList(user)
                if (!user.phoneNo) setAddMobileNumberDialog(true)
            }
            else navigate("/")
        } catch (error: any) {
            console.log(error);
            Toast({ message: error, type: 'error' })
        }
    }

    useEffect(() => {
        getUserDetails();
    }, [])

    const handleClose = () => {
        setOpen(false);
    };

    function onConfirm() {
        try {
            if (selectedCard && selectedCard.cardId) {
                const body = {
                    "countryCode": searchedNumber.countryCode,
                    "phoneNo": clickedNumber.phonenumber.substring(searchedNumber.countryCode.length),
                    "numberPrice": numberPriceInCountry,
                    "userId": userDetails.currentuserId,
                    "businessId": userDetails.businessId
                }
                setGetNumberLoading(true)
                API.post(`${process.env.REACT_APP_BASE_API}${apiList.buyNumber}`, body, {})?.subscribe({
                    next(res: any) {
                        // setTimeout(() => {
                        if (res.status === 200) {
                            Toast({ message: 'Number purchased successfully', type: 'success' })
                            setGetNumberLoading(false)
                            setOpen(false);
                            props.linkNumber();
                            props.setIsDisable();
                        }
                        // }, 2000);
                    },
                    error(err) {
                        setGetNumberLoading(false)
                        // if (err.response && err.response.data && err.response.message) alert(err.response.data.message)
                        // else alert(err);
                        // comment this two lines
                        props.linkNumber();
                        props.setIsDisable();
                    },
                });
            } else Toast({ message: "Please select card", type: 'warning' })
        } catch (error: any) {
            setGetNumberLoading(false)
            Toast({ message: error, type: 'error' })
        }
    }

    function onAddCardSuccess() {
        setShowCards(true)
    }

    function getNumberPrice() {
        try {
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.getNumberPriceInCountry}/${countryAbbrevation}`, {}, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        console.log("res : ", res);
                        setNumberPriceInCountry(res.data.currentPrice);
                    }
                }
            });
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    function searchForNumbers() {
        try {
            setSearchBtnClicked(true);
            if (phone.phoneNo && phone.phoneNo.length > 3) {
                setLoading(true);
                API.get(`${process.env.REACT_APP_BASE_API}${apiList.searchNumbers}/${countryAbbrevation}/${phone.countryCode}${phone.phoneNo}`, {}, {})?.subscribe({
                    next(res: any) {
                        if (res.status === 200) {
                            setSearchedNumber(phone)
                            getNumberPrice()
                            console.log("res : ", res);
                            setLoading(false);
                            setNumbers(res.data);
                            setSearchBtnClicked(false);
                        }
                    },
                    error(err) {
                        setSearchBtnClicked(false);
                        console.log(err);
                    },
                });
            } else setLoading(false);
        } catch (error: any) {
            console.log("inside catch : ", error);

            setSearchBtnClicked(false);
        }
    }

    function _setCardDetails(card: Object) {
        setCardDetails(card);
        console.log("card : ", card);

        setCardList([...cardList, card])
    }

    function checkIsCardAdded(user = userDetails) {
        try {
            const body = {
                userId: user.currentuserId,
                businessId: user.businessId
            }
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.isCardAdded}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) setIsCardAdded(res.data.isCardDetailsAdded)
                }
            });
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    function getCardList(user = userDetails) {
        try {
            const body = {
                userId: user.currentuserId,
                businessId: user.businessId
            }
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.getAllCards}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setCardList(res.data);
                        const defaultCard = res.data.filter((card: any) => {
                            return card.isDefaultCard === true
                        })
                        setSelectedCard(defaultCard[0]);
                    }
                }
            });
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    function postBusinessDetails() {
        setIsBtnClicked(true)
        if (
            !ValidateNumber(businessDetails.appId, '', 25).isError &&
            !ValidateNumber(businessDetails.phoneNoId, '', 25).isError &&
            !ValidateNumber(businessDetails.whatsappBusinessId, '', 25).isError &&
            !ValidateMobile(businessDetails.testNumber).isError &&
            !ValidateEmptyField(businessDetails.token).isError
        ) {
            const body = {
                appId: businessDetails.appId,
                phonenoId: businessDetails.phoneNoId,
                whatsappbusinessAccountId: businessDetails.whatsappBusinessId,
                testNumber: businessDetails.testNumber,
                token: businessDetails.token,
            }
            // props.linkNumber();
            // props.setIsDisable();
            setIsBtnClicked(false)
            API.post(`${process.env.REACT_APP_BASE_API}${apiList.postBusinessDetails}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        Toast({ type: 'success', message: 'Business details saved successfully' });
                        props.linkNumber();
                        props.setIsDisable();
                        setIsBtnClicked(false)
                    }
                }
            });
        }
    }

    return (
        <div className='get-number-wrapper'>
            <div className='settings-title'><IconButton onClick={() => {
                props.switchThirdTab("LinkedNumbers");
                navigate(-1)
            }} style={{ outlineWidth: 0 }}><ArrowBack style={{ color: '#075E54' }} /></IconButton>  Add Business Account</div>
            <div style={{ display: 'flex' }}>
                <div>
                    <div className="field-wrapper add-business-field">
                        <input type="text" onChange={(e) => setBusinessDetails({ ...businessDetails, appId: e.target.value })}
                            defaultValue={businessDetails.appId} disabled={loading} />
                        <div className="field-placeholder">App ID<Asterisk /></div>
                        <div className='error'>{isBtnClicked && ValidateNumber(businessDetails.appId, "App ID", 25).err}</div>
                    </div>
                    <div className="field-wrapper add-business-field">
                        <input type="text" onChange={(e) => setBusinessDetails({ ...businessDetails, phoneNoId: e.target.value })}
                            defaultValue={businessDetails.phoneNoId} disabled={loading} />
                        <div className="field-placeholder">Phone Number ID<Asterisk /></div>
                        <div className='error'>{isBtnClicked && ValidateNumber(businessDetails.phoneNoId, "Phone Number ID", 25).err}</div>
                    </div>
                    <div className="field-wrapper add-business-field">
                        <input type="text" onChange={(e) => setBusinessDetails({ ...businessDetails, whatsappBusinessId: e.target.value })}
                            defaultValue={businessDetails.whatsappBusinessId} disabled={loading} />
                        <div className="field-placeholder">Whatsapp Business Account ID<Asterisk /></div>
                        <div className='error'>{isBtnClicked && ValidateNumber(businessDetails.whatsappBusinessId, "Whatsapp Business Account ID", 25).err}</div>
                    </div>
                </div>
                <div>
                    <div className='input-wrapper'>
                        <div className='field-wrapper add-business-field'>
                            <div className="field-placeholder">Whatsapp Number<Asterisk /></div>
                            <PhoneInput
                                containerStyle={{ width: 'fit-content', fontFamily: 'Poppins', fontSize: 14 }}
                                country={'in'}
                                countryCodeEditable={false}
                                searchStyle={{ width: '85%', fontFamily: 'Poppins', fontSize: 12, padding: 5 }}
                                inputStyle={{ fontFamily: 'Poppins', fontSize: 12 }}
                                value={`${businessDetails.testNumber}`}
                                searchPlaceholder="Search"
                                onChange={(number, obj: any) => {
                                    setBusinessDetails({ ...businessDetails, testNumber: `+${obj.dialCode}${number.slice(obj.dialCode.length)}` })
                                    // setPhone({ countryCode: `+${obj.dialCode}`, phoneNo: number.slice(obj.dialCode.length) });
                                    // setCountryAbbrevation(obj.countryCode);
                                }}
                                enableSearch={true}
                            />
                            <div className='error' style={{ marginTop: 0 }}>{isBtnClicked && ValidateMobile(businessDetails.testNumber, "Whatsapp Number").err}</div>
                        </div>
                    </div>
                    <div className="field-wrapper add-business-field">
                        <input type="text" onChange={(e) => setBusinessDetails({ ...businessDetails, token: e.target.value })}
                            defaultValue={businessDetails.token} disabled={loading} />
                        <div className="field-placeholder">Permanent Token<Asterisk /></div>
                        <div className='error'>{isBtnClicked && ValidateEmptyField(businessDetails.token, "Permanent Token").err}</div>
                    </div>
                </div>
            </div>
            <Button
                className='submit-business-details-btn'
                variant='contained'
                disabled={false}
                onClick={postBusinessDetails}
            >Submit</Button>
            <div style={{ fontSize: 12, margin: 10, marginTop: 30 }}>
                Do not have these details?
                <a className='redirect-to-meta-btn' href="https://developers.facebook.com/apps/?show_reminder=true" target="_blank" rel="noreferrer">
                    Create Meta Developer Account
                </a>
                {/* <Button
                    className='redirect-to-meta-btn'
                    // href='https://developers.facebook.com/apps/?show_reminder=true'
                    variant='contained'
                    disabled={false}
                    onClick={() => window.location.replace('https://developers.facebook.com/apps/?show_reminder=true')}
                >Create Meta Developer Account</Button> */}
            </div>
            {/*<span style={{ color: '#075E54', fontSize: 14 }}>*App ID</span>
             <CssTextField
                variant="outlined"
                className='text-field'
                id="outlined-basic" label=""
                defaultValue={token}
                multiline={true}
                disabled={false}
                inputProps={{ style: { fontSize: 12, padding: 0 } }} // font size of input text
                onChange={(e: any) => setToken(e.target.value)}
            /> */}
            {
                addCardDialog &&
                <AddDialog
                    open={addCardDialog}
                    closeDialog={() => setAddCardDialog(false)}
                    _setCardDetails={_setCardDetails}
                    onAddCardSuccess={onAddCardSuccess}
                />
            }
            <AddMobileNumber
                open={addMobileNumberDialog}
                onAddSuccess={() => { }}
                closeDialog={() => { setAddMobileNumberDialog(false) }}
            />

            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                // onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
                transitionDuration={400}
            >
                <div className='dialog-wrapper'>
                    <div className='dialog-title' style={{ fontSize: 16, marginBottom: 25 }}>Link Number</div>
                    Are you sure you want to link <span style={{ fontWeight: 'bold' }}>+91 8286789657</span> to {userDetails.businessName}?
                    <div className="dialog-action-buttons">
                        <LoadingButton
                            loading={getNumberLoading}
                            variant="outlined"
                            size='small'
                            loadingIndicator={<Spinner />}
                            onClick={() => setShowCards(true)}
                            className='dialog-btn-positive'
                        >
                            {!getNumberLoading && "Get"}
                        </LoadingButton>
                        <Button variant="outlined" className='dialog-btn-danger' onClick={handleClose}>Cancel</Button>
                    </div>
                </div>
            </Dialog>

            <Dialog
                open={showCards}
                TransitionComponent={Transition}
                keepMounted
                // onClose={() => setShowCards(false)}
                aria-describedby="alert-dialog-slide-description"
                transitionDuration={400}
            >
                <div className='dialog-wrapper'>
                    <>
                        <div className='dialog-title' style={{ fontSize: 16 }}>Choose card for payment</div>
                        <div className='dialog-body' style={{ padding: 15, color: "#333" }}>
                            {
                                isCardAdded ?
                                    <span><br />Proceed for payment with card ending {selectedCard.cardNumber} <Button style={{ padding: 5 }} onClick={() => setIsCardAdded(false)}><Edit style={{ fontSize: 14, color: '#666', padding: 0 }} fontSize='small' /></Button></span>
                                    :
                                    cardList.length > 0 &&
                                    <span>
                                        {cardList.map((card, index) =>
                                            <div className='card-number-wrapper' onClick={() => setSelectedCard(card)} style={{ backgroundColor: selectedCard && selectedCard.cardId === card.cardId ? '#eaeef7' : "#FFF" }}>
                                                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                                    <div><CreditCardOutlined style={{ marginRight: 5 }} />**** - **** - **** - {card.cardNumber} </div>
                                                </div>
                                                <div style={{ display: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <div style={{ textAlign: 'center', marginTop: 5, fontSize: 11, fontWeight: 'normal', marginLeft: 25 }}><div style={{ fontSize: 9, color: '#8796af' }}>Name on card</div>{card.name}</div>
                                                    <div style={{ textAlign: 'center', marginTop: 5, fontSize: 11, fontWeight: 'normal' }}><div style={{ fontSize: 9, color: '#8796af' }}>Expiry</div>{card.expiryMonth}/{card.expiryYear && JSON.stringify(card.expiryYear).slice(-2)}</div>
                                                </div>
                                            </div>)}
                                        <IconButton style={{ outlineWidth: 0, padding: 0, fontSize: 13, marginTop: 15, color: '#444' }} onClick={() => setAddCardDialog(true)}>
                                            Add card<AddCardOutlined style={{ marginLeft: 5, cursor: 'pointer' }} />
                                        </IconButton>
                                        {cardList.length === 0 && <span style={{ color: "#888", fontSize: 10 }}>There no cards have been added!</span>}
                                    </span>

                            }
                            <div className="dialog-action-buttons" style={{ marginBottom: 0, direction: 'rtl' }}>
                                <LoadingButton
                                    loading={getNumberLoading}
                                    variant="outlined"
                                    size='small'
                                    disableElevation={false}
                                    loadingIndicator={<Spinner />}
                                    onClick={onConfirm}
                                    className='dialog-btn-positive'
                                    style={{ width: 100, backgroundColor: '#ddd !important' }}
                                >
                                    {!getNumberLoading && "Proceed"}
                                </LoadingButton>
                                <Button variant="outlined" className='dialog-btn-danger' onClick={() => setShowCards(false)}>Cancel</Button>
                            </div>
                        </div>
                    </>
                </div>
            </Dialog>
        </div >
    )
}
