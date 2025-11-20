import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = 'http://192.168.100.11:5000'; // ← TU URL del servidor (según server.js)

// Configurar el header de navegación
AgricultorHomeScreen.navigationOptions = ({ navigation }) => ({
  headerTitle: 'Inicio',
  headerStyle: {
    backgroundColor: Colors.agricultor,
  },
  headerTintColor: Colors.white,
  headerTitleStyle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});



export default function AgricultorHomeScreen({ navigation }) {
  const { user, token } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProductos: 0,
    ordenesPendientes: 0,
    totalVentas: 0,
    totalOrdenes: 0,
  });

  // Función para obtener estadísticas del backend
  const fetchStats = async () => {
    try {
      console.log('🔄 Obteniendo estadísticas...');
      console.log('📍 URL:', `${API_URL}/api/orders/agricultor/stats`);
      console.log('🔑 Token:', token?.substring(0, 20) + '...');
      
      const response = await axios.get(
        `${API_URL}/api/orders/agricultor/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('✅ Respuesta recibida:', response.data);
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error.response?.data || error.message);
      Alert.alert(
        'Error', 
        'No se pudieron cargar las estadísticas. Verifica tu conexión.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Cargar estadísticas al montar el componente
    if (token) {
      fetchStats();
    }
  }, [token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
  };

  // Funciones para las acciones rápidas
 const handlePublicarProducto = () => {
  navigation.navigate('InventarioScreen'); // ✅ Nombre correcto
};

const handleVerInventario = () => {
  navigation.navigate('InventarioScreen'); // ✅ Nombre correcto
};

const handleVerPedidos = () => {
  navigation.navigate('Pedidos'); // ✅ Nombre correcto
};


  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.agricultor} />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header con saludo */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, {user?.nombre}! 🌾</Text>
          <Text style={styles.subtitle}>Bienvenido a tu panel</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications" size={24} color={Colors.white} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{stats.ordenesPendientes}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tarjetas de estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="basket" size={28} color={Colors.agricultor} />
          <Text style={styles.statNumber}>{stats.totalProductos}</Text>
          <Text style={styles.statLabel}>Total Productos</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="alert-circle" size={28} color={Colors.warning} />
          <Text style={styles.statNumber}>{stats.ordenesPendientes}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="cash" size={28} color={Colors.success} />
          <Text style={styles.statNumber}>${stats.totalVentas.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Ventas Totales</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="list" size={28} color={Colors.primary} />
          <Text style={styles.statNumber}>{stats.totalOrdenes}</Text>
          <Text style={styles.statLabel}>Órdenes</Text>
        </View>
      </View>

      {/* Acciones rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handlePublicarProducto}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="add" size={24} color={Colors.white} />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Publicar nuevo producto</Text>
            <Text style={styles.actionSubtitle}>Agrega productos a tu inventario</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleVerInventario}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="list" size={24} color={Colors.white} />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Ver mi inventario</Text>
            <Text style={styles.actionSubtitle}>Administra tus productos</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleVerPedidos}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="document-text" size={24} color={Colors.white} />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Ver pedidos</Text>
            <Text style={styles.actionSubtitle}>Revisa los pedidos pendientes</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Sección de información */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información útil</Text>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Mantén tus productos activos para que los compradores puedan verlos.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  header: {
    backgroundColor: Colors.agricultor,
    padding: 20,
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: Colors.error,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.agricultor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoBox: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: {
    flex: 1,
    color: Colors.white,
    fontSize: 13,
    lineHeight: 20,
  },
});
