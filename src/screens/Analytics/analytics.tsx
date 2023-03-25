import { ArrowUpward, AttachMoneyOutlined, CallOutlined, GroupOutlined, KeyboardArrowDown, PermContactCalendarOutlined, Today } from '@material-ui/icons'
import { useState, useEffect, useCallback } from 'react'
import './analytics.css'
import Pie from '../../components/Pie';
import MultiLineChart from '../../components/MultilineChart';
import { AnimatedList } from 'react-animated-list';
import agentActivity from '../../assets/jsons/analytics/agentActivity.json';
import todayChart from '../../assets/jsons/analytics/lineChart/today.json';
import thisWeekChart from '../../assets/jsons/analytics/lineChart/thisWeek.json';
import thisMonthChart from '../../assets/jsons/analytics/lineChart/thisMonth.json';
import thisYearChart from '../../assets/jsons/analytics/lineChart/thisYear.json';
import kpiJson from '../../assets/jsons/analytics/kpis.json';
import agents from '../../assets/jsons/agents.json';
import LineChart from '../../components/LineChart';
import OutsideClickDetector from '../../components/OutsideClickDetector/OutsideClickDetector';
import Grid from '../../components/Grid/Grid';
import { apiList } from '../../constant/apiList';
import Spinner from '../../components/Loading/spinner';
import Skeleton from '@mui/material/Skeleton';
import { CircularProgress } from '@mui/material';
import { getFromLocalStorage } from '../../components/LocalStorage/localStorage';
import { API } from '../../constant/network';
import IconButton from '@mui/material/IconButton';
import { Button } from '@material-ui/core';
import Kpi from '../../components/KPI';
import Toast from '../../components/Toast/Toast';
import { CalendarMonth } from '@mui/icons-material';

