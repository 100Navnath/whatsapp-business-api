import React, { useState } from 'react'
import Asterisk from '../../../../components/Asterisk';
import { ValidateEmptyField } from '../../../../components/validators';
import Radio from '@mui/material/Radio';
import Autocomplete from '@mui/material/Autocomplete';
import { Box, Button, TextField, withStyles } from '@material-ui/core'
import language from '../../../../assets/dropdownData/language';
import Scrollbars from 'react-custom-scrollbars'

interface Step1Props {
    template: any
    setTemplate: (prop: any) => void
    nextStep?: any
}

export default function Step1({ template, setTemplate, nextStep }: Step1Props) {

    const [isBtnClicked, setIsBtnClicked] = useState(false);
    const { innerWidth: width, innerHeight: height } = window;

    const CssTextField = withStyles({
        root: {
            '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                    borderColor: '#075E54',
                },
            },
        },
    })(TextField);

    const categories = [
        {
            title: 'Transactional',
            description: 'Send account updates, order updates, alerts and more to share important information.',
            value: 'TRANSACTIONAL'
        },
        {
            title: 'Marketing',
            description: 'Send promotional offers, product announcements and more to increase awareness and engagement.',
            value: 'MARKETING'
        },
        {
            title: 'One-time passwords',
            description: 'Send codes that allow your customers to access their accounts.',
            value: 'OTP'
        }
    ]

    function validateData() {
        setIsBtnClicked(true)
        if (
            !ValidateEmptyField(template.name).isError &&
            !ValidateEmptyField(template.category).isError &&
            !ValidateEmptyField(template.language).isError
        ) {
            nextStep && nextStep();
            setIsBtnClicked(false)
        }
    }

    return (
        <Scrollbars style={{ height: height - 70 }}>
            <div style={{ padding: 10 }}>
                <div className='category-container'>
                    <div className='title'>Name<span style={{ fontWeight: 'normal' }}><Asterisk /></span></div>
                    <div className="field-wrapper" style={{ width: '100%', marginLeft: 0, marginTop: 5 }}>
                        <div className="field-placeholder">Template Name</div>
                        <input name='template_name' type="text" autoFocus={true} value={template.name} maxLength={60}
                            onChange={(event) => {
                                if (/^(?:[A-Za-z_ ]+|\d+)$/.test(event.target.value) || event.target.value === "") {
                                    setTemplate({ ...template, name: event.target.value.split(' ').join('_').toLowerCase() })
                                }
                            }}
                            disabled={false}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <div className='error'>{isBtnClicked && ValidateEmptyField(template.name, "Template name").err}</div>
                            <div style={{ fontSize: 11 }}>{template.name.length}/60</div>
                        </div>
                    </div>
                </div>

                <div className='category-container'>
                    <div className='title'>Category<span style={{ fontWeight: 'normal' }}><Asterisk /></span></div>
                    {
                        categories.map((c: any) =>
                            <div className='category'>
                                <Radio
                                    className='radio-btn'
                                    checked={template.category === c.value}
                                    onChange={(e) => setTemplate({ ...template, category: c.value })}
                                    value="a"
                                    name="radio-button-demo"
                                    inputProps={{ 'aria-label': 'A' }}
                                />
                                <span onClick={() => setTemplate({ ...template, category: c.value })} className='category-title'>{c.title}<br />
                                    <span className='category-description'>{c.description}</span>
                                </span>
                            </div>
                        )
                    }
                    <div className='error'>{isBtnClicked && ValidateEmptyField(template.category, "Category").err}</div>
                </div>

                <div className='category-container'>
                    <div className='title'>Language<span style={{ fontWeight: 'normal' }}><Asterisk /></span></div>
                    <Autocomplete
                        options={language}
                        defaultValue={language.filter((l: any) => l.value === template.language)[0]}
                        disablePortal
                        id="combo-box-demo"
                        sx={{ width: '100%' }}
                        renderInput={(params) =>
                            <CssTextField {...params}
                                variant="outlined"
                                inputProps={{
                                    ...params.inputProps,
                                    style: { padding: 0, fontSize: 12 }
                                }} />
                        }
                        onChange={(e: any, value) => { setTemplate({ ...template, language: value?.value }) }}
                    />
                    <div className='error'>{isBtnClicked && ValidateEmptyField(template.language, "Language").err}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                    <Button className='next-btn' onClick={validateData}>
                        Next
                    </Button>
                </div>
            </div>
        </Scrollbars>
    )
}
