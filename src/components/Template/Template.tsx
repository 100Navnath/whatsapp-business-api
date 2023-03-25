import { Button, Checkbox, Radio } from '@material-ui/core'
import { Block, Call, CheckBox, DeleteOutline, EditOutlined, OpenInNew, SpeakerNotes, SpeakerNotesOffOutlined, SpeakerNotesOutlined } from '@material-ui/icons'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './template.css'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material';
import { ContentCopyOutlined, CopyAllOutlined, PreviewOutlined, ThumbUpOffAltOutlined, WarningAmberOutlined } from '@mui/icons-material'
import TemplateMessage from './Message'
import TemplateButtons from './TemplateButtons'
interface TemplatesInterface {
    template: Object | any
    templateActionButtons?: boolean
    statusVisible?: boolean
    editTemplate?: (obj: any) => void
    deleteTemplate?: (obj: any) => void
    isSelectable?: boolean
    isChecked?: boolean
    onChangeCheck?: (val: boolean) => void
    enableDisableTemplate?: (obj: any) => void
    copyTemplate?: (obj: any) => void
}

export default function Template({ template, templateActionButtons = false, statusVisible = true, editTemplate, deleteTemplate, enableDisableTemplate, isSelectable = false, isChecked = false, onChangeCheck, copyTemplate }: TemplatesInterface) {
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
    useEffect(() => {
        // console.log("template : ", template);
    }, [])

    return (
        <div className='template' style={{ cursor: isSelectable ? "pointer" : 'auto' }}
            onClick={() => onChangeCheck && onChangeCheck(!isChecked)}
        >
            {/* <div style={{ height: '100%', width: 260, padding: 10, position: 'absolute', backgroundColor: template.isDisable ? '#ebebebaa' : 'transparent', zIndex: 100 }} /> */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                {
                    statusVisible &&
                    <span>
                        {
                            template.templateStatus === 'REJECTED' ?
                                <span style={{ fontSize: 13, color: '#d32f2f' }}><WarningAmberOutlined color='error' className='template-action-icon' /> Rejected</span> :
                                template.templateStatus === "APPROVED" ?
                                    <span style={{ fontSize: 12, color: '#075e45' }}><ThumbUpOffAltOutlined style={{ color: '#075e45' }} className='template-action-icon' /> Approved</span> :
                                    template.templateStatus === "success" ?
                                        <span style={{ fontSize: 12, color: '#fc9f49' }}><PreviewOutlined style={{ color: '#fc9f49' }} className='template-action-icon' /> In-Preview</span> :
                                        <span style={{ fontSize: 12, color: '#333' }}>{template.templateStatus}</span>

                        }
                    </span>
                }
                {
                    templateActionButtons &&
                    <span>
                        {
                            template.templateStatus !== "APPROVED" &&
                            <GridTooltip title="Edit Template" placement="bottom">
                                <Button
                                    onClick={() => { editTemplate && editTemplate(template) }}
                                >
                                    <EditOutlined color='primary' className='template-action-icon' />
                                </Button>
                            </GridTooltip>
                        }
                        {
                            template.templateStatus !== "APPROVED" &&
                            <GridTooltip title="Delete Template" placement="bottom">
                                <Button
                                    onClick={() => { deleteTemplate && deleteTemplate(template) }}
                                >
                                    <DeleteOutline color='error' className='template-action-icon' />
                                </Button>
                            </GridTooltip>
                        }
                        {
                            template.templateStatus === "APPROVED" &&
                            <>
                                <GridTooltip title={template.isDisable ? "Enable Template" : "Disable Template"} placement="bottom">
                                    <Button
                                        onClick={() => { enableDisableTemplate && enableDisableTemplate(template) }}
                                    >
                                        {
                                            template.isDisable ?
                                                <SpeakerNotesOutlined className='template-action-icon' /> :
                                                <SpeakerNotesOffOutlined className='template-action-icon' />
                                        }
                                    </Button>
                                </GridTooltip>
                                <GridTooltip title={"Copy Template"} placement="bottom">
                                    <Button
                                        onClick={() => { copyTemplate && copyTemplate(template) }}
                                    >
                                        <ContentCopyOutlined className='template-action-icon' />
                                    </Button>
                                </GridTooltip>

                            </>
                        }
                    </span>
                }
            </div>
            <div className='template-name'>
                {isSelectable && <Radio
                    checked={isChecked}
                    className='radio-btn'
                    onChange={(e: any) => onChangeCheck && onChangeCheck(e.target.checked)}
                />}
                <span>{template.templateJson.name} • {template.templateJson.language}</span>
            </div>
            <TemplateMessage template={template.templateJson} />
            {/* <TemplateButtons template={template.templateJson} /> */}
        </div >
    )
}
