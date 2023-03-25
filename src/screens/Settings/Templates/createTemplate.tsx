import moment from 'moment'
import { useState, useEffect } from 'react'
import './createTemplate.css'
import StepWizard from "react-step-wizard";
import { Call, OpenInNew } from '@material-ui/icons';
import Step2 from './CreateTemplate/step2';
import Step1 from './CreateTemplate/step1';
import Scrollbars from 'react-custom-scrollbars'
import { useLocation } from 'react-router-dom';
import Template from '../../../components/Template/Template';

interface CreateTemplateProps {
    switchSubTab: (tabName: string) => void
}

export default function CreateTemplate({ switchSubTab }: CreateTemplateProps) {
    const fileTypes = [
        "pdf",
        // "XLSX"
    ];

    const { innerWidth: width, innerHeight: height } = window;
    const { state } = useLocation();
    const templateObj = state?.templateObj?.templateJson ? state.templateObj.templateJson : undefined;
    const action = state?.action;

    useEffect(() => {
        // console.log("Template : ", templateObj);
    }, [])

    const [header, setHeader] = useState<any>(
        {
            "type": "HEADER",
            text: "",
            ...templateObj?.components.filter((e: any) => e.type === "HEADER")[0]
        }
        // : {
        //     "type": "HEADER",
        //     "format": "NONE",
        //     "text": "",
        //     "example": { "header_text": [], header_handle: [] }
        // }
    )

    const [body, setBody] = useState<any>({
        "type": "BODY",
        "text": "",
        ...templateObj?.components.filter((e: any) => e.type === "BODY")[0]
        // "example": { "body_text": [[]] }
    })
    const [footer, setFooter] = useState<any>({
        "type": "FOOTER",
        ...templateObj?.components?.filter((e: any) => e.type === "FOOTER")[0]
        // "text": ""
    })



    // {
    //     "type": "PHONE_NUMBER",
    //     "text": "call btn text",
    //     "phone_number": "+91083923 48249"
    // },
    // {
    //     "type": "URL",
    //     "text": "Visit Website",
    //     "url": "https://google.com/{{1}}"
    // }
    const [buttons, setButtons] = useState<any>({
        "type": "BUTTONS",
        ...templateObj?.components.filter((e: any) => e.type === "BUTTONS")[0]
        // "buttons": []
    })

    const [template, setTemplate] = useState<any>(
        {
            "name": templateObj?.name ? templateObj.name : "",
            "language": templateObj?.language ? templateObj.language : "en_US",
            "category": templateObj?.category ? templateObj.category : "",
            "components": [
                { ...body },
                { ...header },
                { ...footer },
                { ...buttons }
            ]
        }
    );

    function getPosition(str: any, pat: any, n: any) {
        var L = str.length, i = -1;
        while (n-- && i++ < L) {
            i = str.indexOf(pat, i);
            if (i < 0) break;
        }
        return i;
    }
    function convertToHtmlString() {
        try {
            let text = body?.text ? body.text : ''
            let i = 1
            while (getPosition(text, ' *', i) > 0 && getPosition(text, '*', i + 1) > 0) {
                const start = getPosition(text, ' *', i)
                const end = getPosition(text, '*', i * 2)
                text = text.slice(0, start + 1) + '<b>' + text.slice(start + 2, end) + '</b>' + text.slice(end + 1)
            }
            let j = 1
            while (getPosition(text, ' _', j) > 0 && getPosition(text, '_', j + 1) > 0) {
                const start = getPosition(text, ' _', j)
                const end = getPosition(text, '_', j * 2)
                text = text.slice(0, start + 1) + '<i>' + text.slice(start + 2, end) + '</i>' + text.slice(end + 1)
            }
            return text
        } catch (error) {
            console.log("Error converting to html string : ", error, body?.text);
        }
    }

    //replacing variables with sample values in body
    function addVariableinBody() {
        let text = convertToHtmlString();
        // console.log("Body without variables : ", text, body.example.body_text[0]);
        if (body?.example?.body_text && body?.example?.body_text[0]) {
            for (let i = 1; i <= body.example.body_text[0].length; i++) {
                const value = body.example.body_text[0][i - 1] ? body.example.body_text[0][i - 1] : `{{${i}}}`
                text = text.replaceAll(`{{${i}}}`, value)
            }
        }
        // console.log('Body with variable : ', text);

        return text
    }

    function addVariablesInHeader() {
        let text = header.text
        //replacing variables with sample values
        if (header?.example?.header_text) {
            for (let i = 1; i <= header?.example.header_text.length; i++) {
                const start = getPosition(text, `{{${i}}}`, i)
                const value = header.example.header_text[i - 1] ? header.example.header_text[i - 1] : `{{${i}}}`
                if (start > -1) text = text.slice(0, start) + value + text.slice(start + 5)
            }
        }
        return text
    }

    function repositioningVariables() {
        let text = "012 {{9}} {{4}} {{4}} {{11}}, ."
        let i = 1
        const arr = []
        let mainArr = []
        while (getPosition(text, '{{', i) > 0 && getPosition(text, '}}', i) > 0) {
            const start = getPosition(text, '{{', i)
            const end = getPosition(text, '}}', i)
            arr.push(JSON.parse(text.slice(start + 2, end)))
            mainArr.push(JSON.parse(text.slice(start + 2, end)))
            i++
        }
        function removeDuplicates(arr: any) {
            return arr.filter((item: any, index: number) => arr.indexOf(item) === index);
        }
        console.log("Array of variables : ", arr)
        let copyArr = arr.sort(function (a, b) {
            return a - b;
        });
        copyArr = removeDuplicates(copyArr)
        console.log("sorted array : ", copyArr)
        let newArr = [...mainArr]
        for (let k = 0; k < copyArr.length; k++) {
            for (let j = 0; j < newArr.length; j++) {
                if (newArr[j] === copyArr[k]) {
                    newArr[j] = k + 1
                }
            }
        }
        console.log("New Arr", newArr)
        console.log("mainArr", mainArr)
        for (let i = 0; i < mainArr.length; i++) {
            text.replaceAll(`{{${mainArr[i]}}}`, `{{${newArr[i]}}}`)
        }


    }

    useEffect(() => {
        addVariableinBody()
    }, [body.text])

    return (
        <div className='templates-wrapper'>
            <div className='page-title'>{templateObj?.name ? "Edit Template" : "Create Template"}</div>
            <div className='create-template-container' style={{ height: '100%', display: 'flex', justifyContent: 'space-between', backgroundColor: '#eee' }}>
                <Scrollbars style={{ height: height - 70 }}>
                    {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'clip', width: '50%', backgroundColor: '#FFF', margin: 15, borderRadius: 5 }}> */}
                    <div className='steps-container' style={{ overflowY: 'clip' }}>
                        <StepWizard isHashEnabled={false}>
                            <Step1 template={template} setTemplate={(template: any) => setTemplate(template)} />
                            <Step2
                                template={template} setTemplate={(template: any) => setTemplate(template)}
                                header={header} setHeader={(h: any) => setHeader(h)}
                                body={body} setBody={(b: any) => setBody(b)}
                                footer={footer} setFooter={(b: any) => setFooter(b)}
                                buttons={buttons} setButtons={(b: any) => setButtons(b)}
                                switchSubTab={switchSubTab}
                            />
                        </StepWizard>
                    </div>
                </Scrollbars>
                {/* <Template
                    template={{
                        "templateJson": {
                            ...template,
                            "components": [
                                { ...body, text: addVariableinBody() },
                                { ...header, text: addVariablesInHeader() },
                                { ...footer },
                                { ...buttons }
                            ]
                        }
                    }}
                /> */}
                <div style={{ height: '100%', width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <span className='template-name' style={{ margin: 10 }}>• Preview</span>
                    <div className='template'>
                        <span className='template-name'>{template.name}</span>
                        <div className='templates-message'>
                            {header.format === 'TEXT' ?
                                <div className='template-header'><b>{addVariablesInHeader()}</b></div> :
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
                                        <div className='doc-bg'
                                        >
                                            <object data={header?.example?.header_handle[0]} type="application/pdf" width="100%" height="100%" />
                                        </div>
                            }
                            <div className='template-body' dangerouslySetInnerHTML={{ __html: addVariableinBody() }} />
                            <div className='time-wrapper'>
                                <span className='template-footer'>{footer.text}</span>
                                <span className='template-time'>{moment(Date.now()).format('HH:MM A')}</span>
                            </div>
                        </div>
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
                </div>
            </div>
        </div >
    )
}
