import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Entypo } from '@expo/vector-icons';

export default function Button({ title, styles ,onPress, icon, color, image }) {
    return (
        <TouchableOpacity onPress={onPress} style={styles}>
            {icon ? (
                <Entypo name={icon} size={28} color={color ? color : '#f1f1f1'} />
            ) : (
                image && <Image source={require('/Users/seanhakmon/Projects/insect-tracker/insect-app/assets/LOGO.png')} />
            )}
            <Text style={styles}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    buttons:{
        height:40,
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text:{
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize:16,
        color: '#f1f1f1',
        marginLeft: 10
    }
})