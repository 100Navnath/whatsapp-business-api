import React, { useState, useEffect } from 'react'
import './billing.css'
import { AcUnitOutlined, ArrowDropDown, CreditCardOutlined, DeleteOutline, DockOutlined, EditOutlined, SaveAltOutlined, Star, StarBorder } from '@material-ui/icons'
import { AddCardOutlined, CreditScore, StartOutlined } from '@mui/icons-material';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu'
import LineChart from '../../../components/LineChart'
import { Button } from '@material-ui/core'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { Skeleton, styled } from '@mui/material';
import { AnimatedList } from 'react-animated-list'
import numbersJson from '../../../assets/jsons/numbers.json'
import cards from '../../../assets/jsons/cards.json'
// import allTransactionJSON from '../../../assets/jsons/billing/allTransaction.json'
import Dialog from '@mui/material/Dialog';
import { TransitionProps } from '@mui/material/transitions';
import Slide from '@mui/material/Slide';
import topupPlans from '../../../assets/jsons/topupPlans.json'
import Scrollbars from 'react-custom-scrollbars';
import Asterisk from '../../../components/Asterisk';
import { API } from '../../../constant/network';
import { apiList } from '../../../constant/apiList';
import { ValidateEmptyField } from '../../../components/validators';
import Grid from '../../../components/Grid/Grid';
import AddDialog from '../../../components/AddCardDialog/AddDialog';
import Spinner from '../../../components/Loading/spinner';
import { getFromLocalStorage } from '../../../components/LocalStorage/localStorage';
// import CreditCardInput from 'react-credit-card-input';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';
import Toast from '../../../components/Toast/Toast';
import { useNavigate } from 'react-router-dom';

interface cardProps {
    id?: number,
    number: string,
    nameOnCard: string,
    expiry: string,
    default: boolean
}

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="down" ref={ref} {...props} />;
});

interface agentActivityinterface {
    id: number,
    transactionDate: string | Date | number,
    paymentBy: string,
    amount: string | number,
    status: string,
    invoice: string
}

