import { AddPhotoAlternateOutlined, Clear, EmojiEmotions, Send } from '@material-ui/icons';
import { LoadingButton } from '@mui/lab';
import React, { useState, useRef, useEffect } from 'react'
import { InputProps } from 'react-select';
import Spinner from '../../components/Loading/spinner';
import { InfoOutlined } from '@mui/icons-material'
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { getFromLocalStorage } from '../../components/LocalStorage/localStorage';
import { useNavigate } from 'react-router-dom';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material';
import LinkedNumbers from '../Settings/NumberManagement/LinkedNumbers';

interface ChatFormProps {
    sendMessage: ({ }) => void
    loading?: boolean
    disabled?: boolean
    onChange?: (e: any) => void
    value?: string
    inputProps?: Object
    placeholder?: string
}

export default function ChatForm({ sendMessage, loading, disabled = false, onChange, value = "", inputProps = {}, placeholder = 'Type your message here...' }: ChatFormProps) {
    const emojis = require('emojis-list')
    const [image, setImage] = useState<any>(undefined);
    const imageRef: any = useRef(null);
    const navigate = useNavigate();
    const handleClick = () => {
        imageRef.current.click();
    };

    const handleFileChange = (event: any) => {
        const fileObj = event.target.files && event.target.files[0];
        if (!fileObj) {
            return;
        }
        var reader = new FileReader();
        var url = reader.readAsDataURL(fileObj);
        reader.onloadend = function (e: any) {
            setImage([reader.result]);
        }
        event.target.value = null;
    };
    const inputRef = useRef<any>(null)

    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [loggedInUser, setLoggedInUser] = useState<any>({ linkedNumbers: [""] });

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

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event) => {
        if (
            anchorRef.current &&
            anchorRef.current.contains(event.target as HTMLElement)
        ) {
            return;
        }

        setOpen(false);
    };

    const handleMenuItemClick = (
        event: React.MouseEvent<HTMLLIElement, MouseEvent>,
        index: number,
    ) => {
        setSelectedIndex(index);
        setOpen(false);
    };

    async function getLoggedInUserInfo() {
        if (loggedInUser.linkedNumbers.length === 0) {
            const user = await getFromLocalStorage('user');
            if (!user) navigate('/')
            else setLoggedInUser({ ...user, linkedNumbers: [''] })
        }
    }

    useEffect(() => {
        getLoggedInUserInfo();
    }, [])


    // console.log("disabled :  ", typeof disabled, disabled, value);

    return (
        <div style={{ backgroundColor: '#f5f8fd' }}>
            <div className="chat-form">
                <input
                    style={{ display: 'none' }}
                    ref={imageRef}
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                />
                <div className="form-group">
                    {
                        image &&
                        <span style={{ position: 'absolute', bottom: 50, marginLeft: 50 }}>
                            <img
                                style={{ height: 100, width: 100 }}
                                src={image}
                            />
                            <span onClick={() => setImage(undefined)}>
                                <Clear
                                    style={{ color: '#000', fontSize: 14, position: 'absolute', right: 0, margin: 5, backgroundColor: '#FFF6', borderRadius: 2 }}
                                />
                            </span>
                        </span>
                    }
                    <input
                        {...inputProps}
                        ref={inputRef}
                        style={{ fontSize: 12, height: 40 }}
                        value={value} className="form-control"
                        placeholder={placeholder}
                        onChange={(e: any) => onChange && onChange(e)}
                        autoFocus={true}
                        multiple={true}
                        maxLength={320}
                        onKeyDown={(event) => event.key === 'Enter' && sendMessage({ smsFrom: loggedInUser.linkedNumbers[selectedIndex].number })}
                        readOnly={false}
                    />
                </div>
                <div className="chat-form-actions">
                    <a className="action-icon">
                        <EmojiEmotions fontSize='small' style={{ color: '#075E54' }} />
                        <div className="action-icon-popup">
                            <div className="emoji-list">
                                {
                                    emojis.slice(1749, 1798).map((emoji: any, index: any) =>
                                        <span key={index} style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                // console.log("`${value}${emojis[1749 + index]}`", `${value}${emojis[1749 + index]}`);
                                                onChange && onChange({ target: { value: `${value}${emojis[1749 + index]}` } })
                                            }
                                            }

                                        >
                                            {emoji}</span>
                                    )
                                }
                            </div>
                        </div>
                    </a>
                    {/* <a className="action-icon" onClick={() => handleClick()}>
                        <AddPhotoAlternateOutlined fontSize='small' />
                        <span className="action-icon-tooltip">Attach</span>
                    </a> */}
                </div >
                <ButtonGroup disabled={disabled} variant="contained" ref={anchorRef} aria-label="split button">
                    <Button
                        style={{ height: 40, padding: 10, outlineWidth: 0, backgroundColor: disabled || loggedInUser.linkedNumbers.length === 0 ? '#ddd' : '#075E54' }}
                        disabled={disabled}
                        onClick={() =>
                            loggedInUser.linkedNumbers.length > 0 && sendMessage({ smsFrom: loggedInUser.linkedNumbers[selectedIndex].number })
                        }
                    >
                        {
                            loading ? <Spinner /> :
                                <GridTooltip title={loggedInUser.linkedNumbers.length < 1 ? "Cannot send message until you have number" : "Send"} placement="bottom">
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        {loggedInUser.linkedNumbers.length > 1 &&
                                            <span style={{ display: 'flex', flexDirection: 'column', fontSize: 7, marginRight: 15 }}>
                                                <span>Sending from</span>
                                                <span style={{ fontSize: 11 }}>{loggedInUser.linkedNumbers[selectedIndex].number}</span>
                                            </span>}
                                        <Send fontSize='small' />
                                    </span>
                                </GridTooltip>
                        }
                    </Button>
                    {loggedInUser.linkedNumbers.length > 1 && <Button
                        style={{ outlineWidth: 0, backgroundColor: disabled ? '#ddd' : '#075E54' }}
                        size="small"
                        aria-controls={open ? 'split-button-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-label="select merge strategy"
                        aria-haspopup="menu"
                        onClick={handleToggle}
                    >
                        <ArrowDropDownIcon />
                    </Button>}
                </ButtonGroup>
                <Popper
                    sx={{
                        zIndex: 1,
                    }}
                    open={open}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    transition
                    disablePortal
                >
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin:
                                    placement === 'bottom' ? 'center top' : 'center bottom',
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList id="split-button-menu" autoFocusItem style={{ width: 152.5, backgroundColor: '#f5f8fd', border: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
                                        {loggedInUser.linkedNumbers.map((option: any, index: number) => (
                                            <MenuItem
                                                key={index}
                                                selected={index === selectedIndex}
                                                onClick={(event) => handleMenuItemClick(event, index)}
                                                style={{ width: 150 }}
                                            >
                                                <div style={{ width: 'fit-content', padding: 5, paddingRight: 15, paddingLeft: 15 }}>{option.number}</div>
                                            </MenuItem>
                                        ))}
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </div >
            {/* <div style={{ width: inputRef?.current && inputRef?.current.offsetWidth, marginLeft: 10, fontSize: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                    <InfoOutlined style={{ fontSize: 12, marginRight: 5 }} />2 credits will be charged for more than 160 characters
                </span>
                <b><span style={{
                    fontSize: 10, color: '#444',
                    left: inputRef?.current ? inputRef?.current.offsetWidth : 20
                }}>{value.length}/320</span>
                </b>
            </div> */}
        </div>
    )
}
