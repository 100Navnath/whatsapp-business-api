import { Button } from '@material-ui/core';
import { FileDownloadOutlined, FileUpload, UploadOutlined } from '@mui/icons-material';
import React, { useState, useRef, useEffect } from 'react'
import { AnimatedList } from 'react-animated-list';
import Scrollbars from 'react-custom-scrollbars';
import agents from '../../../assets/jsons/agents.json';
import UploadCSV from './uploadCSV'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material';
// import errorCodes from '../../../assets/jsons/errorCodes.json';
import ContactInfo from '../ContactsInfo/contactInfo';
import { API } from '../../../constant/network';
import { apiList } from '../../../constant/apiList';
import Spinner from '../../../components/Loading/spinner';
import Grid from '../../../components/Grid/Grid';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { getFromLocalStorage } from '../../../components/LocalStorage/localStorage';
import Toast from '../../../components/Toast/Toast';

export default function Contacts(props: any) {
    const [skippedRecords, setSkippedRecords] = useState<Array<any>>(Array);
    const [isHeadersMapped, setIsHeadersMapped] = useState(false);
    const [thirdTab, setThirdTab] = useState(props.thirdTab);
    const [errorCodes, setErrorCodes] = useState<Array<any>>([]);
    const [errorCodesLoading, setErrorCodesLoading] = useState(false);
    const [csvCount, setCsvCount] = useState<any>({
        "totalValidCount": 0,
        "totalInvalidCount": 0,
    });
    useEffect(() => {
        setThirdTab(props.thirdTab);
    }, [props.thirdTab])

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

    function _setSkippedRecords(records: any) {
        setSkippedRecords(records);
    }

    function _setCsvCount(c: Object) {
        setCsvCount(c);
    }

    function _setIsHeadersMapped(prop: any) {
        setIsHeadersMapped(prop);
    }

    function _upload(params: any) {
        setIsHeadersMapped(false);
    }

    function getErrorCodes() {
        try {
            setErrorCodesLoading(true)
            API.get(`${process.env.REACT_APP_BASE_API}${apiList.errorCodes}`, {}, {})?.subscribe({
                next(res: any) {
                    setErrorCodesLoading(false);
                    if (res.status === 200) setErrorCodes(res.data)
                },
                error(err) {
                    setErrorCodesLoading(false);
                },
            });
        } catch (error: any) {
            setErrorCodesLoading(false);
            Toast({ message: error, type: 'error' })
        }
    }

    function downloadSkippedRecords() {
        try {
            const user = getFromLocalStorage("user")
            // API.get(`${process.env.REACT_APP_BASE_API}${apiList.downloadSkipperRecords}`, {}, { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Accept": "*/*" })?.subscribe({
            //     next(res: any) {
            //         if (res.status === 200) {
            //             const url = window.URL.createObjectURL(new Blob([res.data]));
            //             const link = document.createElement('a');
            //             link.href = url;
            //             link.setAttribute('download', `${Date.now()}.xlsx`);
            //             document.body.appendChild(link);
            //             link.click();
            //         }
            //     },
            //     error(err) {
            //         console.log(err);
            //         alert(err);
            //     },
            // });
            axios.get(`${process.env.REACT_APP_BASE_API}${apiList.downloadSkipperRecords}?userId=${user.currentuserId}&businessId=${user.businessId}`,
                {
                    headers: {
                        'Content-Disposition': "attachment; filename=template.xlsx",
                        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    },
                    responseType: 'arraybuffer',
                }
            ).then((response: any) => {
                console.log(response);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'BulkUploadError.xlsx');
                document.body.appendChild(link);
                link.click();
            })
                .catch((error: any) => console.log(error));
        } catch (error: any) {
            Toast({ message: error, type: 'error' })
        }
    }

    useEffect(() => {
        getErrorCodes();
    }, []);


    return (
        <div style={{ overflowY: 'clip', backgroundColor: '#f5f8fd' }}>
            {
                thirdTab === "contactInfo" &&
                <ContactInfo clickedContactId={props.clickedContactId} setContactListAction={props.setContactListAction}
                    setThirdTab={(i: any) => setThirdTab(i)} setChatListAction={props.setChatListAction} />
            }
            {
                !isHeadersMapped && thirdTab === "uploadCSV" &&
                <UploadCSV _setIsHeadersMapped={_setIsHeadersMapped} _setSkippedRecords={_setSkippedRecords} setContactListAction={props.setContactListAction}
                    setCsvCount={_setCsvCount}
                />
            }
            {
                isHeadersMapped && thirdTab === "uploadCSV" &&
                <div>
                    <div style={{ color: '#074e34', fontWeight: 'bold', fontSize: 20, padding: 20 }}>Skipped Records</div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 20, marginBottom: 10 }}>
                        <GridTooltip title="Upload" placement="bottom"><Button variant='contained' style={{ height: 30, marginRight: 10, backgroundColor: '#074e34', color: '#FFF' }} onClick={_upload}><FileUpload fontSize='small' /></Button></GridTooltip>
                        <GridTooltip title="Download" placement="bottom"><Button variant='contained' style={{ height: 30, color: '#FFF', backgroundColor: '#074e34' }} onClick={downloadSkippedRecords}><FileDownloadOutlined /></Button></GridTooltip>
                    </div>
                    <div style={{ marginLeft: 15, fontSize: 13, color: '#42b0a3' }}>
                        <b>{csvCount.totalValidCount}</b> {csvCount.totalValidCount > 1 ? 'Contacts' : 'Contact'} Uploaded Successfully
                    </div>
                    <div style={{ marginLeft: 15, fontSize: 13, color: '#fe5044' }}>
                        <b>{csvCount.totalInvalidCount}</b> {csvCount.totalInvalidCount > 1 ? 'Contacts' : 'Contact'} skipped
                    </div>
                    <Grid
                        data={skippedRecords}
                        columns={[
                            { header: 'Name', value: (i) => <span>{i.firstName} {i.lastName}</span>, width: 150 },
                            { header: 'Contact', propertyName: "phoneNo", value: (i) => <span>{i.phoneNo ? `${i.countryCode.charAt(0) !== '+' && '+'}${i.countryCode} ${i.phoneNo}` : 'NA'}</span> },
                            { header: 'Email', value: (i) => <span>{i.email.length > 20 ? `${i.email.substring(0, 20)}...` : i.email}</span>, width: 180 },
                            { header: 'Secondary Contact', value: (i) => <span>{i.secondaryPhoneNo ? `${i.countryCode.charAt(0) !== '+' && '+'}${i.countryCode} ${i.secondaryPhoneNo}` : 'NA'}</span>, width: 150 },
                            { header: 'Gender', value: 'gender' },
                            { header: 'D.O.B.', value: 'dob' },
                            { header: 'Error code', value: (i) => <span style={{ color: '#fe5044' }}>{i.csvValidationErrors.map((e: any, index: number) => `${e && e.validationErrorCode}${(index + 1) === i.csvValidationErrors.length ? '' : ', '}`)}</span> },
                        ]}
                        rowsAtATime={5}
                        isActions={false}
                        footer={false}
                        columnSearch={false}
                        globalSearch={false}
                    />
                    {/* <Scrollbars style={{ height: 300 }}>
                        <div className='grid' style={{ border: "0px", marginTop: 0 }}>
                            <div className='grid-header'>
                                <div className='header-text' style={{ width: 100 }}>Name</div>
                                <div className='header-text' style={{ width: 100 }}>Contact</div>
                                <div className='header-text' style={{ width: 100 }}>Secondary Contact</div>
                                <div className='header-text'>Email</div>
                                <div className='header-text' style={{ width: 80 }}>Error</div>
                            </div>
                            <AnimatedList animation={"zoom"} >
                                {skippedRecords.map(customer => <div className='number row'>
                                    <div className='grid-row' style={{ width: 100 }}>{customer.firstName} {customer.lastName}</div>
                                    <div className='grid-row' style={{ width: 100 }}>{customer.phoneNo}</div>
                                    <div className='grid-row' style={{ width: 100 }}>{customer.secondaryPhoneNo}</div>
                                    <div className='grid-row'>{customer.email}</div>
                                    <div className='grid-row' style={{ width: 80, color: 'red' }}>{customer.csvValidationErrors.map((e: any, index: number) => `${e.validationErrorCode}${(index + 1) === customer.csvValidationErrors.length ? '' : ', '}`)}</div>
                                </div>)}
                            </AnimatedList>
                        </div>
                    </Scrollbars> */}
                    {
                        errorCodes.length > 0 && !errorCodesLoading &&
                        <div style={{ margin: 20, width: 'fit-content' }}>
                            <div style={{ color: '#074e34', fontSize: 16, marginTop: 15 }}>Error Codes</div>
                            {
                                errorCodesLoading ? <Spinner color='#074e34' /> :
                                    <div style={{ border: "1px solid #acacac", borderBottom: '0px', borderRadius: 5 }}>
                                        {
                                            errorCodes.map(i =>
                                                <div style={{ display: 'flex', fontSize: 13, color: '#666', borderBottom: '1px solid #acacac', }}>
                                                    <span style={{ width: 50, padding: 3, justifyContent: 'center', display: 'flex', alignItems: 'center', borderRight: '1px solid #acacac', color: 'red' }}>{i.validationErrorCode}</span>
                                                    <div style={{ width: 'fit-content', padding: 3, marginLeft: 10, display: 'flex', flexWrap: 'wrap' }}>{i.validationErrorMessage}</div>
                                                </div>)
                                        }
                                    </div>
                            }
                        </div>
                    }
                </div>
            }
        </div >
    )
}
