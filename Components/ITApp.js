import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ToastAndroid, View, Text, Image, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions} from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import Button from './Button'
import { GoogleSignin, GoogleAuth } from "@react-native-google-signin/google-signin";
import {
  GDrive,
  MimeTypes
} from "@robinbobin/react-native-google-drive-api-wrapper";
import axios from 'axios';



export default function ITApp({logoutFunction, setConfigure, setSettings, intervalTime, experimentName, userInfo}) {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMicrophonePermission, setMicrophonePermission] = useState(null);

  const [facing, setFacing] = useState('back');
  const [inputAllow, setinputAllow] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [image, setImage] = useState(null);
  const [recordingFinished, setRecordingFinished] = useState(false); // New state
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const intervalIdRef = useRef(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    (async () => {
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(mediaLibraryStatus.status === 'granted');
    })();
  }, []);

  const createFolder = async (folderName) => {
    try {
        const accessToken = (await GoogleSignin.getTokens()).accessToken;  // Make sure you have valid token
        // ToastAndroid.show(GoogleSignin.getTokens().accessToken, ToastAndroid.SHORT);
        
        axios.post('https://www.googleapis.com/drive/v3/files', {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder'
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          console.log('Folder created with ID:', response.data.id);
        })
        .catch(error => {
          console.error('Failed to create folder:', error.response.data);
        });
      
        // console.log('Folder created with ID:', response.data.id);
        // return response.data;
    } catch (error) {
        console.error('Failed to create folder:', error);
        throw error;
    }
};

//GoogleSignin.getTokens()
  const takePicture = async () => {
    if (cameraRef) {
      try {
        console.log("taking a photo..");
        const data = await cameraRef.current.takePictureAsync();
        ToastAndroid.show(data.uri, ToastAndroid.SHORT);
        console.log(data);
        setImage(data.uri);
        // if (isRecording) {
        console.log("got image");
        setImages(prevArr => [...prevArr, data.uri]); // Add the image URI to the images array
        // } else {
        //   setRecordingFinished(true); // Set recordingFinished to true after taking picture
        saveImage(); // Save the single image
        // }
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    } else {
      console.error('Camera reference is null');
    }
  };
  
  const toggleCameraFacing = async() => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const recordVideo = async () => {
    if (!isRecording) {
      setIsRecording(true);
      console.log("recording........")
    }
    if (isRecording) {
      setIsRecording(false);
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
      setRecordingFinished(true);
      return;
    }
    setRecordingFinished(false);
    intervalIdRef.current = setInterval(takePicture, intervalTime * 1000);
  };


  const saveImage = async () => {
    createFolder("folder1");
    try {
      if (images.length > 0) {
        for (const img of images) {
          await MediaLibrary.createAssetAsync(img);
          setImage(null);
        }
        setImages([]);
      }
    } catch (e) {
      console.log(e);
    }
  };
//   ToastAndroid.show('A pikachu appeared nearby !', ToastAndroid.SHORT);
  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => setSettings()} style={styles.experimentTitle}>
          <Image source={require('/Users/seanhakmon/Projects/insect-tracker/insect-app/assets/LOGO.png')} style={styles.logoSettings} text={experimentName}/>
          <View style={styles.titleContainer}>
            <Text style={styles.experimentTitle}>{experimentName}</Text>
          </View>
          {/* <View>
            <GoogleDriveManager userInfo={userInfo}/>
          </View> */}
      </TouchableOpacity>
      {/* <Image source={require('/Users/seanhakmon/Projects/insect-tracker/insect-app/assets/LOGO.png')} /> */}
        <CameraView style={styles.camera} facing={facing} ref={cameraRef} zoom={0} />
      </View>
      <View style={styles.buttonContainer}>
        {(image && !isRecording) ? (
         <View>
         {!isRecording && images && (
           <>
             <Button title={'Retake'} icon="retweet" onPress={() => setImage(null)} />
             <Button title={'Save'} icon="check" onPress={saveImage} />
           </>
         )}
       </View>
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <Button icon="camera" onPress={takePicture} />
            <Button icon={'controller-record'} color={isRecording ? 'red' : null} onPress={recordVideo} />
            <Button icon={'cycle'} onPress={toggleCameraFacing}/>
            <Button icon={'log-out'} onPress={()=>{
              logoutFunction(); 
              setConfigure(false);}} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  experimentTitle: {
    flexDirection: 'row',
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 2,
    backgroundColor: 'black',
    // textAlign: 'center',
  },
  titleContainer: {
    flex: 1, 
    alignItems: 'center', 
    // left: 135
  },
  logoSettings: {
    height: 45,
    width: 45,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    color: 'white',
  },
  camera: {
    flex: 1,
    borderRadius: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingBottom: 5,
    marginTop: 20
  },
  button: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 5,
  },
  text: {
    color: '#000000',
    fontWeight: 'bold',
  },
});
