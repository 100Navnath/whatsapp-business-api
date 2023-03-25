// // Scripts for firebase and firebase messaging
// importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
// importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

// // Initialize the Firebase app in the service worker by passing the generated config
// const firebaseConfig = {
//     apiKey: "AIzaSyDVqKf-g3-6fsC-EeVZlynzAuA88L15pQs",
//     authDomain: "werq-sms.firebaseapp.com",
//     projectId: "werq-sms",
//     storageBucket: "werq-sms.appspot.com",
//     messagingSenderId: "648328198068",
//     appId: "1:648328198068:web:fbb9780e740002c8b4a4e1"
// };

// firebase.initializeApp(firebaseConfig);

// // Retrieve firebase messaging
// const messaging = firebase.messaging();

// messaging.onBackgroundMessage(function (payload) {
//     console.log("Received background message ", payload);
//     const notificationTitle = payload.notification.title;
//     const notificationOptions = {
//         body: payload.notification.body,
//     };

//     self.registration.showNotification(notificationTitle, notificationOptions);
// });