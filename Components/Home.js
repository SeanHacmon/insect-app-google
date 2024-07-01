import { StatusBar } from 'expo-status-bar';
import { StyleSheet,Image, Text, View, Button, ToastAndroid } from 'react-native';
import { useEffect, useState } from 'react';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
// import Navigation from '../navigation/navigation';
// import { useNavigation } from '@react-navigation/native';
export default function Home({userInfo, setUserInfo, setLogoutFunction}) {
  const [error, setError] = useState();
  useEffect(() => {
    GoogleSignin.configure();
  }, []);
  
//   const navigation = useNavigation();


  const signin = async () => {
    // ToastAndroid.show("hello", ToastAndroid.SHORT);
    try {
      // ToastAndroid.show(user, ToastAndroid.SHORT);
      await GoogleSignin.hasPlayServices();
      const user = await GoogleSignin.signIn();
      setUserInfo(user);
      setError();
    } catch (e) {
      console.log('Error during sign-in:', e); // Add this line
      setError(e);
    }

  };

  // const logout = () => {
  //   // ToastAndroid.show("hello", ToastAndroid.SHORT);
  //   // ToastAndroid.show(userInfo, ToastAndroid.SHORT);
  //   setUserInfo();
  //   GoogleSignin.revokeAccess();
  //   GoogleSignin.signOut();
  // };

  return (
    <View style={styles.container}>
      {error && <Text>{"could not log in"}</Text>}
      {error && <Text>{JSON.stringify(error)}</Text>}
      <Text style={styles.title}>Insect Tracker App</Text>
      <Image source={require('/Users/seanhakmon/Projects/insect-tracker/insect-app/assets/LOGO.png')} style={styles.logo} />
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
    </View>
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
    fontFamily: 'Montserrat'
  },
  // customGoogleButton: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   backgroundColor: '#FFFFFF', // White background color for the button
  //   paddingHorizontal: 25,
  //   paddingVertical: 8,
  //   borderRadius: 20, // High border radius for a pill shape
  //   shadowColor: "#000",
  //   shadowOffset: {
  //     width: 0,
  //     height: 2,
  //   },
  //   shadowOpacity: 0.25,
  //   shadowRadius: 3.84,
  //   elevation: 5,
  // },
  buttonText: {
    marginLeft: 10,
    color: '#DB4437', // Google red color for the text
    fontSize: 16,
    
  }
});


