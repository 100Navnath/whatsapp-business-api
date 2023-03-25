import ErrorMessages from "./ErrorMessages";
import validator from "validator";
const ValidateText = (text?: string, fieldName = "") => {
    const reg = /^[a-z\s.]+$/i;
    if (!text) return { isError: true, err: `${fieldName}${ErrorMessages.emptyField}` }
    else if (!(reg.test(text))) return { isError: true, err: ErrorMessages.onlyAlphabets }
    else return { isError: false }
}

const ValidateEmail = (email: any, fieldName = "") => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (!email) return { isError: true, err: `${fieldName}${ErrorMessages.emptyField}` }
    else if (!(reg.test(email))) return { isError: true, err: ErrorMessages.invalidEmail }
    else return { isError: false }
}

const ValidateEmptyField = (text: any, fieldName = "") => {
    if (typeof text === 'number') text = JSON.stringify(text);
    if (!text.trim(" ")) return { isError: true, err: `${fieldName}${ErrorMessages.emptyField}` }
    else return { isError: false }
}

const ValidateMobile = (e: any, fieldName = "") => {
    const reg = /^[0-9]/;
    const mobileRegX = /^\d+$/;
    const mobile = e && e.charAt(0) === '+' ? e.substring(1) : e
    if (!mobile) return { isError: true, err: `${fieldName}${ErrorMessages.emptyField}` }
    else if (!(reg.test(mobile)) || !mobileRegX.test(mobile)) return { isError: true, err: ErrorMessages.only1To9 }
    else if (mobile.length < 7) return { isError: true, err: ErrorMessages.phoneNoMinDigits }
    else if (mobile.length > 15) return { isError: true, err: ErrorMessages.phoneNoMaxDigits }
    // else if (
    //     !(
    //         mobile.charAt(0) == 9 ||
    //         mobile.charAt(0) == 8 ||
    //         mobile.charAt(0) == 7 ||
    //         mobile.charAt(0) == 6
    //     )
    // ) return { isError: true, err: ErrorMessages.invalidMobile }
    else return { isError: false }
}

const ValidateNumber = (mobile: any, fieldName = "", maxLength: number = 15, minLength: number = 7) => {
    const mobileRegX = /^\d+$/;
    if (!mobile) return { isError: true, err: `${fieldName}${ErrorMessages.emptyField}` }
    else if (!mobileRegX.test(mobile)) return { isError: true, err: ErrorMessages.only1To9 }
    else if (mobile.length < minLength) return { isError: true, err: ErrorMessages.phoneNoMinDigits }
    else if (mobile.length > maxLength) return { isError: true, err: ErrorMessages.phoneNoMaxDigits }
    else return { isError: false }
}

const ValidateOTP = (OTP: any) => {
    const reg = /^[0-9\b]+$/;
    if (!OTP) return { isError: true, err: `OTP ${ErrorMessages.emptyField}` }
    else if (!(reg.test(OTP))) return { isError: true, err: ErrorMessages.only1To9 }
    else if (OTP.length != 6) return { isError: true, err: ErrorMessages.OTPLength }
    else return { isError: false }
}

