// components/FormInput.tsx

import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface FormInputProps {
  control: Control<any>; // Use 'any' for generic form control, or specify your FormData type
  name: string;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  errors: FieldErrors<any>; // Use 'any' for generic errors
}

export const FormInput: React.FC<FormInputProps> = ({
  control,
  name,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  errors,
}) => {
  return (
    <View style={styles.inputContainer}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            // Using Tailwind classes (assuming they are set up in your project)
            className="bg-zinc-800 text-white rounded-lg px-4 py-3 border border-zinc-600"
            placeholder={placeholder}
            placeholderTextColor="#a3a3a3"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            style={errors[name] && styles.inputErrorBorder} // Apply error border style
          />
        )}
      />
      {/* Display error message */}
      {errors[name] && <Text style={styles.errorText}>{errors[name]?.message as string}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16, // Space between inputs
  },
  inputErrorBorder: {
    borderColor: 'red', // Red border for inputs with errors
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4, // Align with input padding
  },
});