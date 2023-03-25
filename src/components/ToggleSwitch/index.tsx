import React, { useState } from 'react'
import './toggle.css'
import { Button } from '@material-ui/core';

interface toggleProps {
    checked: boolean,
    onChange?: (checked: boolean) => void
}

export default function Toggle({ checked = false, onChange }: toggleProps) {
    const [isChecked, setIsChecked] = useState(checked)
    function handleChange() {
        setIsChecked(!checked);
        onChange && onChange(!checked)
    }
    return (
        <label className="switch">
            <><input type="checkbox" checked={isChecked} />
                <Button className={isChecked ? "slider round active-toggle" : "slider round"} variant="contained" onClick={handleChange} />
            </>
        </label>
    );
}
