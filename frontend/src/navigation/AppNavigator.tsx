import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colores } from '../styles/comunes';
import DetalleFacturaView from '../views/DetalleFacturaView';
import FormCiudadView from '../views/FormCiudadView';
import FormClienteView from '../views/FormClienteView';
import FormIvaView from '../views/FormIvaView';
import FormProductoView from '../views/FormProductoView';
import FormProveedorView from '../views/FormProveedorView';
import FormProvinciaView from '../views/FormProvinciaView';
import FormVendedorView from '../views/FormVendedorView';
import ListaCiudadesView from '../views/ListaCiudadesView';
import ListaClientesView from '../views/ListaClientesView';
import ListaFacturasView from '../views/ListaFacturasView';
import ListaIvaView from '../views/ListaIvaView';
import ListaProductosView from '../views/ListaProductosView';
import ListaProveedoresView from '../views/ListaProveedoresView';
import ListaProvinciasView from '../views/ListaProvinciasView';
import ListaVendedoresView from '../views/ListaVendedoresView';
import MenuView from '../views/MenuView';
import NuevaFacturaView from '../views/NuevaFacturaView';
import type { RootStackParamList } from './tipos';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Menu"
        screenOptions={{
          headerStyle: { backgroundColor: colores.primario },
          headerTintColor: colores.blanco,
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: colores.fondo },
          statusBarStyle: 'light',
        }}
      >
        <Stack.Screen name="Menu" component={MenuView} options={{ title: 'Facturación' }} />

        <Stack.Screen name="ListaProvincias" component={ListaProvinciasView} options={{ title: 'Provincias' }} />
        <Stack.Screen
          name="FormProvincia"
          component={FormProvinciaView}
          options={({ route }) => ({
            title: route.params?.provincia ? 'Editar provincia' : 'Nueva provincia',
          })}
        />

        <Stack.Screen name="ListaCiudades" component={ListaCiudadesView} options={{ title: 'Ciudades' }} />
        <Stack.Screen
          name="FormCiudad"
          component={FormCiudadView}
          options={({ route }) => ({
            title: route.params?.ciudad ? 'Editar ciudad' : 'Nueva ciudad',
          })}
        />

        <Stack.Screen name="ListaIva" component={ListaIvaView} options={{ title: 'IVA' }} />
        <Stack.Screen
          name="FormIva"
          component={FormIvaView}
          options={({ route }) => ({
            title: route.params?.iva ? 'Editar tarifa de IVA' : 'Nueva tarifa de IVA',
          })}
        />

        <Stack.Screen name="ListaClientes" component={ListaClientesView} options={{ title: 'Clientes' }} />
        <Stack.Screen
          name="FormCliente"
          component={FormClienteView}
          options={({ route }) => ({
            title: route.params?.cliente ? 'Editar cliente' : 'Nuevo cliente',
          })}
        />

        <Stack.Screen name="ListaVendedores" component={ListaVendedoresView} options={{ title: 'Vendedores' }} />
        <Stack.Screen
          name="FormVendedor"
          component={FormVendedorView}
          options={({ route }) => ({
            title: route.params?.vendedor ? 'Editar vendedor' : 'Nuevo vendedor',
          })}
        />

        <Stack.Screen name="ListaProveedores" component={ListaProveedoresView} options={{ title: 'Proveedores' }} />
        <Stack.Screen
          name="FormProveedor"
          component={FormProveedorView}
          options={({ route }) => ({
            title: route.params?.proveedor ? 'Editar proveedor' : 'Nuevo proveedor',
          })}
        />

        <Stack.Screen name="ListaProductos" component={ListaProductosView} options={{ title: 'Productos' }} />
        <Stack.Screen
          name="FormProducto"
          component={FormProductoView}
          options={({ route }) => ({
            title: route.params?.producto ? 'Editar producto' : 'Nuevo producto',
          })}
        />

        <Stack.Screen name="NuevaFactura" component={NuevaFacturaView} options={{ title: 'Nueva factura' }} />
        <Stack.Screen name="ListaFacturas" component={ListaFacturasView} options={{ title: 'Facturas' }} />
        <Stack.Screen name="DetalleFactura" component={DetalleFacturaView} options={{ title: 'Detalle de factura' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}