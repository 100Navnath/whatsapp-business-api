import { Close } from '@material-ui/icons'
import React, { CSSProperties, ReactElement } from 'react'
import Transition from '../../components/Transition'
import { LoadingButton } from '@mui/lab';
import DialogBox from '@mui/material/Dialog';
import Spinner from '../Loading/spinner';
import { Button } from '@material-ui/core'
import { JsxAttribute } from 'typescript';
import './dialog.css'
interface DialogProps {
    title: string
    open: boolean
    onClose: VoidFunction
    loading: boolean
    onClick?: VoidFunction
    DialogBody: any
    positiveBtnLabel?: string
    negativeBtnLabel?: string
    btnContainerStyles?: CSSProperties
    hideActionBtns?: boolean
}

export default function Dialog({ title, open, onClose, loading, onClick, DialogBody, negativeBtnLabel = "Cancel",
    positiveBtnLabel = "Submit", btnContainerStyles, hideActionBtns = false }: DialogProps) {
    return (
        <DialogBox
            open={open}
            TransitionComponent={Transition}
            keepMounted
            // onClose={onClose}
            aria-describedby="alert-dialog-slide-description"
            transitionDuration={400}
        >
            <div className='dialog-wrapper' style={{ width: 'fit-content' }}>
                <div className='dialog-title'>{title}
                    <Close onClick={onClose} className='close-dialog' />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', padding: 10 }}>
                    {DialogBody()}
                </div>
                {
                    !hideActionBtns &&
                    <div className="dialog-action-btn-wrapper" style={{ ...btnContainerStyles }}>
                        <Button
                            className='dialog-btn-positive'
                            // loading={loading}
                            variant="contained"
                            size='small'
                            // loadingIndicator={<Spinner />}
                            onClick={onClick}
                        >
                            {/* <span style={{ backgroundColor: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> */}
                            {loading ? <Spinner /> : positiveBtnLabel}
                            {/* </span> */}
                        </Button>
                        <Button variant="outlined" className='dialog-btn-danger' onClick={onClose}>{negativeBtnLabel}</Button>
                    </div>
                }
            </div>
        </DialogBox>
    )
}
