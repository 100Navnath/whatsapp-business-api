import { useState, useEffect, useRef } from 'react'
import PhoneInput from 'react-phone-input-2';
import { useNavigate } from 'react-router-dom';
import Asterisk from '../../components/Asterisk'
import Dropdown from '../../components/Dropdown';
import Spinner from '../../components/Loading/spinner';
import { ValidateConfirmEmail, ValidateConfirmPassword, ValidateEmail, ValidateEmptyField, ValidateMobile, ValidateName, ValidatePassword, ValidateUrl } from '../../components/validators';
import { apiList } from '../../constant/apiList';
import { API } from '../../constant/network';
import LoadingButton from '@mui/lab/LoadingButton';
import dummyData from '../../assets/dummyData'
import { getFromLocalStorage, setLocalStorage } from '../../components/LocalStorage/localStorage';
import Button from '@mui/material/Button';
import Toast from '../../components/Toast/Toast';
import validator from 'validator';

const firstName = `${dummyData.firstNames[Math.floor(Math.random() * 993)]}`;
const lastName = `${dummyData.firstNames[Math.floor(Math.random() * 993)]}`;
const user = {
    "firstName": `${firstName}`,
    "lastName": `${lastName}`,
    // "countryCode": "+91",
    // "phoneNo": `9${Math.floor(Math.random() * 1000000000)}`,
    "email": `${firstName}${lastName}@email.com`.toLowerCase(),
    "confirmEmail": `${firstName}${lastName}@email.com`.toLowerCase(),
    // "isWhatsappNo": false,
    "password": "Password@123",
    "confirmPassword": "Password@123",
    "website": `https://${firstName}.com`,
    "businessName": `${firstName}'s Business`,
    "businessType": "Business type",
    "noOfEmployee": "1-10"
}

