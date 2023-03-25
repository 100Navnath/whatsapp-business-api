import React, { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog';
import { TransitionProps } from '@mui/material/transitions';
import Slide from '@mui/material/Slide';
import Asterisk from '../Asterisk';
import { Button } from '@material-ui/core'
import { ValidateEmptyField } from '../validators';
import { LoadingButton } from '@mui/lab';
import Spinner from '../Loading/spinner';
import Cards from 'react-credit-cards';
import "react-credit-cards/es/styles-compiled.css";
import { getFromLocalStorage } from '../LocalStorage/localStorage';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { apiList } from '../../constant/apiList';
import { API } from '../../constant/network';
import Toast from '../Toast/Toast';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="down" ref={ref} {...props} />;
});

interface AddCardProps {
    open: boolean
    closeDialog: VoidFunction
    caption?: string
    _setCardDetails: any //function
    onAddCardSuccess?: any //function
}

export default function AddDialog({ open, caption, closeDialog, onAddCardSuccess = () => { }, _setCardDetails }: AddCardProps) {
    const [addCardDialog, setAddCardDialog] = useState(open);
    const [isBtnClicked, setIsBtnClicked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cardDetails, setCardDetails] = useState<any>(
        {
            id: Math.random(),
            "number": "",
            "nameOnCard": "",
            "expiry": "",
            "default": false,
            "cvv": ""
        }
    );
    useEffect(() => {
        // console.log("open changes", open);
        setAddCardDialog(open)
    }, [open])

    function resetForm() {
        setCardDetails({
            "id": Math.random(),
            "number": "",
            "nameOnCard": "",
            "expiry": "",
            "default": false,
            cvv: ""
        });
    }

    function closeAddCardDialog() {
        setAddCardDialog(false);
        closeDialog();
        resetForm()
        setIsBtnClicked(false);
    }

    async function addCard() {
        try {
            setIsBtnClicked(true);
            if (
                cardDetails.number != "" &&
                cardDetails.nameOnCard != "" &&
                cardDetails.expiry != "" &&
                cardDetails.cvv != ""
            ) {
                setLoading(true);
                const user = await getFromLocalStorage("user");
                const expiryDate = new Date().setMonth(parseInt(cardDetails.expiry.slice(0, 2)) - 1);
                const yearSet = new Date(expiryDate).setFullYear(parseInt(`20${cardDetails.expiry.slice(-2)}`))
                const body = {
                    "name": cardDetails.nameOnCard,
                    "email": user.email,
                    "expiryMonthYear": new Date(yearSet).toISOString(),
                    "cvv": cardDetails.cvv,
                    "cardNumber": cardDetails.number,
                    "isDefaultCard": cardDetails.isDefaultCard,
                    "userId": user.currentuserId,
                    "businessId": user.businessId
                }
                API.post(`${process.env.REACT_APP_BASE_API}${apiList.addCard}`, body, {})?.subscribe({
                    next(res: any) {
                        console.log("res of addCard : ", res);

                        if (res.status === 200) {
                            // setTimeout(() => {
                            Toast({ message: 'Card added successfully', type: 'success' })
                            _setCardDetails(res.data.cardDetails ? { ...res.data.cardDetails, name: cardDetails.nameOnCard } : { ...cardDetails });
                            closeAddCardDialog();
                            onAddCardSuccess();
                            setLoading(false);
                            resetForm()
                            setIsBtnClicked(false);
                            // }, 2000);
                        }
                    },
                    error(err) {
                        setLoading(false)
                    },
                });
            }
        } catch (error) {
            setLoading(false)
        }

    }

    const handleInputFocus = (e: any) => {
        setCardDetails({ ...cardDetails, focus: e.target.name });
    }

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setCardDetails({ ...cardDetails, [name]: value });
    }

    return (
        <Dialog
            open={addCardDialog}
            TransitionComponent={Transition}
            keepMounted
            onClose={closeAddCardDialog}
            aria-describedby="alert-dialog-slide-description"
            transitionDuration={400}
        >
            <div className='dialog-wrapper'>
                <div className='dialog-title' style={{ fontSize: 16, marginBottom: 25 }}>Add Card</div>
                {
                    caption && <div style={{ marginBottom: 10 }}><i>*Add card to procced for make payment</i></div>
                }
                <div style={{ padding: 20 }}>
                    <div id="PaymentForm">
                        <Cards
                            cvc={cardDetails.cvv}
                            expiry={cardDetails.expiry}
                            focused={cardDetails.focus}
                            name={cardDetails.nameOnCard}
                            number={cardDetails.number}
                        />
                    </div>
                    <div style={{ flexDirection: 'row', display: 'flex', justifyContent: 'space-between', marginBottom: 35, marginTop: 35 }}>
                        <div className="field-wrapper" style={{ margin: 0, width: "65%" }} >
                            <input name="number" onFocus={handleInputFocus} value={cardDetails.number} maxLength={16}
                                onChange={(e) => (e.target.value === '' || /^[0-9\b]+$/.test(e.target.value)) && setCardDetails({ ...cardDetails, number: e.target.value })}
                                contentEditable={true} placeholder='****-****-****-****'
                            />
                            <div className="field-placeholder">Card Number<Asterisk /></div>
                            <div className='error' >{isBtnClicked && ValidateEmptyField(cardDetails.number, "Card number").err}</div>
                        </div>
                        <div className="field-wrapper" style={{ width: "30%", margin: 0 }}>
                            <input type="text" name="expiry" onFocus={handleInputFocus} value={cardDetails.expiry} placeholder={"MM/YY"} onChange={(e) => {
                                if (e.target.value.length === 2 && !cardDetails.expiry.includes('/')) {
                                    if (parseInt(e.target.value) < 13 && parseInt(e.target.value) > 0) {
                                        console.log("inside if");
                                        setCardDetails({ ...cardDetails, expiry: `${e.target.value}/` })
                                    }
                                }
                                else if (e.target.value.length !== 6) {
                                    console.log("inside else if");
                                    setCardDetails({ ...cardDetails, expiry: e.target.value })
                                }
                            }
                            } />
                            <div className="field-placeholder">Expiry Date<Asterisk /></div>
                            <div className='error' >{isBtnClicked && ValidateEmptyField(cardDetails.expiry, "Expiry date").err}</div>
                        </div>
                    </div>
                    <div style={{ flexDirection: 'row', display: 'flex', justifyContent: 'space-between', marginBottom: 15, marginTop: 35 }}>
                        <div className="field-wrapper" style={{ width: '75%', margin: 0 }}>
                            <input type="text" name="name" onFocus={handleInputFocus} value={cardDetails.nameOnCard} placeholder={"Enter Name"} onChange={(e) => setCardDetails({ ...cardDetails, nameOnCard: e.target.value })} />
                            <div className="field-placeholder">Name On Card<Asterisk /></div>
                            <div className='error' >{isBtnClicked && ValidateEmptyField(cardDetails.nameOnCard, "Name").err}</div>
                        </div>
                        <div className="field-wrapper" style={{ width: "20%", margin: 0 }}>
                            <input type="text" name="cvc" maxLength={3} onFocus={handleInputFocus} value={cardDetails.cvv}
                                placeholder={"***"} onChange={(e) => (e.target.value === '' || /^[0-9\b]+$/.test(e.target.value)) && setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                onKeyPress={(event) => {
                                    if (!/[0-9]/.test(event.key)) {
                                        event.preventDefault();
                                    }
                                }}
                            />
                            <div className="field-placeholder">CVV<Asterisk /></div>
                            <div className='error' >{isBtnClicked && ValidateEmptyField(cardDetails.cvv, "CVV").err}</div>
                        </div>
                    </div>
                    {/* <div style={{ justifyContent: 'flex-start', display: 'flex', alignItems: 'center', marginBottom: 35, }}>
                        <FormControlLabel control={<Switch color='primary' size='small' checked={cardDetails.isDefaultCard} onChange={(e: any) => {
                            setCardDetails({ ...cardDetails, isDefaultCard: e.target.checked });
                        }} />} label={<span className='toggle-label' >Set as default card</span>} />
                    </div> */}
                    <div className="dialog-action-buttons" style={{ direction: 'rtl' }}>
                        <LoadingButton
                            loading={loading}
                            variant="outlined"
                            size='small'
                            loadingIndicator={<Spinner />}
                            onClick={addCard}
                            className='dialog-btn-positive'
                        >
                            {!loading && "Add"}
                        </LoadingButton>
                        <Button variant="outlined" className='dialog-btn-danger' onClick={closeAddCardDialog}>Discard</Button>
                        {/* <Button variant="outlined" className='dialog-btn-positive' onClick={addCard}>{cardDetails.number.length > 1 ? "Save" : "Add"}</Button> */}
                    </div>
                </div>
            </div>
        </Dialog >
    )
}
