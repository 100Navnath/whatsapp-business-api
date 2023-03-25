import { AddOutlined, ArrowBack, Close, EmojiEmotionsOutlined, FormatBoldOutlined, FormatItalic, Image, StrikethroughSOutlined } from '@material-ui/icons';
import { useState, useEffect } from 'react'
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { ValidateEmptyField, ValidateNumber } from '../../../../components/validators';
import { Button } from '@mui/material';
import Radio from '@mui/material/Radio';
import { TextField } from '@material-ui/core';
import PhoneInput from 'react-phone-input-2';
import Dialog from '../../../../components/Dialog/Dialog';
import Dropdown from '../../../../components/Dropdown';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { API } from '../../../../constant/network';
import Toast from '../../../../components/Toast/Toast';
import { apiList } from '../../../../constant/apiList';
import Spinner from '../../../../components/Loading/spinner';
import Scrollbars from 'react-custom-scrollbars'
import Asterisk from '../../../../components/Asterisk';

interface Step1Props {
    template: any
    header: any
    body: any
    footer: any
    buttons: any
    setTemplate: (prop: any) => void
    setHeader: (prop: any) => void
    setBody: (prop: any) => void
    setFooter: (prop: any) => void
    setButtons: (prop: any) => void
    previousStep?: any
    switchSubTab: (tabName: string) => void
}

