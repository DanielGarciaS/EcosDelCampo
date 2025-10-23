import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState('comprador');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    // Validaciones
    if (!nombre || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    const result = await register({
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      password,
      rol,
      telefono: telefono.trim(),
    });
    setLoading(false);

    if (!result.success) {
      Alert.alert('Error', result.message);
    }
    // Si es exitoso, la navegación se maneja automáticamente
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🌾</Text>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a Ecos del Campo</Text>
        </View>

        <View style={styles.form}>
          {/* Selector de Rol */}
          <Text style={styles.label}>¿Qué tipo de cuenta deseas?</Text>
          <View style={styles.rolContainer}>
            <TouchableOpacity
              style={[
                styles.rolButton,
                rol === 'comprador' && styles.rolButtonActiveComprador,
              ]}
              onPress={() => setRol('comprador')}
              disabled={loading}
            >
              <Text
                style={[
                  styles.rolButtonText,
                  rol === 'comprador' && styles.rolButtonTextActive,
                ]}
              >
                🛒 Comprador
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.rolButton,
                rol === 'agricultor' && styles.rolButtonActiveAgricultor,
              ]}
              onPress={() => setRol('agricultor')}
              disabled={loading}
            >
              <Text
                style={[
                  styles.rolButtonText,
                  rol === 'agricultor' && styles.rolButtonTextActive,
                ]}
              >
                🌾 Agricultor
              </Text>
            </TouchableOpacity>
          </View>

          {/* Campos del formulario */}
          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Juan Pérez"
            value={nombre}
            onChangeText={setNombre}
            editable={!loading}
            placeholderTextColor={Colors.gray}
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
            placeholderTextColor={Colors.gray}
          />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            placeholder="3331234567"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            editable={!loading}
            placeholderTextColor={Colors.gray}
          />

          <Text style={styles.label}>Contraseña *</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
            placeholderTextColor={Colors.gray}
          />

          <Text style={styles.label}>Confirmar contraseña *</Text>
          <TextInput
            style={styles.input}
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!loading}
            placeholderTextColor={Colors.gray}
          />

          {/* Botón de Registro */}
          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.buttonDisabled,
              { backgroundColor: rol === 'agricultor' ? Colors.agricultor : Colors.comprador },
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          {/* Link a Login */}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta?{' '}
              <Text style={styles.linkTextBold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  emoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray,
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  rolContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  rolButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.gray,
    alignItems: 'center',
  },
  rolButtonActiveComprador: {
    backgroundColor: Colors.comprador,
    borderColor: Colors.comprador,
  },
  rolButtonActiveAgricultor: {
    backgroundColor: Colors.agricultor,
    borderColor: Colors.agricultor,
  },
  rolButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  rolButtonTextActive: {
    color: Colors.white,
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: Colors.gray,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  linkTextBold: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
