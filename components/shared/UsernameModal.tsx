import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';

interface Props {
  visible: boolean;
  onSave: (username: string) => void;
}

export function UsernameModal({ visible, onSave }: Props) {
  const [username, setUsername] = useState('');

  function handleSave() {
    const trimmed = username.trim();
    if (trimmed.length > 0) onSave(trimmed);
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome to SmartTask</Text>
          <Text style={styles.subtitle}>What should we call you?</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            value={username}
            onChangeText={setUsername}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          <TouchableOpacity
            style={[styles.button, username.trim().length === 0 && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={username.trim().length === 0}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 28,
    width: '85%',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    color: Colors.text,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
