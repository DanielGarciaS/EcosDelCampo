import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Modal,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';
import { ENDPOINTS } from '../../constants/endpoints';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const CATEGORIAS = ['todas', 'frutas', 'verduras', 'granos', 'lacteos', 'carnes', 'otros'];

const ICONOS_CATEGORIAS = {
  todas: 'apps',
  frutas: 'nutrition',
  verduras: 'leaf',
  granos: 'egg',
  lacteos: 'water',
  carnes: 'restaurant',
  otros: 'ellipsis-horizontal',
};

export default function CompradorHomeScreen({ navigation }) {
  const { user, token } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [modalFiltrosVisible, setModalFiltrosVisible] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await axios.get(ENDPOINTS.PRODUCTS);
      if (response.data.success) {
        setProductos(response.data.data || []);
      }
    } catch (error) {
      console.error('Error cargando productos:', error.message);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarProductos();
    setRefreshing(false);
  }, []);

  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const cumpleCategoria =
        categoriaSeleccionada === 'todas' ||
        producto.categoria?.toLowerCase() === categoriaSeleccionada.toLowerCase();

      const cumpleBusqueda =
        !search ||
        producto.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        producto.descripcion?.toLowerCase().includes(search.toLowerCase());

      return cumpleCategoria && cumpleBusqueda;
    });
  }, [productos, categoriaSeleccionada, search]);

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
        Alert.alert('✅ Éxito', `${producto.nombre} agregado al carrito`);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Error al agregar al carrito');
    }
  };

  // Renderizar cada opción de filtro en el modal
  const renderOpcionFiltro = (categoria) => {
    const isActive = categoriaSeleccionada === categoria;
    const iconName = ICONOS_CATEGORIAS[categoria];
    const categoryLabel = categoria.charAt(0).toUpperCase() + categoria.slice(1);

    return (
      <TouchableOpacity
        key={categoria}
        style={[styles.opcionFiltro, isActive && styles.opcionFiltroActive]}
        onPress={() => {
          setCategoriaSeleccionada(categoria);
          setModalFiltrosVisible(false);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.opcionFiltroIcono}>
          <Ionicons
            name={iconName}
            size={24}
            color={isActive ? Colors.white : Colors.comprador}
          />
        </View>
        <View style={styles.opcionFiltroTexto}>
          <Text style={[styles.opcionFiltroLabel, isActive && styles.opcionFiltroLabelActive]}>
            {categoryLabel}
          </Text>
          <Text style={styles.opcionFiltroCount}>
            {productos.filter(
              (p) =>
                categoria === 'todas' ||
                p.categoria?.toLowerCase() === categoria.toLowerCase()
            ).length}{' '}
            productos
          </Text>
        </View>
        {isActive && (
          <Ionicons name="checkmark-circle" size={24} color={Colors.comprador} />
        )}
      </TouchableOpacity>
    );
  };

  // Renderizar cada producto
  const renderProducto = ({ item }) => (
    <View style={styles.productoCard}>
      <View style={styles.productoHeader}>
        <View style={styles.productoInfo}>
          <Text style={styles.productoNombre} numberOfLines={2}>
            {item.nombre || 'Sin nombre'}
          </Text>
          <View style={styles.categoriaBadge}>
            <Text style={styles.categoriaBadgeText}>
              {item.categoria?.charAt(0).toUpperCase() + item.categoria?.slice(1) || 'Otros'}
            </Text>
          </View>
          {item.descripcion && (
            <Text style={styles.productoDescripcion} numberOfLines={2}>
              {item.descripcion}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.productoFooter}>
        <View style={styles.productoDetalles}>
          <Text style={styles.productoPrecio}>${item.precio || 0}</Text>
          <Text style={styles.productoUnidad}>por {item.unidad || 'unidad'}</Text>
          <Text style={styles.productoStock}>
            {item.cantidad || 0} disponibles
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.botonAgregar,
            (item.cantidad === 0 || item.cantidad === null) && styles.botonAgregarDisabled,
          ]}
          onPress={() => agregarAlCarrito(item)}
          disabled={item.cantidad === 0 || item.cantidad === null}
          activeOpacity={0.8}
        >
          <Ionicons name="cart" size={16} color={Colors.white} />
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
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>¡Hola, {user?.nombre || 'Usuario'}! 🛒</Text>
            <Text style={styles.headerSubtitle}>¿Qué necesitas hoy?</Text>
          </View>
          <TouchableOpacity
            style={styles.cartIconButton}
            onPress={() => navigation.navigate('Carrito')}
          >
            <Ionicons name="cart" size={24} color={Colors.white} />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>0</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* BUSCADOR */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={18}
          color={Colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos..."
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* BOTÓN DE FILTROS */}
      <View style={styles.filtroButtonContainer}>
        <TouchableOpacity
          style={styles.filtroButton}
          onPress={() => setModalFiltrosVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="funnel" size={20} color={Colors.white} />
          <Text style={styles.filtroButtonText}>Filtros</Text>
          <View style={styles.filtroButtonBadge}>
            <Text style={styles.filtroButtonBadgeText}>
              {categoriaSeleccionada === 'todas' ? 'Todos' : '1'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* MOSTRAR CATEGORÍA SELECCIONADA */}
        <View style={styles.categoriaActivaContainer}>
          <Ionicons
            name={ICONOS_CATEGORIAS[categoriaSeleccionada]}
            size={16}
            color={Colors.comprador}
          />
          <Text style={styles.categoriaActivaText}>
            {categoriaSeleccionada.charAt(0).toUpperCase() + categoriaSeleccionada.slice(1)}
          </Text>
        </View>
      </View>

      {/* MODAL DE FILTROS */}
      <Modal
        visible={modalFiltrosVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalFiltrosVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* HEADER DEL MODAL */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona una categoría</Text>
              <TouchableOpacity
                onPress={() => setModalFiltrosVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* LISTA DE FILTROS */}
            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              {CATEGORIAS.map((categoria) => renderOpcionFiltro(categoria))}
            </ScrollView>

            {/* BOTÓN LIMPIAR FILTROS */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.botonLimpiarFiltros}
                onPress={() => {
                  setCategoriaSeleccionada('todas');
                  setModalFiltrosVisible(false);
                }}
              >
                <Ionicons name="refresh" size={18} color={Colors.comprador} />
                <Text style={styles.botonLimpiarFiltrosText}>Limpiar filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* LISTA DE PRODUCTOS */}
      {productosFiltrados.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>Sin resultados</Text>
          <Text style={styles.emptySubtitle}>
            {search ? 'No encontramos productos con ese nombre' : 'Selecciona una categoría diferente'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={productosFiltrados}
          renderItem={renderProducto}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.comprador]}
              tintColor={Colors.comprador}
            />
          }
          scrollIndicatorInsets={{ right: 1 }}
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
    backgroundColor: Colors.backgroundLight,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // ========== HEADER ==========
  header: {
    backgroundColor: Colors.comprador,
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 45,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    fontWeight: '500',
  },
  cartIconButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },

  // ========== BUSCADOR ==========
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    padding: 0,
  },

  // ========== BOTÓN Y FILTROS ACTIVOS ==========
  filtroButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  filtroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.comprador,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: Colors.comprador,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  filtroButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  filtroButtonBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
  filtroButtonBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  categoriaActivaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.comprador + '40',
    flex: 1,
    gap: 8,
  },
  categoriaActivaText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.comprador,
  },

  // ========== MODAL ==========
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.backgroundLight,
  },
  modalScrollView: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  opcionFiltro: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  opcionFiltroActive: {
    backgroundColor: Colors.comprador + '10',
    borderColor: Colors.comprador,
  },
  opcionFiltroIcono: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  opcionFiltroTexto: {
    flex: 1,
  },
  opcionFiltroLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  opcionFiltroLabelActive: {
    color: Colors.comprador,
  },
  opcionFiltroCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  botonLimpiarFiltros: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.comprador,
    gap: 8,
  },
  botonLimpiarFiltrosText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.comprador,
  },

  // ========== PRODUCTOS ==========
  listContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 20,
  },
  productoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productoHeader: {
    marginBottom: 12,
  },
  productoInfo: {
    flex: 1,
  },
  productoNombre: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  categoriaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.comprador + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoriaBadgeText: {
    fontSize: 12,
    color: Colors.comprador,
    fontWeight: '600',
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
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  productoDetalles: {
    flex: 1,
  },
  productoPrecio: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.comprador,
    marginBottom: 2,
  },
  productoUnidad: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  productoStock: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  botonAgregar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.comprador,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    shadowColor: Colors.comprador,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  botonAgregarDisabled: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.5,
  },
  botonAgregarText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  // ========== EMPTY STATE ==========
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});