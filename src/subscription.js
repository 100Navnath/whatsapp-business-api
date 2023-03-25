import axios from "axios"
import { getFromLocalStorage, setLocalStorage } from "./components/LocalStorage/localStorage"
import Toast from "./components/Toast/Toast"
import { apiList } from "./constant/apiList"
import { API } from "./constant/network"

const convertedVapidKey = urlBase64ToUint8Array("BG3whY6PUV-_yPlFgkUZtYsX_jUABrONZa2jjAS2aDvxHFm377Q5E9vgYYssTGiyx4hyQHunwN_0758lid5pPMM")
// const convertedVapidKey = urlBase64ToUint8Array("BNWBnBNF6pMA6KHhN3Z-M-7Iu8Ce_qjbkj5Ro_YSnFPlE6ZFr-5LnvpLlDDNVpjCQoLFxRsMGPNVLRx7uEQip38");

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4)
    // eslint-disable-next-line
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

async function sendSubscription(subscription) {
    try {
        let returnThis = false
        const res = await axios.get('https://geolocation-db.com/json/')
        const user = await getFromLocalStorage("user")
        if (res.data.IPv4) {
            subscription.ipAddress = res.data.IPv4;
            const response = await axios.post(`${process.env.REACT_APP_BASE_API}${apiList.registerSW}`, subscription);
            if (response.status === 200) {
                setLocalStorage("user", { ...user, swObject: subscription.subscriptionDetailsList })
                returnThis = true
            }
        } else Toast({ message: "IP address not found" });
        return returnThis
    } catch (error) {
        Toast({ message: `${error}`, type: 'error' });
    }
}

//conditional render
let clicked = true

export async function subscribeUser(userObj) {
    try {
        let returnThis = false
        // Notification.permission === 'granted'
        if (clicked) {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready
                if (!registration.pushManager) console.log('Push manager unavailable.')

                const existedSubscription = await registration.pushManager.getSubscription()
                if (existedSubscription === null) {
                    console.log('No subscription detected, make a request.')
                    const newSubscription = await registration.pushManager.subscribe({
                        applicationServerKey: convertedVapidKey,
                        userVisibleOnly: true,
                    });
                    const subscriptionObject = JSON.stringify(newSubscription);
                    const swJson = JSON.parse(subscriptionObject)
                    const isSubscriptionUploaded = await sendSubscription({ ...userObj, subscriptionDetailsList: swJson, authKey: swJson.keys.auth })
                    // returnThis = { ...userObj, subscriptionDetailsList: swJson, authKey: swJson.keys.auth }
                    if (isSubscriptionUploaded) returnThis = true
                } else {
                    const subscriptionObject = JSON.stringify(existedSubscription);
                    const swJson = JSON.parse(subscriptionObject)
                    const isSubscriptionUploaded = await sendSubscription({ ...userObj, subscriptionDetailsList: swJson, authKey: swJson.keys.auth })
                    if (isSubscriptionUploaded) returnThis = true
                    // returnThis = { ...userObj, subscriptionDetailsList: swJson, authKey: swJson.keys.auth }
                    console.log('Existed subscription detected.', JSON.parse(subscriptionObject))
                }
            } else {
                console.log("serviceWorker in navigator not foind");
            }
        } else {
            console.log('Can not reachable to the service worker');
        }
        return returnThis
    } catch (error) {
        throw new Error(error)
    }

}