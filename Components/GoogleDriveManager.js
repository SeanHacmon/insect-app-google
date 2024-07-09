import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  GDrive,
  MimeTypes
} from "@robinbobin/react-native-google-drive-api-wrapper";
import Button from "./Button";
import { StyleSheet, View, Text, TouchableOpacity, ToastAndroid} from 'react-native';

export default function GoogleDriveManager(userInfo, token){
  const createFolder = async () =>{
    GoogleSignin.configure();
    await GoogleSignin.signIn();
    
    const gdrive = new GDrive();
    gdrive.accessToken = (await GoogleSignin.getTokens()).accessToken;
    ToastAndroid(gdrive.accessToken,SHORT);
    console.log(await gdrive.files.list());

    const folderIdNotItsName = "root";

    await gdrive.files.list({
      q: new ListQueryBuilder()
        .e("name", "Untitled")
        .and()
        .in(folderIdNotItsName, "parents")
    });
    // const bodyData = JSON.stringify({
    //   name: `${userName}'s Folder`,
    //   mimeType: 'application/vnd.google-apps.folder'
    // });
  
    // const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    //   method: 'POST',
    //   headers: {
    //     Authorization: `Bearer ${accessToken}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: bodyData
    // });
  
    // const responseData = await response.json();
    // console.log('Folder created:', responseData);
    
    
    // console.log(await gdrive.files.getBinary(id));
  } 

  return (
    <View>
      <Button onPress={()=>{createFolder}} icon={'google-drive'} styles={styles.driveButton} >
        <Text>Drive</Text>  
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({

  googleApi: {
    
    height: 45,
    margin: 18,
    borderWidth: 2,
    padding: 10,
    borderColor: 'rgba(255, 255, 255, 0.333)',
    backgroundColor: 'azure',
    color: '#7e97b8',
    fontFamily: 'inherit',
    borderRadius: 8,
    borderStyle: 'solid',
    width: 100,
    fontSize: 16,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'mediumturquoise',
  },
  driveButton:{
    marginTop: 10,
  },
});