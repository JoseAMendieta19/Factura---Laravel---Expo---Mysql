import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colores } from '../styles/comunes';

export default function ContenedorFormulario({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colores.fondo }} behavior="padding">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 + insets.bottom }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}