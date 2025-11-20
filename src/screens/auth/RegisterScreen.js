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
import { validatePasswordStrength } from '../../utils/passwordValidator';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState('comprador');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  const { register } = useAuth();

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (text.length > 0) {
      setPasswordStrength(validatePasswordStrength(text));
    } else {
      setPasswordStrength(null);
    }
  };

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

    // Validar contraseña segura
    if (!passwordStrength || !passwordStrength.isStrong) {
      Alert.alert(
        'Contraseña débil',
        'La contraseña debe tener:\n• Al menos 8 caracteres\n• Mayúsculas\n• Minúsculas\n• Números\n• Caracteres especiales'
      );
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    const result = await register(nombre, email.toLowerCase().trim(), password, rol, telefono);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Error', result.message);
    }
  };

  const getStrengthBarColor = () => {
    if (!passwordStrength) return '#e0e0e0';
    return passwordStrength.color;
  };

  const getStrengthPercentage = () => {
    if (!passwordStrength) return 0;
    return (passwordStrength.strength / 5) * 100;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ecos del Campo</Text>
          <Text style={styles.subtitle}>Crea tu cuenta</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Nombre */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              value={nombre}
              onChangeText={setNombre}
              editable={!loading}
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Teléfono */}
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          {/* Rol */}
          <View style={styles.rolContainer}>
            <Text style={styles.rolLabel}>Registrarse como:</Text>
            <View style={styles.rolButtons}>
              <TouchableOpacity
                style={[
                  styles.rolBtn,
                  rol === 'comprador' && styles.rolBtnActive
                ]}
                onPress={() => setRol('comprador')}
                disabled={loading}
              >
                <Ionicons
                  name="cart-outline"
                  size={18}
                  color={rol === 'comprador' ? '#fff' : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.rolBtnText,
                    rol === 'comprador' && styles.rolBtnTextActive
                  ]}
                >
                  Comprador
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rolBtn,
                  rol === 'agricultor' && styles.rolBtnActive
                ]}
                onPress={() => setRol('agricultor')}
                disabled={loading}
              >
                <Ionicons
                  name="leaf-outline"
                  size={18}
                  color={rol === 'agricultor' ? '#fff' : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.rolBtnText,
                    rol === 'agricultor' && styles.rolBtnTextActive
                  ]}
                >
                  Agricultor
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contraseña */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Indicador de Fortaleza */}
          {password.length > 0 && passwordStrength && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                <View
                  style={[
                    styles.strengthBarFill,
                    {
                      width: `${getStrengthPercentage()}%`,
                      backgroundColor: getStrengthBarColor()
                    }
                  ]}
                />
              </View>
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                Fortaleza: {passwordStrength.message}
              </Text>

              {/* Requisitos */}
              <View style={styles.requirementsContainer}>
                <RequirementCheck
                  label="Mínimo 8 caracteres"
                  met={passwordStrength.criteria.length}
                />
                <RequirementCheck
                  label="Mayúsculas (A-Z)"
                  met={passwordStrength.criteria.uppercase}
                />
                <RequirementCheck
                  label="Minúsculas (a-z)"
                  met={passwordStrength.criteria.lowercase}
                />
                <RequirementCheck
                  label="Números (0-9)"
                  met={passwordStrength.criteria.number}
                />
                <RequirementCheck
                  label="Caracteres especiales (!@#$...)"
                  met={passwordStrength.criteria.special}
                />
              </View>
            </View>
          )}

          {/* Confirmar Contraseña */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Botón Registrar */}
          <TouchableOpacity
            style={[styles.registerBtn, !passwordStrength?.isStrong && styles.registerBtnDisabled]}
            onPress={handleRegister}
            disabled={loading || !passwordStrength?.isStrong}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerBtnText}>Registrarse</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Ir a Login */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Componente para mostrar requisitos
function RequirementCheck({ label, met }) {
  return (
    <View style={styles.requirementItem}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'close-circle'}
        size={18}
        color={met ? '#66BB6A' : '#EF5350'}
      />
      <Text style={[styles.requirementText, { color: met ? '#66BB6A' : '#EF5350' }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, padding: 20 },
  header: { marginBottom: 30, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: Colors.comprador, marginBottom: 8 },
  subtitle: { fontSize: 18, color: Colors.textSecondary },
  form: { marginBottom: 20 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    marginBottom: 16,
    borderRadius: 8,
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  input: { flex: 1, marginHorizontal: 8, fontSize: 16 },
  rolContainer: { marginBottom: 16 },
  rolLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
  rolButtons: { flexDirection: 'row', gap: 12 },
  rolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6
  },
  rolBtnActive: { backgroundColor: Colors.comprador },
  rolBtnText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  rolBtnTextActive: { color: '#fff' },
  strengthContainer: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginBottom: 16 },
  strengthBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8
  },
  strengthBarFill: { height: '100%' },
  strengthText: { fontSize: 13, fontWeight: 'bold', marginBottom: 12 },
  requirementsContainer: { gap: 6 },
  requirementItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  requirementText: { fontSize: 12 },
  registerBtn: {
    backgroundColor: Colors.comprador,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16
  },
  registerBtnDisabled: { opacity: 0.5 },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: Colors.textSecondary },
  loginLink: { color: Colors.comprador, fontWeight: 'bold' }
});
