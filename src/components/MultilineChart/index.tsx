import React, { useCallback } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export default function MultiLineChart({ data, labels, height, width, labelVisibilityX = true, labelVisibilityY = true, placeholder = false }: any) {
    const chartData = {
        labels: data.labels,
        datasets: [
            {
                label: 'SMS Sent',
                data: data.sent,
                borderColor: placeholder ? '#ddd' : '#1273eb', //primary blue 
                tension: 0.1,
                borderWidth: 2
            },
            {
                label: 'SMS Failed',
                data: data.failed,
                borderColor: placeholder ? '#ddd' : '#fe5044', // red
                tension: 0.1,
                borderWidth: 2
            },
            {
                label: 'SMS Received',
                data: data.received,
                borderColor: placeholder ? '#ddd' : '#4caf4f', // green
                tension: 0.1,
                borderWidth: 2,
                fill: placeholder
            }
        ]
    };
    return (
        <Line
            width={width}
            height={height}
            data={chartData}
            options={
                {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                    },
                    scales: {
                        x: {
                            display: labelVisibilityX,
                        },
                        y: {
                            display: labelVisibilityY,
                        }
                    },
                }
            } />
    )
}