export default function Billing() {
    const navigate = useNavigate()
    const [loggedInUser, setLoggedInUser] = useState<any>(undefined);
    const [credits, setCredits] = useState({ creditUsed: 0, totalCredit: 0 })
    const [addCardDialog, setAddCardDialog] = useState(false);
    const [addCardDialogCaption, setAddCardDialogCaption] = useState(false);
    const [cancelSubConfirmation, setCancelSubConfirmation] = useState(false);
    const [allCards, setAllCards] = useState<Array<any>>(Array);
    const [cardsLoading, setCardsLoading] = useState(false)
    const [topupPlans, setTopupPlans] = useState<Array<Object>>(Array);
    const [topupPlanLoading, setTopupPlanLoading] = useState(false);
    const [deleteConfirmationDialog, setDeleteConfirmationDialog] = useState(false);
    const [isBtnClicked, setIsBtnClicked] = useState(false);
    const [allTransaction, setAllTransactions] = useState<Array<agentActivityinterface>>(Array);
    const [isAddCard, setIsAddCard] = useState(Boolean) //to check if add card dialog is open or edit card dialog because using only 1 component for both
    const [cardDetails, setCardDetails] = useState<any>(
        {
            "number": "",
            "nameOnCard": "",
            "expiry": "",
            "default": false
        }
    );
    const [selectedTopupPlan, setSelectedTopupPlan] = useState<any>(undefined);
    const [linkedNumbers, setLinkedNumbers] = useState<Array<any>>([]);
    const [cancelSubscriptionNumbersLoading, setCancelSubscriptionNumbersLoading] = useState(false)
    const [chartData, setChartData] = useState<any>({ labels: [], data: [] });
    const [dropdown, setDropdown] = useState({ value: "today", label: 'Today' });
    const [visibility, setVisibility] = useState(false);
    const [isCancelSubDisable, setIsCancelSubDisable] = useState(true);
    const [makePaymentLoading, setmakePaymentLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(0);
    const [page, setPage] = useState(1)
    function openAddCardDialog() {
        setAddCardDialog(true);
        setIsAddCard(true)
        setCardDetails({
            "number": "",
            "nameOnCard": "",
            "expiry": "",
            "default": false
        })
        setIsBtnClicked(false);
    }

    function openDeleteConfirmationDialog(index: number) {
        if (!allCards[index].isDefaultCard) {
            setDeleteConfirmationDialog(true)
            setCardDetails(allCards[index])
        } else Toast({ message: "Default card cannot be deleted", type: 'warning' })
    }

    function closeAddCardDialog() {
        setAddCardDialog(false);
        setAddCardDialogCaption(false);
    }

    function closeDeleteConfirmationDialog() {
        setDeleteConfirmationDialog(false);
    }

    function onEditCard(index: any) {
        setCardDetails(allCards[index]);
        setIsAddCard(false)
        setAddCardDialog(true);
    }

    function onCancelSubDialog() {
        setCancelSubConfirmation(false)
    }

    function onConfirmSubDialog() {
        // API.get(`${process.env.REACT_APP_BASE_API}${apiList.cancelSubscription}`, cardDetails, {})?.subscribe({
        //     next(res: any) {
        //         if (res.status) {
        //             setAllCards([...allCards, cardDetails])
        setCancelSubConfirmation(false)
        //         }
        //     },
        //     error(err) {
        //         console.log(err);
        //     },
        // });
    }

    async function getAllCards() {
        try {
            setCardsLoading(true)
            const user = await getFromLocalStorage("user")
            const body = {
                businessId: user.businessId,
                userId: user.currentuserId
            }
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.getAllCards}`, body, {})?.subscribe({
                next(res: any) {
                    setCardsLoading(false)
                    console.log("cards : ", res);

                    if (res.status === 200) {
                        setAllCards(res.data);
                    }
                },
                error(err) {
                    setCardsLoading(false)
                    alert(err);
                },
            });
        } catch (error: any) {
            setCardsLoading(false)
            Toast({ message: error, type: 'error' })
        }
    }

    async function getLinkedNumbers() {
        try {
            setCancelSubscriptionNumbersLoading(true)
            const user = await getFromLocalStorage("user")
            const body = {
                businessId: user.businessId,
                userId: user.currentuserId
            }
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.cancelSubscriptionNumbers}`, body, {})?.subscribe({
                next(res: any) {
                    setCancelSubscriptionNumbersLoading(false)
                    console.log("linked numbers : ", res);
                    if (res.status === 200) {
                        setLinkedNumbers(res.data);
                    }
                },
                error(err) {
                    setCancelSubscriptionNumbersLoading(false)
                },
            });
        } catch (error: any) {
            setCancelSubscriptionNumbersLoading(false)
            Toast({ message: error, type: 'error' })
        }
    }

    //progress bar 
    async function getCreditUsed() {
        try {
            const user = await getFromLocalStorage("user");
            const body = {
                businessId: user.businessId,
                userId: user.currentuserId
            }
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.creditsusedVSRemaining}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setCredits(res.data)
                    }
                }
            });
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    async function getTransactions(take = 10, skip = 0, searchValue = undefined) {
        try {
            const user = await getFromLocalStorage("user");
            const body = {
                businessId: user.businessId,
                take,
                skip,
                searchValue: searchValue === "" ? undefined : searchValue
            }
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.getTransactions}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setTransactionCount(res.data.count);
                        if (skip === 0) {
                            setPage(1)
                            setAllTransactions([...res.data.lsttransaction])
                        }
                        else setPage(page + 1);
                    }
                }
            });
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    async function addCard() {
        setIsBtnClicked(true);
        if (
            cardDetails.number != "" &&
            cardDetails.nameOnCard != "" &&
            cardDetails.expiry != ""
        ) {
            const user = await getFromLocalStorage("user");
            const body = {
                "name": cardDetails.nameOnCard,
                "email": "string",
                "expiryMonthYear": cardDetails.expiry,
                "cvc": "string",
                "cardNumber": cardDetails.number,
                "country": "string",
                "isDefaultCard": true,
                "userId": user.currentuserId,
                "businessId": user.businessId
            }
            console.log("add card body : ", body);

            // API.post(`${process.env.REACT_APP_BASE_API}${apiList.addCard}`, body, {})?.subscribe({
            //     next(res: any) {
            //         if (res.status) {
            //             setCardDetails({ ...cardDetails, id: Math.random() })
            //             setAllCards([...allCards, cardDetails])
            //             closeAddCardDialog()
            //         }
            //     },
            //     error(err) {
            //         console.log(err);
            //     },
            // });
        }

    }

    function editCard() {
        setAllCards([...allCards,]);
        const newArray = allCards.map((obj: any) =>
            obj.id === cardDetails.id ? { ...obj, ...cardDetails } : obj
        );
        setAllCards([...newArray]);
        closeAddCardDialog()
        // API.put(`${process.env.REACT_APP_BASE_API}${apiList.editCard}`, cardDetails, {})?.subscribe({
        //     next(res: any) {
        //         if (res.status) {
        //             setAllCards([...allCards,]);
        //             const newArray = allCards.map((obj: any) =>
        //                 obj.id === cardDetails.id ? { ...obj, ...cardDetails } : obj
        //             );
        //             setAllCards([...newArray]);
        //         }
        //     },
        //     error(err) {
        //         console.log(err);
        //     },
        // })
    }

    async function deleteCard() {
        try {
            const user = await getFromLocalStorage("user");
            const body = {
                StripeCardId: cardDetails.cardId,
                businessId: user.businessId,
                userId: user.currentuserId
            }
            API.deleteApi(`${process.env.REACT_APP_BASE_API}${apiList.deleteCard}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status) {
                        Toast({ message: "Card deleted successfully", type: 'success' })
                        const filteredCards = allCards.filter((item) => item.cardId !== cardDetails.cardId);
                        setAllCards([...filteredCards]);
                        closeDeleteConfirmationDialog()
                    }
                }
            })
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    async function getLoggerInUser() {
        const user = await getFromLocalStorage("user")
        if (!user) {
            navigate("/");
        } else {
            setLoggedInUser({ ...user })
            if (user.linkedNumbers.length > 0) {
                setIsCancelSubDisable(false)
            }
        }
    }

    useEffect(() => {
        getLoggerInUser()
        getAllCards();
        getTransactions();
        getTopupPlans();
        getCreditUsed()
    }, [])

    async function makePayment() {
        try {
            const user = await getFromLocalStorage("user");
            if (selectedTopupPlan) {
                if (allCards.length > 0) {
                    const defaultCard = allCards.filter(obj => obj.isDefaultCard && obj.cardId)[0]
                    if (defaultCard) {
                        setIsBtnClicked(false);
                        setmakePaymentLoading(true);
                        const body = {
                            "customerId": user.currentuserId,
                            "stripeCreditPlanId": selectedTopupPlan.stripePlanId,
                            "creditPlanId": selectedTopupPlan.id,
                            "businessId": user.businessId,
                            "userId": user.currentuserId,
                            "paymentMethodType": "card",
                            "planCredits": selectedTopupPlan.planCredit,
                            "creditPlanDescription": selectedTopupPlan.planPrice,
                            "creditPlanPrice": selectedTopupPlan.planPrice,
                            "stripeCardId": defaultCard.cardId
                        }
                        // console.log("make payment body : ", body);
                        API.post(`${process.env.REACT_APP_BASE_API}${apiList.makePayment}`, body, {})?.subscribe({
                            next(res: any) {
                                if (res.status === 200) {
                                    getCreditUsed()
                                    Toast({ message: `${selectedTopupPlan.planCredit} credits added successfully`, type: 'success' })
                                    setSelectedTopupPlan(undefined)
                                    getCreditUsed();
                                    getTransactions();
                                    setmakePaymentLoading(false);
                                }
                            },
                            error(err) {
                                setmakePaymentLoading(false);
                            },
                        })
                    } else Toast({ message: 'Please set any one card as default to proceed for payment', type: 'warning' })
                } else {
                    const body = {
                        userId: user.currentuserId,
                        businessId: user.businessId
                    }
                    API.get(`${process.env.REACT_APP_BASE_API}${apiList.isCardAdded}`, body, {})?.subscribe({
                        next(res: any) {
                            if (res.status === 200 && !res.data.isCardDetailsAdded) {
                                Toast({ message: "Add card to proceed for payment", type: 'info' })
                                setAddCardDialogCaption(true);
                                openAddCardDialog();
                            }
                        },
                        error(err) {
                            console.log(err);
                        },
                    })
                }
            } else {
                setIsBtnClicked(true);
                Toast({ message: "Please select top-up plan", type: 'warning' })
                // setAddCardDialog(true);
            }
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
            setIsBtnClicked(false);
            setmakePaymentLoading(true);
        }
    }

    function getTopupPlans() {
        try {
            setTopupPlanLoading(true);
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.topUpPlans}`, {}, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setTopupPlanLoading(false)
                        setTopupPlans(res.data);
                    }
                },
                error(err) {
                    setTopupPlanLoading(false)
                },
            })
        } catch (error: any) {
            setTopupPlanLoading(false)
            Toast({ message: error, type: 'error' })
        }
    }

    async function setAsDefault(index: number) {
        try {
            const user = await getFromLocalStorage("user");
            const clickedCard = allCards[index]
            const body = {
                StripeCardId: clickedCard.cardId,
                businessId: user.businessId,
                userId: user.currentuserId
            }
            API.put(`${process.env.REACT_APP_BASE_API}${apiList.setAsDefault}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setCardsLoading(false);
                        let newArray = allCards;
                        var foundIndex = newArray.findIndex(c => c.isDefaultCard == true);
                        newArray[foundIndex] = { ...newArray[foundIndex], isDefaultCard: false };
                        newArray[index] = { ...newArray[index], isDefaultCard: true }
                        setAllCards([...newArray]);
                        // setTopupPlans(res.data);
                        Toast({ message: `Card ending with ${clickedCard.cardNumber} has been set default successfully`, type: 'success' })
                    }
                },
                error(err) {
                    console.log(err);
                },
            })
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
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

    const today = {
        labels: ["9 AM", "11 AM", "1 PM", "3 PM", "5 PM", "7 PM", "9 PM"],
        data: [32, 24, 42, 35, 67, 34, 33]
    }
    const thisWeek = {
        data: [25, 59, 31, 65, 59, 55, 65],
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    }
    const thisMonth = {
        data: [25, 33, 31, 32, 23, 23, 34, 25, 32, 31, 42, 59, 55, 65, 55, 59, 55, 65, 59, 55, 65, 55, 59, 55, 65, 59, 55, 65, 65, 45],

    }
    const thisYear = {
        data: [23, 23, 34, 25, 32, 31, 42, 59, 55, 65, 55, 59],
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

    }

    async function getCreditsUsedLineChartData() {
        try {
            const user = await getFromLocalStorage("user");
            const body = {
                businessId: user.businessId,
                DurationType: dropdown.value
            }
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.getCreditUsed}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        let creditsUsed = Array(res.data.billingLineGraph.labels.length).fill(0)
                        for (let i = 0; i < res.data.creditsUsageModel.hours.length; i++) {
                            const index = res.data.billingLineGraph.labels.findIndex(function (object: any) {
                                return object === res.data.creditsUsageModel.hours[i];
                            })
                            creditsUsed[index] = res.data.creditsUsageModel.creditused[i]
                        }
                        setChartData({
                            labels: res.data.billingLineGraph.labels,
                            data: creditsUsed
                        })
                    }
                },
                error(err) {
                    console.log(err);
                },
            })
        } catch (error: any) {

        }
    }

    async function downloadInvoice(index: number) {
        try {
            const user = await getFromLocalStorage("user");
            const body = {
                businessId: user.businessId,
                transactionId: allTransaction[index].id
            }
            axios.get(`${process.env.REACT_APP_BASE_API}${apiList.downloadInvoice}?businessId=${user.businessId}&transactionId=${allTransaction[index].id}`,
                {
                    headers: {
                        'Content-Disposition': "attachment; filename=invoice.pdf",
                        'Content-Type': 'application/pdf'
                    },
                    responseType: 'arraybuffer',
                }
            ).then((response: any) => {
                console.log(response);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'invoice.pdf');
                document.body.appendChild(link);
                link.click();
            })
                .catch((error: any) => Toast({ message: error, type: 'error' }));
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    const creditsUsedOptions = [
        { value: "today", label: 'Today' },
        { value: "week", label: 'This Week' },
        { value: "month", label: 'This Month' },
        { value: "year", label: 'This Year' },
    ]

    useEffect(() => {
        getCreditsUsedLineChartData()
    }, [dropdown.value])

    return (
        <div className='billing-wrapper'>
            <div style={{ width: '100%', justifyContent: 'space-between', display: 'flex' }}>
                <div className='settings-title'>Billing Management</div>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                        {
                            credits.creditUsed &&
                            <div style={{ fontSize: 12, color: '#666' }}>
                                <b>{credits.creditUsed}</b> {credits.totalCredit && <span>of <b>{credits.totalCredit}</b></span>} Credits Used
                            </div>
                        }
                        {
                            credits.totalCredit && credits.creditUsed &&
                            <div className="progress _progress-bar">
                                <div className="progress-bar filled-progress" role="progressbar" style={{ width: `${credits.creditUsed / credits.totalCredit * 100}%` }} />
                            </div>
                        }
                    </div>
                    <Button disabled={isCancelSubDisable} disableElevation={true} onClick={() => {
                        getLinkedNumbers();
                        setCancelSubConfirmation(true)
                    }} style={{ backgroundColor: isCancelSubDisable ? '#777' : '#ff666e', color: '#fff', fontSize: 12, height: 35, padding: 10, border: '0px solid green' }}>Cancel Subscription
                    </Button>
                </div>
            </div>
            <div className='row' style={{ padding: 15 }}>
                <div className="line-chart">
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <div className='field-wrapper' style={{ fontSize: 14 }}>Your Credit Usage</div>
                        <div style={{ marginBottom: 0, margin: 10 }}>
                            <Button onClick={() => setVisibility(!visibility)} style={{ cursor: 'pointer', fontSize: 12 }}>{dropdown.label}<ArrowDropDown /></Button>
                            {
                                visibility &&
                                <div className='dropdown-options-wrapper'>
                                    <AnimatedList animation={"zoom"}>
                                        {creditsUsedOptions.map(i => <div className='dropdown-item' onClick={() => {
                                            setDropdown(i);
                                            setVisibility(false);
                                        }}>{i.label}</div>)}
                                    </AnimatedList>
                                </div>
                            }
                        </div>
                    </div>
                    <LineChart height={2} width={5} data={chartData.data} labels={chartData.labels} labelVisibility={true} />
                </div>
                <div>
                    <div className='default-card-wrapper'>
                        <div style={{ borderBottom: '1px solid #555', display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}>
                            <div className='sub-header' style={{ marginBottom: 5 }}>Card Details</div>
                            <GridTooltip title="Add Card" placement="bottom">
                                <IconButton style={{ outlineWidth: 0, padding: 0 }}>
                                    <AddCardOutlined onClick={openAddCardDialog} style={{ color: '#1273eb', marginRight: 10, cursor: 'pointer' }} />
                                </IconButton>
                            </GridTooltip>
                        </div>
                        <Scrollbars>
                            <div style={{ paddingRight: 15, paddingBottom: 40 }}>
                                {allCards.map((card, index) =>
                                    <div className='card-number-wrapper' style={{ backgroundColor: card.isDefaultCard ? '#eaeef7' : "#FFF" }}>
                                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                            <div><CreditCardOutlined style={{ marginRight: 5 }} />**** - **** - **** - {card.cardNumber} </div>
                                            <div>
                                                <GridTooltip title="Delete" placement="bottom"><DeleteOutline onClick={() => openDeleteConfirmationDialog(index)} style={{ fontSize: 14, color: '#FF5858', cursor: 'pointer', marginRight: 4 }} /></GridTooltip>

                                                {
                                                    card.isDefaultCard ?
                                                        <GridTooltip title="Default Card" placement="bottom">
                                                            <Star style={{ fontSize: 14, color: '#1273eb', cursor: 'pointer' }} />
                                                        </GridTooltip>
                                                        :
                                                        <GridTooltip title="Set as default" placement="bottom">
                                                            <StarBorder onClick={() => setAsDefault(index)} style={{ fontSize: 14, color: '#1273eb', cursor: 'pointer' }} />
                                                        </GridTooltip>
                                                }
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <div style={{ textAlign: 'center', marginTop: 5, fontSize: 11, fontWeight: 'normal', marginLeft: 25 }}><div style={{ fontSize: 9, color: '#8796af' }}>Name on card</div>{card.name}</div>
                                            <div style={{ textAlign: 'center', marginTop: 5, fontSize: 11, fontWeight: 'normal' }}><div style={{ fontSize: 9, color: '#8796af' }}>Expiry</div>{card.expiryMonth}/{card.expiryYear && JSON.stringify(card.expiryYear).slice(-2)}</div>
                                        </div>
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {allCards.length === 0 && !cardsLoading ?
                                        < span style={{ color: "#888", fontSize: 10 }}>There no cards have been added!</span> :
                                        cardsLoading && <Spinner color='#1273eb' />}
                                </div>
                            </div>
                        </Scrollbars>
                        <div style={{ flexDirection: 'row', display: 'flex', justifyContent: 'space-around', color: '#666', marginTop: 10, padding: 5 }}>
                            {/* <GridTooltip title="Edit Details" placement="bottom"><div style={{ fontSize: 12, color: '#1273eb', cursor: 'pointer' }} onClick={onAddCard}><AddCardOutlined style={{ marginRight: 5 }} />Add Card</div></GridTooltip> */}
                            <GridTooltip title="Edit Details" placement="bottom"><div style={{ fontSize: 12, color: '#1273eb', cursor: 'pointer' }}>Change Default Card</div></GridTooltip>
                        </div>
                    </div>
                </div>
            </div >
            <div className='top-up-plans-wrapper'>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #666', paddingBottom: 5 }}>
                    <div className='sub-header' style={{ marginBottom: 0 }}>Top-up Plans for Werq Credits</div>
                    <Button onClick={makePayment} style={{ width: 120, backgroundColor: '#1273eb', color: '#fff', fontSize: 12, padding: 5, height: 30, border: '0px solid green' }}>
                        {!makePaymentLoading ? "Make Payment" : <Spinner />}
                    </Button>
                </div>
                {/* {isBtnClicked && !selectedTopupPlan && "Select plan"} */}
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, alignItems: 'center' }}>
                    {
                        !topupPlanLoading ?
                            topupPlans.map((plan: any) =>
                                <div onClick={() => setSelectedTopupPlan(plan)} className={selectedTopupPlan && plan.id == selectedTopupPlan.id ? 'top-up-plan active-top-up-plan' : 'top-up-plan'}>
                                    <div>{plan.planCredit} Credits
                                        <div style={{ fontSize: 9, color: '#8796af' }}>{plan.planValidity ? plan.planValidity : "No Expiration"}</div>
                                    </div>
                                    <div className='top-up-plan-btn'>${plan.planPrice}</div>
                                </div>)
                            :
                            [1, 1, 1, 1].map(() =>
                                <span className='top-up-plan'>
                                    <span>
                                        <Skeleton variant="text" style={{ fontSize: 14, width: 100 }} />
                                        <Skeleton variant="text" style={{ fontSize: 12, width: 70 }} />
                                    </span>
                                    <Skeleton variant="text" style={{ fontSize: 20, width: 50 }} />
                                </span>
                            )
                    }
                </div>
            </div>
            <div className='row'>
                <div style={{ width: '100%', backgroundColor: '#FFF', margin: 15, borderRadius: 5 }}>
                    <Grid
                        title='Transaction history'
                        data={allTransaction}
                        columns={[
                            { header: 'Transaction Date', value: (_, index: number) => <span>{new Date(allTransaction[index].transactionDate).toLocaleDateString()}</span>, propertyName: "transactionDate", width: 180 },
                            { header: 'Paid By', value: "paymentBy" },
                            { header: 'Amount($)', value: "amount" },
                            { header: 'Status', value: "status" },
                        ]}
                        isActions={true}
                        actions={[{
                            component: <GridTooltip title="Download Invoice" placement="bottom"><SaveAltOutlined className='grid-icon' fontSize='small' /></GridTooltip>,
                            onClick: (_: any, index: number) => { downloadInvoice(index) }
                        }]}
                        pagination={true}
                        globalSearch={false}
                        onPageChange={(t: number, s: number, searchValue: any) => getTransactions(t, s, searchValue)}
                        onColumnSearch={(t: number, s: number, searchValue: any) => getTransactions(t, s, searchValue)}
                        totalCount={transactionCount}
                    />
                </div>
            </div>

            <AddDialog
                open={addCardDialog}
                closeDialog={() => setAddCardDialog(false)}
                _setCardDetails={(card: Object) => {
                    setCardDetails(card);
                    setAllCards([card, ...allCards])
                }}
            />

            <Dialog
                open={cancelSubConfirmation}
                TransitionComponent={Transition}
                keepMounted
                // onClose={onCancelSubDialog}
                aria-describedby="alert-dialog-slide-description"
                transitionDuration={400}
            >
                <div className='dialog-wrapper'>
                    <div className='dialog-title' style={{ fontSize: 16, marginBottom: 25 }}>Cancel Subscription</div>
                    Are you sure you want to cancel subscription of all numbers? Cancelling subscription will cause releasing these numbers{" "}
                    {
                        !cancelSubscriptionNumbersLoading ?
                            linkedNumbers.map((number: string, index: number) => <b>{`${number}${(index + 1) === linkedNumbers.length ? '' : ', '}`}</b>) :
                            <><br /><Spinner color='#1273eb' /></>
                    }
                    <div className="dialog-action-buttons" style={{ direction: 'rtl' }}>
                        <Button disabled={cancelSubscriptionNumbersLoading} variant="outlined" className='dialog-btn-positive' onClick={onConfirmSubDialog}>Confirm</Button>
                        <Button disabled={cancelSubscriptionNumbersLoading} variant="outlined" className='dialog-btn-danger' onClick={onCancelSubDialog}>Cancel</Button>
                    </div>
                </div>
            </Dialog>
            <Dialog
                open={deleteConfirmationDialog}
                TransitionComponent={Transition}
                keepMounted
                // onClose={closeDeleteConfirmationDialog}
                aria-describedby="alert-dialog-slide-description"
                transitionDuration={400}
            >
                <div className='dialog-wrapper'>
                    <div className='dialog-title' style={{ fontSize: 16, marginBottom: 25 }}>Delete Card</div>
                    Are you sure you want to delete card ending with <span style={{ fontWeight: 'bold' }}>{cardDetails.cardNumber}</span>?
                    <div className="dialog-action-buttons" style={{ direction: 'rtl' }}>
                        <Button variant="outlined" className='dialog-btn-positive' onClick={deleteCard}>Delete</Button>
                        <Button variant="outlined" className='dialog-btn-danger' onClick={closeDeleteConfirmationDialog}>Cancel</Button>
                    </div>
                </div>
            </Dialog>
        </div >
    )
}
