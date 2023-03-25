import { Button, Checkbox, Radio } from '@material-ui/core'
import { Call, CheckBox, DeleteOutline, EditOutlined, OpenInNew, SpeakerNotesOffOutlined } from '@material-ui/icons'
import moment from 'moment'
import React, { CSSProperties, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './template.css'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material';
import { ThumbUpOffAltOutlined, WarningAmberOutlined } from '@mui/icons-material'
import TemplateButtons from './TemplateButtons'
interface TemplatesInterface {
    template: Object | any
    styles?: CSSProperties
}

export default function TemplateMessage({ template, styles }: TemplatesInterface) {
    const navigate = useNavigate();
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
    // const [templateObj, setTemplateObj] = useState<any>(template)

    const header = template.components.filter((obj: any) => { return obj.type === 'HEADER' })[0];
    const body = template.components.filter((obj: any) => { return obj.type === 'BODY' })[0];
    const footer = template.components.filter((obj: any) => { return obj.type === 'FOOTER' })[0];
    const buttons = template.components.filter((obj: any) => { return obj.type === 'BUTTONS' })[0];

    return (
        <div>
            <div className='templates-message' style={{ ...styles }}>
                {header &&
                    <span>
                        {
                            header.format === 'TEXT' ?
                                <div className='template-header'><b>{header.text}</b></div> :
                                header.format === 'IMAGE' ?
                                    <div className='image-bg'>
                                        {
                                            header.example && header.example.header_handle[0] &&
                                            <img style={{ height: '100%', width: '100%', objectFit: 'cover' }} src={header.example.header_handle[0]} alt="preview image" />
                                        }
                                    </div> :
                                    header.format === 'VIDEO' ?
                                        <div className='video-bg'
                                        >
                                            {
                                                header.example && header.example.header_handle[0] &&
                                                <video style={{ objectFit: 'cover', borderRadius: 2 }} width="100%" height="100%" controls>
                                                    <source src={header.example.header_handle[0]} />
                                                </video>
                                            }
                                        </div> :
                                        header.format === 'DOCUMENT' &&
                                        <div className='doc-bg'>
                                            {header.example && header.example.header_handle[0] && <object data={header.example.header_handle[0]} type="application/pdf" width="100%" height="100%" />}
                                        </div>
                        }
                    </span>}
                <div className='template-body' dangerouslySetInnerHTML={{ __html: body.text }} />
                {/* {body.text} */}
                {
                    footer &&
                    <div className='time-wrapper'>
                        <span className='template-footer'>{footer.text}</span>
                        {/* <span className='template-time'>{moment(Date.now()).format('HH:MM A')}</span> */}
                    </div>
                }
            </div>
            {
                buttons && <div>
                    <div className='template-btn-wrapper'>
                        {
                            buttons.buttons?.slice(0, 2).map((btn: any) =>
                                <span className='template-btn'>{btn.type === 'PHONE_NUMBER' ? <Call style={{ fontSize: 16, marginRight: 5 }} /> : btn.type === 'URL' && <OpenInNew style={{ fontSize: 14, marginRight: 5 }} />}{btn.text}</span>
                            )
                        }
                    </div>
                    <div className='template-btn-wrapper'>
                        {
                            buttons.buttons?.slice(2, 3).map((btn: any) =>
                                <span className='template-btn'>{btn.text}</span>
                            )
                        }
                    </div>
                </div>
            }
        </div >
    )
}
