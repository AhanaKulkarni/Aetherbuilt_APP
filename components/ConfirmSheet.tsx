import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Colors } from '../theme/tokens';
import * as Haptics from 'expo-haptics';

interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message: string;
  confirmStyle?: 'danger' | 'success' | 'primary';
  confirmText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmSheet({ visible, title, message, confirmStyle = 'primary', confirmText = 'Confirm', onConfirm, onClose }: ConfirmSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const getConfirmColor = () => {
    switch (confirmStyle) {
      case 'danger': return Colors.accentRed;
      case 'success': return Colors.accentGreen;
      default: return Colors.accentBlue;
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['35%']}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
      )}
      backgroundStyle={{ backgroundColor: Colors.surface }}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        
        <View style={styles.buttonRow}>
          <Pressable style={styles.cancelBtn} onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            bottomSheetRef.current?.dismiss();
          }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable style={[styles.confirmBtn, { backgroundColor: getConfirmColor() }]} onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onConfirm();
            bottomSheetRef.current?.dismiss();
          }}>
            <Text style={styles.confirmText}>{confirmText}</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  contentContainer: { flex: 1, padding: 24, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12, textAlign: 'center' },
  message: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  buttonRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 'auto' },
  cancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, backgroundColor: Colors.background, marginRight: 12, alignItems: 'center' },
  cancelText: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  confirmBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  confirmText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
