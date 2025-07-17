import { cn } from '@/lib/cn';
import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

interface FormInputProps {
  control: Control<any>;
  name: string;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  errors: FieldErrors<any>;
  className?: string; 
  label?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  control,
  name,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  errors,
  className,
  label,
}) => {
  const hasError = errors[name];

  return (
    <View className="mb-4">
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
              "bg-white/10 border border-white/20 text-white rounded-xl px-6 py-3",
              hasError ? "border-red-500" : "border-white/20",
              className
            )}
            placeholder={placeholder}
            placeholderTextColor="#a38e7c"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
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