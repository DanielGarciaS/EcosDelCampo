import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function AgricultorHomeScreen({ navigation }) {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProductos: 0,
    productosActivos: 0,
    pedidosPendientes: 0,
    ventasTotales: 0,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Aquí cargarás los datos del backend
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

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
          <Ionicons name="notifications-outline" size={24} color={Colors.white} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tarjetas de estadísticas */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.statCard1]}>
          <Ionicons name="cube-outline" size={30} color={Colors.agricultor} />
          <Text style={styles.statNumber}>{stats.totalProductos}</Text>
          <Text style={styles.statLabel}>Total Productos</Text>
        </View>

        <View style={[styles.statCard, styles.statCard2]}>
          <Ionicons name="checkmark-circle-outline" size={30} color={Colors.success} />
          <Text style={styles.statNumber}>{stats.productosActivos}</Text>
          <Text style={styles.statLabel}>Activos</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.statCard3]}>
          <Ionicons name="cart-outline" size={30} color={Colors.warning} />
          <Text style={styles.statNumber}>{stats.pedidosPendientes}</Text>
          <Text style={styles.statLabel}>Pedidos Pendientes</Text>
        </View>

        <View style={[styles.statCard, styles.statCard4]}>
          <Ionicons name="cash-outline" size={30} color={Colors.primary} />
          <Text style={styles.statNumber}>${stats.ventasTotales}</Text>
          <Text style={styles.statLabel}>Ventas Totales</Text>
        </View>
      </View>

      {/* Acciones rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Inventario')}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="add-circle" size={24} color={Colors.white} />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Publicar nuevo producto</Text>
            <Text style={styles.actionSubtitle}>Agrega productos a tu inventario</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.gray} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Inventario')}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: Colors.info }]}>
            <Ionicons name="list" size={24} color={Colors.white} />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Ver mi inventario</Text>
            <Text style={styles.actionSubtitle}>Administra tus productos</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.gray} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Próximamente', 'Función en desarrollo')}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: Colors.warning }]}>
            <Ionicons name="bar-chart" size={24} color={Colors.white} />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Ver estadísticas</Text>
            <Text style={styles.actionSubtitle}>Analiza tus ventas</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.gray} />
        </TouchableOpacity>
      </View>

      {/* Productos recientes placeholder */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Productos recientes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Inventario')}>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={60} color={Colors.gray} />
          <Text style={styles.emptyStateText}>No hay productos aún</Text>
          <Text style={styles.emptyStateSubtext}>
            Comienza publicando tu primer producto
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
  header: {
    backgroundColor: Colors.agricultor,
    padding: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
