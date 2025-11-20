import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, ActivityIndicator, StyleSheet, 
  TouchableOpacity, Alert, RefreshControl, ScrollView  // ← AGREGAR ScrollView
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { ENDPOINTS } from '../../constants/endpoints';
import Colors from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function PedidosRecibidosScreen({ navigation }) {
  const { token } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todos');

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
      const response = await axios.get(ENDPOINTS.AGRICULTOR_ORDERS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setPedidos(response.data.data);
      } else {
        setPedidos([]);
      }
    } catch (error) {
      console.log('Error cargando pedidos:', error.response?.data || error.message);
      Alert.alert('Error', 'No se pudieron cargar los pedidos recibidos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarPedidos();
  };

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      const response = await axios.put(
        ENDPOINTS.UPDATE_ORDER_STATUS(pedidoId),
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Alert.alert('Éxito', 'Estado actualizado correctamente');
        cargarPedidos();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo actualizar el estado');
    }
  };

  const mostrarOpcionesEstado = (pedido) => {
    const opciones = [
      { texto: 'Confirmar pedido', estado: 'confirmado' },
      { texto: 'Marcar en proceso', estado: 'en_proceso' },
      { texto: 'Marcar como enviado', estado: 'enviado' },
      { texto: 'Marcar como entregado', estado: 'entregado' },
      { texto: 'Cancelar' },
    ];

    Alert.alert(
      'Cambiar estado del pedido',
      'Selecciona el nuevo estado:',
      [
        ...opciones.map(op => ({
          text: op.texto,
          onPress: () => op.estado && cambiarEstado(pedido._id, op.estado)
        }))
      ]
    );
  };

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

  const pedidosFiltrados = filtroEstado === 'todos' 
    ? pedidos 
    : pedidos.filter(p => p.estado === filtroEstado);

  const renderFiltro = () => (
    <View style={styles.filtrosContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['todos', 'pendiente', 'confirmado', 'en_proceso', 'enviado', 'entregado'].map(estado => (
          <TouchableOpacity
            key={estado}
            style={[
              styles.filtroBtn,
              filtroEstado === estado && styles.filtroBtnActive
            ]}
            onPress={() => setFiltroEstado(estado)}
          >
            <Text style={[
              styles.filtroText,
              filtroEstado === estado && styles.filtroTextActive
            ]}>
              {estado === 'todos' ? 'Todos' : estado.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPedido = ({ item }) => (
    <TouchableOpacity 
      style={styles.pedidoCard}
      onPress={() => navigation.navigate('DetallePedido', { pedido: item })}
    >
      <View style={styles.pedidoHeader}>
        <View style={[styles.estadoBadge, { backgroundColor: getColorEstado(item.estado) }]}>
          <Text style={styles.estadoText}>{item.estado.toUpperCase().replace('_', ' ')}</Text>
        </View>
        <TouchableOpacity
          style={styles.btnCambiarEstado}
          onPress={() => mostrarOpcionesEstado(item)}
        >
          <Ionicons name="create-outline" size={20} color={Colors.comprador} />
          <Text style={styles.btnCambiarEstadoText}>Cambiar estado</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pedidoInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color="#666" />
          <Text style={styles.infoText}>
            {item.comprador?.nombre || 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={18} color="#666" />
          <Text style={styles.infoText}>
            {item.comprador?.telefono || 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color="#666" />
          <Text style={styles.infoText}>
            {new Date(item.createdAt || item.fechaPedido).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={18} color="#666" />
          <Text style={[styles.infoText, styles.total]}>
            Total: ${item.total}
          </Text>
        </View>
      </View>

      <View style={styles.productosContainer}>
        <Text style={styles.productosLabel}>Productos:</Text>
        {item.items.map((prod, idx) => (
          <Text key={idx} style={styles.productoItem}>
            • {prod.nombre} x{prod.cantidad} (${prod.subtotal})
          </Text>
        ))}
      </View>

      {item.direccionEntrega && (
        <View style={styles.direccionContainer}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.direccionText}>
            {item.direccionEntrega.calle}, {item.direccionEntrega.ciudad}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.comprador} />
        <Text style={styles.loadingText}>Cargando pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderFiltro()}
      
      {pedidosFiltrados.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="clipboard-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>
            {filtroEstado === 'todos' 
              ? 'No tienes pedidos recibidos aún'
              : `No hay pedidos con estado: ${filtroEstado}`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={pedidosFiltrados}
          renderItem={renderPedido}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  filtrosContainer: { backgroundColor: '#fff', padding: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  filtroBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8 },
  filtroBtnActive: { backgroundColor: Colors.comprador },
  filtroText: { fontSize: 14, color: '#666' },
  filtroTextActive: { color: '#fff', fontWeight: 'bold' },
  listContainer: { padding: 12 },
  pedidoCard: { backgroundColor: '#fff', marginBottom: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  pedidoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  estadoBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  estadoText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  btnCambiarEstado: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  btnCambiarEstadoText: { fontSize: 14, color: Colors.comprador, fontWeight: '600' },
  pedidoInfo: { marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  infoText: { fontSize: 14, color: '#333' },
  total: { fontWeight: 'bold', fontSize: 16, color: Colors.comprador },
  productosContainer: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginBottom: 12 },
  productosLabel: { fontWeight: 'bold', marginBottom: 6, fontSize: 14 },
  productoItem: { fontSize: 13, color: '#555', marginLeft: 8, marginBottom: 4 },
  direccionContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  direccionText: { fontSize: 13, color: '#666', flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 16, textAlign: 'center' },
});