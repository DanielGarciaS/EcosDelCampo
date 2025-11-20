import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Colors from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { ENDPOINTS } from '../../constants/endpoints';

export default function DetallePedidoScreen({ route, navigation }) {
  const { pedido } = route.params;
  const { user, token } = useAuth();
  const esAgricultor = user?.rol === 'agricultor';
  const esComprador = user?.rol === 'comprador';

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

  const cambiarEstado = async (nuevoEstado) => {
    try {
      const response = await axios.put(
        ENDPOINTS.UPDATE_ORDER_STATUS(pedido._id),
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Alert.alert('Éxito', 'Estado actualizado correctamente');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo actualizar el estado');
    }
  };

  const cancelarPedido = async () => {
    Alert.alert(
      'Cancelar pedido',
      '¿Estás seguro de cancelar este pedido?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.put(
                ENDPOINTS.CANCEL_ORDER(pedido._id),
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              if (response.data.success) {
                Alert.alert('Pedido cancelado', 'El pedido fue cancelado exitosamente');
                navigation.goBack();
              }
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'No se pudo cancelar el pedido');
            }
          }
        }
      ]
    );
  };

  const mostrarOpcionesEstado = () => {
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
          onPress: () => op.estado && cambiarEstado(op.estado)
        }))
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Estado del pedido */}
      <View style={[styles.estadoCard, { backgroundColor: getColorEstado(pedido.estado) }]}>
        <Text style={styles.estadoText}>
          {pedido.estado.toUpperCase().replace('_', ' ')}
        </Text>
      </View>

      {/* Información del comprador (solo para agricultor) */}
      {esAgricultor && pedido.comprador && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información del Comprador</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={20} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{pedido.comprador.nombre}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{pedido.comprador.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{pedido.comprador.telefono || 'No disponible'}</Text>
          </View>
        </View>
      )}

      {/* Productos */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Productos</Text>
        {pedido.items.map((item, index) => (
          <View key={index} style={styles.productoItem}>
            <View>
              <Text style={styles.productoNombre}>{item.nombre}</Text>
              <Text style={styles.productoCantidad}>Cantidad: {item.cantidad}</Text>
            </View>
            <Text style={styles.productoSubtotal}>${item.subtotal}</Text>
          </View>
        ))}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${pedido.total}</Text>
        </View>
      </View>

      {/* Dirección de entrega */}
      {pedido.direccionEntrega && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dirección de Entrega</Text>
          <Text style={styles.direccionText}>
            {pedido.direccionEntrega.calle}
          </Text>
          <Text style={styles.direccionText}>
            {pedido.direccionEntrega.ciudad}, {pedido.direccionEntrega.estado}
          </Text>
          <Text style={styles.direccionText}>
            CP: {pedido.direccionEntrega.codigoPostal}
          </Text>
          <Text style={styles.direccionText}>
            Tel: {pedido.direccionEntrega.telefono}
          </Text>
        </View>
      )}

      {/* Notas */}
      {pedido.notas && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notas</Text>
          <Text style={styles.notasText}>{pedido.notas}</Text>
        </View>
      )}

      {/* Botones de acción */}
      <View style={styles.accionesContainer}>
        {esAgricultor && pedido.estado !== 'cancelado' && pedido.estado !== 'entregado' && (
          <TouchableOpacity
            style={styles.btnCambiarEstado}
            onPress={mostrarOpcionesEstado}
          >
            <Ionicons name="create" size={20} color="#fff" />
            <Text style={styles.btnText}>Cambiar Estado</Text>
          </TouchableOpacity>
        )}

        {esComprador && pedido.estado === 'pendiente' && (
          <TouchableOpacity
            style={styles.btnCancelar}
            onPress={cancelarPedido}
          >
            <Ionicons name="close-circle" size={20} color="#fff" />
            <Text style={styles.btnText}>Cancelar Pedido</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  estadoCard: { margin: 16, padding: 20, borderRadius: 12, alignItems: 'center' },
  estadoText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', margin: 16, marginTop: 0, padding: 16, borderRadius: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: Colors.textPrimary },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  infoText: { fontSize: 16, color: Colors.textPrimary },
  productoItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  productoNombre: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  productoCantidad: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  productoSubtotal: { fontSize: 16, fontWeight: 'bold', color: Colors.comprador },
  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 2, borderTopColor: '#eee' },
  totalLabel: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: Colors.comprador },
  direccionText: { fontSize: 15, color: Colors.textPrimary, marginBottom: 6 },
  notasText: { fontSize: 15, color: Colors.textSecondary, fontStyle: 'italic' },
  accionesContainer: { padding: 16, gap: 12 },
  btnCambiarEstado: { backgroundColor: Colors.comprador, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8 },
  btnCancelar: { backgroundColor: Colors.error, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
