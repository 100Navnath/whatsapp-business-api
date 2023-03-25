import React, { CSSProperties, useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';
import './dropdown2.css'
interface DropdownInterface {
    options: Array<any>,
    open?: boolean,
    defaultValue?: any,
    title?: string,
    styles?: CSSProperties,
    scrollbarHeight?: number,
    optionsContainer?: CSSProperties,
    onChange?: any,
    err?: string | false,
    disabled?: boolean,
    autoFocus?: boolean,
    defaulValueProperty?: string
    valuePropertyName?: string
    labelPropertyName?: string
}

export default function Dropdown2({ options, title, styles, scrollbarHeight = 175, optionsContainer, onChange,
    err, defaultValue, disabled = false, autoFocus = false, valuePropertyName = "value", labelPropertyName = "label"
}: DropdownInterface) {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <span>
            {/* <InputLabel id="demo-select-small">First name</InputLabel> */}
            <Select
                labelId="demo-select-small"
                id="demo-select-small"
                value={defaultValue}
                displayEmpty
                label="Age"
                onChange={onChange}
                inputProps={{ 'aria-label': 'Without label' }}
                style={{ width: 200, borderTop: dropdownOpen ? '1px solid #1273eb' : '1px solid #999', borderRadius: 2, fontSize: 12 }}
                onOpen={() => setDropdownOpen(true)}
                onBlur={() => setDropdownOpen(false)}
            >
                {
                    options.map((obj) => <MenuItem value={obj[valuePropertyName]}>{obj[labelPropertyName]}</MenuItem>)
                }
            </Select>
            <span className='error'>{err}</span>
        </span>
    );
}