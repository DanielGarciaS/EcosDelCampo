import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { ENDPOINTS } from '../../constants/endpoints';
import Colors from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function MisPedidosScreen({ navigation }) {
  const { token } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarPedidos();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarPedidos();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarPedidos = async () => {
    try {
      const response = await axios.get(ENDPOINTS.MY_ORDERS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setPedidos(response.data.data);
      } else {
        setPedidos([]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarPedidos();
  }, []);

  const getColorEstado = (estado) => {
    const colores = {
      pendiente: '#FFA726',
      confirmado: '#42A5F5',
      en_proceso: '#AB47BC',
      enviado: '#26C6DA',
      entregado: '#66BB6A',
      cancelado: '#EF5350'
    };
    return colores[estado] || '#757575';
  };

  const renderPedido = ({ item }) => (
    <TouchableOpacity
      style={styles.pedidoCard}
      onPress={() => navigation.navigate('DetallePedido', { pedido: item })}
    >
      <View style={styles.pedidoHeader}>
        <View style={[styles.estadoBadge, { backgroundColor: getColorEstado(item.estado) }]}>
          <Text style={styles.estadoText}>{item.estado.toUpperCase().replace('_', ' ')}</Text>
        </View>
        <Text style={styles.fecha}>{new Date(item.createdAt || item.fechaPedido).toLocaleDateString()}</Text>
      </View>

      <View style={styles.pedidoBody}>
        <View style={styles.infoRow}>
          <Ionicons name="cube-outline" size={16} color={Colors.comprador} />
          <Text style={styles.infoText}>{item.items.length} {item.items.length === 1 ? 'producto' : 'productos'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={16} color={Colors.comprador} />
          <Text style={[styles.infoText, styles.total]}>Total: ${item.total}</Text>
        </View>
      </View>

      <View style={styles.productosContainer}>
        {item.items.slice(0, 2).map((prod, idx) => (
          <Text key={idx} style={styles.productoItem}>• {prod.nombre} x{prod.cantidad}</Text>
        ))}
        {item.items.length > 2 && (
          <Text style={styles.masProductos}>+{item.items.length - 2} más...</Text>
        )}
      </View>

      <View style={styles.verMasContainer}>
        <Text style={styles.verMasText}>Ver detalles</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.comprador} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.comprador} />
        <Text style={styles.loadingText}>Cargando pedidos...</Text>
      </View>
    );
  }

  if (pedidos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>No tienes pedidos aún</Text>
          <Text style={styles.emptySubtitle}>Realiza tu primera compra y aparecerá aquí</Text>
          <TouchableOpacity
            style={styles.btnCatalogo}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.btnCatalogoText}>Ir al catálogo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pedidos}
        renderItem={renderPedido}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.comprador]} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  listContainer: { padding: 12 },
  pedidoCard: { backgroundColor: '#fff', marginBottom: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  pedidoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  estadoBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  estadoText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  fecha: { fontSize: 14, color: '#666' },
  pedidoBody: { marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  infoText: { fontSize: 14, color: '#333' },
  total: { fontWeight: 'bold', fontSize: 16, color: Colors.comprador },
  productosContainer: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginBottom: 12 },
  productoItem: { fontSize: 13, color: '#555', marginBottom: 4 },
  masProductos: { fontSize: 13, color: Colors.comprador, fontWeight: '600', marginTop: 4 },
  verMasContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  verMasText: { fontSize: 14, color: Colors.comprador, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary, marginTop: 20 },
  emptySubtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginTop: 10, marginBottom: 30 },
  btnCatalogo: { backgroundColor: Colors.comprador, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25 },
  btnCatalogoText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
});
