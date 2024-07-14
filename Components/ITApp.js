import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ToastAndroid, View, Text, Image, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions} from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import Button from './Button'
import { GoogleSignin, GoogleAuth } from "@react-native-google-signin/google-signin";
import axios from 'axios';
import {
  GDrive,
  MimeTypes
} from "@robinbobin/react-native-google-drive-api-wrapper";
import RNFS from 'react-native-fs';
import RNFetchBlob from 'react-native-blob-util';

export default function ITApp({logoutFunction, setConfigure, setSettings, intervalTime, experimentName, userInfo}) {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMicrophonePermission, setMicrophonePermission] = useState(null);
  const [folderId, setFolderId] = useState(null);
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
    createFolder(experimentName);
  }, []);
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
        
        const response = axios.post('https://www.googleapis.com/drive/v3/files', {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder'
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          setFolderId(response.data.id);
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

  const takePicture = async () => {
    if (cameraRef) {
      try {
        console.log("taking a photo..");
        const data = await cameraRef.current.takePictureAsync();
        // ToastAndroid.show(data.uri, ToastAndroid.SHORT);
        console.log(data);
        setImage(data);
        // if (isRecording) {
        console.log("got image");
        setImages(prevArr => [...prevArr, data.uri]); // Add the image URI to the images array
        // } else {
        //   setRecordingFinished(true); // Set recordingFinished to true after taking picture
        // saveImage(); // Save the single image
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
     const accessToken = (await GoogleSignin.getTokens()).accessToken;
    try {
      // Step 1: Create a Blob from a simple text string
      const fileContent = "Hello, this is a demo file."; // Content of the file
      const blob = new Blob([fileContent], { type: 'text/plain' });
  
      // Step 2: Create FormData to send in the fetch request
      const formData = new FormData();
      formData.append('file', blob, 'demo.txt');
      formData.append('metadata', new Blob([JSON.stringify({
        name: 'demo.txt',
        mimeType: 'text/plain'
      })], { type: 'application/json' }));
  
      // Step 3: Make the fetch request to upload the file to Google Drive
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/related', // This header is necessary for multipart uploads
        },
        body: formData
      });
  
      // Step 4: Process the response
      if (response.ok) {
        const data = await response.json();
        console.log('File uploaded successfully:', data);
        return data;
      } else {
        const errorText = await response.text();
        throw new Error('Failed to upload file: ' + errorText);
      }
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      throw error;
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
// const saveImage = async () => {
//   if (!folderId) {
//     console.error("Folder ID is not set.");
//     return;
//   }
//   const accessToken = (await GoogleSignin.getTokens()).accessToken;
//   try {
//     if (images.length > 0) {
//       ToastAndroid.show(folderId, ToastAndroid.SHORT);
//       for (const img of images) {
//         const response = await fetch(img);
//         const blob = await response.blob();
//         const formData = new FormData();
//         formData.append('file', blob, { type: 'image/jpeg' });
//         formData.append('metadata', new Blob([JSON.stringify({
//           name: 'uploaded_image.jpg',  // Customize the file name as needed
//           parents: [folderId],  // Folder ID where the file will be saved
//           mimeType: 'image/jpeg',
//         })], { type: 'application/json' }));
        
//         await MediaLibrary.createAssetAsync(img);
//         setImage(null);
//         const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${accessToken}`,
//           'Content-Type': 'multipart/related',
//         },
//         body: formData,
//       });
//       const uploadData = await uploadResponse.json();
//       console.log('Upload successful:', uploadData);
//       }
      
//       setImages([]);
//     }
//   } catch (e) {
//     console.log(e);
//   }
// };


// version2 
// const saveImage = async () => {
//   if (!folderId) {
//     console.error("Folder ID is not set.");
//     return;
//   }
//   const accessToken = (await GoogleSignin.getTokens()).accessToken;
//   if (!accessToken) {
//     ToastAndroid.show("bad access token", ToastAndroid.SHORT);
//     return;
//   }
//     if (images.length > 0) {
//       ToastAndroid.show(folderId, ToastAndroid.SHORT);
//       for (const img of images) {
//         try {
//         const response = await fetch(img);
//         const blob = await response.blob();
//         const formData = new FormData();
//         formData.append('metadata', new Blob([JSON.stringify({
//           name: 'uploaded_image.jpg',  // Customize the file name as needed
//           parents: [folderId],  // Folder ID where the file will be saved
//           mimeType: 'image/jpeg',
//         })]));
//         formData.append('file', blob, { type: 'image/jpeg' });
//         await MediaLibrary.createAssetAsync(img);
//         setImage(null);
        
//         const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${accessToken}`,
//           'Content-Type': 'multipart/related',
//         },
//         body: formData,
//       })

//       if (uploadResponse.ok) {
//         ToastAndroid.show('Upload successful', ToastAndroid.SHORT);
//         const uploadData = await uploadResponse.json();
//         console.log('Upload successful:', uploadData);
//       } else {
//         console.error('Upload failed:', await uploadResponse.text());
//         ToastAndroid.show('Upload failed', ToastAndroid.SHORT);
//       }
//     }
//     catch (e) {
//      console.log(e);
//    }
//       }
      
//       setImages([]);
//     }
// };

// version 3
// const saveImage = async () => {
  //   if (!folderId) {
  //     console.error("Folder ID is not set.");
  //     return;
  //   }
  
  //   const accessToken = (await GoogleSignin.getTokens()).accessToken;
  //   if (!accessToken) {
  //     console.error("Access token is not available.");
  //     return;
  //   }
  
  //   // Create an empty Blob for a .txt file
  //   const blob = new Blob([''], { type: 'text/plain' });
  //   let formData = new FormData();
  //   formData.append('metadata', new Blob([JSON.stringify({
  //     name: 'empty_file.txt',
  //     parents: [folderId],
  //     mimeType: 'text/plain',
  //   })], { type: 'application/json' }));
  //   formData.append('file', blob, 'empty_file.txt');
    
  //   try {
  //     const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${accessToken}`,
  //         'Content-Type': 'application/json'
  //       },
  //       body: formData,
  //     });
  
  //     if (uploadResponse.ok) {
  //       const uploadData = await uploadResponse.json();
  //       console.log('Upload successful:', uploadData);
  //     } else {
  //       console.error('Upload failed:', await uploadResponse.text());
  //     }
  //   } catch (error) {
  //     console.error('Error during the upload:', error);
  //   }
  // };

  // version 4 
  // const saveImage = async () => {
  //   if (!folderId) {
  //     ToastAndroid.show('folder id is null', ToastAndroid.SHORT);
  //   }
  //   const accessToken = (await GoogleSignin.getTokens()).accessToken;
  //   if (!accessToken) {
  //     ToastAndroid.show('accesstoken is null', ToastAndroid.SHORT);
  //   }
  //   try {
  //     if (image) {
  //       ToastAndroid.show(folderId, ToastAndroid.SHORT);
  //       // for (const img of images) {
  //         const response = await fetch(image);
  //         const blob = await response.blob();
  //         const formData = new FormData();
  //         formData.append('metadata', new Blob([JSON.stringify({
  //           name: 'uploaded_image.jpg',  // Customize the file name as needed
  //           parents: [folderId],  // Folder ID where the file will be saved
  //           mimeType: 'image/jpeg',
  //           uri: image.uri
  //         })], { type: 'application/json' }));
  //         formData.append('file', blob);
  //         const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', formData ,{
  //         method: 'POST',
  //         headers: {
  //           'Authorization': `Bearer ${accessToken}`,
  //           'Content-Type': 'multipart/related',
  //         },
          
  //       }).then(response => {
  //         ToastAndroid.show('Success', ToastAndroid.SHORT);
  //         })
  //         if (uploadResponse.ok) {
  //           const uploadData = await uploadResponse.json();
  //           console.log('Upload successful:', uploadData);
  //           ToastAndroid.show('Upload successful', ToastAndroid.SHORT);
  //         } else {
  //           const errorText = await uploadResponse.text();
  //           console.error('Upload failed:', errorText);
  //           ToastAndroid.show('Upload failed', ToastAndroid.SHORT);
  //         }
  //       // }
  //       await MediaLibrary.createAssetAsync(image);
  //       setImage(null);
  //       setImages([]);
  //     }
  //   }
  //    catch (e) {
  //     console.log(e);
  //   }
  // };


  // best version 

  // const saveImage = async () => {
  //   if (!folderId) {
  //     ToastAndroid.show('folder id is null', ToastAndroid.SHORT);
  //   }
  //   const accessToken = (await GoogleSignin.getTokens()).accessToken;
  //   if (!accessToken) {
  //     ToastAndroid.show('accesstoken is null', ToastAndroid.SHORT);
  //   }
  //   try {
  //     if (image) {
  //       ToastAndroid.show(image.uri, ToastAndroid.SHORT);
  //       // for (const img of images) {
  //         const response = await fetch(image.uri);
  //         const blob = await response.blob();
  //         const formData = new FormData();
  //         formData.append('metadata', new Blob(JSON.stringify({
  //           name: 'uploaded_image.jpg',  
  //           // parents: [folderId],  
  //           mimeType: 'image/jpeg',
  //           uri: image.uri
  //         }), { type: 'application/json' }));
  //         formData.append('file', blob);
  //         const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart' ,{
  //         method: 'POST',
  //         headers: {
  //           'Authorization': `Bearer ${accessToken}`,
  //           'Content-Type': 'multipart/related'
  //         },
  //         body: formData
  //       }).then(response => {
  //         ToastAndroid.show('Success', ToastAndroid.SHORT);
  //         })
  //         if (uploadResponse.ok) {
  //           const uploadData = await uploadResponse.json();
  //           console.log('Upload successful:', uploadData);
  //           ToastAndroid.show('Upload successful', ToastAndroid.SHORT);
  //         } else {
  //           const errorText = await uploadResponse.text();
  //           console.error('Upload failed:', errorText);
  //           ToastAndroid.show('Upload failed', ToastAndroid.SHORT);
  //         }
  //       // }
  //       await MediaLibrary.createAssetAsync(image);
  //       setImage(null);
  //       setImages([]);
  //     }
  //   }
  //    catch (e) {
  //     console.log(e);
  //   }
  // };