export default function Step1(props: any) {
    const [userDetails, setUserDetails] = useState<any>({ website: "" })
    const [isBtnClick, setIsBtnClick] = useState(false);
    const [loading, setLoading] = useState(false)

    function validation() {
        console.log("inside validation : ", userDetails);

        setIsBtnClick(true);
        // console.log(userDetails);
        if (
            !ValidateName(userDetails.firstName).isError &&
            !ValidateName(userDetails.lastName).isError &&
            // !ValidateMobile(userDetails.phoneNo).isError &&
            !ValidateEmail(userDetails.email).isError &&
            !ValidateEmptyField(userDetails.businessName).isError &&
            !ValidateEmptyField(userDetails.businessType).isError &&
            !(userDetails.website && ValidateUrl(`${userDetails.website}`).isError) &&
            // !ValidateEmptyField(userDetails.noOfEmployee).isError &&
            !ValidatePassword(userDetails.password).isError &&
            !ValidateConfirmPassword(userDetails.password, userDetails.confirmPassword).isError &&
            !ValidateConfirmEmail(userDetails.email, userDetails.confirmEmail).isError
        ) {

            onSignupClick();
        }
    }

    function clearForm() {
        setUserDetails({
            "firstName": ``,
            "lastName": ``,
            // "countryCode": "+91",
            // "phoneNo": ``,
            // "isWhatsappNo": false,
            "email": ``,
            "confirmEmail": "",
            "password": "",
            "confirmPassword": "",
            "website": ``,
            "businessName": ``,
            "businessType": "",
            "noOfEmployee": ""
        })
    }

    useEffect(() => {
        if (props.action === "clearForm") {
            clearForm()
        }
    }, [props.action])


    function onSignupClick() {
        try {
            setLoading(true)
            if (userDetails) {

            }
            const body = {
                ...userDetails,
                website: userDetails.website ? `${userDetails.website}` : "",
                noOfEmployee: userDetails.noOfEmployee ? userDetails.noOfEmployee : ""
            }

            API.post(`${process.env.REACT_APP_BASE_API}${apiList.signUp}`, body, { "content-type": "application/json", "Accept": "*/*" })?.subscribe({
                next(res: any) {
                    console.log("sign up response : ", res);
                    // setTimeout(() => {
                    setLoading(false)
                    if (res.status === 200) {
                        // props.setEmail(`${userDetails.countryCode}-${userDetails.phoneNo}`)
                        props.setUserDetails({ ...userDetails, tempId: res.data.userId })
                        setLocalStorage("user", { ...userDetails, tempId: res.data.userId, role: "Admin" })
                        props.setUserOnSignup({ ...userDetails, tempId: res.data.userId, role: "Admin" })
                        // props.setData({ contactNumber: `${userDetails.countryCode}-${userDetails.phoneNo}`, userId: res.data.userId })
                        props.nextStep()
                    }
                    // }, 2000);
                },
                error(err) {
                    setLoading(false)
                    // if (err.response.data && err.response.data.message && err.response.data.message === "This Email is already exist.")
                    //     Toast({ message: "Email Id already exists, Please try Login.", type: "error" });
                },
            });
        } catch (error: any) {
            setLoading(false)
            Toast({ message: error, type: "error" });
        }
    }

    const navigate = useNavigate();
    const options = ['1-10', '11-25', '26-50', '51-100', '100-500', '500+'];
    // const options = [
    //     { value: '1-10', label: '1-10' },
    //     { value: '11-25', label: '11-25' },
    //     { value: '26-50', label: '26-50' },
    //     { value: '51-100', label: '51-100' },
    //     { value: '100-500', label: '100-500' },
    //     { value: '500+', label: '500+' }
    // ];
    const [visibility, setVisibility] = useState(false);
    const [selected, setSelected] = useState(Object);

    function login() {
        navigate('/')
    }

    useEffect(() => {
        async function getUserFromLocalStorage() {
            const userDetails = await getFromLocalStorage("user");
            if (userDetails && !userDetails.isVerify) {
                props.setUserDetails(userDetails)
                // props.setData({ contactNumber: `${userDetails.countryCode}-${userDetails.phoneNo}`, userId: userDetails.currentuserId })
                props.nextStep()
            }
        }
        getUserFromLocalStorage();
    }, []);
    const ref = useRef<any>(null);
    const [widthOfPrefix, setWidthOfPrefix] = useState(10)
    useEffect(() => {
        // console.log('width', ref.current ? ref.current.offsetWidth : 0);
        if (ref.current && ref.current.offsetWidth) {
            setWidthOfPrefix(ref.current.offsetWidth)
        }
    }, [ref.current]);
    return (
        <div>
            <div style={{ textAlign: 'center', fontSize: 26, marginBottom: 25 }}>Create Account</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 25, flexDirection: 'row', flexWrap: 'wrap' }}>
                <div className='input-column'>
                    <div className="field-wrapper">
                        <input name='firstName' type="text" autoFocus={true} defaultValue={userDetails.firstName} maxLength={15}
                            onChange={(event) => setUserDetails({ ...userDetails, firstName: event.target.value })}
                            disabled={loading}
                        />
                        <div className="field-placeholder">First Name<Asterisk /></div>
                        <div className='error'>{isBtnClick && ValidateName(userDetails.firstName, "First name").err}</div>
                    </div>
                    <div className="field-wrapper">
                        <input name='lastName' type="text" maxLength={15} onChange={(e) => setUserDetails({ ...userDetails, lastName: e.target.value })}
                            defaultValue={userDetails.lastName} disabled={loading} />
                        <div className="field-placeholder">Last Name<Asterisk /></div>
                        <div className='error'>{isBtnClick && ValidateName(userDetails.lastName, "Last Name").err}</div>
                    </div>
                </div>
                <div className='input-column'>
                    {/* <div className='phone-number-input-field'>
                        <div className='field-wrapper'>
                            <div className="field-placeholder">Phone number<Asterisk /></div>
                            <PhoneInput
                                containerStyle={{ width: 'fit-content', fontFamily: 'Poppins', fontSize: 14 }}
                                country={'in'}
                                searchStyle={{ fontFamily: 'Poppins', fontSize: 12, padding: 5 }}
                                inputStyle={{ width: 200, fontFamily: 'Poppins', fontSize: 12, boxShadow: '0px 0px 0px 0px', borderRadius: 5 }}
                                value={`${userDetails.countryCode}${userDetails.phoneNo}`}
                                countryCodeEditable={false}
                                onChange={(number, obj: any) => setUserDetails({ ...userDetails, countryCode: `+${obj.dialCode}`, phoneNo: number.slice(obj.dialCode.length) })}
                                enableSearch={true}
                                disabled={loading}
                                searchPlaceholder={"Search"}
                            />
                        </div>
                        <div className='error'>{isBtnClick && ValidateMobile(userDetails.phoneNo, "Phone number").err}</div>
                        <div className="checkbox-wrapper">
                            <input className='input-checkbox' type="checkbox" onChange={(e) => setUserDetails({ ...userDetails, isWhatsappNo: e.target.checked })} />
                            <div className="field-placeholder">Is WhatsApp number?</div>
                        </div>
                    </div> */}
                    <div className="field-wrapper">
                        <input name='email' type="email" onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                            defaultValue={userDetails.email} disabled={loading} />
                        <div className="field-placeholder">Email ID<Asterisk /></div>
                        <div className='error'>{isBtnClick && ValidateEmail(userDetails.email, "Email").err}</div>
                    </div>
                    <div className="field-wrapper">
                        <input name='email' type="email" onChange={(e) => setUserDetails({ ...userDetails, confirmEmail: e.target.value })}
                            defaultValue={userDetails.confirmEmail} disabled={loading} />
                        <div className="field-placeholder">Confirm Email ID<Asterisk /></div>
                        <div className='error'>{isBtnClick && ValidateConfirmEmail(userDetails.email, userDetails.confirmEmail, "Confirm Email ID").err}</div>
                    </div>
                </div>
                <div className='input-column'>
                    <div className="field-wrapper">
                        <input type="text" onChange={(e) => setUserDetails({ ...userDetails, businessName: e.target.value })}
                            defaultValue={userDetails.businessName} disabled={loading} />
                        <div className="field-placeholder">Business Name<Asterisk /></div>
                        <div className='error'>{isBtnClick && ValidateEmptyField(userDetails.businessName, "Business Name").err}</div>
                    </div>
                    <div className="field-wrapper">
                        <input type="text" onChange={(e) => setUserDetails({ ...userDetails, businessType: e.target.value })}
                            defaultValue={userDetails.businessType} disabled={loading} />
                        <div className="field-placeholder">Business Type<Asterisk /></div>
                        <div className='error'>{isBtnClick && ValidateEmptyField(userDetails.businessType, "Business Type").err}</div>
                    </div>
                </div>
                <div className='input-column'>
                    <div className="field-wrapper">
                        {/* <span ref={ref} style={{ position: 'absolute', fontSize: 12, height: 36, display: 'flex', alignItems: 'center', paddingLeft: 5 }}>https://www.</span> */}
                        <input name='website' type="text"
                            onChange={(e) => setUserDetails({ ...userDetails, website: `${e.target.value}` })}
                            disabled={loading}
                            defaultValue={userDetails.website}
                            style={{ paddingLeft: widthOfPrefix }}
                        />
                        <div className="field-placeholder">Website</div>
                        <div className='error'>{isBtnClick && userDetails.website && ValidateUrl(`${userDetails.website}`).err}</div>
                    </div>
                    <Dropdown
                        options={options}
                        title="Number of Employees"
                        // optionsContainer={{ marginTop: -20 }}
                        defaultValue={userDetails.noOfEmployee}
                        scrollbarHeight={150}
                        onChange={function (e: any) {
                            setUserDetails({ ...userDetails, noOfEmployee: e });
                        }}
                        // err={isBtnClick && ValidateEmptyField(userDetails.noOfEmployee).err}
                        disabled={loading}
                    />
                    {/* <div className="field-wrapper">
                        <div className="field-placeholder">Number of employees</div>
                        <Select
                            maxMenuHeight={150}
                            styles={{
                                container: (baseStyles, state) => ({
                                    ...baseStyles,
                                    fontSize: 12,
                                    width: 200,
                                    borderRadius: 5
                                }),
                                menuList: (base, props) => ({
                                    ...base,
                                    fontSize: 12,
                                    position: 'absolute',
                                    zIndex:1111
                                })

                            }}
                            isClearable={true}
                            value={{ value: userDetails.noOfEmployee, label: userDetails.noOfEmployee }}
                            onChange={(e) => setUserDetails({ ...userDetails, noOfEmployee: e?.value })}
                            options={options}
                            isSearchable={false}
                        />
                    </div> */}
                </div>
                <div className='input-column'>
                    <div className="field-wrapper">
                        <input type="password" onChange={(e) => setUserDetails({ ...userDetails, password: e.target.value })}
                            defaultValue={userDetails.password} disabled={loading} />
                        <div className="field-placeholder">Password<Asterisk /></div>
                        <div className='error'>{isBtnClick && ValidatePassword(userDetails.password, "Password").err}</div>
                    </div>
                    <div className="field-wrapper mb-3">
                        <input type="password" onChange={(e) => setUserDetails({ ...userDetails, confirmPassword: e.target.value })}
                            defaultValue={userDetails.confirmPassword} disabled={loading} />
                        <div className="field-placeholder">Confirm Password<Asterisk /></div>
                        <div className='error'>{isBtnClick && ValidateConfirmPassword(userDetails.password, userDetails.confirmPassword, "Confirm Password").err}</div>
                    </div>
                </div>
            </div>
            <div className="actions">
                {/* <button type="submit" className="btn btn-primary ml-auto" style={{ width: '100%', fontSize: 14 }} onClick={validation}>Next</button> */}
                <LoadingButton
                    loading={loading}
                    variant="contained"
                    size='small'
                    loadingIndicator={<Spinner />}
                    onClick={validation}
                    className='btn-active'
                >
                    Next
                </LoadingButton>
            </div>
            <div style={{ display: 'flex', borderColor: '#000', borderWidth: 1, justifyContent: 'center', marginTop: 10, flexDirection: 'column', alignItems: 'center' }}>
                <div className='secondary-action'>Have an account?
                    <Button onClick={login} variant="text">
                        Login
                    </Button></div>
                <div className='secondary-action' style={{ marginTop: 10 }}>V {process.env.REACT_APP_VERSION}</div>
            </div>
        </div >
    )
}
