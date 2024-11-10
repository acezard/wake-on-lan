import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { BACKEND_URL } from '@env'; // Import the environment variable

const backendUrl = BACKEND_URL || 'http://192.168.1.177:8080';

export default function App() {
    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: `${backendUrl}` }}
                style={styles.webview}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    webview: {
        flex: 1,
    },
});