const ValidatePassword = (password: any, fieldName = "") => {
    var reg = /[ `!@#$ %^&*()_+\-=\[\]{};':"\\|,.<>\/? ~]/;
    if (!password) return { isError: true, err: `${fieldName}${ErrorMessages.emptyField}` }
    else if (!(/[A-Z]/.test(password))) return { isError: true, err: ErrorMessages.capitalLetter }
    else if (!(/[0-9]/.test(password))) return { isError: true, err: ErrorMessages.numberInPassword }
    else if (!reg.test(password)) return { isError: true, err: ErrorMessages.passwordSpecChar }
    else if (password.length < 8 || password.length > 20) return { isError: true, err: ErrorMessages.passwordLength }
    else return { isError: false }
}

const ValidatePincode = (pincode: any) => {
    const reg = /^[0-9]/;
    if (!pincode) return { isError: true, err: ErrorMessages.emptyField }
    else if (!(reg.test(pincode))) return { isError: true, err: ErrorMessages.only1To9 }
    else if (pincode.length != 6) return { isError: true, err: ErrorMessages.notSixDigits }
    else return { isError: false }
}

const ValidateConfirmEmail = (email: any, confirmEmail: any, fieldName = "") => {
    if (!confirmEmail) return { isError: true, err: `${fieldName}${ErrorMessages.emptyField}` }
    else if (email && email.toLowerCase() != confirmEmail.toLowerCase()) return { isError: true, err: ErrorMessages.confirmEmail }
    else return { isError: false }
}

const ValidateConfirmPassword = (password: any, confirmPassword: any, fieldName = "") => {
    if (!password) return { isError: true, err: `${fieldName}${ErrorMessages.emptyField}` }
    else if (password != confirmPassword) return { isError: true, err: ErrorMessages.confirmPassword }
    else return { isError: false }
}

const ValidateName = (name: any, fieldName = "") => {
    const reg = /^[a-z'\s]+$/i;
    if (!name) return { isError: true, err: `${fieldName}${ErrorMessages.emptyField}` }
    else if (!(reg.test(name))) return { isError: true, err: ErrorMessages.onlyA2Z }
    else if (name.length < 3) return { isError: true, err: ErrorMessages.nameAtleast }
    else if (name.length == 30) return { isError: true, err: ErrorMessages.nameLessThan }
    else return { isError: false }
}

const ValidateDate = (date: any) => {
    if (new Date().setHours(0, 0, 0, 0) <= new Date(date).setHours(0, 0, 0, 0))
        return { isError: true, err: ErrorMessages.futureDate }
    else return { isError: false }
}
const ValidateDOB = (date: any, fieldName = 'This field') => {
    const CurrentDate = new Date().getTime();
    const DateTime = new Date(date).getTime();
    const maximumDate = new Date(new Date().setFullYear(new Date().getFullYear() - 16)).getTime();
    const minimumDate = new Date(new Date().setFullYear(new Date().getFullYear() - 59)).getTime();
    if (!date) return { isError: true, err: `${fieldName}${ErrorMessages.emptyField}` }
    else if (new Date(date).getFullYear() > 9999) return { isError: true, err: ErrorMessages.invalidYear }
    else if (DateTime >= CurrentDate) return { isError: true, err: ErrorMessages.futureDate }
    else if (DateTime >= maximumDate) return { isError: true, err: ErrorMessages.lessThan16 }
    // else if (DateTime <= minimumDate) return { isError: true, err: ErrorMessages.ageLimitExceeded }
    else return { isError: false }
}

const ValidationIsBlank = (text: any) => {
    if (!text) return { isError: true, err: ErrorMessages.emptyField }
    else return { isError: false }
}

const ValidateUrl = (url: any) => {
    const reg = /^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*$/;
    // if (url.slice(3).toLowerCase() === "www" && url.split(".").length <= 2) return { isError: true, err: ErrorMessages.validUrl }
    // else 
    if (!validator.isURL(url)) return { isError: true, err: ErrorMessages.validUrl }
    else return { isError: false }
}

function ValidateDropdownSelected(selected: any, options: Array<any>) {
    for (let i = 0; i < options.length; i++) {
        // console.log(selected === options[i].value);
        if (selected === options[i].value) return { isError: false }
    }
    return { isError: true, err: ErrorMessages.dropdown }
}

function ValidateLength(value?: any, minLength = 0, maxLength?: number, fieldName?: string) {
    if (!value) return { isError: true, err: `${fieldName}${ErrorMessages.emptyField}` }
    else if (minLength && !(value.length >= minLength)) return { isError: true, err: `${fieldName} length should be minimum ${minLength}` }
    else if (maxLength && !(value.length <= maxLength)) return { isError: true, err: `${fieldName} length should be maximum ${minLength}` }
    else return { isError: false };
}




export {
    ValidateText,
    ValidateEmail,
    ValidateMobile,
    ValidateConfirmEmail,
    ValidateName,
    ValidateEmptyField,
    ValidatePincode,
    ValidateDate,
    ValidatePassword,
    ValidationIsBlank,
    ValidateOTP,
    ValidateNumber,
    ValidateConfirmPassword,
    ValidateDOB,
    ValidateUrl,
    ValidateDropdownSelected,
    ValidateLength // can be used to get empty field as well
}