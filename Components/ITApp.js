import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ToastAndroid, View, Text, Image, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions} from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import Button from './Button'
// import Authentication from './components/Authentication';
export default function ITApp({logoutFunction}) {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMicrophonePermission, setMicrophonePermission] = useState(null);

  const [facing, setFacing] = useState('back');
  const [inputAllow, setinputAllow] = useState(true);
  const [intervalTime, setIntervalTime] = useState(5);
  const [experimentName, setExperimentName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [image, setImage] = useState(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [showIntervalInput, setShowIntervalInput] = useState(false);
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
  
  useEffect(() => {
    if (image && !isRecording) {
      setExperimentName('');
      setShowTextInput(true);
    }
  }, [image, inputAllow, isRecording]);
  
  
  const saveInterval = (time) => {
    setIntervalTime(time);
    console.log('Interval Time:', time);
    setShowIntervalInput(false);
  };

  const saveExperimentName = (name) => {
    setExperimentName(name);
    console.log('Experiment Name:', name);
    setShowTextInput(false);
  };
// check
  const takePicture = async () => {
    if (cameraRef) {
      try {
        console.log("taking a photo..");
        const data = await cameraRef.current.takePictureAsync();
        // ToastAndroid.show(data.uri, ToastAndroid.SHORT);
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
    try {
      // if (image) {
      //   await MediaLibrary.createAssetAsync(image);
      //   setImage(null);
      // }
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
            <Button icon="clock" onPress={() => setShowIntervalInput(!showIntervalInput)} />
            <Button icon={'controller-record'} color={isRecording ? 'red' : null} onPress={recordVideo} />
            <Button icon={'cycle'} onPress={toggleCameraFacing}/>
            <Button icon={'log-out'} onPress={logoutFunction} />
            {/* <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity> */}
          </View>
        )}
      </View>
      {showTextInput && (
        <View>
          <Text style={styles.title}>Please enter experiment name</Text>
          <TextInput
          style={styles.input}
          value={experimentName}
          onChangeText={(input) => setExperimentName(input)}
          onSubmitEditing={() => saveExperimentName(experimentName)}
        />
        </View>
      )}
      {showIntervalInput &&  (
        <View>
          <Text style={styles.title}>Please enter interval time:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Interval Number"
            keyboardType="numeric"
            onChangeText={(input) => setIntervalTime(input)}
            onSubmitEditing={() => saveInterval(intervalTime)}
          />
        </View>
      )}
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
