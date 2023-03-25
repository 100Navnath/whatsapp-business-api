import React from 'react'
import { Pie as PieChart } from 'react-chartjs-2'
import { Chart, ArcElement, LineController, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';
import Spinner from '../Loading/spinner';
import { CircularProgress } from '@mui/material';
import './pie.css'
// Chart.register(ArcElement, LineController, LineElement, PointElement, LinearScale, CategoryScale);
interface PieInterface {
    data: Object | undefined
    loading?: boolean
}
export default function Pie({ data, loading }: PieInterface) {
    const [dataSet, setData] = React.useState<any>({
        data: [0, 0, 0],
        labels: ["sent", "received", "failed"],
        colors: []
    })
    const colorsForLabel: { [key: string]: string } = {
        "Received": "#4caf4f",
        "Sent": '#1273eb',
        "Failed": '#fe5044'
    }
    React.useEffect(() => {
        if (typeof data === 'object') {
            const properties = Object.getOwnPropertyNames(data).map((e) => e.charAt(0).toUpperCase() + e.slice(1));
            setData({
                data: Object.values(data),
                labels: properties,
                colors: properties.map((prop: string) => colorsForLabel[prop])
            })
        }
    }, [data])


    const dataset = {
        labels: dataSet.labels,
        datasets: [{
            data: dataSet.data,
            backgroundColor: dataSet.colors
        }]
    };

    const option = {
        tooltips: {
            enabled: false
        },
        legend: {
            display: false
        },
    }

    return (
        <div style={{ height: 150, width: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {
                dataSet.data.every((element: any) => {
                    if (element === "0") {
                        return true;
                    } else return false
                }) &&
                <span className='empty-pie'>There are no Received, Sent and Failed SMS</span>
            }
            {
                typeof data === 'object' && Object.keys(data).length != 0 ?
                    <PieChart
                        style={{ height: 150, width: 150 }}
                        data={dataset}
                        options={
                            {
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                }
                            }
                        }
                    /> :
                    loading && <CircularProgress size={16} style={{ color: '#1273eb' }} />
            }
        </div>
    )
}