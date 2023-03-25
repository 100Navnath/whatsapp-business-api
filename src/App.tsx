import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import Login from './screens/SignIn/Login';
import SignUp from './screens/SignUp/SignUp';
import ForgotPassword from './screens/ForgotPassword/ForgotPassword';
import Index from './screens/Index/Index';
import { useState, useEffect, useMemo } from 'react';
import PageNotFound from './screens/pageNotFound/pageNotFound';
import { getFromLocalStorage, removeFromLocalStorage } from './components/LocalStorage/localStorage';
import { ToastContainer } from 'react-toastify';
import Spinner from './components/Loading/spinner';
import UnauthAccessDenied from './screens/UnauthAccessDenied/UnauthAccessDenied';
import { newNotification } from './screens/Notifications/handleNotifications';

function App() {
  const [userDetails, setUserDetails] = useState(Object);
  const [isDisable, setIsDisable] = useState(false);
  const [loading, setLoading] = useState(false);

  async function getUserDetails() {
    const i = await getFromLocalStorage("isDisable");
    const user = await getFromLocalStorage("user");
    if (user && typeof i === "boolean") {
      setUserDetails(user);
      setIsDisable(i);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }

  const swListener = useMemo(() => new BroadcastChannel('swListener'), []);

  useEffect(() => {
    swListener.addEventListener('message', (event: any) => newNotification(event, () => { }))
  }, [])

  const onClickNotification = new BroadcastChannel('onClickNotification');
  // swListener.onmessage = (event: any) => console.log("New message");
  onClickNotification.onmessage = (event: any) => { };

  useEffect(() => {
    getUserDetails()
  }, [])

  function _setUser(userObj: any) {
    // console.log("_set User  : ", userObj);
    // setUserDetails(userObj)
  }

  // console.log("Log should be once");


  return (
    <Router>
      {
        !loading ?
          <Routes>
            <Route path='/' element={<Login setUserOnLogin={_setUser} />} />
            <Route path='/signup' element={<SignUp setUserOnSignup={_setUser} />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/messages' element={<Index activeTab={'chatlist'} activeSubTab={null} />} />
            <Route path='/chats'>
              <Route index element={<Index activeTab={'chatlist'} activeSubTab={null} />} />
              <Route path='bulk-sms' element={<Index activeTab={'chatlist'} activeSubTab={'bulkSMS'} />} />
              <Route path=':id' element={<Index activeTab={'chatlist'} activeSubTab={'chat'} />} />
            </Route>
            <Route path='/segments'>
              <Route index element={<Index activeTab={'segments'} activeSubTab={null} />} />
              <Route path=':id' element={<Index activeTab={'segments'} activeSubTab={'segmentInfo'} />} />
            </Route>
            {/* {
              userDetails && userDetails.role === "Admin" && */}
            <Route path='/settings'>
              <Route index element={<Index activeTab={'settings'} activeSubTab={"profile"} />} />
              {/* No use in whatsapp sms app */}
              <Route path='number-management' >
                <Route index element={<Index index activeTab={'settings'} activeSubTab={'numberMngmt'} thirdTab={'LinkedNumbers'} />} />
                <Route path="get-number" element={<Index index activeTab={'settings'} activeSubTab={'numberMngmt'} thirdTab={'getNumber'} />} />
              </Route>
              <Route path="billing" element={<Index activeTab={'settings'} activeSubTab={'buyCredits'} />} />
              <Route path="invoice" element={<Index activeTab={'settings'} activeSubTab={'invoice'} />} />
              <Route path="user-management" element={<Index activeTab={'settings'} activeSubTab={'userMngmt'} />} />
              <Route path="auto-responder" element={<Index activeTab={'settings'} activeSubTab={'autoRes'} />} />
              <Route path="templates">
                <Route index element={<Index activeTab={'settings'} activeSubTab={'template'} />} />
                <Route path='create-template' element={<Index activeTab={'settings'} activeSubTab={'createTemplate'} />} />
              </Route>
              <Route path="profile" element={<Index activeTab={'settings'} activeSubTab={'profile'} />} />
            </Route>
            {/* } */}
            <Route path='/billing' element={<Index activeTab={'billing'} />} />
            <Route path='/notifications' element={<Index activeTab={'notifications'} />} />
            <Route path='/contacts'>
              <Route index element={<Index activeTab={'contacts'} activeSubTab={null} />} />
              <Route path='upload-contacts' element={<Index activeTab={'contacts'} activeSubTab={'contacts'} thirdTab={'uploadCSV'} />} />
              <Route path='contact-info'>
                <Route path=':id' element={<Index activeTab={'contacts'} activeSubTab={'contacts'} thirdTab={'contactInfo'} />} />
              </Route>
            </Route>
            <Route path='/analytics' element={<Index activeTab={'analytics'} />} />
            {/* {
              userDetails && userDetails.role && userDetails.role.toLowerCase() == "user" && */}
            <Route path='/profile' element={<Index activeTab={'profile'} activeSubTab={'profile'} />} />
            {/* } */}
            <Route path="/unauthorize-access-denied" element={<UnauthAccessDenied />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes> :
          <Spinner color='#1273eb`' />
      }
      <ToastContainer />
    </Router>
  );
}

export default App;
