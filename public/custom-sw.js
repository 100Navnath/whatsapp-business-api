self.addEventListener('install', function (event) {
});

self.addEventListener('message', function (event) {
    console.log('triggered', event);
    const swListener = new BroadcastChannel('swListener');
    swListener.postMessage(event.data.message);
});

self.addEventListener('activate', function (event) {

});

self.addEventListener("push", receivePushNotification);

self.addEventListener("notificationclick", openPushNotification);

self.addEventListener('pushsubscriptionchange', function (event) {
    console.log('Subscription expired');
    event.waitUntil(
        self.registration.pushManager.subscribe({ userVisibleOnly: true })
            .then(function (subscription) {
                console.log('Subscribed after expiration', subscription);
                //update subscription object for perticular object
            })
    );
});

function receivePushNotification(event) {
    console.log("[Service Worker] Push Received.", event.data.json());
    const swListener = new self.BroadcastChannel('swListener');
    swListener.postMessage(event.data.json());
    // showNotification(event);
    // var jsondata = event.data.json();
    // if (jsondata.notification.ModuleName == 'sms') {
    //     console.log("notificationdata", jsondata.notification);
    //     var Extradata = {};
    //     Extradata.ChannleId = jsondata.notification.ChannleId;
    //     Extradata.MessagingSystemId = jsondata.notification.MessagingSystemId;
    //     Extradata.SmsFromUserName = jsondata.notification.SmsFromUserName;
    //     Extradata.SmsFromNumber = jsondata.notification.title;
    //     Extradata.RedirectToUrl = jsondata.notification.RedirectToUrl;
    //     Extradata.PatientId = jsondata.notification.PatientId;
    //     Extradata.IsPatient = jsondata.notification.IsPatient;
    //     Extradata.IsContact = jsondata.notification.IsContact;
    //     Extradata.ModuleName = jsondata.notification.ModuleName;
    //     //SmsCampaignUrl

    //     const options = {
    //         data: Extradata,
    //         body: jsondata.notification.body,
    //         icon: jsondata.notification.icon,
    //         vibrate: jsondata.notification.vibrate,
    //         //tag: tag,
    //         //image: jsondata.notification.icon,
    //         badge: jsondata.notification.icon,
    //         actions: jsondata.notification.actions,
    //         silent: jsondata.notification.silent
    //     };
    //     var title = jsondata.notification.title;
    //     console.log("options", options);
    //     event.waitUntil(self.registration.showNotification(title, options));

    // }
    // else if (jsondata.notification.ModuleName == 'CSV Patient' || jsondata.notification.ModuleName == 'CSV Appointment') {
    //     var Extradata = {};
    //     Extradata.ChannleId = jsondata.notification.ChannleId;
    //     Extradata.RedirectToUrl = jsondata.notification.RedirectToUrl;
    //     Extradata.FileName = jsondata.notification.FileName;
    //     Extradata.ProcessedPercentage = jsondata.notification.ProcessedPercentage;
    //     Extradata.ProcessingDateTime = jsondata.notification.ProcessingDateTime;
    //     Extradata.UserId = jsondata.notification.UserId;
    //     Extradata.UserName = jsondata.notification.UserName;
    //     Extradata.practice_id = jsondata.notification.practice_id;
    //     Extradata.ModuleName = jsondata.notification.ModuleName;
    //     //SmsCampaignUrl

    //     const options = {
    //         data: Extradata,
    //         body: jsondata.notification.Message,
    //         icon: jsondata.notification.icon,
    //         vibrate: jsondata.notification.vibrate,
    //         //tag: tag,
    //         //image: jsondata.notification.icon,
    //         badge: jsondata.notification.icon,
    //         actions: jsondata.notification.actions,
    //         silent: jsondata.notification.silent
    //     };
    //     var title = jsondata.notification.ModuleName;
    //     console.log("options", options);
    //     event.waitUntil(self.registration.showNotification(title, options));

    // }
    // else if (jsondata.notification.ModuleName == 'ReferralWidget' || jsondata.notification.ModuleName == 'Referral' || jsondata.notification.ModuleName == 'Appointment') {
    //     var Extradata = {};
    //     Extradata.ChannleId = jsondata.notification.ChannleId;
    //     Extradata.ModuleActivityData = jsondata.notification.ModuleActivityData;
    //     Extradata.RedirectToUrl = jsondata.notification.RedirectToUrl;
    //     Extradata.NotificationType = jsondata.notification.NotificationType;
    //     Extradata.ModuleName = jsondata.notification.ModuleName;

    //     const options = {
    //         data: Extradata,
    //         body: jsondata.notification.body,
    //         icon: jsondata.notification.icon,
    //         vibrate: jsondata.notification.vibrate,
    //         //tag: tag,
    //         //image: jsondata.notification.icon,
    //         badge: jsondata.notification.icon,
    //         actions: jsondata.notification.actions,
    //         silent: jsondata.notification.silent
    //     };
    //     var title = jsondata.notification.ModuleName;
    //     console.log("options", options);
    //     event.waitUntil(self.registration.showNotification(title, options));
    // }
}

function showNotification(event) {
    const data = event.data.json();
    console.log('current path : ', self.location);
    event.waitUntil(self.registration.showNotification(data?.Data?.name, {
        body: data.Data.message,
        icon: "../src/assets/img/logo.png",
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        tag: "new-message",
    }));
}


function openPushNotification(event) {
    console.log("[Service Worker] Notification click Received.", event);
    const data = {
        "type": event.notification.tag,
        id: event?.notification?.data?.id,
        Data: event?.notification?.data
    }
    const onClickNotification = new self.BroadcastChannel('onClickNotification');
    onClickNotification.postMessage(data);

    // clients.openWindow('chats/11');
    var notification = event.notification;
    var primaryKey = notification.data.primaryKey;
    var action = event.action;
    var ExtraData = event.notification.data;
    if (action === 'close') {
        notification.close();
    } else if (action === 'openChat') {

        if (ExtraData.IsPatient) {
            var OpenChatLink = ExtraData.RedirectToUrl + "?messaging_sys_id=" + ExtraData.MessagingSystemId + "&phone_number=" + ExtraData.SmsFromNumber + "&patient_name=" + ExtraData.SmsFromUserName + "&patient_id=" + ExtraData.PatientId;
        }
        else if (ExtraData.IsContact) {
            var OpenChatLink = ExtraData.RedirectToUrl + "?messaging_sys_id=" + ExtraData.MessagingSystemId + "&phone_number=" + ExtraData.SmsFromNumber + "&contact_name=" + ExtraData.SmsFromUserName;
        }

        clients.openWindow(OpenChatLink);
        notification.close();
    }
    else if (action == 'openNotification') {
        var OpenChatLink = ExtraData.RedirectToUrl;
        clients.openWindow(OpenChatLink);
        notification.close();
    }
    else {
        notification.close();
    }
}