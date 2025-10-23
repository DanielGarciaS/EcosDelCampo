import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import AgricultorNavigator from './AgricultorNavigator';
import CompradorNavigator from './CompradorNavigator';
import Colors from '../constants/colors';

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <AuthNavigator />;
  }

  if (user.rol === 'agricultor') {
    return <AgricultorNavigator />;
  }

  return <CompradorNavigator />;
}