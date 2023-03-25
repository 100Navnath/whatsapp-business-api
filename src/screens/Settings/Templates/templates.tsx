import { Button } from '@material-ui/core'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom'
import { dummyTemplates } from '../../../assets/jsons/dummyTemplates'
import Dialog from '../../../components/Dialog/Dialog'
import Spinner from '../../../components/Loading/spinner'
import Template from '../../../components/Template/Template'
import { apiList } from '../../../constant/apiList'
import { API } from '../../../constant/network'
import './templates.css'
import InfiniteScroll from 'react-infinite-scroller';
import Scrollbars from 'react-custom-scrollbars'
import { ValidateEmptyField } from '../../../components/validators'

interface TemplatesInterface {
    switchSubTab: (tabName: string) => void
}

export default function Templates({ switchSubTab }: TemplatesInterface) {
    const navigate = useNavigate();
    const { innerWidth: width, innerHeight: height } = window;
    const { state } = useLocation()
    const [templates, setTemplates] = useState<any>([]);
    const [deleteTemplateDialog, setDeleteTemplateDialog] = useState(false)
    const [enableDisableDialog, setEnableDisableDialog] = useState(false)
    const [enterTemplateNameDialog, setEnterTemplateNameDialog] = useState(false)
    const [clickedTemplate, setClickedTemplate] = useState<any>(null)
    const [templateListLoading, setTemplateListLoading] = useState(false)
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0)
    const [dialogLoading, setDialogLoading] = useState(false);
    const [isDialogBtnClick, setIsDialogBtnClick] = useState(false)
    const [newTemplateName, setNewTemplateName] = useState("")

    function editTemplate(obj: any) {
        navigate("/settings/templates/create-template", { state: { templateObj: obj } })
        switchSubTab('createTemplate')
    }

    function getTemplates(p = page) {
        setTemplateListLoading(true)
        const body = {
            skipIn: (p - 1) * 10,
            takeIn: 10,
            status: "success"
        }
        API.get(`${process.env.REACT_APP_BASE_API}${apiList.templateList}`, body, {})?.subscribe({
            next(res: any) {
                if (res.status === 200) {
                    if (res?.data?.templatelist?.length > 0) {
                        if (p === 1) setTemplates([...res.data.templatelist])
                        else setTemplates([...templates, ...res.data.templatelist])
                    }
                    setTemplateListLoading(false)
                    setPage(p + 1)
                    setTotalCount(res.data.count)
                }
            },
            error(err) {
                setTemplateListLoading(false);
            },
        });
    }

    useEffect(() => {
        getTemplates(1)
    }, [])

    function deleteTemplate() {
        if (clickedTemplate && clickedTemplate.templateJson.name) {
            const body = {
                templateName: clickedTemplate.templateJson.name
            }
            setDialogLoading(true);
            API.deleteApi(`${process.env.REACT_APP_BASE_API}${apiList.deleteTemplate}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        // setTimeout(() => {
                        const templatesArr = templates.filter((t: any) => t.whatsappTemplateId !== clickedTemplate.whatsappTemplateId);
                        console.log("templateArr : ", templatesArr);
                        setTemplates([...templatesArr]);
                        setDeleteTemplateDialog(false);
                        setDialogLoading(false)
                        setClickedTemplate(null)
                        setTotalCount(totalCount - 1)
                        // }, 1000);
                    }
                },
                error(err) {
                    setDialogLoading(false)
                },
            });
        }
    }

    function enableDisableTemplate(isDisable: boolean) {
        if (clickedTemplate && clickedTemplate.templateJson.name) {
            const body = {
                "whatsappTemplateId": clickedTemplate.whatsappTemplateId,
                "isDisable": isDisable
            }
            setDialogLoading(true);
            API.put(`${process.env.REACT_APP_BASE_API}${apiList.enableDisableTemplate}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        // setTimeout(() => {
                        let templatesArr = [...templates]
                        const index = templatesArr.findIndex((obj: any) => obj.whatsappTemplateId === clickedTemplate.whatsappTemplateId)
                        templatesArr[index] = { ...templatesArr[index], isDisable: body.isDisable }
                        setTemplates([...templatesArr]);
                        setDialogLoading(false)
                        setClickedTemplate(null)
                        setEnableDisableDialog(false)
                        // }, 1000);
                    }
                },
                error(err) {
                    setDialogLoading(false)
                },
            });
        }
    }

    const swListener = new BroadcastChannel('swListener');
    swListener.onmessage = (event: any) => {
        const data = event.data
        const chat = [...templates]
        const messageObj = event.data.Data
        if (data && data.Type === "TemplateStatusChanged") {
            const arrayOfUrl = window.location.href.split('/');
            const id = parseInt(arrayOfUrl[arrayOfUrl.length - 1]);
            // if (data.Data.customerId === id) {
            let chatArr = [...templates]
            const objIndex = chatArr.findIndex(((obj: any) => obj.whatsappTemplateId === data.Data.TemplateId));
            if (objIndex !== -1) {
                chatArr[objIndex] = { ...chatArr[objIndex], templateStatus: data?.Data?.Status }
                setTemplates([...chatArr])
            }
            // }
        }
    }

    return (
        <div className='templates-wrapper'>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className='page-title'>Templates</div>
                {
                    templates.length !== 0 &&
                    <Button
                        className='create-template-btn'
                        style={{ padding: '4px 20px' }}
                        onClick={() => {
                            switchSubTab('createTemplate');
                            navigate('create-template')
                        }}>
                        Create Template
                    </Button>
                }
            </div>
            {
                templates.length > 0 ?
                    <Scrollbars style={{ height: height - 70 }}>
                        <InfiniteScroll
                            pageStart={1}
                            loadMore={() => getTemplates(page)}
                            hasMore={totalCount && totalCount > templates.length ? true : false}
                            loader={<div style={{ display: 'flex', width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}
                            ><Spinner color="#075E54" /></div>}
                            useWindow={false}
                        >
                            <div className='templates-container'>
                                {
                                    templates.map((t: any) =>
                                        <Template template={t} templateActionButtons={true} editTemplate={editTemplate}
                                            enableDisableTemplate={(t: any) => {
                                                setEnableDisableDialog(true);
                                                setClickedTemplate(t)
                                            }}
                                            deleteTemplate={(t: any) => {
                                                setDeleteTemplateDialog(true);
                                                setClickedTemplate(t)
                                            }}
                                            copyTemplate={(t: any) => {
                                                console.log(t);

                                                setEnterTemplateNameDialog(true);
                                                setClickedTemplate(t)
                                            }}
                                        />
                                    )
                                }
                            </div>
                        </InfiniteScroll>
                    </Scrollbars>
                    // <div className='templates-container' style={{ marginLeft: 10, marginTop: 10 }}>
                    //     {[[1, 4, 7, 10, 13, 16, 19, 22, 25, 28], [2, 5, 8, 11, 14, 17, 20, 23, 26, 29], [3, 6, 9, 12, 15, 18, 21, 24, 27, 30]].map((i) =>
                    //         <div>
                    //             {i.map((j) =>
                    //                 templates[j] &&
                    //                 <Template template={templates[j]} templateActionButtons={true} editTemplate={editTemplate} deleteTemplate={(t: any) => {
                    //                     setDeleteTemplateDialog(true);
                    //                     setClickedTemplate(t)
                    //                 }} />
                    //             )}
                    //         </div>
                    //     )}
                    // </div>
                    :
                    <div style={{ fontSize: 14, color: '#90a4ac', width: '100%', height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        {
                            templateListLoading ?
                                <Spinner color='#075E54' /> :
                                <>
                                    <img height={150} src='https://www.freeiconspng.com/thumbs/document-icon/document-icon-26.png' />
                                    <span style={{ marginTop: 10 }}>Dont have any templates</span>
                                    <Button
                                        className='create-template-btn'
                                        style={{ marginTop: 10, padding: '3px 20px' }}
                                        onClick={() => {
                                            switchSubTab('createTemplate');
                                            navigate('create-template')
                                        }}>
                                        Create Template
                                    </Button>
                                </>
                        }
                    </div>
            }
            <Dialog
                title={"Delete template confirmation"}
                open={deleteTemplateDialog}
                loading={dialogLoading}
                onClose={() => setDeleteTemplateDialog(false)}
                onClick={deleteTemplate}
                DialogBody={() =>
                    <div style={{ margin: 10 }}>
                        <span style={{ display: 'block', marginBottom: 10 }}>Are you sure you want to delete <b>{clickedTemplate?.templateJson?.name}</b></span>
                        {clickedTemplate?.whatsappTemplateId && <Template template={clickedTemplate} />}
                    </div>}
                positiveBtnLabel={"Delete"}
                negativeBtnLabel={'Cancel'}
            />

            <Dialog
                title={clickedTemplate?.isDisable ? "Enable template?" : "Disable template?"}
                open={enableDisableDialog}
                loading={dialogLoading}
                onClose={() => setEnableDisableDialog(false)}
                onClick={() => {
                    enableDisableTemplate(!clickedTemplate?.isDisable)
                }}
                DialogBody={() =>
                    <div style={{ margin: 10 }}>
                        <span style={{ display: 'block', marginBottom: 10 }}>Are you sure you want to {clickedTemplate?.isDisable ? "Enable" : "Disable"} <b>{clickedTemplate?.templateJson?.name}</b></span>
                        {clickedTemplate?.whatsappTemplateId && <Template template={clickedTemplate} />}
                    </div>}
                positiveBtnLabel={clickedTemplate?.isDisable ? "Enable" : "Disable"}
                negativeBtnLabel={'Cancel'}
            />

            <Dialog
                title={'Enter Template Name'}
                open={enterTemplateNameDialog}
                loading={dialogLoading}
                onClose={() => setEnterTemplateNameDialog(false)}
                onClick={() => {
                    setIsDialogBtnClick(true)
                    if (clickedTemplate.templateJson.name !== newTemplateName &&
                        !ValidateEmptyField(newTemplateName, "Template Name").err) {
                        editTemplate({ ...clickedTemplate, whatsappTemplateId: undefined, templateJson: { ...clickedTemplate?.templateJson, name: newTemplateName } })
                    }
                }}
                DialogBody={() =>
                    <div className="field-wrapper" style={{ width: 350, marginBottom: 0 }}>
                        <input value={newTemplateName} disabled={dialogLoading}
                            onChange={(event) => {
                                if (/^(?:[A-Za-z_ ]+|\d+)$/.test(event.target.value) || event.target.value === "") {
                                    setNewTemplateName(event.target.value.split(' ').join('_').toLowerCase())
                                }
                            }} />
                        <div className="field-placeholder">Template Name</div>
                        <div className='error'>{isDialogBtnClick && ValidateEmptyField(newTemplateName, "Template Name").err}</div>
                        <div className='error'>{isDialogBtnClick && clickedTemplate.templateJson.name === newTemplateName && "Template name cannot be same"}</div>
                    </div>
                }
                positiveBtnLabel={"Proceed"}
                negativeBtnLabel={'Cancel'}
            />
        </div >
    )
}
