import * as React from 'react';
import { useState, ToastAndroid} from 'react';
import Configure from './Components/Configure';
import Home from './Components/Home';
import ITApp from './Components/ITApp';
import GoogleDriveManager from './Components/GoogleDriveManager';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { GDrive } from '@robinbobin/react-native-google-drive-api-wrapper';

function App() {

  const [userInfo, setUserInfo] = useState(null);
  const [intervalTime, setIntervalTime] = useState(5);
  const [experimentName, setExperimentName] = useState('');
  const [configure, setConfigure] = useState(false);
  const [token, setToken] = useState(null);
  const [gdrive, setGDrive] = useState();
  
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

  const init = async () => {
    try {
      const gdrv = new GDrive();

      gdrv.accessToken = token;

      gdrv.fetchCoercesTypes = true;
      gdrv.fetchRejectsOnHttpErrors = true;
      gdrv.fetchTimeout = 60000;

      setGDrive(gdrv);
      console.log('----------------------')
    } catch (error) {
      console.log('gdrive erorr: ',error.message);
    }
  }

  React.useEffect(() => {
    if (token) {
      init();
    }
  }, [token])

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
        gdrive={gdrive}
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
