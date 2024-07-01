import * as React from 'react';
import { useState, ToastAndroid} from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
import Home from './Components/Home';
import ITApp from './Components/ITApp';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
function App() {
  const [userInfo, setUserInfo] = useState(null);
  // const [logoutFunction, setLogoutFunction] = useState(null);
  const logout = () => {
    
    // ToastAndroid.show(5, ToastAndroid.SHORT);
    // // ToastAndroid.show(userInfo, ToastAndroid.SHORT);
    setUserInfo();
    GoogleSignin.revokeAccess();
    GoogleSignin.signOut();
  };
  return (
    !userInfo ? (
      <Home userInfo={userInfo} setUserInfo={setUserInfo} logoutFunction={logout} 
       />
    ) : (
      
      <ITApp logoutFunction={logout} />
    )
  );
  
}

// (
//   <Button title="Logout" onPress={logout} />
// ) : 
export default App;
