import React, { useState, useEffect } from 'react'
import './linkedNumbers.css'
import { AddIcCallOutlined, BlockOutlined, Close, PersonAddOutlined, RemoveCircleOutline, SearchRounded } from '@material-ui/icons';
import { Button } from '@material-ui/core';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import 'react-phone-input-2/lib/style.css'
import numbersJson from '../../../assets/jsons/numbers.json'
import agentsList from '../../../assets/jsons/numberMngmt/agentsList.json'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { Checkbox, styled } from '@mui/material';
import { Scrollbars } from 'react-custom-scrollbars';
import agents from '../../../assets/jsons/agents.json';
import Grid from '../../../components/Grid/Grid';
import { useNavigate } from 'react-router-dom';
import { apiList } from '../../../constant/apiList';
import { API } from '../../../constant/network';
import Spinner from '../../../components/Loading/spinner';
import LoadingButton from '@mui/lab/LoadingButton';
import { getFromLocalStorage } from '../../../components/LocalStorage/localStorage';
import { PersonRemoveAlt1Outlined } from '@mui/icons-material';
import Toast from '../../../components/Toast/Toast';
import moment from 'moment';

interface LinkedNumbersInterface {
    getNumber: VoidFunction
}


const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="down" ref={ref} {...props} />;
});