interface kpiInterface {
    count: number | undefined | null,
    progress: number[] | undefined,
    percent: number | undefined | string
}
interface kpiDataInterface {
    "messages"?: {
        sent: string | number | undefined,
        received: string | number | undefined,
        faild: string | number | undefined
    },
    "kpi": {
        users?: kpiInterface | undefined | null,
        totalcredit: kpiInterface | undefined,
        monthcredit: kpiInterface | undefined,
        contacts: kpiInterface | undefined,
        numbers: kpiInterface | undefined
        todaycreditused: kpiInterface | undefined
    }
}
const singleKpiData = {
    count: undefined,
    progress: undefined,
    percent: undefined
}
export default function Analytics(props: any) {
    const [agentsActivity, setAgentsActivity] = useState(Array);
    const [kpisData, setKpisData] = useState<kpiDataInterface>({
        "kpi": {
            todaycreditused: singleKpiData,
            users: singleKpiData,
            totalcredit: singleKpiData,
            monthcredit: singleKpiData,
            contacts: singleKpiData,
            numbers: singleKpiData
        }
    });
    const [messagesCount, setMessagesCount] = useState(Object)
    const [loading, setLoading] = useState(false);
    const [agentsActivityLoading, setAgentsActivityLoading] = useState(false);
    const [lineGraphLoading, setLineGraphLoading] = useState(false);
    // const [lineChartDropdown, setLineChartDropdown] = useState({ selected: 'Today', visibility: true });
    const [lineChartDropdown, setLineChartDropdown] = useState(false);
    const [lineChartSelectedDropdown, setLineChartSelectedDropdown] = useState({ value: "week", label: 'This Week' })
    const [multilineChartData, setMultilineChartData] = useState<any>(null)
    const [totalAgents, setTotalAgents] = useState(undefined);

    async function getChartData() {
        try {
            setLineGraphLoading(true);
            const user = await getFromLocalStorage('user');
            const body = {
                businessId: user.businessId,
                SelectedOption: lineChartSelectedDropdown.value
            }
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.getMultilineChartData}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setLineGraphLoading(false)
                        let received = Array(res.data.analyticsLineGraph.labels.length).fill(0)
                        let sent = Array(res.data.analyticsLineGraph.labels.length).fill(0)
                        let failed = Array(res.data.analyticsLineGraph.labels.length).fill(0)
                        for (let i = 0; i < res.data.receivedData.hours.length; i++) {
                            const index = res.data.analyticsLineGraph.labels.findIndex(function (object: any) {
                                return object === res.data.receivedData.hours[i];
                            })
                            received[index] = res.data.receivedData.received[i]
                        }
                        for (let i = 0; i < res.data.sentData.hours.length; i++) {
                            const index = res.data.analyticsLineGraph.labels.findIndex(function (object: any) {
                                return object === res.data.sentData.hours[i];
                            })
                            sent[index] = res.data.sentData.sent[i]
                        }
                        for (let i = 0; i < res.data.failedData.hours.length; i++) {
                            const index = res.data.analyticsLineGraph.labels.findIndex(function (object: any) {
                                return object === res.data.failedData.hours[i];
                            })
                            failed[index] = res.data.failedData.failed[i]
                        }
                        setMultilineChartData({ labels: res.data.analyticsLineGraph.labels, received, sent, failed })
                        // if (lineChartSelectedDropdown.label === 'Today') {
                        //     setMultilineChartData(todayChart)
                        // }
                        // else if (lineChartSelectedDropdown.label === 'This Week') {
                        //     setMultilineChartData(thisWeekChart)
                        // }
                        // else if (lineChartSelectedDropdown.label === 'This Month') {
                        //     setMultilineChartData(thisMonthChart)
                        // }
                        // else if (lineChartSelectedDropdown.label === 'This Year') {
                        //     setMultilineChartData(thisYearChart)
                        // }
                    }
                }
            });
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
            setLineGraphLoading(false);
        }
    }
    useEffect(() => {
        getChartData()
    }, [lineChartSelectedDropdown])

    function closeDropdown() {
        setLineChartDropdown(false)
    }

    const lineChartOptions = [
        { value: "today", label: 'Today' },
        { value: "week", label: 'This Week' },
        { value: "month", label: 'This Month' },
        { value: "year", label: 'This Year' },
    ]

    async function getAgentsActivity(take: number, skip: number, searchValue: string) {
        setAgentsActivityLoading(true);
        try {
            if (searchValue === "") {
                const user = await getFromLocalStorage("user");
                const body = {
                    businessId: user.businessId,
                    skip,
                    take
                }
                API.get(`${process.env.REACT_APP_BASE_API}${apiList.getAgentsActivity}`, body, {})?.subscribe({
                    next(res: any) {
                        if (res.status === 200) {
                            setAgentsActivityLoading(false);
                            setAgentsActivity(res.data.lstAgent);
                            setTotalAgents(res.data.count);
                        }
                    },
                    error(err) {
                        setAgentsActivityLoading(false);
                    },
                });
            } else gridGlobalSearch(take, skip, searchValue)
        } catch (error: any) {
            setAgentsActivityLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }
    async function agentsActivityColumnSearch(take: number, skip: number, columnSearch: any) {
        setAgentsActivityLoading(true);
        try {
            const user = await getFromLocalStorage("user");
            const body = {
                businessId: user.businessId,
                skip,
                take,
                searchValue: columnSearch
            }
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.agentActivityColumnSearch}/${user.businessId}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setAgentsActivityLoading(false);
                        setAgentsActivity(res.data.lstAgent);
                        setTotalAgents(res.data.count);
                    }
                },
                error(err) {
                    setAgentsActivityLoading(false);
                },
            });
        } catch (error: any) {
            setAgentsActivityLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }

    async function gridGlobalSearch(take: number, skip: number, searchValue: string) {
        setAgentsActivityLoading(true);
        const user = await getFromLocalStorage("user");
        const body = {
            businessId: user.businessId,
            skip,
            take,
            searchValue
        }
        API.get(`${process.env.REACT_APP_BASE_API}${apiList.agentActivityGlobalSearch}`, body, {})?.subscribe({
            next(res: any) {
                if (res.status === 200) {
                    setAgentsActivityLoading(false);
                    setAgentsActivity(res.data.lstAgent);
                    setTotalAgents(res.data.count);
                }
            },
            error(err) {
                setAgentsActivityLoading(false);
            },
        });
    }

    async function getKpiData() {
        try {
            const user = await getFromLocalStorage("user");
            const body = {
                userId: user.currentuserId,
                businessId: user.businessId
            }
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.getKpisData}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status) {
                        setLoading(false);
                        setKpisData({
                            kpi:
                            {
                                ...res.data,
                                todaycreditused: res.data.todaycreditused ? res.data.todaycreditused : {
                                    count: 0,
                                    progress: [],
                                    percent: 0
                                }
                            }
                        });
                    }
                }
            });
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }
    async function messegesCount() {
        try {
            const user = await getFromLocalStorage("user");
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.massegesCount}/${user.businessId}`, {}, {})?.subscribe({
                next(res: any) {
                    if (res.status) {
                        setLoading(false);
                        setMessagesCount(res.data);
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

    useEffect(() => {
        getKpiData();
        messegesCount();
        getAgentsActivity(10, 0, "")
    }, [])

    return (
        <div className='analytics-wrapper'>
            <div className='page-title'>Analytics</div>

            <div style={{ display: 'flex', marginRight: 15 }}>
                <div className='card' style={{ width: 520, marginRight: 15 }}>
                    <div className='card-header' style={{ width: 'fit-content', display: 'flex', fontSize: 14, alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>Messages Sent</div>
                        <div style={{ marginLeft: 5 }}>
                            <OutsideClickDetector
                                action={closeDropdown}
                                children={
                                    <span>
                                        <Button
                                            style={{ padding: 0, outlineWidth: 0 }}
                                            onClick={() => setLineChartDropdown(!lineChartDropdown)}
                                        >
                                            <div style={{ cursor: 'pointer', fontFamily: "Poppins", textTransform: 'none', fontSize: 14 }}>{lineChartSelectedDropdown.label}
                                                <KeyboardArrowDown style={{ fontSize: 18, marginLeft: 5 }} />
                                            </div>
                                        </Button>
                                        {
                                            lineChartDropdown &&
                                            <div className='options-wrapper' style={{ width: 'fit-content', borderRadius: 5, zIndex: 1000, justifyContent: 'left' }}>
                                                {/* <Scrollbars> */}
                                                <AnimatedList animation={"fade"} initialAnimationDuration={500}>
                                                    {lineChartOptions.map(i => <div className='option' style={{ padding: 5 }} onClick={() => {
                                                        setLineChartDropdown(false);
                                                        setLineChartSelectedDropdown(i);
                                                    }}>{i.label}</div>)}
                                                </AnimatedList>
                                                {/* </Scrollbars> */}
                                            </div>
                                        }
                                    </span>
                                }
                            />

                        </div>
                    </div>
                    <div style={{ height: 250, width: 515, backgroundColor: '#FFF', padding: 10 }}>
                        {
                            multilineChartData ?
                                <MultiLineChart data={multilineChartData} /> :
                                <MultiLineChart data={{
                                    "labels": ["9 AM", "11 AM", "1 PM", "3 PM", "5 PM", "7 PM"],
                                    "received": [1, 2, 3, 2, 3, 4]
                                }} labelVisibilityX={true} labelVisibilityY={true}
                                    placeholder={true}
                                />
                        }
                    </div>
                </div>
                <div className='kpi-container'>
                    <div>
                        {
                            kpisData.kpi && kpisData.kpi.totalcredit &&
                            <Kpi
                                PrimaryIcon={<AttachMoneyOutlined className='primary-icon' />}
                                data={kpisData.kpi.totalcredit}
                                title={"Total credits used"}
                                tooltip={
                                    kpisData.kpi.totalcredit.percent !== undefined && kpisData.kpi.totalcredit.percent >= 0 ?
                                        `% growth in credits used since last month` :
                                        `% decrement in credits used since last month.`
                                }
                            />
                        }
                        {
                            kpisData.kpi && kpisData.kpi.numbers &&
                            <Kpi
                                style={{ marginTop: 15 }}
                                PrimaryIcon={<CallOutlined className='primary-icon' />}
                                data={kpisData.kpi.numbers}
                                title={"Numbers Used"}
                                tooltip={
                                    kpisData.kpi.numbers.percent !== undefined && kpisData.kpi.numbers.percent >= 0 ?
                                        `% growth in Numbers used since last month` :
                                        `% decrement in Contacts since last month`
                                }
                            />
                        }
                    </div>
                    <div>
                        {
                            kpisData.kpi.monthcredit &&
                            <Kpi
                                PrimaryIcon={<CalendarMonth className='primary-icon' />}
                                data={kpisData.kpi.monthcredit}
                                title={"Monthly Credits Used"}
                                tooltip={
                                    kpisData.kpi.monthcredit.percent !== undefined && kpisData.kpi.monthcredit.percent >= 0 ?
                                        `% growth in credits used since last month` :
                                        `% decrement in credits used since last month.`
                                }
                            />
                        }
                        {
                            kpisData.kpi.users &&
                            <Kpi
                                style={{ marginTop: 15 }}
                                PrimaryIcon={<GroupOutlined className='primary-icon' />}
                                data={kpisData.kpi.users}
                                title={"Total Users"}
                                tooltip={
                                    kpisData.kpi.users.percent !== undefined && kpisData.kpi.users.percent >= 0 ?
                                        `% growth in Users since last month` :
                                        `% decrement in Users since last month`
                                }
                            />
                        }
                    </div>
                    <div>
                        {
                            kpisData.kpi.todaycreditused &&
                            <Kpi
                                PrimaryIcon={<Today className='primary-icon' />}
                                data={kpisData.kpi.todaycreditused}
                                title={"Credits Used Today"}
                                tooltip={
                                    kpisData.kpi.todaycreditused.percent !== undefined && kpisData.kpi.todaycreditused.percent >= 0 ?
                                        `% growth in credits used since last month` :
                                        `% decrement in credits used since last month.`
                                }
                            />
                        }
                        {
                            kpisData.kpi.contacts &&
                            <Kpi
                                style={{ marginTop: 15 }}
                                PrimaryIcon={<PermContactCalendarOutlined className='primary-icon' />}
                                data={kpisData.kpi.contacts}
                                title={"Total Contacts"}
                                tooltip={
                                    kpisData.kpi.contacts.percent !== undefined && kpisData.kpi.contacts.percent >= 0 ?
                                        `% growth in Contacts since last month.` :
                                        `% decrement in credits used since last month.`
                                }
                            />
                        }
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex' }}>
                <div className="card" style={{ width: 130 * 6, marginTop: 15 }}>
                    <span className="card-header">Users Activity</span>
                    <Grid
                        data={agentsActivity}
                        columns={[
                            {
                                header: "User Name",
                                value: "fullName"
                            },
                            {
                                header: "Contact",
                                value: "phoneNo"
                            },
                            {
                                header: "Assigned Numbers",
                                value: "assignedNumbers"
                            },
                            {
                                header: "SMS Sent",
                                value: "smsSent"
                            },
                            {
                                header: "SMS Received",
                                value: "smsReceived"
                            },
                            {
                                header: "SMS Failed",
                                value: "smsFailed"
                            },
                        ]}
                        rowsAtATime={5}
                        columnWidth={120}
                        loading={agentsActivityLoading}
                        onPageChange={(take: number, skip: number, searchValue: string) => getAgentsActivity(take, skip, searchValue)}
                        onColumnSearch={(take: number, skip: number, searchValue: Object) => agentsActivityColumnSearch(take, skip, searchValue)}
                        pagination={true}
                        footer={true}
                        totalCount={totalAgents}
                        globalSearch={false}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', height: 'fit-content', marginLeft: 15 }}>
                    <div className="card messages-card">
                        <span className="card-header">Messages</span>
                        <div className="card-body" style={{ display: 'flex', alignItems: 'center' }}>
                            <div>
                                <span className='btn2' style={{ display: 'flex' }}>
                                    <div className='indicator-box blue'></div>
                                    <div className='item-title'>Sent</div>
                                </span>
                                <span className='btn2' style={{ display: 'flex' }}>
                                    <div className='indicator-box green'></div>
                                    <div className='item-title'>Received</div>
                                </span>
                                <span className='btn2' style={{ display: 'flex' }}>
                                    <div className='indicator-box red'></div>
                                    <div className='item-title'>Failed</div>
                                </span>
                            </div>
                            <Pie data={messagesCount} />
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}
