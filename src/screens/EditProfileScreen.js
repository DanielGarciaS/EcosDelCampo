import React, { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints';

export default function EditProfileScreen({ navigation, route }) {
  const { user, token, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [ubicacion, setUbicacion] = useState(user?.ubicacion || '');

  const handleSaveProfile = async () => {
    if (!nombre.trim() || !email.trim()) {
      Alert.alert('Error', 'El nombre y email son requeridos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Intentando actualizar perfil a:', `${ENDPOINTS.PROFILE}`);
      console.log('📦 Datos:', { nombre, email, telefono, ubicacion });
      console.log('🔑 Token:', token?.substring(0, 10) + '...');

      const response = await axios.post(
        ENDPOINTS.PROFILE,
        {
          nombre,
          email,
          telefono,
          ubicacion,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Respuesta:', response.data);

     if (response.data.success || response.data.data) {
  // Actualizar el contexto con los nuevos datos
  const updatedUser = response.data.data || {
    ...user,
    nombre,
    email,
    telefono,
    ubicacion,
  };
  
  // Guardar en SecureStore también
  await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
  
  // Actualizar el contexto
  setUser(updatedUser);

  Alert.alert('Éxito', 'Perfil actualizado correctamente');
  navigation.goBack();
}

    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ Response:', error.response?.data);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ URL:', error.config?.url);
      console.error('❌ Method:', error.config?.method);
      
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'No se pudo actualizar el perfil'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Editar perfil</Text>
      </View>

      {/* Nombre */}
      <View style={styles.section}>
        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu nombre"
          placeholderTextColor={Colors.textSecondary}
          value={nombre}
          onChangeText={setNombre}
          editable={!loading}
        />
      </View>

      {/* Email */}
      <View style={styles.section}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          placeholderTextColor={Colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          editable={!loading}
        />
      </View>

      {/* Teléfono */}
      <View style={styles.section}>
        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          placeholder="123456789"
          placeholderTextColor={Colors.textSecondary}
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
          editable={!loading}
        />
      </View>

      {/* Ubicación */}
      <View style={styles.section}>
        <Text style={styles.label}>Ubicación</Text>
        <TextInput
          style={styles.input}
          placeholder="Ciudad, País"
          placeholderTextColor={Colors.textSecondary}
          value={ubicacion}
          onChangeText={setUbicacion}
          editable={!loading}
        />
      </View>

      {/* Botones */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && { opacity: 0.6 }]}
          onPress={handleSaveProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color={Colors.white} />
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Ionicons name="close" size={20} color={Colors.textSecondary} />
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  section: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    gap: 10,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 40,
  },
});
