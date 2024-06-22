import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useEffect, useState } from 'react';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';

export default function App() {
  const [error, setError] = useState();
  const [userInfo, setUserInfo] = useState();
  useEffect(() => {
    GoogleSignin.configure();
  }, []);

  const signin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const user = await GoogleSignin.signIn();
      setUserInfo(user);
      setError();
    } catch (e) {
      console.log('Error during sign-in:', e); // Add this line
      setError(e);
    }
  };

  const logout = () => {
    setUserInfo();
    GoogleSignin.revokeAccess();
    GoogleSignin.signOut();
  };

  return (
    <View style={styles.container}>
      {error && <Text>{"could not log in"}</Text>}
      {error && <Text>{JSON.stringify(error)}</Text>}
      {userInfo && <Text>{JSON.stringify(userInfo)}</Text>}
      {userInfo ? (
        <Button title="Logout" onPress={logout} />
      ) : (
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Standard}
          color={GoogleSigninButton.Color.Dark}
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
