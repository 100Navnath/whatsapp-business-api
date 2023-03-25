// var jwt = require('jsonwebtoken');
// import jwt from 'jsonwebtoken'
import CryptoJS from 'crypto-js'
const localStorageEncryptionKey: any = `${process.env.REACT_APP_LocalStorageEncryptionKey}`
const secret = new TextEncoder().encode(
    localStorageEncryptionKey
);
export function setLocalStorage(key: string, value: any) {
    try {
        var encryptedValue = CryptoJS.AES.encrypt(JSON.stringify(value), localStorageEncryptionKey).toString();
        localStorage.setItem(key, encryptedValue);
    } catch (error) {
        console.log("Error in setLocalStorage", error);
    }
}

export function getFromLocalStorage(key: string) {
    try {
        const value: any = localStorage.getItem(key);
        if (value) {
            var bytes = CryptoJS.AES.decrypt(value, localStorageEncryptionKey);
            var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            return decryptedData
        }
    } catch (error) {
        console.log("Error in getFromLocalStorage", error);
    }
}

export function removeFromLocalStorage(key: string) {
    localStorage.removeItem(key);
}