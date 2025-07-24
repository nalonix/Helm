// src/components/QRScanner.tsx
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native'; // Import StyleSheet

export default function QRScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    setScanned(true);
    console.log(`QR Code Scanned!`);
    console.log(`Type: ${type}`);
    console.log(`Data: ${data}`); // The QR code content

    // Alert.alert(
    //   'QR Code Scanned!',
    //   `Data: ${data}`,
    //   [{ text: 'OK', onPress: () => setScanned(false) }]
    // );
  };

  if (!permission) {
    return (
      <View className='flex-1 flex-col justify-center items-center bg-black'>
        <Text className='text-white'>Requesting for camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className='flex-1 flex-col justify-center items-center bg-black p-4'>
        <Text className='text-white text-center mb-5'>
          We need your permission to show the camera.
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <View className='aspect-square flex flex-col justify-center items-center overflow-hidden rounded-lg bg-black'>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        facing='back'
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        style={styles.cameraPreview}
      />
      {scanned ? (
        <View className='absolute top-1/2 z-10'>
          <Button title={'Tap To Scan New'} onPress={() => setScanned(false)} />
        </View>
      ) : (
        <Text className='absolute top-1/2 text-lg text-white bg-black/50 p-2.5 rounded-md z-10'>
            Scan A Ticket
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cameraPreview: {
    ...StyleSheet.absoluteFillObject
  },
});