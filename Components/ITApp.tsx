import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ToastAndroid, View, Text, Image, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, CameraCapturedPicture, useCameraPermissions} from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import Button from './Button'
import {
  GDrive,
  ListQueryBuilder,
  MimeTypes
} from "@robinbobin/react-native-google-drive-api-wrapper";
import RNFetchBlob from 'react-native-blob-util';
import { imageCropper } from './ImageCropper';
import { driveImageUploader } from './DriveUploader';

export default function ITApp({logoutFunction,gdrive, setConfigure, setSettings, intervalTime, experimentName, userInfo}) {

  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMicrophonePermission, setMicrophonePermission] = useState(null);
  const [folderId, setFolderId] = useState(null);
  const [facing, setFacing] = useState('back');
  const [inputAllow, setinputAllow] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [image, setImage] = useState<CameraCapturedPicture>(null);
  const [recordingFinished, setRecordingFinished] = useState(false); // New state
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const intervalIdRef = useRef(null);
  const [images, setImages] = useState<CameraCapturedPicture[]>([]);

  let drive: GDrive = gdrive;
  
  useEffect(() => { 
    
    createFolder(experimentName);

    (async () => {
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(mediaLibraryStatus.status === 'granted');
    })();
        
  }, []);

  const createFolder = async (folderName: string) => {
    try {

      let status: any = await drive
        .files
        .createIfNotExists(
          {
            q: new ListQueryBuilder()
              .e('name', folderName)
              .and()
              .e('mimeType', MimeTypes.FOLDER)
              .and()
              .in('root', 'parents'),
          },
         await gdrive.files.newMetadataOnlyUploader().setRequestBody({
            name: folderName,
            mimeType: MimeTypes.FOLDER,
            parents: ['root'],
          }),
        )

        if(status.alreadyExisted){
          console.log('folder already exists', status.result.id);
          setFolderId(status.result.id);
        } else {
          console.log('new folder created', status.result.id);
          setFolderId(status.result.id);
        }
      
    } catch (error) {
        console.error('Failed to create folder:', error);
    }
}; 


  const takePicture = async () => {

    setImage(null);
    
    if (cameraRef) {
      try {
        console.log("taking a photo..");
        const data = await cameraRef.current.takePictureAsync();
        // console.log(data);
        setImage(data);
        // if (isRecording) {
        console.log("got image");
        setImages(prevArr => ([...prevArr, data])); // Add the image URI to the images array
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
    for (const img of images) {
      let file = await RNFetchBlob.fs.stat(img.uri)
      let size = file.size / 1024 / 1024; // covert to MB

      let filename = img.uri.substring(img.uri.lastIndexOf('/') + 1);

      let extension = img.uri.substring(img.uri.lastIndexOf('.') + 1);

      if (size > 5 && size < 7) {

        console.log('Image size is bigger then 5mb, and less then 7mb');
        console.log('cropping ...')
        
        let resizedImage = await imageCropper({
          uri: img.uri,
          width: img.width,
          height: img.height,
        })

        let newSize = (await RNFetchBlob.fs.stat(resizedImage.uri)).size / 1024 / 1024; // convert to MB

        if (newSize > 5) {
          console.log('croped image size is bigger than 5 mb');
          return
        }

        let status = await driveImageUploader({
          drive,
          base64: resizedImage.base64,
          extension,
          filename,
          folderId,
        })

        console.log('File uploaded successfully: ', { status });

        setImage(null);

      } else if (size <= 5) {

        let imageBase64 = await RNFetchBlob.fs.readFile(img.uri, 'base64');

        let status = await driveImageUploader({
          drive,
          base64: imageBase64,
          extension,
          filename,
          folderId,
        })

        console.log('File uploaded successfully: ', { status });

        setImage(null);
      } else {
        console.log('imagee size is too big');
        return;
      }
    }
    setImages([]);
  };
 
  let uploadMultiImages = async ()=>{
    
    try {
    Promise.all(images.map(async (image,i) => {

      let file = await RNFetchBlob.fs.stat(image.uri);

      let size = file.size / 1024 / 1024; // covert to MB

      let filename = image.uri.substring(image.uri.lastIndexOf('/') + 1);

      let extension = image.uri.substring(image.uri.lastIndexOf('.') + 1);

      if (size > 5 && size < 7) {

        console.log('Image size is bigger then 5mb, and less then 7mb');
        console.log('cropping ...')
        
        let resizedImage = await imageCropper({
          uri: image.uri,
          width: image.width,
          height: image.height,
        })
  
        let newSize = (await RNFetchBlob.fs.stat(resizedImage.uri)).size / 1024 / 1024; // convert to MB
  
        if (newSize > 5) {
          console.log('croped image size is bigger than 5 mb');
          return
        }
  
        let status = await driveImageUploader({
          drive,
          base64: resizedImage.base64,
          extension,
          filename,
          folderId,
        })
  
        console.log('File uploaded successfully: ', { status });
  
        setImages([]);
  
      } else if (size <= 5) {
  
        let imageBase64 = await RNFetchBlob.fs.readFile(image.uri, 'base64');
  
        let status = await driveImageUploader({
          drive,
          base64: imageBase64,
          extension,
          filename,
          folderId,
        })
  
        console.log('File uploaded successfully: ', { status });
  
        setImage(null);
        setImages([]);
      } else {
        console.log('image size is too big');
        return;
      }

    }))
  } catch (err) {
    console.log('error uploading multiple uploaded', err.message);
  }
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => setSettings()} style={styles.experimentTitle}>
          <Image source={require('../assets/LOGO.png')} style={styles.logoSettings} text={experimentName}/>
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
