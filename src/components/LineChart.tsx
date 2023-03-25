import React from 'react'
import { Line } from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export default function LineChart({ styles, data, labels, height, width, labelVisibilityX = true, labelVisibilityY = true, lineWidth = 2, tooltip = true, dot = true, lineColor = '#01579b' }: any) {
    let dataset = data ? data : []
    return (
        <Line
            width={width}
            height={height}
            style={{ ...styles }}
            data={{
                datasets: [{
                    label: 'Credit Used',
                    data: dataset,
                    fill: true,
                    borderColor: lineColor,
                    tension: 0.1,
                    borderWidth: lineWidth,
                }],
                labels: labels,
            }}
            options={
                {
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: tooltip
                        },
                    },
                    scales: {
                        x: {
                            display: labelVisibilityX,
                        },
                        y: {
                            display: labelVisibilityY,
                        },
                    },
                    elements: {
                        point: {
                            radius: dot ? 3 : 0
                        }
                    }
                }
            } />
    )
}
