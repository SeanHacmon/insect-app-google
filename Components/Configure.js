import React from 'react';
import { ImageBackground, useState, StyleSheet, TextInput, SafeAreaView, Button, TouchableOpacity, Text} from 'react-native';

function Configure({setIntervalTime, setExperimentName, setConfigure}) {
    const [text, onChangeText] = React.useState('');
    const [number, onChangeNumber] = React.useState('');
    return (
        <ImageBackground source={require('../assets/leafBackground.jpeg')} style={styles.container}>
            <Text style={styles.title}> Experiment Configuration </Text>
        <TextInput
            style={styles.input}
            onChangeText={onChangeText}
            value={text}
            placeholder="Experiment Name"
        />
        <TextInput
            style={styles.input}
            onChangeText={onChangeNumber}
            value={number}
            placeholder="Interval Time"
            keyboardType="numeric"
        />
        
        <TouchableOpacity style={styles.button} onPress={()=> {
            setExperimentName(text);
            setIntervalTime(number);
            if (text && number){setConfigure(true);}

        }}>
            <Text> Continue</Text>
        </TouchableOpacity>
        </ImageBackground>
  );
}
  const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00695c',
        
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        
    },
    title: {
        fontSize: 48,
        fontFamily: 'Futura',
        fontStyle: 'bold',
        color: 'white',
        margin: 24,

    },
    button: {
        height: 40,
        margin: 18,
        borderWidth: 2,
        padding: 10,
        borderColor: 'rgba(255, 255, 255, 0.333)',
        backgroundColor: 'azure',
        color: '#7e97b8',
        fontFamily: 'inherit',
        borderRadius: 8,
        borderStyle: 'solid',
        width: 200,
        fontSize: 16,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'mediumturquoise'
        
    },
    input: {
      height: 40,
      margin: 18,
      borderWidth: 1,
      padding: 10,
      borderColor: 'rgba(255, 255, 255, 0.333)',
      backgroundColor: '#e0e8ef',
      color: '#7e97b8',
      fontFamily: 'inherit',
      borderRadius: 8,
      borderStyle: 'solid',
      width: 200,
      fontSize: 16,
      textAlign: 'center',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  export default Configure;