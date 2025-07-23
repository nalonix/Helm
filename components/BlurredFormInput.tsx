import { BlurView, BlurViewProps } from '@react-native-community/blur';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FormInput, FormInputProps } from './FormInput';

interface BlurredFormInputProps extends FormInputProps {
  // Directly specify blur-related props from BlurViewProps
  blurType?: BlurViewProps['blurType'];
  blurAmount?: BlurViewProps['blurAmount'];
  // removed: reducedTransparencyFallbackColor?: BlurViewProps['reducedTransparencyFallbackColor'];
  style?: any; // Add a style prop for the BlurView's container or the BlurView itself
}

export const BlurredFormInput: React.FC<BlurredFormInputProps> = ({
  style,
  blurType = 'light', // Default blur type
  blurAmount = 10, // Default blur amount
  // removed: reducedTransparencyFallbackColor,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <BlurView
        style={[styles.blurView, StyleSheet.absoluteFill, style]}
        blurType={blurType}
        blurAmount={blurAmount}
        // removed: reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
      />
      <FormInput {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%', // Example: take full width
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10, // Match the input's border-radius for visual consistency
    overflow: 'hidden', // Essential for borderRadius to work with BlurView
  },
});