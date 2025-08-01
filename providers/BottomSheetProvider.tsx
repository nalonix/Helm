// src/providers/BottomSheetProvider.tsx
import { Feather } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { createContext, useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define the context type
export interface BottomSheetContextType {
  openSheet: (
    content: React.ComponentType<any>, // The React component to render inside the sheet
    props?: Record<string, any>,      // Props to pass to the content component
    headerTitle?: string              // Optional header title for the sheet
  ) => void;
  closeSheet: () => void;
}

export const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined);

// Define the props for the provider
interface BottomSheetProviderProps {
  children: React.ReactNode;
}

export const BottomSheetProvider: React.FC<BottomSheetProviderProps> = ({ children }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [sheetContent, setSheetContent] = useState<React.ComponentType<any> | null>(null);
  const [sheetProps, setSheetProps] = useState<Record<string, any>>({});
  const [sheetHeaderTitle, setSheetHeaderTitle] = useState<string | undefined>(undefined);

  // Snap points for full screen: 1% (almost closed) to 100% (full screen)
  const snapPoints = useMemo(() => ['65%'], []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      // When sheet is fully closed, clear its content and props
      setSheetContent(null);
      setSheetProps({});
      setSheetHeaderTitle(undefined);
    }
  }, []);

  const openSheet = useCallback(
    (contentComponent: React.ComponentType<any>, props: Record<string, any> = {}, headerTitle?: string) => {
      setSheetContent(() => contentComponent); // Use a function to set state for component
      setSheetProps(props);
      setSheetHeaderTitle(headerTitle);
      bottomSheetRef.current?.snapToIndex(1); // Open to full screen
    },
    []
  );

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const contextValue = useMemo(
    () => ({ openSheet, closeSheet }),
    [openSheet, closeSheet]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  // The actual content component will be rendered here
  const ContentComponent = sheetContent;

  return (
    <BottomSheetContext.Provider value={contextValue}>
      {children}
      {/* The global BottomSheet is rendered here, outside the main app's layout flow */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1} // Start hidden
        enablePanDownToClose={true}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        // containerStyle={{ zIndex: 999 }} // Ensure it's above other content
      >
        <BottomSheetView style={styles.contentContainer}>
          {sheetContent && ( // Only render header and content if sheetContent is set
            <>
              {/* Header for the Bottom Sheet */}
              <View className='flex flex-row justify-between items-center mb-4 pb-2'>
                <Text className='text-3xl font-bold'>{sheetHeaderTitle || 'Details'}</Text>
                <TouchableOpacity
                  onPress={closeSheet} // Use the context's closeSheet function
                  className="p-1"
                >
                  <Feather name='x-circle' size={28} color="gray" />
                </TouchableOpacity>
              </View>

              {/* Dynamically rendered content component */}
              <View style={{ flex: 1 }}>
                {ContentComponent && <ContentComponent {...sheetProps} />}
              </View>
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    </BottomSheetContext.Provider>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});