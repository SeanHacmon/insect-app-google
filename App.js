import * as React from 'react';
import { useState, ToastAndroid} from 'react';
import Configure from './Components/Configure';
import Home from './Components/Home';
import ITApp from './Components/ITApp';
import GoogleDriveManager from './Components/GoogleDriveManager';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';

function App() {

  const [userInfo, setUserInfo] = useState(null);
  const [intervalTime, setIntervalTime] = useState(5);
  const [experimentName, setExperimentName] = useState('');
  const [configure, setConfigure] = useState(false);
  const [token, setToken] = useState(null);
  
  const logout = () => {
    // ToastAndroid.show(5, ToastAndroid.SHORT);
    // // ToastAndroid.show(userInfo, ToastAndroid.SHORT);
    setUserInfo();
    GoogleSignin.revokeAccess();
    GoogleSignin.signOut();
  };
  const setSettings = () =>{
    setConfigure(!configure);
  }
  return (
    !userInfo ? (
      <Home userInfo={userInfo}
       setUserInfo={setUserInfo}
       logoutFunction={logout} 
       setToken={setToken}/>
    ) : (
      !configure ? (<Configure
         setIntervalTime={setIntervalTime}
         setExperimentName={setExperimentName}
         setConfigure={setConfigure} />
      ) 
      : ( <ITApp 
        logoutFunction={logout}
        setConfigure={setConfigure}
        setSettings={setSettings} 
        intervalTime={intervalTime}
        experimentName={experimentName}
        userInfo={userInfo}
        token={token}/>
      )
    )
  );
  
}

export default App;
