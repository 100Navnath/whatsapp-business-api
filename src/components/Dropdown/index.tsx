import { ArrowDownward, ArrowDropDown, Close, ExpandLess, ExpandMore } from '@material-ui/icons'
import React, { CSSProperties, useState, useEffect } from 'react'
import { AnimatedList } from 'react-animated-list'
import './dropdown.css'
import Scrollbars from 'react-custom-scrollbars'
import { VoidExpression } from 'typescript'
import OutsideClickDetector from '../OutsideClickDetector/OutsideClickDetector'
import { ValidateEmptyField } from '../validators'
import IconButton from '@mui/material/IconButton';
import { Button } from '@mui/material'
import Asterisk from '../Asterisk'

interface DropdownInterface {
    options: Array<any>,
    open?: boolean,
    defaultValue?: any,
    title?: string,
    scrollbarHeight?: number,
    styles?: CSSProperties,
    inputStyles?: CSSProperties
    inputWrapper?: CSSProperties
    optionsContainer?: CSSProperties,
    onChange?: any,
    err?: string | false,
    disabled?: boolean,
    autoFocus?: boolean,
    defaulValueProperty?: string
    valuePropertyName?: string
    labelPropertyName?: string
    scrollAfterOptions?: number
    mandatory?: boolean
    placeholder?: string
    hideClearButton?: boolean
}

export default function Dropdown({ options, title, styles, scrollbarHeight = 175, optionsContainer, onChange, err,
    defaultValue, disabled = false, autoFocus = false, valuePropertyName = "value", labelPropertyName = 'label', scrollAfterOptions = 0,
    mandatory = false, inputStyles, inputWrapper, placeholder = '', hideClearButton = false }: DropdownInterface) {
    const [visibility, setVisibility] = useState(false);

    function closeDropdown() {
        setVisibility(false);
    }

    function _optionClick(i: any) {
        onChange(i)
        closeDropdown()
    }

    function getDefaultValue() {
        let val = ""
        val = typeof defaultValue === "object" ? defaultValue[labelPropertyName] : typeof defaultValue === "string" ? defaultValue : ""
        return val
    }

    return (
        <div className='dropdown-container' style={{ ...styles }}>
            <OutsideClickDetector
                children={
                    <span>
                        <div className="field-wrapper" style={{ margin: 0, ...inputWrapper }}>
                            {title && <div className="field-placeholder">{title}{mandatory && <Asterisk />}</div>}
                            <input
                                style={{ ...inputStyles }}
                                type="text"
                                autoFocus={autoFocus}
                                value={getDefaultValue()}
                                disabled={disabled}
                                contentEditable={false}
                                onClick={() => {
                                    setVisibility(!visibility)
                                }}
                                readOnly={true}
                                onKeyDown={(event) => event.key === 'Enter' && setVisibility(!visibility)}
                                placeholder={placeholder}
                            />
                            {
                                defaultValue && !hideClearButton ?
                                    <IconButton
                                        className='cross-btn'
                                        onClick={() => {
                                            if (typeof defaultValue === 'object') {
                                                onChange({ [valuePropertyName]: '', [labelPropertyName]: '' })
                                            }
                                            else if (typeof defaultValue === 'string') {
                                                onChange("")
                                            }
                                        }
                                        }
                                    >
                                        <Close style={{ padding: 4 }} />
                                    </IconButton>
                                    :
                                    visibility ?
                                        <IconButton
                                            className='cross-btn'
                                            onClick={() => {
                                                setVisibility(false)
                                            }}
                                        >
                                            <ExpandLess />
                                        </IconButton> :
                                        <IconButton
                                            className='cross-btn'
                                            onClick={() => {
                                                setVisibility(true)
                                            }}
                                        >
                                            <ExpandMore />
                                        </IconButton>
                            }
                            <div className='error'>{err}</div>
                        </div>
                        {
                            visibility &&
                            <div className='options-wrapper' style={{ ...optionsContainer }}>
                                <Scrollbars style={{ height: scrollAfterOptions ? scrollAfterOptions * 35 : options.length * 35, maxHeight: 175 }}>
                                    <AnimatedList animation={"fade"} initialAnimationDuration={500}>
                                        {options.map((i: any, index: number) =>
                                            <Button
                                                key={index}
                                                className='button'
                                                onClick={() => _optionClick(i)}
                                            >
                                                <div key={index} className='option'>{typeof i === 'object' ? i[labelPropertyName] : i}</div>
                                            </Button>
                                        )
                                        }
                                    </AnimatedList>
                                </Scrollbars>
                            </div>
                        }
                    </span>
                }
                action={closeDropdown}
            />
        </div >

    )
}
