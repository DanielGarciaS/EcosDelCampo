import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';
import { ENDPOINTS } from '../../constants/endpoints';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function CompradorHomeScreen({ navigation }) {
  const { user, token } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');

  const categorias = ['todas', 'frutas', 'verduras', 'granos', 'lacteos', 'carnes', 'otros'];

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await axios.get(ENDPOINTS.PRODUCTS);

      if (response.data.success) {
        setProductos(response.data.data);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarProductos();
  }, []);

  const agregarAlCarrito = async (producto) => {
    try {
      const response = await axios.post(
        ENDPOINTS.CART_ADD,
        {
          productoId: producto._id,
          cantidad: 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        Alert.alert('Éxito', `${producto.nombre} agregado al carrito`);
      }
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo agregar al carrito'
      );
    }
  };

  const productosFiltrados = productos.filter((producto) => {
    const matchCategoria =
      categoriaSeleccionada === 'todas' ||
      producto.categoria === categoriaSeleccionada;
    const matchSearch =
      producto.nombre.toLowerCase().includes(search.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(search.toLowerCase());

    return matchCategoria && matchSearch;
  });

  const renderProducto = ({ item }) => (
    <View style={styles.productoCard}>
      <View style={styles.productoHeader}>
        <View style={styles.productoInfo}>
          <Text style={styles.productoNombre}>{item.nombre}</Text>
          <Text style={styles.productoCategoria}>
            {item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1)}
          </Text>
          {item.descripcion && (
            <Text style={styles.productoDescripcion} numberOfLines={2}>
              {item.descripcion}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.productoFooter}>
        <View>
          <Text style={styles.productoPrecio}>${item.precio}</Text>
          <Text style={styles.productoUnidad}>por {item.unidad}</Text>
          <Text style={styles.productoStock}>
            {item.cantidad} {item.unidad} disponibles
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botonAgregar}
          onPress={() => agregarAlCarrito(item)}
          disabled={item.cantidad === 0}
        >
          <Ionicons name="cart" size={20} color={Colors.white} />
          <Text style={styles.botonAgregarText}>Agregar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.comprador} />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, {user?.nombre}! 🛒</Text>
          <Text style={styles.subtitle}>¿Qué necesitas hoy?</Text>
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Carrito')}
        >
          <Ionicons name="cart" size={28} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={Colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filtro de categorías */}
      <View style={styles.categoriasContainer}>
        <FlatList
          horizontal
          data={categorias}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoriaChip,
                categoriaSeleccionada === item && styles.categoriaChipActive,
              ]}
              onPress={() => setCategoriaSeleccionada(item)}
            >
              <Text
                style={[
                  styles.categoriaChipText,
                  categoriaSeleccionada === item && styles.categoriaChipTextActive,
                ]}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Lista de productos */}
      {productosFiltrados.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="basket-outline" size={80} color={Colors.gray} />
          <Text style={styles.emptyTitle}>No hay productos disponibles</Text>
          <Text style={styles.emptySubtitle}>
            Intenta con otra categoría o búsqueda
          </Text>
        </View>
      ) : (
        <FlatList
          data={productosFiltrados}
          renderItem={renderProducto}
          keyExtractor={(item) => item._id}
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
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    backgroundColor: Colors.comprador,
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
  cartButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  categoriasContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  categoriaChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  categoriaChipActive: {
    backgroundColor: Colors.comprador,
    borderColor: Colors.comprador,
  },
  categoriaChipText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  categoriaChipTextActive: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  productoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productoHeader: {
    marginBottom: 10,
  },
  productoInfo: {
    flex: 1,
  },
  productoNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  productoCategoria: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  productoDescripcion: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  productoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  productoPrecio: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.comprador,
  },
  productoUnidad: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  productoStock: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  botonAgregar: {
    flexDirection: 'row',
    backgroundColor: Colors.comprador,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  botonAgregarText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
});
