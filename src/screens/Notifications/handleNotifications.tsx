import { getFromLocalStorage, setLocalStorage } from "../../components/LocalStorage/localStorage";
import Toast from "../../components/Toast/Toast";


export async function newNotification(event: any, increamentNotificationBadge: () => void) {
  const data = event.data;
  const arrayOfUrl = window.location.href.split('/');
  const endpoint = parseInt(arrayOfUrl[arrayOfUrl.length - 1]); //id
  const title = data?.Data?.name ? data.Data.name : data?.Data?.contact
  const options: NotificationOptions = {
    body: data.Data.message,
    icon: "https://cdn-icons-png.flaticon.com/512/134/134914.png?w=740&t=st=1677493666~exp=1677494266~hmac=8bdeebf87701cdbe9fe1182302be551a57a9f734023108f4fcdf91058db7587f",
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    tag: data.Type,
    silent: false,
    dir: 'auto',
    badge: 'badge',
    data: data?.Data,
    // image: "https://seeklogo.com/images/W/whatsapp-logo-112413FAA7-seeklogo.com.png",
    requireInteraction: false,
    renotify: true
  }

  if (data.Type === "ReceivedNewMessage" && endpoint != data.Data.id) {
    notify(title, options);
    increamentNotificationBadge();
    const chatlist = await getFromLocalStorage("recentChats");
    // console.log("recentChats : ", chatlist);

    let list: Array<any> = [];
    if (chatlist && chatlist.length > 0) list = [...chatlist]
    const objIndex = list.findIndex(((obj: any) => obj.id === data.Data.id));
    const updatedChatObj = { ...data.Data, lastMessage: data.Data.message, unreadCount: 1 }
    // console.log("existing count : ", list[objIndex]?.unreadCount);

    if (objIndex === -1) setLocalStorage("recentChats", [updatedChatObj, ...list])
    else if (objIndex > -1) {
      const chatObj = { ...updatedChatObj, unreadCount: list[objIndex]?.unreadCount ? list[objIndex]?.unreadCount + 1 : 1 };
      list.splice(objIndex, 1)
      setLocalStorage("recentChats", [chatObj, ...list]);
      // console.log("updated value : ", chatObj.unreadCount);

      // localStorage.setItem("recentChats", JSON.stringify([{ ...updatedChatObj, unreadCount: list[objIndex]?.unreadCount ? list[objIndex]?.unreadCount + 1 : 1 }, ...updatedArr]))
    }
  }
  else if (data.Type === "TemplateStatusChanged") {
    notify('Template status changed', { ...options, body: `${data?.Data?.TemplateName} Template is ${data.Data.Status}` });
    increamentNotificationBadge();
  }
}

export function notify(title: string, options: NotificationOptions) {
  Notification.requestPermission(async (result) => {
    if (result === "granted") {
      const user = await getFromLocalStorage('user')
      if (!user?.isMute) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, options);
        });
      }
    } else Notification.requestPermission().catch((e: any) => Toast({ message: `${e}`, type: 'error' }))
  });
}

export function onClickNotificationHandle(event: any, redirect: (path: string, activeTab: string, activeSubTab: string) => void) {
  let path = '';
  let activeTab = '';
  let activeSubTab = '';
  console.log("onClickNotificationHandle : ", event);
  if (event?.data?.type === "ReceivedNewMessage") {
    path = '/chats/' + event?.data?.id
    activeTab = 'chatlist'
    activeSubTab = 'chat'
  }
  else if (event?.data?.type === "TemplateStatusChanged") path = '/settings/templates'
  else if (event?.data?.type === "Opted-out") path = '/contacts/contact-info/' + event?.data?.id
  if (path !== '') {
    redirect(path, activeTab, activeSubTab);
    path = ''
  }
}