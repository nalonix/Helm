// src/components/QRScanner.tsx
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';

export default function QRScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    setScanned(true);
    console.log(`QR Code Scanned!`);
    console.log(`Type: ${type}`);
    console.log(`Data: ${data}`); // The QR code content

    Alert.alert(
      'QR Code Scanned!',
      `Data: ${data}`,
      [{ text: 'OK', onPress: () => setScanned(false) }]
    );
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
    <View className='flex-1 flex-col justify-center items-center bg-black'>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        // NativeWind equivalent of StyleSheet.absoluteFillObject
        className='absolute inset-0'
      />
      {scanned && (
        // Position the "Scan Again" button over the camera view
        <View className='absolute bottom-10'>
          <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
        </View>
      )}
      <Text className='mt-20 text-lg text-white bg-black/50 p-2.5 rounded-md'>
        Scan a QR Code
      </Text>
    </View>
  );
}