import { useState, useEffect } from 'react'
import { AnimatedList } from 'react-animated-list';
import './upload-csv.css';
import { FileUploader } from "react-drag-drop-files";
import agents from '../../../assets/jsons/agents.json'
import mapHeaders from '../../../assets/jsons/contacts/uploadCSV/mapHeaders.json'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material';
import { Circle, FileDownload } from '@mui/icons-material';
import { Button } from '@material-ui/core';
import Dropdown from '../../../components/Dropdown';
import { apiList } from '../../../constant/apiList';
import Spinner from '../../../components/Loading/spinner';
import { LoadingButton } from '@mui/lab';
import { ValidateEmptyField } from '../../../components/validators';
import ErrorMessages from '../../../components/ErrorMessages';
import { API } from '../../../constant/network';
import { getFromLocalStorage } from '../../../components/LocalStorage/localStorage';
import { toast } from 'react-toastify';
import Toast from '../../../components/Toast/Toast';
import Asterisk from '../../../components/Asterisk';
import Dropdown2 from '../../../components/Dropdown2/Dropdown2';

export default function UploadCSV(props: any) {
    const { innerWidth: width, innerHeight: height } = window;
    const [file, setFile] = useState<any>(null);
    const [uploaded, setUploaded] = useState(false);
    const [excelHeaders, setExcelHeaders] = useState(Array);
    const [mappedHeaders, setMappedHeaders] = useState(Object)
    const fileTypes = [
        "CSV",
        // "XLSX"
    ];
    const [loading, setLoading] = useState(false);
    const [mapHeaderLoading, setMapHeaderLoading] = useState(false);
    const [isBtnClick, setIsBtnClick] = useState(false);
    const [userDetails, setUserDetails] = useState(Object)
    const notify = (msg: String) => toast(msg)

    function validateHeaders() {
        setIsBtnClick(true)
        console.log("mappedHeaders : ", mappedHeaders);
        if (
            !ValidateEmptyField(mappedHeaders.firstName).isError &&
            !ValidateEmptyField(mappedHeaders.lastName).isError &&
            // !ValidateEmptyField(mappedHeaders.email).isError &&
            !ValidateEmptyField(mappedHeaders.phoneNo).isError
            // !ValidateEmptyField(mappedHeaders.secondaryPhoneNo).isError
        ) postHeaders()
    }

    function resetHeaders() {
        setMappedHeaders({
            firstName: { headerName: "" },
            lastName: { headerName: "" },
            countryCode: { headerName: "" },
            phoneNo: { headerName: "" },
            email: { headerName: "" },
            secondaryPhoneNo: { headerName: "" },
        });
    }

    function onCancel() {
        resetHeaders()
        setUploaded(false)
    }

    function postHeaders() {
        try {
            setLoading(true);
            setMapHeaderLoading(true);
            let mappedH = [
                mappedHeaders.firstName,
                mappedHeaders.lastName,
                mappedHeaders.phoneNo,
                mappedHeaders.countryCode
            ]
            if (mappedHeaders.secondaryPhoneNo) mappedH.push(mappedHeaders.secondaryPhoneNo)
            if (mappedHeaders.dob) mappedH.push(mappedHeaders.dob)
            if (mappedHeaders.gender) mappedH.push(mappedHeaders.gender)
            if (mappedHeaders.email) mappedH.push(mappedHeaders.email)
            const body = {
                "userId": userDetails.currentuserId,
                "userName": `${userDetails.firstName} ${userDetails.lastName}`,
                "businessId": userDetails.businessId,
                "file_name": file.name,
                "csvColumns": mappedH,
            }
            API.post(`${process.env.REACT_APP_BASE_API}${apiList.postMappedHeaders}`, body, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        setLoading(false)
                        setMapHeaderLoading(false);
                        resetHeaders()
                        props.setContactListAction({ action: 'reload' })
                        props.setCsvCount({
                            "totalValidCount": res.data.totalValidCount,
                            "totalInvalidCount": res.data.totalInvalidCount,
                        })
                        if (res.data.skipContacts && res.data.skipContacts.length > 0) {
                            props._setIsHeadersMapped(true)
                            props._setSkippedRecords(res.data.skipContacts);
                        } else {
                            Toast({ message: `${res.data.totalValidCount} Contacts uploaded successfully`, type: 'success' })
                            setUploaded(false);
                        }
                    }
                }, error() {
                    setLoading(false)
                    setMapHeaderLoading(false);
                }
            });
        } catch (error: any) {
            setLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }

    const handleChange = async (file: any) => {
        try {
            setFile(file);
            // getHeaders()
            const user = await getFromLocalStorage("user");
            if (user) setUserDetails(user)
            var bodyFormData = new FormData();
            bodyFormData.append('file', file);
            API.post(`${process.env.REACT_APP_BASE_API}${apiList.uploadCSV}?userId=${user.currentuserId}`, bodyFormData, {})?.subscribe({
                next(res: any) {
                    if (res.status === 200) {
                        console.log("res of upload csv : ", res);
                        // const headersFromBackend = [
                        //     {
                        //         "headerId": 0,
                        //         "headerName": "FirstName"
                        //     },
                        //     {
                        //         "headerId": 1,
                        //         "headerName": "LastName"
                        //     },
                        //     {
                        //         "headerId": 2,
                        //         "headerName": "Email"
                        //     },
                        //     {
                        //         "headerId": 3,
                        //         "headerName": "Contact No."
                        //     },
                        //     {
                        //         "headerId": 4,
                        //         "headerName": "Secondary contact no."
                        //     }
                        // ]
                        // const headersFromBackend = res.data;
                        setExcelHeaders(res.data);
                        // for (let i = 0; i < headersFromBackend.length; i++) {
                        //     excelHeaders.push({ label: headersFromBackend[i].headerName, value: headersFromBackend[i].headerId })
                        // }
                        setUploaded(true);
                    }
                }
            });
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    };

    function downloadSampleCSV() {
        var csv = 'FirstName,LastName,CountryCode,PhoneNo,SecondaryPhoneNo,Email,Gender,DOB(MM/DD/YYYY)';
        csv += "\n";

        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'Contact_ Bulk_Upload_Template.csv';
        hiddenElement.click();
    }
    useEffect(() => {
        console.log("mappedHeaders : ", mappedHeaders);
    }, [mappedHeaders])

    function addToDropdown(e: any) {
        if (e) {
            console.log("e : ", e);
            const obj = { headerId: e.columnPosition, headerName: e.headerName }
            excelHeaders.push(obj)
        }
    }

    function removeFromDropdown(e: any) {
        setExcelHeaders(excelHeaders.filter((val: any) => val.headerId !== e.headerId))
    }


    function onSelectOption(fieldName: any, selectedOption: any) {
        console.log("selectedOption : ", selectedOption);

        if (selectedOption.headerId === "") {
            addToDropdown(mappedHeaders[`${fieldName}`]);
            setMappedHeaders({ ...mappedHeaders, [`${fieldName}`]: undefined })
        }
        else {
            if (mappedHeaders[`${fieldName}`]) addToDropdown(mappedHeaders[`${fieldName}`])
            setMappedHeaders({ ...mappedHeaders, [`${fieldName}`]: { columnPosition: selectedOption.headerId, fieldName, headerName: selectedOption.headerName } })
            removeFromDropdown(selectedOption)
        }
    }

    const options = [
        {
            "headerId": 0,
            "headerName": "FirstName"
        },
        {
            "headerId": 1,
            "headerName": "LastName"
        },
        {
            "headerId": 2,
            "headerName": "CountryCode"
        },
        {
            "headerId": 3,
            "headerName": "PhoneNo"
        },
        {
            "headerId": 4,
            "headerName": "SecondaryPhoneNo"
        },
        {
            "headerId": 5,
            "headerName": "Email"
        }
    ]

    return (
        <div className='add-contact-wrapper' style={{ height: height - 20, overflowY: 'clip' }}>
            {
                !uploaded ?
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div className='upload-csv-title'>Upload CSV</div>
                            <div className="chat-actions">
                                <Button variant="contained" style={{ fontSize: 10, backgroundColor: '#074e34', color: "#fff" }} onClick={downloadSampleCSV}>
                                    Download Sample CSV <FileDownload fontSize='small' style={{ fontSize: 12, color: "#FFF" }} />
                                </Button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', height: height - 200, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
                            <FileUploader
                                classes="upload_area"
                                handleChange={handleChange}
                                types={fileTypes}
                                multiple={false}
                            // onDrop={() => { }}
                            />
                            <div style={{ width: '100%' }}>
                                <div style={{ fontSize: 16, color: '#666', marginTop: 20 }}>Instructions</div>
                                <div style={{ fontSize: 12, color: '#666', marginTop: 10 }}><Circle style={{ fontSize: 6, marginRight: 5 }} />Click above button and upload csv file.</div>
                                <div style={{ fontSize: 12, color: '#666', marginTop: 10 }}><Circle style={{ fontSize: 6, marginRight: 5 }} />Select header for respective field.</div>
                                <div style={{ fontSize: 12, color: '#666', marginTop: 10 }}><Circle style={{ fontSize: 6, marginRight: 5 }} />On submitting headers your contacts will be added.You will get an option to download csv with incorrect data of contacts.You can download it and make corrections and upload again</div>
                            </div>
                        </div>
                    </div>
                    :
                    <>{
                        <>
                            <div style={{ color: '#074e34', fontWeight: 'bold', fontSize: 20 }}>Map Columns</div>
                            <div className='map-headers-wrapper'>

                                <div className='input-container'>
                                    <div className='input-title'>First Name<Asterisk /></div>
                                    <Dropdown
                                        options={excelHeaders}
                                        defaultValue={mappedHeaders.firstName}
                                        onChange={(e: any) => onSelectOption("firstName", e)}
                                        disabled={loading}
                                        autoFocus={true}
                                        err={isBtnClick && ValidateEmptyField(mappedHeaders.firstName).isError && ErrorMessages.dropdown}
                                        valuePropertyName="headerId"
                                        labelPropertyName="headerName"
                                    />
                                </div>

                                <div className='input-container'>
                                    <div className='input-title' style={{ width: 120 }}>Last Name<Asterisk /></div>
                                    <Dropdown
                                        options={excelHeaders}
                                        defaultValue={mappedHeaders.lastName}
                                        onChange={(e: any) => onSelectOption("lastName", e)}
                                        autoFocus={false}
                                        disabled={loading}
                                        err={isBtnClick && ValidateEmptyField(mappedHeaders.lastName).isError && ErrorMessages.dropdown}
                                        valuePropertyName="headerId"
                                        labelPropertyName="headerName"
                                    />
                                </div>
                                <div className='input-container'>
                                    <div className='input-title'>Country Code<Asterisk /></div>
                                    <Dropdown
                                        options={excelHeaders}
                                        defaultValue={mappedHeaders.countryCode}
                                        onChange={(e: any) => onSelectOption("countryCode", e)}
                                        err={isBtnClick && ValidateEmptyField(mappedHeaders.countryCode).isError && ErrorMessages.dropdown}
                                        valuePropertyName="headerId"
                                        labelPropertyName="headerName"
                                        disabled={loading}
                                    />
                                </div>
                                <div className='input-container'>
                                    <div className='input-title'>Contact<Asterisk /></div>
                                    <Dropdown
                                        options={excelHeaders}
                                        defaultValue={mappedHeaders.phoneNo}
                                        onChange={(e: any) => onSelectOption("phoneNo", e)}
                                        err={isBtnClick && ValidateEmptyField(mappedHeaders.phoneNo).isError && ErrorMessages.dropdown}
                                        valuePropertyName="headerId"
                                        disabled={loading}
                                        labelPropertyName="headerName"
                                    />
                                </div>
                                <div className='input-container'>
                                    <div className='input-title'>Email</div>
                                    <Dropdown
                                        options={excelHeaders}
                                        defaultValue={mappedHeaders.email}
                                        onChange={(e: any) => onSelectOption("email", e)}
                                        // err={isBtnClick && ValidateEmptyField(mappedHeaders.email).isError && ErrorMessages.dropdown}
                                        valuePropertyName="headerId"
                                        labelPropertyName="headerName"
                                        disabled={loading}
                                    />
                                </div>
                                <div className='input-container'>
                                    <div className='input-title' style={{ width: 120 }}>Secondary Contact</div>
                                    <Dropdown
                                        options={excelHeaders}
                                        defaultValue={mappedHeaders.secondaryPhoneNo}
                                        onChange={(e: any) => onSelectOption("secondaryPhoneNo", e)}
                                        // err={isBtnClick && ValidateEmptyField(mappedHeaders.secondaryPhoneNo).isError && ErrorMessages.dropdown}
                                        valuePropertyName="headerId"
                                        labelPropertyName="headerName"
                                        disabled={loading}
                                    />
                                </div>
                                <div className='input-container'>
                                    <div className='input-title' style={{ width: 120 }}>Gender</div>
                                    <Dropdown
                                        options={excelHeaders}
                                        defaultValue={mappedHeaders.gender}
                                        onChange={(e: any) => onSelectOption("gender", e)}
                                        valuePropertyName="headerId"
                                        labelPropertyName="headerName"
                                        disabled={loading}
                                    />
                                </div>
                                <div className='input-container'>
                                    <div className='input-title' style={{ width: 120 }}>Date of birth</div>
                                    <Dropdown
                                        options={excelHeaders}
                                        defaultValue={mappedHeaders.dob}
                                        onChange={(e: any) => onSelectOption("dob", e)}
                                        valuePropertyName="headerId"
                                        labelPropertyName="headerName"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className='btn-container'>
                                <LoadingButton
                                    className='dialog-btn-cancel'
                                    variant="contained"
                                    size='small'
                                    loadingIndicator={<Spinner />}
                                    onClick={onCancel}
                                    style={{ backgroundColor: "#fe5044", marginRight: 10, fontSize: 12 }}
                                >
                                    Cancel
                                </LoadingButton>
                                <LoadingButton
                                    className='dialog-btn-positive'
                                    loading={mapHeaderLoading}
                                    variant="contained"
                                    size='small'
                                    loadingIndicator={<Spinner />}
                                    onClick={validateHeaders}
                                >
                                    {!mapHeaderLoading && "Submit"}
                                </LoadingButton>
                            </div>
                        </>
                    }
                    </>
            }
        </div >
    )
}
