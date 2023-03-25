/*firebase daniel start*/
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDVqKf-g3-6fsC-EeVZlynzAuA88L15pQs",
  authDomain: "werq-sms.firebaseapp.com",
  projectId: "werq-sms",
  storageBucket: "werq-sms.appspot.com",
  messagingSenderId: "648328198068",
  appId: "1:648328198068:web:fbb9780e740002c8b4a4e1"
};

const fapp = initializeApp(firebaseConfig);
const messaging: any = getMessaging(fapp);

const { REACT_APP_VAPID_KEY } = process.env;
const publicKey = REACT_APP_VAPID_KEY;

export const getFCMToken = async (setTokenFound?: any) => {
  let currentToken = "";
  try {
    currentToken = await getToken(messaging);
    if (currentToken) {
      setTokenFound && setTokenFound(true);
      // console.log("currentToken : ", currentToken);
    } else {
      setTokenFound && setTokenFound(false);
      // console.log("token not found : ", currentToken);
    }
  } catch (error) {
    console.log("An error occurred while retrieving token. ", error);
  }

  return currentToken;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    messaging.onMessage((payload: any) => {
      resolve(payload);
    });
  });