import React, { CSSProperties, useState, useEffect, useRef } from 'react'
import Multiselect from 'multiselect-react-dropdown';
import './multiSelectDropdown.css'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material';
import Spinner from '../Loading/spinner';
import { SearchOutlined, Send } from '@material-ui/icons';
import { Button, IconButton } from '@material-ui/core';
import { LoadingButton } from '@mui/lab';

import { Theme, useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';

interface MultiSelectDropdownInterface {
    options: Array<any>,
    defaultValue?: any,
    onChange?: any,
    displayValue?: string,
    isObject?: boolean,
}

export default function MultiSelectDropdown({ options, onChange, defaultValue, displayValue, isObject = true }: MultiSelectDropdownInterface) {
    const GridTooltip = styled(({ className, ...props }: any) => (
        <Tooltip {...props} classes={{ popper: className }} />
    ))(({ theme }: { theme: any }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: '#111',
            color: '#FFF',
            maxWidth: 220,
            fontSize: theme.typography.pxToRem(10),
            border: '1px solid #dadde9',
        },
    }));

    const ref = useRef<any>(null);
    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    const [personName, setPersonName] = React.useState<string[]>([]);
    const names = [
        'Oliver Hansen',
        'Van Henry',
        'April Tucker',
        'Ralph Hubbard',
        'Omar Alexander',
        'Carlos Abbott',
        'Miriam Wagner',
        'Bradley Wilkerson',
        'Virginia Andrews',
        'Kelly Snyder',
    ];

    return (
        // <span>
        //     <Multiselect
        //         ref={ref}
        //         options={options} // Options to display in the dropdown
        //         selectedValues={defaultValue} // Preselected value to persist in dropdown
        //         onSelect={(e) => onChange(e)} // Function will trigger on select event
        //         onRemove={(e) => onChange(e)} // Function will trigger on remove event
        //         displayValue={displayValue} // Property name to display in the dropdown options
        //         isObject={isObject}
        //         showCheckbox={true}
        //         hideSelectedList={true}
        //         placeholder="Filter chats by number"
        //         style={{
        //             multiselectContainer: {
        //                 color: '#444',
        //                 fontSize: 12,
        //             },
        //             searchBox: {
        //                 padding: 0,
        //                 fontSize: 12,
        //                 marginRight: 15
        //             }
        //         }}
        //         avoidHighlightFirstOption={true}
        //         closeOnSelect={false}
        //     />
        //     <span style={{ fontSize: 10 }}>{defaultValue.length} Numbers selected</span>
        // </span >

        // <div>
        //     <FormControl sx={{ m: 1, width: 300 }}>
        //         <InputLabel id="demo-multiple-name-label" style={{ backgroundColor: '#ddd', alignSelf: 'center', margin: 0 }}>Name</InputLabel>
        //         <Select
        //             labelId="demo-multiple-name-label"
        //             id="demo-multiple-name"
        //             multiple
        //             value={defaultValue}
        //             onChange={(e) => onChange(e.target.value)}
        //             input={<OutlinedInput label="Filter chat by number" />}
        //         // MenuProps={MenuProps}
        //         >
        //             {options.map((name: any, index) => (
        //                 <MenuItem
        //                     key={index}
        //                     value={name.number}
        //                 // style={getStyles(name, personName, theme)}
        //                 >
        //                     {name.number}
        //                 </MenuItem>
        //             ))}
        //         </Select>
        //     </FormControl>
        // </div>

        <div>
            <FormControl style={{ margin: 0, marginRight: 15, marginLeft: 15 }} sx={{ m: 1, width: 300, mt: 3, '& legend': { display: 'none' }, '& fieldset': { top: 0 } }}>
                <Select
                    labelId="demo-multiple-checkbox-label"
                    id="demo-multiple-checkbox"
                    multiple
                    displayEmpty
                    value={defaultValue}
                    onChange={(e) => onChange(e.target.value)}
                    input={<OutlinedInput style={{ fontSize: 12, padding: 0 }} />}
                    renderValue={(selected) => {
                        if (selected.length === 0) {
                            return <span style={{ fontFamily: 'Poppins' }}>Filter chats by number</span>;
                        }

                        return selected.map((e: any) => e.number).join(', ');
                    }}
                    MenuProps={MenuProps}
                    inputProps={{ 'aria-label': 'Without label' }}
                    size='small'
                >
                    {/* <MenuItem disabled value="">
                        <em>Placeholder</em>
                    </MenuItem> */}
                    {options.map((name: any, index: number) => (
                        <MenuItem
                            key={name.number}
                            value={name}
                            className='menuItem'
                        // style={getStyles(name, personName, theme)}
                        >
                            <Checkbox className='checkbox' size='small' checked={defaultValue.indexOf(name) > -1} />
                            <ListItemText primary={name.number} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    )
}
