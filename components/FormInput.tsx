import { cn } from '@/lib/cn';
import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

export interface FormInputProps {
  control: Control<any>;
  name: string;
  placeholder: string;
  placeholderTextColor?: string; 
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  errors: FieldErrors<any>;
  className?: string;
  label?: string;
  multiline?: boolean; // Add multiline prop
  numberOfLines?: number; // Add numberOfLines prop for initial height hint
}

export const FormInput: React.FC<FormInputProps> = ({
  control,
  name,
  placeholder,
  placeholderTextColor = '#a38e7c', 
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  errors,
  className,
  label,
  multiline = false, // Default to false
  numberOfLines, // No default, let TextInput handle it if multiline is true
}) => {
  const hasError = errors[name];

  return (
    <View className="mb-2">
      {label && (
        <Text
          className="text-helm-beige text-base font-semibold mb-2 ml-1"
        >
          {label}
        </Text>
      )}

      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className={cn(
              "bg-white/10 border text-white rounded-xl px-6", 
              multiline ? "py-3 h-auto min-h-[48px]" : "py-3",
              hasError ? "border-red-500" : "border-white/20",
              className
            )}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            multiline={multiline} // Apply the multiline prop
            numberOfLines={numberOfLines} // Apply numberOfLines
            textAlignVertical={multiline ? 'top' : 'center'} // Often good for multiline inputs
          />
        )}
      />
      {hasError && (
        <Text
          className="text-red-500 text-xs mt-1 ml-1"
        >
          {errors[name]?.message as string}
        </Text>
      )}
    </View>
  );
};