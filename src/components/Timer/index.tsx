import React from 'react'
import { useState, useEffect } from 'react';

const Timer = (props: any) => {
    const [minutes, setMinutes] = useState(props.initialMinute);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        let myInterval = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1);
            }
            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(myInterval)
                } else {
                    setMinutes(minutes - 1);
                    setSeconds(59);
                }
            }
        }, 1000)
        return () => {
            clearInterval(myInterval);
        };
    });

    useEffect(() => {
        if (minutes === 0) {
            if (seconds === 0) {
                props.onTimeout()
            }
        }
    }, [seconds])

    function addOneMin() {
        setMinutes(1);
        setSeconds(0)
    }

    useEffect(() => {
        if (props.action.name === "addOneMin") {
            addOneMin();
        }
    }, [props.action])


    return (
        <span style={{ ...props.styles }}>
            {minutes === 0 && seconds === 0
                ? null
                : <span>
                    You can resend OTP after
                    <span style={{ fontWeight: 'bold', marginLeft: 5 }}>
                        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                    </span>
                </span>
            }
        </span>
    )
}

export default Timer;