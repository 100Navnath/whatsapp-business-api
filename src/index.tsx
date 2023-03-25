import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './serviceWorker';
import { subscribeUser } from './subscription';
import { newNotification } from './screens/Notifications/handleNotifications';
const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

// console.log("timezoneOffset", timeZone);
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// const swListener = new BroadcastChannel('swListener');
// const onClickNotification = new BroadcastChannel('onClickNotification');
// swListener.onmessage = (event: any) => newNotification(event, () => { });
// // swListener.onmessage = (event: any) => console.log("New message");
// onClickNotification.onmessage = (event: any) => { };

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
serviceWorker.register();
// subscribeUser()