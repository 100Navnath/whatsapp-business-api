import React, { useState, useEffect } from 'react'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material';
import './segmentInfo.css'
import { DeleteOutline, EditOutlined } from '@material-ui/icons';
import { Button } from '@material-ui/core';
import { apiList } from '../../constant/apiList';
import { API } from '../../constant/network';
import Toast from '../../components/Toast/Toast';
import { getFromLocalStorage } from '../../components/LocalStorage/localStorage';
import { useNavigate } from 'react-router-dom';
import Grid from '../../components/Grid/Grid';
import ChatForm from '../Chat/ChatForm';
import Dialog from '../../components/Dialog/Dialog';
import { ValidateEmptyField } from '../../components/validators';
import contactListOfSegment from '../../assets/jsons/Segments/segmentContacts.json'
import Scrollbars from 'react-custom-scrollbars'
import moment from 'moment';
import DialogBox from '../../components/Dialog/Dialog';
import InfiniteScroll2 from 'react-infinite-scroller';
import Template from '../../components/Template/Template';
import Spinner from '../../components/Loading/spinner';

interface SegmentInfoProps {
  thirdTab: string
  clickedSegment?: any
  setSegmentListAction: (action: any) => void
}

export default function SegmentInfo({ thirdTab, clickedSegment, setSegmentListAction }: SegmentInfoProps) {
  const GridTooltip = styled(({ className, ...props }: any) => (
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
  const navigate = useNavigate();
  const { innerHeight: height, innerWidth: width } = window;

  const [segmentInfo, setSegmentInfo] = useState(clickedSegment)
  const [contacts, setContacts] = useState(Array)
  const [page, setPage] = useState(1);
  const [contactsListLoading, setContactsListLoading] = useState(false)
  const [sendMessageLoading, setSendMessageLoading] = useState(false)
  const [editSegmentDialog, setEditSegmentDialog] = useState(false);
  const [deleteSegmentDialog, setDeleteSegmentDialog] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState("")
  const [isDialogBtnClicked, setIsDialogBtnClicked] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false)
  const [message, setMessage] = useState({ text: "" })
  const [addRemoveDialog, setAddRemoveDialog] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Array<any>>([])
  const [dialogGridTotalCount, setDialogGridTotalCount] = useState(0)
  const [dialogGridPage, setDialogGridPage] = useState(1);
  const [contactsWithSegContacts, setContactsWithSegContacts] = useState<Array<any>>([])
  const [dialogGridLoading, setDialogGridLoading] = useState(false)
  const [search, setSearch] = useState<Object>({});
  const [selectTemplateDialog, setSelectTemplateDialog] = useState(false)
  const [templateListLoading, setTemplateListLoading] = useState(false)
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(-1);
  const [templates, setTemplates] = useState<Array<any>>([]);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [templatePage, setTemplatePage] = useState(1)

  useEffect(() => {
    if (!(clickedSegment && clickedSegment.id)) {
      const arrayOfUrl = window.location.href.split('/');
      setSegmentInfo({ id: arrayOfUrl[arrayOfUrl.length - 1] });
      getContacts(10, 0, "")
    }
  }, [])

  useEffect(() => {
    console.log(search);
  }, [search])


  useEffect(() => {
    if (clickedSegment && clickedSegment.id) {
      setSegmentInfo(clickedSegment);
      getContacts(10, 0, "")
      setSearch({ name: "", phoneNo: "", countryCode: "", secondaryPhoneNo: "", email: "", gender: "" });
    }
  }, [clickedSegment && clickedSegment.id])

  async function getContacts(take: number, skip: number, searchValue: string) {
    try {
      setContactsListLoading(true)
      const arrayOfUrl = window.location.href.split('/');
      const body = {
        id: arrayOfUrl[arrayOfUrl.length - 1],
        skipIn: skip,
        takeIn: take
      }
      API.get(`${process.env.REACT_APP_BASE_API}${apiList.getContactsOfSegments}`, body, {})?.subscribe({
        next(res: any) {
          if (res.status === 200) {
            // setTimeout(() => {
            //   const res = {
            //     data: contactListOfSegment
            //   }
            setContactsListLoading(false)
            setContacts(res.data.contacts);
            setSegmentInfo({ ...segmentInfo, name: res.data.name, contactsCount: res.data.count });
            setNewSegmentName(res.data.name);
            setPage(page + 1)
            // }, 2000);
          }
        },
        error(error: any) {
          setContactsListLoading(false)
        }
      });
    } catch (error: any) {
      Toast({ message: error, type: 'error' })
    }
  }

  async function sendMessage({ smsFrom = '' }: { smsFrom?: string }) {
    try {
      const userDetails = await getFromLocalStorage("user");
      if (!userDetails) navigate("/")
      if (message.text) {
        const user = await getFromLocalStorage('user');
        if (!user) navigate('/')
        setSendMessageLoading(true)
        const arrayOfUrl = window.location.href.split('/');
        const body = {
          "id": arrayOfUrl[arrayOfUrl.length - 1],                      // Segment id
          "smsText": message.text,
          "smsStatus": "Pending",
          "smsType": "send",
          "smsFrom": smsFrom
        }
        console.log("bulk sms body : ", body);

        API.post(`${process.env.REACT_APP_BASE_API}${apiList.sendMessageToSegment} `, body, {})?.subscribe({
          next(res: any) {
            if (res.status === 200 || res.status === 201) {
              setSendMessageLoading(false);
              Toast({ message: 'Message sent successfully', type: 'success' });
              setMessage({ text: "" })
            }
          },
          error(err) {
            setSendMessageLoading(false)
          },
        });
      } else Toast({ message: "Message field cannot be empty", type: 'warning' })
    } catch (error: any) {
      setSendMessageLoading(false)
      Toast({ message: error, type: 'error' })
    }
  }

  function onEditDialogClose() {
    setEditSegmentDialog(false)
    setNewSegmentName(`${segmentInfo.name}`)
    setIsDialogBtnClicked(false)
    setDialogLoading(false);
  }

  function onEditDialogConfirm() {
    setIsDialogBtnClicked(true)
    if (!ValidateEmptyField(newSegmentName).isError) {
      setDialogLoading(true);
      const arrayOfUrl = window.location.href.split('/');
      console.log("Edit segment", clickedSegment, segmentInfo);
      const body = {
        id: arrayOfUrl[arrayOfUrl.length - 1],
        segmentName: newSegmentName
      }
      API.put(`${process.env.REACT_APP_BASE_API}${apiList.updateSegmentName}`, body, {})?.subscribe({
        next(res: any) {
          if (res && res.status === 200) {
            // setTimeout(() => {
            setEditSegmentDialog(false);
            Toast({ message: "Segment name updated successfully", type: 'success' })
            setSegmentInfo({ ...segmentInfo, name: newSegmentName })
            setDeleteSegmentDialog(false);
            setDialogLoading(false);
            setSegmentListAction({ action: "edit", data: { id: body.id, name: newSegmentName } })
            // }, 2000);
          }
        },
        error(err) {
          setDialogLoading(false);
        },
      });
    }
  }

  function onDeleteDialogClose() {
    setDeleteSegmentDialog(false)
  }

  function onDeleteDialogConfirm() {
    try {
      setDialogLoading(true)
      const arrayOfUrl = window.location.href.split('/');
      const id = arrayOfUrl[arrayOfUrl.length - 1]
      API.deleteApi(`${process.env.REACT_APP_BASE_API}${apiList.deleteSegment}/${id}`, {}, {})?.subscribe({
        next(res: any) {
          if (res && res.status === 200) {
            // setTimeout(() => {
            Toast({ message: "Segment deleted successfully", type: 'success' })
            setDeleteSegmentDialog(false);
            setDialogLoading(false);
            setSegmentListAction({ action: "delete", data: { id: id } })
            // }, 2000);
          }
        },
        error(err) {
          setDialogLoading(false);
        },
      });
    } catch (error) {
      setDialogLoading(false);
    }
  }

  async function getContactsWithAddedContacts(take = 10, skip = 0, searchValue: any = {}) {
    try {
      setDialogGridLoading(true)
      const arrayOfUrl = window.location.href.split('/');
      const userDetails = await getFromLocalStorage("user");
      if (!userDetails) {
        navigate("/");
        throw new Error("Log in required!!!");
      }

      let columnSearchObj: any = searchValue
      const keys = Object.keys(searchValue)
      for (let i = 0; i < keys.length; i++) {
        const key: string = keys[i]
        searchValue[key] === "" && delete columnSearchObj[key]
      }

      const body = {
        segmentId: arrayOfUrl[arrayOfUrl.length - 1],            // Segment id
        skip: skip,
        take: take,
        searchValue: Object.keys(columnSearchObj).length > 0 ? columnSearchObj : null
      }
      API.get(`${process.env.REACT_APP_BASE_API}${apiList.contactListForCreateSegment}`, body, {})?.subscribe({
        next(res: any) {
          if (res.status === 200) {
            setDialogGridLoading(false)
            setContactsWithSegContacts(res.data.contacts);
            setDialogGridTotalCount(res.data.count)
            setDialogGridPage(dialogGridPage + 1)
          }
        }
      });
    } catch (error: any) {
      Toast({ message: error, type: 'error' })
    }
  }

  function onCloseAddRemoveDialog() {
    setDialogLoading(false)
    setAddRemoveDialog(false)
  }

  function onConfirmAddRemoveDialog() {
    if (selectedRows.filter((i) => i.isAssigned === true).length > 1) {
      setDialogLoading(true)
      const arrayOfUrl = window.location.href.split('/');
      const body = {
        segmentId: arrayOfUrl[arrayOfUrl.length - 1],
        lstAddRemoveContactInSegment: selectedRows.map(({ name, phoneNo, countryCode, email, secondaryPhoneNo, ...k }) => k)
      }
      API.post(`${process.env.REACT_APP_BASE_API}${apiList.updateSegmentContacts}`, body, {})?.subscribe({
        next(res: any) {
          if (res.status === 200) {
            setDialogLoading(false);
            Toast({ message: 'Segment updated successfully', type: 'success' });
            setAddRemoveDialog(false);
            setContacts(selectedRows.filter((obj: any) => obj.isAssigned === true));
          }
        },
        error(err) {
          setDialogLoading(false);
        },
      });
    } else Toast({ message: "Segment must have atleast 2 contacts", type: 'warning' })
    console.log("selectedRows : ", selectedRows);
  }

  //Author:Navnath Phapale
  //Description : To get approved templates.
  //Parameter : Requires 1 paramenter i.e. pageNumber.
  //Created At : 20/03/2023
  function getTemplates(p = templatePage) {
    const body = {
      skipIn: (p - 1) * 10,
      takeIn: 10,
      status: "Approved"
    }
    API.get(`${process.env.REACT_APP_BASE_API}${apiList.templateList}`, body, {})?.subscribe({
      next(res: any) {
        if (res.status === 201 || res.status === 200) {
          setTemplateListLoading(false);
          setTemplatePage(p + 1)
          if (p === 1) setTemplates([...res.data.templatelist])
          else setTemplates([...templates, ...res.data.templatelist])
          setTotalTemplates(res.data.count)
        }
      },
      error(err: any) {
        setTemplateListLoading(false);
      }
    });
  }

  //Author:Navnath Phapale
  //Description : This function is to send template to contacts included in segment
  //Parameter : None
  //Created At : 20/03/2023
  async function sendTemplate() {
    try {
      const userDetails = await getFromLocalStorage("user");
      if (!userDetails) navigate("/")
      if (templates[selectedTemplateIndex]?.templateJson?.name) {
        setDialogLoading(true)
        const arrayOfUrl = window.location.href.split('/');
        const body = {
          "id": arrayOfUrl[arrayOfUrl.length - 1],                      // Segment id
          "smsStatus": "Pending",
          "smsType": "send",
          "recipientType": "individual",
          "templateName": templates[selectedTemplateIndex].templateJson.name,
          "templateLanguage": templates[selectedTemplateIndex].templateJson.language,
          whatsapptemplateId: templates[selectedTemplateIndex].whatsappTemplateId
        }

        API.post(`${process.env.REACT_APP_BASE_API}${apiList.sendTemplateToSegment} `, body, {})?.subscribe({
          next(res: any) {
            if (res.status === 200 || res.status === 201) {
              setDialogLoading(false);
              setSelectTemplateDialog(false)
              Toast({ message: 'Template sent successfully', type: 'success' });
              setSelectedTemplateIndex(-1);
            }
          },
          error(err) {
            setDialogLoading(false)
          },
        });
      } else Toast({ message: "Please select template", type: 'warning' })
    } catch (error: any) {
      setDialogLoading(false)
      setSelectedTemplateIndex(-1);
      Toast({ message: error, type: 'error' })
    }
  }

  return (
    <div className='segment-info-wrapper'>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className='page-title'>{segmentInfo && `${segmentInfo.name}`}</div>
        <div className="chat-actions">
          <GridTooltip title={"Edit Segment Name"} placement="bottom">
            <Button onClick={() => { setEditSegmentDialog(true) }} className='submit-button' variant="contained" style={{ marginRight: 10 }}>
              <EditOutlined fontSize='small' />
            </Button>
          </GridTooltip>
          <GridTooltip title={"Add or Remove contacts"} placement="bottom">
            <Button style={{ marginRight: 15 }} className='submit-button' variant="contained" onClick={() => {
              setAddRemoveDialog(true);
              getContactsWithAddedContacts();
              setSelectedRows([])
            }}>
              <b>Add / Remove Contacts</b>
            </Button>
          </GridTooltip>
          <GridTooltip title={"Delete Segment"} placement="bottom">
            <Button className='delete-button' variant="contained" onClick={() => { setDeleteSegmentDialog(true) }}>
              <DeleteOutline fontSize='small' />
            </Button>
          </GridTooltip>
        </div>
      </div>
      <Scrollbars style={{ height: height - 120 }}>
        <Grid
          data={contacts}
          columns={[
            { header: "Name", propertyName: 'name', value: (row) => <span>{row.isDeleted ? "Unknown" : row.name}</span>, width: 150 },
            { header: "Contact", propertyName: "contact", value: (column: any) => <span>{column.countryCode} {column.phoneNo}</span>, width: 150 },
            { header: "Email", value: (row) => row.isDeleted ? "NA" : row.email, propertyName: 'email', width: 150, charLimit: 30, popupOnHover: true },
            { header: "Secondary Contact", propertyName: 'secondaryPhoneNo', value: (column: any) => <span>{column.isDeleted ? "NA" : column.secondaryPhoneNo ? `${column.countryCode} ${column.secondaryPhoneNo}` : 'NA'}</span>, width: 150 },
            { header: "Gender", propertyName: 'gender', value: (column: any) => <span>{!column.isDeleted && column.gender ? column.gender : 'NA'}</span>, width: 150 },
            { header: "D.O.B.", propertyName: 'dob', value: (column: any) => <span>{!column.isDeleted && column.dob ? moment(column.dob).format('MM/DD/YYYY') : 'NA'}</span>, width: 150 },
          ]}
          footer={true}
          pagination={true}
          rowsAtATimeSelector={false}
          loading={contactsListLoading}
          rowsAtATime={10}
          totalCount={segmentInfo && segmentInfo.contactsCount ? segmentInfo.contactsCount : 0}
          onPageChange={(take: number, skip: number, searchValue: string) => getContacts(take, skip, searchValue)}
          globalSearch={false}
          columnSearch={false}
          infiniteScroll={false}
        />
      </Scrollbars>
      <div style={{ position: 'absolute', bottom: 8 }}>
        <Button
          style={{ width: width - 460, outlineWidth: 0, color: '#075E54', fontSize: 11, border: '1px solid #075E54' }}
          variant='outlined'
          onClick={() => {
            getTemplates()
            setTemplateListLoading(true)
            setSelectTemplateDialog(true)
          }}
        >
          Select and send Template...
        </Button>
        <div style={{ fontSize: 9, padding: 0, marginTop: 3 }}>*You can only send templates by segment and bulk messages.</div>
        {/* <ChatForm
          loading={sendMessageLoading}
          sendMessage={sendMessage}
          onChange={(e: any) => setMessage({ ...message, text: e.target.value })}
          value={message.text}
        /> */}
      </div>

      <Dialog
        title={"Edit Segment Name"}
        open={editSegmentDialog}
        onClose={onEditDialogClose}
        loading={dialogLoading}
        onClick={() => onEditDialogConfirm()}
        DialogBody={() =>
          <div>
            <div className="field-wrapper" style={{ width: 350, marginBottom: 0 }}>
              <input name='segmentName' onChange={(e) => setNewSegmentName(e.target.value)}
                value={newSegmentName} disabled={dialogLoading} />
              <div className="field-placeholder">Segment Name</div>
              <div className='error'>{isDialogBtnClicked && ValidateEmptyField(newSegmentName, "Segment Name").err}</div>
            </div>
          </div>}
        positiveBtnLabel={"Update"}
      />

      <Dialog
        title={"Delete Segment"}
        open={deleteSegmentDialog}
        onClose={onDeleteDialogClose}
        loading={dialogLoading}
        onClick={onDeleteDialogConfirm}
        DialogBody={() =>
          <div style={{ padding: 10, paddingRight: 50, paddingLeft: 50 }}>
            Are you sure you want to delete <b>{segmentInfo && segmentInfo.name}</b>?
          </div>}
        positiveBtnLabel={"Delete"}
      />

      <Dialog
        title={"Add / Remove Contacts"}
        open={addRemoveDialog}
        onClose={onCloseAddRemoveDialog}
        loading={dialogLoading}
        onClick={onConfirmAddRemoveDialog}
        DialogBody={() =>
          <div style={{ padding: 10, width: 650 }}>
            <Scrollbars style={{ height: height / 100 * 65, width: 650 }}>
              <Grid
                data={contactsWithSegContacts}
                columns={[
                  { header: "Name", propertyName: "name", value: (row) => <span>{row.isDeleted ? "Unknown" : row.name}</span>, width: 150 },
                  { header: "Contact", propertyName: "phoneNo", value: (column, index) => <span>{column.phoneNo}</span>, width: 150 },
                  { header: "Email", propertyName: "email", value: (row) => row.isDeleted ? "NA" : row.email, width: 150, popupOnHover: true },
                  { header: "Secondary Contact", propertyName: "secondaryPhoneNo", value: (column: any) => <span>{column.isDeleted ? "NA" : column.secondaryPhoneNo ? `${column.countryCode} ${column.secondaryPhoneNo}` : 'NA'}</span>, width: 150 },
                  { header: "Gender", propertyName: "gender", value: (row: any) => <span>{row.isDeleted === false && row.gender ? row.gender : "NA"}</span>, width: 150 },
                  { header: "D.O.B.", propertyName: "dob", value: (i) => <span>{i.dob ? moment(i.dob).format('MM/DD/YYYY') : 'NA'}</span>, width: 150, columnSearch: { type: 'daterange' } },
                ]}
                footer={true}
                pagination={true}
                rowsAtATimeSelector={true}
                setSelectedRows={(rows: any) => {
                  setSelectedRows([...rows]);
                }}
                selectedRecords={selectedRows}
                loading={dialogGridLoading}
                rowsAtATime={10}
                totalCount={dialogGridTotalCount}
                onPageChange={(take: number, skip: number, searchValue: string) => getContactsWithAddedContacts(take, skip)}
                onColumnSearch={(take: number, skip: number, searchValue: any) => getContactsWithAddedContacts(take, skip, searchValue)}
                globalSearch={false}
                columnSearch={true}
                setFilters={function setFilters(f: object) {
                  setFilters(f)
                }}
                infiniteScroll={false}
                setColumnSearch={search}
              />
            </Scrollbars>
          </div>}
        positiveBtnLabel={"Submit"}
        btnContainerStyles={{ margin: '0px 0px 5px 0px' }}
      />
      <DialogBox
        title={"Select Template"}
        open={selectTemplateDialog}
        onClose={() => setSelectTemplateDialog(false)}
        loading={dialogLoading}
        onClick={sendTemplate}
        DialogBody={() =>
          <div style={{ width: 'fit-content' }}>
            {
              !templateListLoading ?
                <Scrollbars style={{ height: height / 100 * 70, width: 650 }}>
                  <InfiniteScroll2
                    pageStart={1}
                    loadMore={() => getTemplates(templatePage)}
                    hasMore={totalTemplates && totalTemplates > templates.length ? true : false}
                    loader={<div style={{ display: 'flex', width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}
                    ><Spinner color="#075E54" /></div>}
                    useWindow={false}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start' }} className='templates-container'>
                      {
                        templates.length > 0 ?
                          templates.map((template: any, templateIndex: number) =>
                            <Template
                              isChecked={templateIndex === selectedTemplateIndex}
                              statusVisible={true} template={template}
                              onChangeCheck={(val: boolean) => setSelectedTemplateIndex(templateIndex)}
                              isSelectable={true}
                            />
                          )
                          :
                          <div style={{ fontSize: 14, color: '#90a4ac', width: '100%', height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
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
                                      // switchSubTab('createTemplate');
                                      navigate('/settings/templates/create-template')
                                    }}>
                                    Create Template
                                  </Button>
                                </>
                            }
                          </div>
                      }
                    </div>
                  </InfiniteScroll2>
                </Scrollbars>
                :
                <Spinner style={{ margin: 50 }} color='#075e45' />
            }
          </div>
        }
        positiveBtnLabel={"Send"}
        btnContainerStyles={{ margin: '0px 0px 5px 0px' }}
      />
    </div>
  )
}
