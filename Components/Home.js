import { StatusBar } from 'expo-status-bar';
import {ImageBackground, StyleSheet,Image, Text, View, Button, ToastAndroid } from 'react-native';
import { useEffect, useState } from 'react';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';

export default function Home({userInfo, setUserInfo, setLogoutFunction, setToken}) {

  const [error, setError] = useState();

  useEffect(() => {
    GoogleSignin.configure({
      // webClientId: '42809521003-s09gbsitjmh2qpml8q7p90dn18l5ej5j.apps.googleusercontent.com',
      webClientId: '42809521003-pc6ip7bgndnpg1uf7e5k68r7g7fjqbg3.apps.googleusercontent.com',
      // androidClientId: '42809521003-h1v0fk55h3dit7qpma8999hcks0vpiip.apps.googleusercontent.com',
      scopes: [
       'https://www.googleapis.com/auth/drive.file'
    ],
       offlineAccess: true,
  })
  }, []);



  const signin = async () => {
    // ToastAndroid.show("hello", ToastAndroid.SHORT);
    try {
      // ToastAndroid.show(user, ToastAndroid.SHORT);
      await GoogleSignin.hasPlayServices();
      const user = await GoogleSignin.signIn();
      setUserInfo(user);
      const token = (await GoogleSignin.getTokens()).accessToken;
      // createFolder(userInfo.user.email, token);
      setToken(token);
      setError();
    } catch (e) {
      console.log('Error during sign-in:', e); // Add this line
      setError(e);
    }

  };


  return (
    <ImageBackground source={require('../assets/HomeInsectBackground.jpeg')} style={styles.container}>
      {error && <Text>{"could not log in"}</Text>}
      {error && <Text>{JSON.stringify(error)}</Text>}
      <Text style={styles.title}>Insect Tracker App</Text>
      <Image source={require('../assets/LOGO.png')} style={styles.logo} />
      {userInfo ? (
        setLogoutFunction= {logout} 
      ) : (
        <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Light}
        backgroundColor={'grey'}
          onPress={signin}
        />
      )}
      <StatusBar style="auto" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00695c', // Dark Turquoise background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30 // Space between the logo and the sign-in button
  },
  title:{
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Montserrat',
    marginBottom: 108,
  },
  buttonText: {
    marginLeft: 10,
    color: '#DB4437', // Google red color for the text
    fontSize: 16,
    
  }
});