export default function LinkedNumbers({ getNumber }: LinkedNumbersInterface) {
    const navigate = useNavigate();
    const { innerWidth: width, innerHeight: height } = window;
    const [totalCount, setTotalCount] = useState(undefined);
    const [numbers, setNumbers] = useState<Array<any>>(Array);
    const [assignPopup, setAssignPopup] = React.useState(false);
    const [confimationPopup, setConfirmationPopup] = React.useState(false);
    const [releasePopup, setReleasePopup] = React.useState(false);
    const [blockPopup, setBlockPopup] = React.useState(false);
    const [selectedRows, setSelectedRows] = useState(Array);
    const [clickeOnRowIndex, setClickeOnRowIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(false)
    const [releaseNumberLoading, setReleaseNumberLoading] = useState(false);
    const [totalUsersCount, setTotalUsersCount] = useState(undefined);
    const [agents, setAgents] = useState<Array<any>>(Array);
    const [clickedRow, setClickedRow] = useState<any>(undefined);
    const [showAssginedTo, setShowAssginedTo] = useState(-1);

    function _setSelectedRows(rows: any) {
        setSelectedRows(rows);
    }

    const openAssignPopup = (index: number) => {
        setClickedRow(numbers[index])
        getAgentsList(10, 0, "", numbers[index])
        setAssignPopup(true);
        setSelectedRows([]);
    };

    const closeAssignPopup = () => {
        setAssignPopup(false);
    };

    const openConfimationPopup = () => {
        const uniqueIds: Array<any> = [];
        const unique = selectedRows.filter((element: any) => {
            const isDuplicate = uniqueIds.includes(element.id);

            if (!isDuplicate) {
                uniqueIds.push(element.id);

                return true;
            }

            return false;
        });
        setSelectedRows([...unique])

        setConfirmationPopup(true);
    };

    const closeConfimationPopup = () => {
        setConfirmationPopup(false);
        setAssignPopup(false);
    };

    function getLinkedNumbers(take: number, skip: number, searchValue: string) {
        try {
            const user = getFromLocalStorage("user");
            if (searchValue === "") {
                API.get(`${process.env.REACT_APP_BASE_API}${apiList.getLinkedNumbers}/${user.businessId}`, { take, skip }, {})?.subscribe({
                    next(res: any) {
                        if (res.status === 200) {
                            setNumbers(res.data.lstNumber);
                            setTotalCount(res.data.count)
                        }
                    },
                    error(err) {
                        console.log(err);
                    },
                });
            } else gridGlobalSearch(take, skip, searchValue);
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    function linkedNumbersColumnSearch(take: number, skip: number, searchValue: Object) {
        try {
            const user = getFromLocalStorage("user");
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.linkedNumbersColumnSearch}/${user.businessId}`, { businessId: user.businessId, take, skip, searchValue }, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setNumbers(res.data.lstNumber);
                        setTotalCount(res.data.count)
                    }
                }
            });
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    function gridGlobalSearch(take: number, skip: number, searchValue: string) {
        try {
            setLoading(true);
            const user = getFromLocalStorage("user");
            const body = { skip, take, searchValue }
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.linkedNumbersGlobalSearch}/${user.businessId}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status) {
                        // setTimeout(() => {
                        setNumbers(res.data.lstNumber);
                        setTotalCount(res.data.count)
                        // }, 1000);
                    }
                }
            });
        } catch (error: any) {
            setLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }

    async function releaseNumber() {
        try {
            setLoading(true);
            setReleaseNumberLoading(true)
            const user = await getFromLocalStorage("user");
            const releaseNumber = clickeOnRowIndex !== null && numbers[clickeOnRowIndex];
            const body = {
                userId: user.currentuserId,
                businessId: user.businessId,
                // countryCode: clickeOnRowIndex.,
                twilioNumber: releaseNumber.number,
                pathSid: releaseNumber.pathSid
            }
            console.log(body);

            API.put(`${process.env.REACT_APP_BASE_API}${apiList.releaseNumber}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setReleaseNumberLoading(false);
                        Toast({ message: "Number released successfully", type: 'success' });
                        setLoading(false);
                        const clickedID = typeof clickeOnRowIndex === 'number' ? numbers[clickeOnRowIndex].id : null
                        const newArr = numbers.filter((i, index) => i.id != clickedID)
                        setNumbers(newArr);
                        setReleasePopup(false);
                        setClickeOnRowIndex(null);
                    }
                },
                error(error: any) {
                    setReleaseNumberLoading(false);
                }
            });
        } catch (error: any) {
            Toast({ message: error, type: 'error' });
            setReleaseNumberLoading(false);
        }
    }

    function getAgentsList(take: number, skip: number, searchValue: any, clickedRow: any = {}) {
        try {
            setLoading(true)
            const user = getFromLocalStorage("user");
            console.log("get agent check", searchValue === "" && clickedRow && clickedRow.numberId);
            if (clickedRow && clickedRow.numberId) {
                API.get(`${process.env.REACT_APP_BASE_API}${apiList.getAgentsForAssign}/${user.businessId}`, { take, skip, number_twilio_data_id: clickedRow ? clickedRow.numberId : undefined, search: searchValue ? searchValue : null }, {})?.subscribe({
                    next(res: any) {
                        if (res.status === 200) {
                            setAgents(res.data.lstUser);
                            setTotalUsersCount(res.data.count);
                            setLoading(false)
                        }
                    }
                });
            } else if (searchValue !== "") agentsGridSearch(take, skip, searchValue)
        } catch (error: any) {
            setLoading(false)
            Toast({ message: error, type: 'error' })
        }
    }

    function agentsGridSearch(take: number, skip: number, searchValue: string) {
        try {
            setLoading(true)
            const user = getFromLocalStorage("user");
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.assignAgentsGlobalSearch}/${user.businessId}`, { take, skip, searchValue }, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        // setTimeout(() => {
                        setAgents(res.data.lstUser);
                        setTotalUsersCount(res.data.count);
                        setLoading(false);
                        // }, 2000);
                    }
                },
                error(err) {
                    setLoading(false);
                },
            });
        } catch (error: any) {
            setLoading(false)
            Toast({ message: error, type: 'error' })
        }
    }

    async function assignAgents() {
        try {
            setLoading(true);
            const user = await getFromLocalStorage("user");
            const body = {
                currentUserId: user.currentuserId,
                numberId: clickedRow.numberId,
                lstNumberAssignedToUser: selectedRows
            }
            console.log("body of assign agents : ", body);

            API.post(`${process.env.REACT_APP_BASE_API}${apiList.assignAgents}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status) {
                        setLoading(false);
                        getLinkedNumbers(10, 0, "")
                        setAssignPopup(false)
                        setClickeOnRowIndex(null);
                        closeConfimationPopup()
                    }
                }
            });
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    useEffect(() => {
        getLinkedNumbers(10, 0, "")
    }, [])


    return (
        <div className='get-number-wrapper'>
            <div className='settings-title'>Number Management</div>
            <Grid
                data={numbers}
                columns={[
                    { header: "Number", value: 'number', propertyName: "number" },
                    { header: "Purchase Date", value: (column: any, index: number) => <span>{new Date(numbers[index].purchaseDate).toLocaleDateString()}</span>, propertyName: "purchaseDate" },
                    { header: "Monthly Cost($)", value: 'monthlyCost', propertyName: "monthlyCost" },
                    {
                        header: "Assigned To", value: (column: any, index: number) =>
                            <span onMouseOver={() => setShowAssginedTo(index)} onMouseOut={() => setShowAssginedTo(-1)}>
                                {numbers[index].assignedTo.length > 0 && numbers[index].assignedTo[0] !== "" ? numbers[index].assignedTo[0] : 0}
                                {numbers[index].assignedTo.length > 1 && <span style={{ fontSize: 10, color: '#1273EB' }}>, +{numbers[index].assignedTo.length - 1}</span>}

                                {
                                    showAssginedTo === index &&
                                    <span style={{ backgroundColor: '#FFF', boxShadow: '1px 1px 1px 1px #ddd', height: 'fit-content', padding: 5, borderRadius: 5, width: 'fit-content', position: 'absolute' }}>
                                        {numbers[index].assignedTo.map((number: any) => <div style={{ margin: 5, fontSize: 11 }}>{number}</div>)}
                                    </span>
                                }

                            </span>,
                        propertyName: "assignedTo", width: 150
                    },
                ]}
                isActions={true}
                actions={[
                    {
                        component: <PersonAddOutlined className='grid-icon' fontSize='small' />,
                        tooltip: "Assign Users",
                        onClick: (id: number, index: number) => openAssignPopup(index)
                    },
                    {
                        component: <RemoveCircleOutline className='grid-icon' fontSize='small' />,
                        tooltip: 'Release Number',
                        onClick: function (id: number, index: number) {
                            setClickeOnRowIndex(index);
                            setReleasePopup(true)
                        }
                    }

                ]}
                toolbarButtons={[
                    {
                        component: <div><AddIcCallOutlined style={{ fontSize: 14, marginRight: 4 }} />Get Number</div>,
                        tooltip: 'Get Number',
                        onClick: getNumber
                    }
                ]}
                onPageChange={(take: number, skip: number, searchValue: string) => getLinkedNumbers(take, skip, searchValue)}
                onColumnSearch={(take: number, skip: number, searchValue: Object) => linkedNumbersColumnSearch(take, skip, searchValue)}
                totalCount={totalCount}
                globalSearch={false}
            />
            {/* :
                    <div style={{ height: 200, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#888', fontSize: 10 }}>Its time to purchase a number!</span>
                    </div>
            } */}

            <Dialog
                open={assignPopup}
                TransitionComponent={Transition}
                keepMounted
                // onClose={closeAssignPopup}
                aria-describedby="alert-dialog-slide-description"
                transitionDuration={400}
            >
                <div className='dialog-wrapper' style={{ width: 700, backgroundColor: '#f5f8fd', overflowY: 'clip' }}>
                    {/* <div className='dialog-title'>Assign</div> */}
                    <div className='dialog-title'>Assign users
                        <Close onClick={closeAssignPopup} className='close-dialog' />
                    </div>
                    <div style={{ padding: 10 }}>
                        <Scrollbars style={{ height: height / 100 * 70 }}>
                            <Grid
                                // title={`${selectedRows.filter((o: any) => o.isAssigned).length} ${selectedRows.length > 1 ? 'users' : 'user'} selected`}
                                data={agents}
                                columns={[
                                    { header: 'Name', value: "name", width: 120 },
                                    { header: 'Designation', value: "designation", width: 120 },
                                    { header: 'Contact', value: 'phoneNo', propertyName: 'phoneNo' },
                                    { header: 'Gender', value: "gender", width: 120 },
                                    { header: 'D.O.B.', propertyName: "dob", value: (i) => <span>{i.dob ? moment(i.dob).format('MM/DD/YYYY') : 'NA'}</span>, width: 120 },
                                    { header: 'Email', value: 'email', width: 200 }
                                ]}
                                footer={true}
                                pagination={true}
                                rowsAtATimeSelector={false}
                                setSelectedRows={_setSelectedRows}
                                onPageChange={(take: number, skip: number, searchValue: string) => getAgentsList(take, skip, searchValue, clickedRow)}
                                totalCount={totalUsersCount}
                                selectedRecords={selectedRows}
                                acquireFullWidth={true}
                                globalSearch={false}
                                onColumnSearch={(take: number, skip: number, searchValue: Object) => getAgentsList(take, skip, searchValue, clickedRow)}
                            />
                            <div className='dialog-action-buttons' style={{ marginTop: 10 }}>
                                <Button variant="outlined" className='dialog-btn-positive' onClick={openConfimationPopup}>
                                    Confirm
                                </Button>
                                <Button variant="outlined" className='dialog-btn-danger' onClick={closeAssignPopup}>Cancel</Button>
                            </div>
                        </Scrollbars>
                    </div>
                </div>

            </Dialog >
            <Dialog
                open={confimationPopup}
                TransitionComponent={Transition}
                keepMounted
                // onClose={closeAssignPopup}
                aria-describedby="alert-dialog-slide-description"
                transitionDuration={400}
            >
                <div className='dialog-wrapper'>
                    <div className='dialog-title'>Assign</div>
                    <div style={{ padding: 20 }}>
                        Are you sure you want to assign < span style={{ fontWeight: 'bold' }
                        }> {clickedRow && clickedRow.number && clickedRow.number}</span > {" to "}
                        <b>{selectedRows.filter((o: any) => o.isAssigned).length}</b>{" users"}
                        {/* {selectedRows.map((i: any, index) => <span>{`${i.name}${(index + 1) === selectedRows.length ? '' : ', '}`}</span>)} */}
                        ?
                        <div className='dialog-action-buttons' style={{ marginTop: 15 }}>
                            <Button variant="outlined" className='dialog-btn-positive' onClick={assignAgents}>
                                {
                                    loading ?
                                        <Spinner /> :
                                        "Assign"
                                }
                            </Button>
                            <Button variant="outlined" className='dialog-btn-danger' onClick={closeConfimationPopup}>Cancel</Button>
                        </div>
                    </div>
                </div>
            </Dialog>
            <Dialog
                open={releasePopup}
                TransitionComponent={Transition}
                keepMounted
                // onClose={() => {
                //     setReleasePopup(false)
                //     setReleaseNumberLoading(false)
                // }}
                aria-describedby="alert-dialog-slide-description"
                transitionDuration={400}
            >
                <div className='dialog-wrapper'>
                    <div className='dialog-title' style={{ marginBottom: 15 }}>Release</div>
                    Are you sure you want to release <span style={{ fontWeight: 'bold' }}>{typeof clickeOnRowIndex === 'number' ? numbers[clickeOnRowIndex].number : null}</span> this number?
                    <div className="dialog-action-buttons">
                        <LoadingButton
                            className='dialog-btn-positive'
                            loading={releaseNumberLoading}
                            variant="contained"
                            size='small'
                            loadingIndicator={<Spinner />}
                            onClick={releaseNumber}
                        >
                            {
                                !releaseNumberLoading &&
                                "Confirm"
                            }
                        </LoadingButton>
                        <Button variant="outlined" className='dialog-btn-danger' onClick={() => {
                            setReleasePopup(false)
                            setReleaseNumberLoading(false)
                        }}>Cancel</Button>
                    </div>
                </div>
            </Dialog>
            <Dialog
                open={blockPopup}
                TransitionComponent={Transition}
                keepMounted
                // onClose={() => setBlockPopup(false)}
                aria-describedby="alert-dialog-slide-description"
                transitionDuration={400}
            >
                <div className='dialog-wrapper'>
                    <div className='dialog-title'>Get a number</div>
                    <div style={{ padding: 20 }}>
                        <span>Get number to start using other services and features</span>

                        <div style={{ textAlign: 'left', marginTop: 10 }}>
                            <span style={{ fontSize: '14', fontWeight: 'bold' }}>Why?</span><br />
                            You can send messages post purchasing number.
                        </div>
                        <div style={{ textAlign: 'left', marginTop: 10 }}>
                            <span style={{ fontSize: '14', fontWeight: 'bold' }}>How?</span><br />
                            Click on Get Number button<br />
                            {'\u2022'} Search for your number with good combination as per your choice.<br />
                            {'\u2022'} Click on Get Button in the table.<br />
                            {'\u2022'} Add credit/debit card for payment (If not added previously).<br />
                            {'\u2022'} Make payment accordingly and you can send messages to your customers.<br />
                        </div>

                        <div className='dialog-action-buttons' style={{ marginTop: 15 }}>
                            <Button variant="outlined" className='dialog-btn-positive' onClick={() => {
                                setBlockPopup(false);
                                getNumber();
                            }}>Get Number</Button>
                            <Button variant="outlined" className='dialog-btn-danger' onClick={() => setBlockPopup(false)}>Cancel</Button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div >
    )
}
