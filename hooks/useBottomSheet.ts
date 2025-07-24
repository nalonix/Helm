// src/hooks/useBottomSheet.ts
import { BottomSheetContext, BottomSheetContextType } from '@/providers/BottomSheetProvider'; // Adjust path
import { useContext } from 'react';

export const useBottomSheet = (): BottomSheetContextType => {
  const context = useContext(BottomSheetContext);
  if (context === undefined) {
    throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  }
  return context;
};