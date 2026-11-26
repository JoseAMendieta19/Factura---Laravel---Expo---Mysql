import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colores } from '../styles/comunes';
import FormCiudadView from '../views/FormCiudadView';
import FormProvinciaView from '../views/FormProvinciaView';
import ListaCiudadesView from '../views/ListaCiudadesView';
import ListaProvinciasView from '../views/ListaProvinciasView';
import MenuView from '../views/MenuView';
import PantallaProximamente from '../views/PantallaProximamente';
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

        {/* Pantallas provisionales: se reemplazan en los pasos siguientes. */}
        <Stack.Screen name="ListaIva" component={PantallaProximamente} options={{ title: 'IVA' }} />
        <Stack.Screen name="ListaClientes" component={PantallaProximamente} options={{ title: 'Clientes' }} />
        <Stack.Screen name="ListaVendedores" component={PantallaProximamente} options={{ title: 'Vendedores' }} />
        <Stack.Screen name="ListaProveedores" component={PantallaProximamente} options={{ title: 'Proveedores' }} />
        <Stack.Screen name="ListaProductos" component={PantallaProximamente} options={{ title: 'Productos' }} />
        <Stack.Screen name="ListaFacturas" component={PantallaProximamente} options={{ title: 'Facturas' }} />
        <Stack.Screen name="NuevaFactura" component={PantallaProximamente} options={{ title: 'Nueva factura' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}