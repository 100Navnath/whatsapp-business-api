import React, { CSSProperties, ReactElement } from 'react'
import Skeleton from '@mui/material/Skeleton';
import LineChart from '../LineChart'
import { ArrowDownward, ArrowUpward } from '@material-ui/icons';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material';

interface kpiProps {
    PrimaryIcon: ReactElement
    data: { count: any, percent: any, progress: any }
    title: string,
    style?: CSSProperties
    tooltip?: string
}

export default function Kpi({ PrimaryIcon, data = { percent: 0, count: 0, progress: [] }, title, style, tooltip }: kpiProps) {

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

    return (
        <div className='kpi-wrapper' style={style}>
            <span>{PrimaryIcon}</span>
            <div className='title-wrapper'>
                <div className='title'>{title}</div>
                <div style={{ color: data.percent >= 0 ? 'green' : "#fe5044", display: 'flex' }}>

                    {
                        JSON.stringify(data.percent) ?
                            <GridTooltip title={`${parseFloat(data.percent.toString()).toFixed(2)}${tooltip}`} placement="bottom" >
                                <span style={{ display: 'flex', height: 'fit-content' }}>
                                    <div style={{ marginLeft: 3 }}>{parseFloat(data.percent.toString()).toFixed(2)}%</div>
                                    {
                                        data.percent >= 0 ?
                                            <ArrowUpward className='icon' /> :
                                            <ArrowDownward style={{ color: "#fe5044" }} className='icon' />
                                    }
                                </span>
                            </GridTooltip> :
                            <Skeleton variant="text" style={{ width: 50 }} sx={{ fontSize: 16 }} />
                    }

                </div>
            </div>
            <div className='data'>{JSON.stringify(data.count) ? data.count : <Skeleton variant="text" style={{ width: 50 }} sx={{ fontSize: 18 }} />}</div>
            <div style={{ height: 50, width: '100%' }}>
                <LineChart
                    height={2} width={5} data={data.progress ? data.progress : [1, 2, 3, 2, 3, 4]} lineWidth={1}
                    labels={data.progress ? data.progress : [1, 2, 3, 2, 3, 4]} labelVisibilityX={false} labelVisibilityY={false}
                    tooltip={false} dot={false} lineColor={!(data.progress) ? "#ddd" : undefined}
                />
            </div>
        </div>
    )
}
