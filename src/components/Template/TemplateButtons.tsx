import { Button, Checkbox, Radio } from '@material-ui/core'
import { Call, CheckBox, DeleteOutline, EditOutlined, OpenInNew, SpeakerNotesOffOutlined } from '@material-ui/icons'
import moment from 'moment'
import React, { CSSProperties, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './template.css'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material';
import { ThumbUpOffAltOutlined, WarningAmberOutlined } from '@mui/icons-material'
interface TemplatesInterface {
    template: Object | any
    styles?: CSSProperties
}

export default function TemplateButtons({ template, styles }: TemplatesInterface) {
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
    console.log("template : ", template);

    const buttons = template?.components?.filter((obj: any) => { return obj.type === 'BUTTONS' })[0];

    return (
        <div>
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