export default function Step2({ template, setTemplate, previousStep, header, setHeader, body, setBody, footer, setFooter, buttons, setButtons, switchSubTab }: Step1Props) {
    const { innerWidth: width, innerHeight: height } = window;
    const [file, setFile] = useState<any>(null);
    const handleChange = async (event: any) => {
        if (event.target.files && event.target.files[0]) {
            const url = URL.createObjectURL(event.target.files[0])
            const header_handle = [`${url}`]
            // setHeader({ ...header, example: { ...header.example, header_handle } })
            setFile(url);
        }
    };
    const navigate = useNavigate();
    const [isBtnClicked, setIsBtnClicked] = useState(false);
    const [headerType, setHeaderType] = useState('NONE')
    const [btnType, setBtnType] = useState(template?.components?.filter((e: any) => e.type === 'BUTTONS')[0]?.buttons && template?.components?.filter((e: any) => e.type === 'BUTTONS')[0]?.buttons[0]?.type)
    const [variables, setVariables] = useState<any>({})
    const [variablesForHeader, setVariablesForHeader] = useState<any>({})
    const mediaType = ['Image', 'Video', 'Document']
    const [addSampleDialog, setAddSampleDialog] = useState(false);
    const [urlType, setUrlType] = useState('');
    const [callToActionBtnType, setCallToActionBtnType] = useState({ label: '', value: '' });
    const { state } = useLocation();
    const templateObj = state?.templateObj ? state.templateObj : undefined;

    const [createTemplateLoading, setCreateTemplateLoading] = useState(false);

    const Tooltip1 = styled(({ className, ...props }: any) => (
        <Tooltip {...props} classes={{ popper: className }} />
    ))(({ theme }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: '#111',
            color: '#FFF',
            maxWidth: 220,
            fontSize: theme.typography.pxToRem(10),
            border: '1px solid #dadde9',
        },
    }));

    function onConfirmAddSample() {
        variablesForHeader[1] && setHeader({ ...header, example: { ...header.example, header_text: [variablesForHeader[1]] } })
        setAddSampleDialog(false)
        let variablesArray = [];
        for (let i = 0; i < Object.keys(variables).length; i++) {
            variablesArray[i] = variables[Object.keys(variables)[i]]
        }
        Object.keys(variables).length > 0 && setBody({ ...body, example: { ...body.example, body_text: [[...variablesArray]] } })
        if (file) setHeader({ ...header, example: { ...header.example, header_handle: [file] } })
    }
    // {
    //     "type": "PHONE_NUMBER",
    //     "text": "this is btn text",
    //     "phone_number": "+1987654323456"
    //   },
    //   {
    //     "type": "URL",
    //     "text": "this is google",
    //     "url": "https://google.com"
    //   }

    function addButton(type: string = btnType, btns = buttons) {
        if (btns.buttons.length < 3) {
            if (type === 'QUICK_REPLY') {
                setButtons({ ...btns, buttons: [...btns.buttons, { "type": type, "text": "" }] })
            } else if (type === 'CALL_TO_ACTION') {
                setButtons({ ...btns, buttons: [...btns.buttons, { "type": 'PHONE_NUMBER', "text": "", phone_number: "" }] })
            }
        }
    }

    // return start and end point of selected text in body 
    function getSelectionPoints() {
        var input: any = document.getElementById('template_body');
        var points = { start: input.selectionStart, end: input.selectionEnd }
        return points
    }

    // identify and perform perticular action regarding body input
    function onKeyDown(event: any) {
        const points = getSelectionPoints();
        if (event.ctrlKey && event.key.toLowerCase() === "b") makeTextBold(points)
        else if (event.ctrlKey && event.key.toLowerCase() === "i") makeTextItalic(points)
    }

    // This function is to make text BOLD
    function makeTextBold(points?: { start: number, end: number }) {
        const selectionPoints = points ? points : getSelectionPoints();
        const newText = [body.text.slice(0, selectionPoints.start), '*', body.text.slice(selectionPoints.start)].join('')
        const newText2 = [newText.slice(0, selectionPoints.end + 1), '*', newText.slice(selectionPoints.end + 1)].join('')
        setBody({ ...body, text: newText2 });
    }

    // This function is to make text ITALIC
    function makeTextItalic(points?: { start: number, end: number }) {
        const selectionPoints = points ? points : getSelectionPoints();
        const newText = [body.text.slice(0, selectionPoints.start), '_', body.text.slice(selectionPoints.start)].join('')
        const newText2 = [newText.slice(0, selectionPoints.end + 1), '_', newText.slice(selectionPoints.end + 1)].join('')
        setBody({ ...body, text: newText2 });
    }

    // This function is to make text  Strike Through
    function makeTextStrikeThrough(points?: { start: number, end: number }) {
        const selectionPoints = points ? points : getSelectionPoints();
        const newText = [body.text.slice(0, selectionPoints.start), '~', body.text.slice(selectionPoints.start)].join('')
        const newText2 = [newText.slice(0, selectionPoints.end + 1), '~', newText.slice(selectionPoints.end + 1)].join('')
        setBody({ ...body, text: newText2 });
    }

    // This function is to make text  Monospace
    function makeTextMonospace(points?: { start: number, end: number }) {
        const selectionPoints = points ? points : getSelectionPoints();
        const newText = [body.text.slice(0, selectionPoints.start), '```', body.text.slice(selectionPoints.start)].join('')
        const newText2 = [newText.slice(0, selectionPoints.end + 1), '```', newText.slice(selectionPoints.end + 1)].join('')
        setBody({ ...body, text: newText2 });
    }

    function getPosition(str: any, pat: any, n: any) {
        var L = str.length, i = -1;
        while (n-- && i++ < L) {
            i = str.indexOf(pat, i);
            if (i < 0) break;
        }
        return i;
    }

    function repositioningVariables() {
        let text = body.text
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
        let copyArr = arr.sort(function (a, b) {
            return a - b;
        });
        copyArr = removeDuplicates(copyArr)
        let newArr = [...mainArr]
        for (let k = 0; k < copyArr.length; k++) {
            for (let j = 0; j < newArr.length; j++) {
                if (newArr[j] === copyArr[k]) {
                    newArr[j] = k + 1
                }
            }
        }
        let text2 = text
        let newVariables: any = {};
        for (let i = 0; i < mainArr.length; i++) {
            text2 = text2.replaceAll('{{' + mainArr[i] + '}}', '{{' + newArr[i] + '}}')
            newVariables[newArr[i]] = variables[mainArr[i]]
        }
        setVariables({ ...newVariables })
        setBody({ ...body, text: text2 })
        setAddSampleDialog(true)
    }

    const callToActionOptions = [
        { label: 'Call Phone Number', value: 'PHONE_NUMBER' },
        { label: 'Visit Website', value: 'URL' }
    ]

    function variablesValidation() {
        let text = header.text
        if (header?.example?.header_text) {
            for (let i = 1; i <= header?.example.header_text.length; i++) {
                const start = getPosition(text, `{{${i}}}`, i)
                if (start === -1) setHeader({ ...header, example: {} })
            }
        }
    }

    function addTemplate() {
        if (body && body.text && body.text.trim() !== "") {
            setCreateTemplateLoading(true)
            let headerValidated = header
            if (header?.example?.header_text) {
                for (let i = 1; i <= header?.example.header_text.length; i++) {
                    const start = getPosition(header.text, `{{${i}}}`, i)
                    if (start === -1) {
                        setHeader({ ...header, example: {} })
                        headerValidated = { ...header, example: {} }
                    }
                }
            }
            let comp: Array<any> = [body]
            if (header?.text) comp.push(headerValidated)
            if (footer?.text) comp.push(footer)
            if (buttons?.buttons?.length > 0) comp.push(buttons)
            const apiBody = {
                ...template, components: [...comp]
            }
            API.post(`${process.env.REACT_APP_BASE_API}${apiList.createTemplate}?templateName=${template.name}`, apiBody, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setCreateTemplateLoading(false);
                        Toast({ message: 'Template sent for approval successfully', type: 'success' })
                        navigate('/settings/templates', { state: { createdTemplate: apiBody } });
                        switchSubTab('template');
                    }
                },
                error(err) {
                    setCreateTemplateLoading(false)
                },
            });
        } else Toast({ message: 'Body can not be empty', type: 'error' })
    }

    function editTemplate() {
        if (body && body.text && body.text.trim() !== "") {
            setCreateTemplateLoading(true)
            let comp: Array<any> = [body]
            if (header?.text) comp.push(header)
            if (footer?.text) comp.push(footer)
            if (buttons?.buttons) comp.push(buttons)
            const apiBody = {
                templateId: templateObj?.whatsappTemplateId,
                ...template, components: [...comp]
            }
            API.post(`${process.env.REACT_APP_BASE_API}${apiList.editTemplate}?templateId=${templateObj?.whatsappTemplateId}`, apiBody, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setCreateTemplateLoading(false);
                        Toast({ message: 'Template sent for approval successfully', type: 'success' })
                        navigate('/settings/templates', { state: { createdTemplate: apiBody } });
                        switchSubTab('template');
                    }
                },
                error(err) {
                    setCreateTemplateLoading(false)
                },
            });
        } else Toast({ message: 'Body can not be empty', type: 'error' })
    }

    useEffect(() => {
        // console.log(buttons);
    }, [buttons])


    return (
        <Scrollbars style={{ height: height - 70 }}>
            <div style={{ padding: 10 }}>
                <ArrowBack onClick={() => previousStep()} />
                <div className='category-container'>
                    <div className='title'>Header</div>
                    <div style={{ width: '100%', display: 'flex', marginTop: 15 }}>
                        <FormControl sx={{ width: '20%', height: 'fit-content' }}>
                            <InputLabel htmlFor="grouped-native-select">Type</InputLabel>
                            <Select
                                onChange={(e: any) => {
                                    const header1 = { ...header, format: e.target.value }
                                    setHeader(header1)
                                    setHeaderType(e.target.value);
                                    setTemplate({ ...template, })
                                }}
                                style={{ width: '100%', fontSize: 12, marginTop: 5 }}
                                defaultValue={(header.format === 'IMAGE' || header.format === 'VIDEO' || header.format === 'DOCUMENT') ? 'MEDIA' : header.format} id="grouped-select" label="Grouping">
                                <MenuItem value={'NONE'}>None</MenuItem>
                                <MenuItem value={'TEXT'}>Text</MenuItem>
                                <MenuItem value={'MEDIA'}>Media</MenuItem>
                            </Select>
                        </FormControl>
                        {
                            header.format === 'TEXT' ?
                                // <div className="field-wrapper" style={{ width: 400, marginLeft: 0, marginBottom: 0, margin: 0 }}>
                                //     <input name='template_header' placeholder='Enter header...' type="text" value={header.text} maxLength={60}
                                //         onChange={(event) => {
                                //             setHeader({ ...header, text: event.target.value })
                                //         }}
                                //         disabled={false}
                                //     />
                                //     <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                //         <div className='error'>{isBtnClicked && ValidateEmptyField(header.text, "Header").err}</div>
                                //         <div style={{ fontSize: 11 }}>{header.text.length}/60</div>
                                //     </div>
                                //     {
                                //         !header.text.includes('{{1}}') &&
                                //         <Button className='add-variable-btn' style={{ alignSelf: 'end' }} onClick={() => {
                                //             setVariablesForHeader({ ...variables, 1: '' })
                                //             setHeader({ ...header, text: `${header.text} {{1}}` })
                                //         }}>
                                //             <AddOutlined fontSize='small' /> Add Variable
                                //         </Button>
                                //     }
                                // </div> 
                                <div style={{ width: '78%', marginLeft: '2%', display: 'flex', alignItems: 'flex-start' }}>
                                    <div style={{ width: '80%' }}>
                                        <TextField
                                            style={{ width: '100%' }}
                                            className='text-field'
                                            id="outlined-basic"
                                            // label="Body"
                                            variant="outlined"
                                            value={header.text}
                                            multiline={true}
                                            disabled={false}
                                            inputProps={{ style: { fontSize: 12, padding: 0 }, maxLength: 60 }} // font size of input text
                                            onChange={(e: any) => setHeader({ ...header, text: e.target.value })}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                            <div className='error'>{isBtnClicked && ValidateEmptyField(footer.text, "Header").err}</div>
                                            <div style={{ fontSize: 11 }}>{header?.text?.length}/60</div>
                                        </div>
                                    </div>
                                    {
                                        !header?.text?.includes('{{1}}') &&
                                        <Button className='add-variable-btn' style={{ width: '15%' }} onClick={() => {
                                            setVariablesForHeader({ ...variables, 1: '' })
                                            setHeader({ ...header, text: `${header?.text} {{1}}` })
                                        }}>
                                            <AddOutlined fontSize='small' /> Add Variable
                                        </Button>
                                    }

                                </div>
                                :
                                (header.format === 'IMAGE' || header.format === 'VIDEO' || header.format === 'DOCUMENT' || header.format === "MEDIA") &&
                                // <FileUploader
                                //     classes="upload_area"
                                //     handleChange={handleChange}
                                //     types={fileTypes}
                                //     multiple={false}
                                // // onDrop={() => { }}
                                // />
                                <div style={{ display: 'flex' }}>
                                    {
                                        mediaType.map((mediaType: any) =>
                                            <div className='category' style={{ display: 'flex', alignItems: 'center' }}>
                                                <Radio
                                                    className='radio-btn'
                                                    checked={header.format === mediaType.toUpperCase()}
                                                    onChange={(e) => setHeader({ ...header, format: mediaType.toUpperCase() })}
                                                    value="a"
                                                    name="radio-button-demo"
                                                    inputProps={{ 'aria-label': 'A' }}
                                                />
                                                <span onClick={() => setHeader({ ...header, format: mediaType.toUpperCase() })} className='category-title'>{mediaType}<br />
                                                    {/* <span className='category-description'>{c.description}</span> */}
                                                </span>
                                            </div>
                                        )
                                    }
                                </div>
                        }
                    </div>
                </div>

                <div className='category-container'>
                    <div className='title'>Body <Asterisk /></div>
                    <div className='category-description'>Enter the text for your message in the language that you've selected.</div>
                    <div>
                        <TextField
                            style={{ marginTop: 5 }}
                            className='text-field'
                            id="template_body"
                            // label="Body"
                            variant="outlined"
                            value={body.text}
                            multiline={true}
                            disabled={false}
                            inputProps={{ style: { fontSize: 12, padding: 0, height: 100, overflowY: 'scroll' }, maxLength: 1024 }} // font size of input text
                            onChange={(e: any) => {
                                setBody({ ...body, text: e.target.value })
                            }}
                            onKeyDown={(event) => onKeyDown(event)}
                        />
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginTop: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                                <Tooltip1 title={"Insert an emoji"} placement="bottom">
                                    <Button className='body-icon-btn-wrapper' onClick={() => { }}>
                                        <EmojiEmotionsOutlined className='body-icon-btn' />
                                    </Button>
                                </Tooltip1>

                                <Tooltip1 title={"Bold (Ctrl+B)"} placement="bottom">
                                    <Button className='body-icon-btn-wrapper' onClick={() => makeTextBold()}>
                                        <FormatBoldOutlined className='body-icon-btn' />
                                    </Button>
                                </Tooltip1>

                                <Tooltip1 title={"Italic (Ctrl+I)"} placement="bottom">
                                    <Button className='body-icon-btn-wrapper' onClick={() => makeTextItalic()}>
                                        <FormatItalic className='body-icon-btn' />
                                    </Button>
                                </Tooltip1>

                                <Tooltip1 title={"Stike-Through"} placement="bottom">
                                    <Button className='body-icon-btn-wrapper' onClick={() => makeTextStrikeThrough()}>
                                        <StrikethroughSOutlined className='body-icon-btn' />
                                    </Button>
                                </Tooltip1>

                                <Tooltip1 title={"Monospace"} placement="bottom">
                                    <Button className='body-icon-btn-wrapper' onClick={() => makeTextMonospace()}>
                                        <span style={{ fontWeight: 'bold', color: '#555', fontSize: 13 }}>{'</>'}</span>
                                    </Button>
                                </Tooltip1>

                                <Tooltip1 title={"This is text that you specify in the API that will be personalised to the customer, such as their name or invoice number."} placement="bottom">
                                    <Button className='add-variable-btn' onClick={() => {
                                        if (body?.text?.length < 1019) {
                                            let key = Object.keys(variables).length + 1;
                                            while (variables.hasOwnProperty(key)) {
                                                key = key + 1
                                            }
                                            setVariables({ ...variables, [key]: '' })
                                            setBody({ ...body, text: `${body.text} {{${key}}}` })
                                        } else Toast({ message: "Body character limit exceeded", type: 'error' })
                                    }}>
                                        <AddOutlined fontSize='small' /> Add Variable
                                    </Button>
                                </Tooltip1>
                            </div>
                            <div>
                                <div style={{ fontSize: 11 }}>{body?.text?.length}/1024</div>
                            </div>
                        </div>
                        <div className='error'>{isBtnClicked && ValidateEmptyField(body.text, "Body").err}</div>
                    </div>
                    {/* <div className="field-wrapper" style={{ width: '100%', marginLeft: 0, marginTop: 20 }}>
                    <div className="field-placeholder">Body<Asterisk /></div>
                    <input name='template_body' type="text" defaultValue={body.text} maxLength={1024}
                        onChange={(event) => {
                            setBody({ ...body, text: event.target.value })
                        }}
                        disabled={false}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <div className='error'>{isBtnClicked && ValidateEmptyField(body.text, "Body").err}</div>
                        <div style={{ fontSize: 11 }}>{body.text.length}/1024</div>
                    </div>
                </div> */}
                </div>

                <div className='category-container'>
                    <div className='title'>Footer</div>
                    <div className='category-description'>Add a short line of text to the bottom of your message template.</div>
                    <div>
                        <TextField
                            style={{ marginTop: 5 }}
                            className='text-field'
                            id="outlined-basic"
                            // label="Body"
                            variant="outlined"
                            value={footer.text}
                            multiline={true}
                            disabled={false}
                            inputProps={{ style: { fontSize: 12, padding: 0 }, maxLength: 60 }} // font size of input text
                            onChange={(e: any) => setFooter({ ...footer, text: e.target.value })}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <div className='error'>{isBtnClicked && ValidateEmptyField(footer?.text, "Header").err}</div>
                            <div style={{ fontSize: 11 }}>{footer?.text?.length}/60</div>
                        </div>
                    </div>
                </div>

                <div className='category-container'>
                    <div className='title'>Buttons</div>
                    <FormControl sx={{ minWidth: 150, marginRight: 1, height: 'fit-content', marginBottom: 1 }}>
                        <InputLabel htmlFor="grouped-native-select">Type</InputLabel>
                        <Select
                            onChange={(e: any) => {
                                let btns = { ...buttons, buttons: [] }
                                setButtons(btns)
                                if (e.target.value === 'NONE') setButtons(btns)
                                setBtnType(e.target.value);
                                addButton(e.target.value, btns)
                            }}
                            style={{ width: 150, fontSize: 12 }}
                            defaultValue={buttons?.buttons && buttons?.buttons[0] ? buttons?.buttons[0]?.type : ''} id="grouped-select" label="Grouping">
                            <MenuItem value={'NONE'}>None</MenuItem>
                            <MenuItem value={'CALL_TO_ACTION'}>Call to action</MenuItem>
                            <MenuItem value={'QUICK_REPLY'}>Quick Reply</MenuItem>
                        </Select>
                    </FormControl>
                    {
                        btnType === 'QUICK_REPLY' ?
                            <div style={{ marginTop: 10 }}>
                                {
                                    buttons.buttons.map((btn: any, btnIndex: number) =>
                                        <div style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <TextField
                                                    style={{ width: 250, marginRight: 10 }}
                                                    className='text-field'
                                                    id="outlined-basic"
                                                    // label="Body"
                                                    variant="outlined"
                                                    value={btn.text}
                                                    multiline={true}
                                                    disabled={false}
                                                    inputProps={{ style: { fontSize: 12, padding: 0 }, maxLength: 25 }} // font size of input text
                                                    onChange={(e: any) => {
                                                        let btns = buttons.buttons
                                                        btns[btnIndex] = { ...btns[btnIndex], text: e.target.value }
                                                        setButtons({ ...buttons, buttons: btns });
                                                    }}
                                                />
                                                {
                                                    buttons.buttons.length > 1 &&
                                                    <Button
                                                        style={{ padding: 0, margin: 0 }}
                                                        onClick={() => {
                                                            let btns: Array<any> = buttons.buttons;
                                                            btns.splice(btnIndex, 1);
                                                            setButtons({ ...buttons, buttons: [...btns] });
                                                        }}
                                                    >
                                                        <Close className='body-icon-btn' />
                                                    </Button>}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: 250 }}>
                                                <div className='error'>{isBtnClicked && ValidateEmptyField(btn.text, "Button Text").err}</div>
                                                <div style={{ fontSize: 11 }}>{btn.text.length}/25</div>
                                            </div>
                                        </div>
                                    )
                                }
                                <span style={{ backgroundColor: '#ddd', cursor: buttons.buttons.length === 3 ? 'not-allowed' : 'auto' }}>
                                    <Button disabled={buttons?.buttons?.length === 3} className='add-btn' onClick={() => addButton()}>
                                        <AddOutlined fontSize='small' /> Add Button
                                    </Button>
                                </span>
                            </div>
                            :
                            btnType === 'CALL_TO_ACTION' &&
                            <div>
                                {
                                    buttons?.buttons?.map((btn: any, btnIndex: number) =>
                                        // btn.type === "PHONE_NUMBER" ?
                                        <div style={{ display: 'flex' }}>
                                            <div style={{ border: '1px solid #555', borderRadius: 5, width: '85%', marginTop: 10, padding: 10 }}>
                                                <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 15 }}>Type of action</div>
                                                <div style={{ display: 'flex' }}>
                                                    <Dropdown
                                                        styles={{ marginRight: 10 }}
                                                        inputWrapper={{ width: 150 }}
                                                        optionsContainer={{ width: 150 }}
                                                        defaultValue={btn.type === "URL" ? callToActionOptions[1] : callToActionOptions[0]}
                                                        options={callToActionOptions}
                                                        onChange={(e: any) => {
                                                            if (e.value === '') {
                                                                let btn = buttons.buttons
                                                                btn.splice(btnIndex, 1)
                                                                setButtons({ ...buttons, buttons: btn })
                                                                setCallToActionBtnType({ label: '', value: '' })
                                                            } else {
                                                                setCallToActionBtnType(e)
                                                                setButtons({ ...buttons, buttons: [{ type: e.value, text: '' }] })
                                                            }
                                                        }}
                                                        placeholder='Select button type'
                                                        hideClearButton={true}
                                                    />
                                                    <div className="field-wrapper" style={{ width: '100%', marginLeft: 0, marginBottom: 0, margin: 0, marginRight: 10 }}>
                                                        <input name='btn-text' placeholder='Enter button text...' type="text" defaultValue={btn.text} maxLength={25}
                                                            onChange={(event) => {
                                                                let btns = buttons.buttons
                                                                btns[btnIndex] = { ...btns[btnIndex], text: event.target.value }
                                                                setButtons({ ...buttons, buttons: btns });
                                                            }}
                                                            disabled={false}
                                                        />
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                            <div className='error'>{isBtnClicked && ValidateEmptyField(btn.text, "Button Text").err}</div>
                                                            <div style={{ fontSize: 11 }}>{btn.text.length}/25</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {
                                                    btn.type === 'PHONE_NUMBER' ?
                                                        <div>
                                                            <PhoneInput
                                                                containerStyle={{ width: 'fit-content', fontFamily: 'Poppins', fontSize: 14, marginTop: 10 }}
                                                                country={'in'}
                                                                searchStyle={{ fontFamily: 'Poppins', fontSize: 12, padding: 5 }}
                                                                inputStyle={{ fontFamily: 'Poppins', fontSize: 12 }}
                                                                searchPlaceholder={"Search"}
                                                                dropdownStyle={{ alignItems: 'flex-start', display: 'flex', flexDirection: 'column' }}
                                                                value={btn.phone_number}
                                                                onChange={(number, obj: any) => {
                                                                    let btns = buttons.buttons
                                                                    btns[btnIndex] = { ...btns[btnIndex], phone_number: number }
                                                                    setButtons({ ...buttons, buttons: [...btns] })
                                                                }}
                                                                enableSearch={true}
                                                                countryCodeEditable={false}
                                                            />
                                                            <div className='error'>{isBtnClicked && ValidateNumber(btn.phone_number, "Phone number").err}</div>
                                                        </div>
                                                        :
                                                        btn.type === 'URL' &&
                                                        <div style={{ display: 'flex', marginTop: 10 }}>
                                                            <Dropdown
                                                                options={["Static", "Dynamic"]}
                                                                styles={{ marginRight: 10 }}
                                                                inputWrapper={{ width: 150 }}
                                                                optionsContainer={{ width: 150 }}
                                                                defaultValue={urlType}
                                                                onChange={(e: any) => {
                                                                    if (e === '') {
                                                                        let btn = buttons.buttons
                                                                        btn.splice(btnIndex, 1)
                                                                        setButtons({ ...buttons, buttons: btn })
                                                                        setUrlType('')
                                                                    } else
                                                                        setUrlType(e)
                                                                }}
                                                                placeholder='Select URL type'
                                                                hideClearButton={true}
                                                            />
                                                            <div className="field-wrapper" style={{ width: '100%', marginLeft: 0, marginBottom: 0, margin: 0, marginRight: 10 }}>
                                                                <input placeholder='Enter URL...' type="text" defaultValue={btn.url} maxLength={2000}
                                                                    onChange={(event) => {
                                                                        let btns = buttons.buttons
                                                                        btns[btnIndex] = { ...btns[btnIndex], url: event.target.value }
                                                                        setButtons({ ...buttons, buttons: btns });
                                                                    }}
                                                                    disabled={false}
                                                                />
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                                    <div className='error'>{isBtnClicked && ValidateEmptyField(btn.text, "Button Text").err}</div>
                                                                    <div style={{ fontSize: 11 }}>{btn?.url?.length}/2000</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                }
                                            </div>
                                            {
                                                buttons.buttons.length > 1 &&
                                                <Button
                                                    style={{ padding: 0, margin: 0, height: 'fit-content' }}
                                                    onClick={() => {
                                                        let btns: Array<any> = buttons.buttons;
                                                        btns.splice(btnIndex, 1);
                                                        setButtons({ ...buttons, buttons: [...btns] });
                                                    }}
                                                >
                                                    <Close className='body-icon-btn' />
                                                </Button>}
                                        </div>
                                    )
                                }
                                <span style={{ backgroundColor: '#ddd', cursor: buttons.buttons.length === 2 ? 'not-allowed' : 'auto' }}>
                                    <Button disabled={buttons.buttons.length === 2} className='add-btn' style={{ marginTop: 10 }} onClick={() => {
                                        if (buttons.buttons.length === 0) {
                                            setButtons({
                                                ...buttons, buttons: [...buttons.buttons, {
                                                    "type": "PHONE_NUMBER",
                                                    "text": "",
                                                    "phone_number": ""
                                                }]
                                            })
                                        }
                                        else {
                                            if (buttons.buttons.length === 1 && buttons.buttons[0].type === 'PHONE_NUMBER') {
                                                setButtons({
                                                    ...buttons, buttons: [...buttons.buttons, {
                                                        type: 'URL',
                                                        text: '',
                                                        url: '',
                                                        // example: 'https://www.website.com/dynamic-url-exam' //if url is dynamic
                                                    }]
                                                })

                                            } else if (buttons.buttons.length === 1 && buttons.buttons[0].type === 'URL') setButtons({ ...buttons, buttons: [...buttons.buttons, { "type": 'PHONE_NUMBER', "text": "", phone_number: "" }] })
                                        }
                                    }}>
                                        <AddOutlined fontSize='small' /> Add Button
                                    </Button>
                                </span>
                            </div>
                    }
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                    <Button className='add-sample-btn' onClick={() => {
                        repositioningVariables()
                    }}>
                        Add Sample
                    </Button>
                    <Button className='next-btn' onClick={() => templateObj?.whatsappTemplateId ? editTemplate() : addTemplate()}>
                        {createTemplateLoading ? <Spinner /> : "Submit"}
                    </Button>
                </div>

                <Dialog
                    title={"Add sample content"}
                    open={addSampleDialog}
                    loading={false}
                    onClose={() => setAddSampleDialog(false)}
                    onClick={() => onConfirmAddSample()}
                    DialogBody={() =>
                        <div>
                            <div className="field-wrapper" style={{ width: 350, marginBottom: 0 }}>
                                <p style={{ fontSize: 12, textAlign: 'left', lineHeight: 1.5 }}>To help us understand what kind of message that you want to send, you have the option to provide specific content examples for your template. You can add a sample template for one or all languages that you are submitting.Make sure that you don't include any actual user or customer information, and only provide sample content in your examples.</p>

                                {
                                    header.format === 'TEXT' && header?.text?.includes('{{1}}') ?
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'start' }}>Header</div>
                                            <div className="field-wrapper" style={{ marginLeft: 0, marginBottom: 10 }}>
                                                <input type="text" onChange={(e) => {
                                                    // setHeader({ ...header, example: { ...header.example, header_text: [e.target.value] } })
                                                    setVariablesForHeader({ ...variablesForHeader, 1: e.target.value })
                                                }}
                                                    defaultValue={header?.example?.header_text[0]}
                                                    placeholder={`Enter value for {{1}}`}
                                                />
                                                <div className='error'>{isBtnClicked && ValidateEmptyField(header.example.header_text[0], "Business Name").err}</div>
                                            </div>
                                        </div> :
                                        (header.format === 'IMAGE' || header.format === 'VIDEO' || header.format === 'DOCUMENT') &&
                                        // <FileUploader
                                        //     classes="upload_area"
                                        //     handleChange={handleChange}
                                        //     types={header.format === 'IMAGE' ? ['jpg', 'png'] : fileTypes}
                                        //     multiple={false}
                                        // // onDrop={() => { }}
                                        // />
                                        <div>
                                            <Button component="label" color="primary" style={{ padding: 3, color: '#075E54', backgroundColor: '#FFF', outlineWidth: 0, border: '1px solid #075E54', textTransform: 'none' }}>
                                                {
                                                    <input hidden accept={header.format === 'IMAGE' ? "image/*" : header.format === 'VIDEO' ? "video/mp4" : header.format === 'DOCUMENT' ? "application/pdf" : "/*"} type="file" onChange={handleChange} />
                                                }
                                                <Image style={{ fontSize: 18, marginRight: 5 }} /> Choose jpg or png file
                                            </Button>
                                            {/* <img style={{ height: 50, width: 50 }} src={file} alt={'Image preview'} /> */}
                                        </div>
                                }
                                {
                                    Object.keys(variables).length > 0 &&
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'start' }}>Body</div>
                                        {
                                            Object.keys(variables).map((key: any, index: number) =>
                                                <div className="field-wrapper" style={{ marginLeft: 0, marginBottom: 10 }}>
                                                    <input type="text" onChange={(e) => {
                                                        // setBody({ ...body, example: { ...body.example, body_text: [[]] } })
                                                        setVariables({ ...variables, [key]: e.target.value })
                                                    }}
                                                        defaultValue={variables[key]}
                                                        placeholder={`Enter value for {{${key}}}`}
                                                    />
                                                    {/* <div className="field-placeholder">Business Name<Asterisk /></div> */}
                                                    {/* <div className='error'>{isBtnClick && ValidateEmptyField(userDetails.businessName, "Business Name").err}</div> */}
                                                </div>
                                            )
                                        }
                                    </div>
                                }
                                {
                                    urlType === 'Dynamic' &&
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'start' }}>URL</div>
                                        <div className="field-wrapper" style={{ marginLeft: 0, marginBottom: 10 }}>
                                            <input type="text" onChange={(e) => {
                                                // setHeader({ ...header, example: { ...header.example, header_text: [e.target.value] } })
                                                let arr = buttons.buttons;
                                                const index = arr.map(function (e: any) { return e.type; }).indexOf('URL');
                                                arr[index] = { ...arr[index], example: [e.target.value] }
                                                setButtons({ ...buttons, buttons: [...arr] })
                                            }}
                                                defaultValue={header?.example?.header_text[0]}
                                                placeholder={`Enter sample url...`}
                                            />
                                            <div className='error'>{isBtnClicked && ValidateEmptyField(header.example.header_text[0], "Business Name").err}</div>
                                        </div>
                                    </div>

                                }

                            </div>
                        </div>}
                    positiveBtnLabel={"Add"}
                    negativeBtnLabel={'Cancel'}
                />

            </div>
        </Scrollbars>
    )
}
