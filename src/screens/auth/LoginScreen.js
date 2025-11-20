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
  Modal,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';
import { ENDPOINTS } from '../../constants/endpoints';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    const result = await login(email.toLowerCase().trim(), password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Error', result.message);
    }
  };

  // PASO 1: Solicitar email
  const handleForgotPasswordStep1 = async () => {
    if (!forgotEmail) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(ENDPOINTS.FORGOT_PASSWORD, {
        email: forgotEmail.toLowerCase().trim()
      });

      if (response.data.success) {
        setForgotStep(2);
        Alert.alert('✅ Éxito', 'Se envió un código a tu email. Revisa tu bandeja de entrada.');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Error al enviar el email');
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: Validar token y avanzar
  const handleForgotPasswordStep2 = () => {
    if (!resetToken) {
      Alert.alert('Error', 'Por favor ingresa el código');
      return;
    }
    if (resetToken.length !== 6) {
      Alert.alert('Error', 'El código debe tener 6 dígitos');
      return;
    }
    setForgotStep(3);
  };

  // PASO 3: Resetear contraseña
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(ENDPOINTS.RESET_PASSWORD, {
        resetToken,
        newPassword
      });

      if (response.data.success) {
        Alert.alert('✅ Éxito', 'Contraseña actualizada. Ahora puedes inicia sesión.');
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotEmail('');
        setResetToken('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Error al resetear contraseña');
    } finally {
      setLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep(1);
    setForgotEmail('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Ecos del Campo</Text>
          <Text style={styles.subtitle}>Inicia sesión</Text>
        </View>

        <View style={styles.form}>
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

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
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

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowForgotModal(true)}>
            <Text style={styles.forgotPasswordLink}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal - Recuperar Contraseña */}
      <Modal
        visible={showForgotModal}
        transparent
        animationType="slide"
        onRequestClose={closeForgotModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={closeForgotModal}
            >
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>

            {forgotStep === 1 && (
              <>
                <Text style={styles.modalTitle}>Recuperar Contraseña</Text>
                <Text style={styles.modalSubtitle}>
                  Ingresa tu email para recibir un código de recuperación
                </Text>

                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleForgotPasswordStep1}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Enviar Código</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {forgotStep === 2 && (
              <>
                <Text style={styles.modalTitle}>Ingresa el Código</Text>
                <Text style={styles.modalSubtitle}>
                  Revisa tu email y copia el código de 6 dígitos
                </Text>

                <View style={styles.inputContainer}>
                  <Ionicons name="key-outline" size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="000000"
                    value={resetToken}
                    onChangeText={(text) => setResetToken(text.replace(/[^0-9]/g, '').slice(0, 6))}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleForgotPasswordStep2}
                >
                  <Text style={styles.submitBtnText}>Continuar</Text>
                </TouchableOpacity>
              </>
            )}

            {forgotStep === 3 && (
              <>
                <Text style={styles.modalTitle}>Nueva Contraseña</Text>
                <Text style={styles.modalSubtitle}>
                  Ingresa tu nueva contraseña
                </Text>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nueva contraseña"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar contraseña"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Cambiar Contraseña</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: Colors.comprador, marginBottom: 8 },
  subtitle: { fontSize: 18, color: Colors.textSecondary },
  form: { marginBottom: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, marginBottom: 16, borderRadius: 8, height: 50, borderWidth: 1, borderColor: '#e0e0e0' },
  input: { flex: 1, marginHorizontal: 8, fontSize: 16 },
  loginBtn: { backgroundColor: Colors.comprador, padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  forgotPasswordLink: { color: Colors.comprador, textAlign: 'center', fontWeight: '600', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: Colors.textSecondary },
  registerLink: { color: Colors.comprador, fontWeight: 'bold' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: '70%' },
  closeBtn: { alignSelf: 'flex-end', marginBottom: 16 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: Colors.textPrimary },
  modalSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  submitBtn: { backgroundColor: Colors.comprador, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
