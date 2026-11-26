import { calcularTotales, subtotalDeLineas } from '../src/utils/calculos';
import { esFechaValida, fechaLocalAISO, formatoFechaCorta } from '../src/utils/fechas';
import { aCentavos, deCentavos, formatoDinero } from '../src/utils/formato';
import {
  filtrarCorreo,
  filtrarDecimal,
  filtrarDigitos,
  filtrarFechaISO,
  filtrarLetras,
  limpiar,
  normalizarCorreo,
  validarCantidad,
  validarCedula,
  validarCorreo,
  validarFechaVencimiento,
  validarNombre,
  validarPorcentaje,
  validarPrecio,
  validarTelefono,
  validarTextoObligatorio,
  validarDescuento
} from '../src/utils/validaciones';

let total = 0;
let fallos = 0;

function probar(nombre: string, condicion: boolean): void {
  total++;
  if (!condicion) {
    fallos++;
    console.log('FALLO:', nombre);
  }
}

const contiene = (mensaje: string | null, texto: string): boolean =>
  mensaje !== null && mensaje.includes(texto);

// Cédula
probar('cédula válida 1300000005', validarCedula('1300000005') === null);
probar('cédula válida 1300000013', validarCedula('1300000013') === null);
probar('cédula válida 1300000021', validarCedula('1300000021') === null);
probar('cédula válida con cero inicial', validarCedula('0100000009') === null);
probar('cédula verificador', contiene(validarCedula('1300000006'), 'verificador'));
probar('cédula faltan 1', contiene(validarCedula('130000000'), 'faltan 1'));
probar('cédula sobran 1', contiene(validarCedula('13000000055'), 'sobran 1'));
probar('cédula provincia 25', contiene(validarCedula('2500000000'), 'provincia'));
probar('cédula tercer dígito', contiene(validarCedula('1360000009'), 'tercer'));
probar('cédula con letra', contiene(validarCedula('13000000a5'), 'solo puede contener números'));
probar('cédula vacía', contiene(validarCedula(''), 'Ingresa'));
probar('cédula solo espacios', contiene(validarCedula('   '), 'Ingresa'));

// Teléfono
probar('teléfono válido', validarTelefono('0991234567') === null);
probar('teléfono faltan 1', contiene(validarTelefono('099123456'), 'faltan 1'));
probar('teléfono sobran 1', contiene(validarTelefono('09912345678'), 'sobran 1'));
probar('teléfono prefijo', contiene(validarTelefono('0891234567'), 'empezar con 09'));
probar('teléfono con letras', contiene(validarTelefono('09912345ab'), 'solo puede contener números'));
probar('teléfono vacío', contiene(validarTelefono(''), 'Ingresa'));

// Correo
probar('correo válido', validarCorreo('maria.pena@correo.com') === null);
probar('correo mínimo', validarCorreo('a@b.co') === null);
probar('correo sin dominio', validarCorreo('prueba@') !== null);
probar('correo sin punto', validarCorreo('a@b') !== null);
probar('correo con espacio', validarCorreo('a b@c.com') !== null);
probar('correo vacío', contiene(validarCorreo(''), 'Ingresa'));
probar('correo largo', contiene(validarCorreo('a'.repeat(40) + '@correo.com'), '45 caracteres'));
probar('normalizar correo', normalizarCorreo('  LUIS@Correo.com ') === 'luis@correo.com');

// Nombre y texto
probar('nombre con tilde', validarNombre('José Peña') === null);
probar('nombre con ñ', validarNombre('Ñandú Ibarra') === null);
probar('nombre espacios dobles', validarNombre('María  José') === null);
probar('nombre con número', contiene(validarNombre('Juan3'), 'letras'));
probar('nombre con guion', validarNombre('Juan-Pérez') !== null);
probar('nombre vacío', contiene(validarNombre('   '), 'Ingresa el nombre'));
probar('nombre largo', contiene(validarNombre('a'.repeat(46)), '45 caracteres'));
probar('texto vacío', contiene(validarTextoObligatorio('   ', 'la dirección'), 'Ingresa la dirección'));
probar('texto largo', contiene(validarTextoObligatorio('a'.repeat(46), 'la dirección'), 'La dirección no puede superar los 45'));
probar('texto válido', validarTextoObligatorio('Av. Principal', 'la dirección') === null);
probar('limpiar', limpiar('  Nueva    Provincia ') === 'Nueva Provincia');

// Precio y cantidad
probar('precio válido', validarPrecio('2.5') === null);
probar('precio entero', validarPrecio('10') === null);
probar('precio cero', contiene(validarPrecio('0'), 'mayor que 0'));
probar('precio 0.00', contiene(validarPrecio('0.00'), 'mayor que 0'));
probar('precio 3 decimales', contiene(validarPrecio('2.555'), '2 decimales'));
probar('precio texto', contiene(validarPrecio('abc'), 'número'));
probar('precio punto final', validarPrecio('5.') !== null);
probar('precio vacío', contiene(validarPrecio(''), 'Ingresa'));
probar('cantidad cero', validarCantidad('0') === null);
probar('cantidad válida', validarCantidad('50') === null);
probar('cantidad decimal', contiene(validarCantidad('2.5'), 'entero'));
probar('cantidad negativa', contiene(validarCantidad('-1'), 'entero'));
probar('cantidad enorme', contiene(validarCantidad('100000000'), 'mayor'));

// Fechas
probar('fecha válida', esFechaValida('2026-11-25'));
probar('fecha 30 de febrero', !esFechaValida('2026-02-30'));
probar('29 de febrero bisiesto', esFechaValida('2028-02-29'));
probar('29 de febrero no bisiesto', !esFechaValida('2027-02-29'));
probar('mes 13', !esFechaValida('2026-13-01'));
probar('formato con barras', !esFechaValida('25/12/2026'));
probar('fecha local 23:30', fechaLocalAISO(new Date(2026, 10, 25, 23, 30)) === '2026-11-25');
probar('fecha local con cero', fechaLocalAISO(new Date(2026, 0, 5)) === '2026-01-05');
probar('formato corto', formatoFechaCorta('2026-11-25') === '25/11/2026');
const hoy = '2026-11-25';
probar('vencimiento futuro', validarFechaVencimiento('2027-12-31', false, hoy) === null);
probar('vencimiento ayer', contiene(validarFechaVencimiento('2026-11-24', false, hoy), 'anterior a hoy'));
probar('vencimiento hoy', validarFechaVencimiento('2026-11-25', false, hoy) === null);
probar('vencimiento pasado al editar', validarFechaVencimiento('2026-11-24', true, hoy) === null);
probar('vencimiento irreal', contiene(validarFechaVencimiento('2026-02-30', false, hoy), 'fecha real'));
probar('vencimiento formato', contiene(validarFechaVencimiento('25/12/2026', false, hoy), 'AAAA-MM-DD'));
probar('vencimiento vacío', contiene(validarFechaVencimiento('', false, hoy), 'Ingresa'));

// Filtros
probar('filtrarDigitos', filtrarDigitos('09a9-1 23', 10) === '099123');
probar('filtrarDigitos máximo', filtrarDigitos('12345678901234', 10) === '1234567890');
probar('filtrarLetras', filtrarLetras('  José3  Peña ') === 'José Peña ');
probar('filtrarDecimal coma', filtrarDecimal('12,345', 8, 2) === '12.34');
probar('filtrarDecimal puntos y letras', filtrarDecimal('1a2.3.4', 8, 2) === '12.34');
probar('filtrarDecimal enteros', filtrarDecimal('123456789', 8, 2) === '12345678');

// Dinero
probar('centavos 2.50', aCentavos('2.50') === 250);
probar('centavos 0.29', aCentavos('0.29') === 29);
probar('centavos 19.99', aCentavos(19.99) === 1999);
probar('deCentavos 250', deCentavos(250) === '2.50');
probar('deCentavos 5', deCentavos(5) === '0.05');
probar('dinero 5.75', formatoDinero('5.75') === '$5.75');
probar('dinero miles', formatoDinero('1234.5') === '$1,234.50');
probar('dinero cero', formatoDinero(0) === '$0.00');
probar('dinero millones', formatoDinero('1234567.89') === '$1,234,567.89');
probar('dinero inválido', formatoDinero('abc') === '$0.00');
probar('dinero negativo', formatoDinero(-5.5) === '-$5.50');
// Porcentaje de IVA
probar('porcentaje 15', validarPorcentaje('15') === null);
probar('porcentaje 8.5', validarPorcentaje('8.5') === null);
probar('porcentaje 0', validarPorcentaje('0') === null);
probar('porcentaje 100', validarPorcentaje('100') === null);
probar('porcentaje 100.00', validarPorcentaje('100.00') === null);
probar('porcentaje 100.01', contiene(validarPorcentaje('100.01'), 'entre 0 y 100'));
probar('porcentaje 101', contiene(validarPorcentaje('101'), 'entre 0 y 100'));
probar('porcentaje negativo', contiene(validarPorcentaje('-1'), 'número'));
probar('porcentaje 3 decimales', contiene(validarPorcentaje('8.555'), 'máximo 2 decimales'));
probar('porcentaje texto', contiene(validarPorcentaje('abc'), 'número'));
probar('porcentaje punto final', validarPorcentaje('5.') !== null);
probar('porcentaje sin entero', validarPorcentaje('.5') !== null);
probar('porcentaje vacío', contiene(validarPorcentaje(''), 'Ingresa'));
probar('porcentaje filtrado', filtrarDecimal('1234', 3, 2) === '123');

// Filtro de correo
probar('filtrarCorreo mayúsculas y espacios', filtrarCorreo(' Maria .Pena@Correo.COM ') === 'maria.pena@correo.com');
probar('filtrarCorreo tabulador', filtrarCorreo('a b\tc') === 'abc');

// Filtro de fecha AAAA-MM-DD
probar('fechaISO completa', filtrarFechaISO('20271231') === '2027-12-31');
probar('fechaISO ya con guiones', filtrarFechaISO('2027-12-31') === '2027-12-31');
probar('fechaISO solo año', filtrarFechaISO('2027') === '2027');
probar('fechaISO un dígito de mes', filtrarFechaISO('20271') === '2027-1');
probar('fechaISO retroceso sobre el último dígito', filtrarFechaISO('2027-12-') === '2027-12');
probar('fechaISO con barras y letras', filtrarFechaISO('2027/12/31abc') === '2027-12-31');
probar('fechaISO exceso de dígitos', filtrarFechaISO('202712319999') === '2027-12-31');
probar('fechaISO un dígito de día', filtrarFechaISO('2027123') === '2027-12-3');

// Descuento
probar('descuento vacío', validarDescuento('') === null);
probar('descuento 0', validarDescuento('0') === null);
probar('descuento 1.5', validarDescuento('1.5') === null);
probar('descuento 3 decimales', contiene(validarDescuento('1.555'), 'máximo 2 decimales'));
probar('descuento texto', contiene(validarDescuento('abc'), 'número'));
probar('descuento punto final', validarDescuento('5.') !== null);
probar('descuento negativo', validarDescuento('-1') !== null);
probar('descuento enorme', contiene(validarDescuento('100000000'), '99999999.99'));

// Totales (la misma fórmula que Laravel; los valores salen de las pruebas del backend)
probar('subtotal de líneas', subtotalDeLineas([{ precio: '1.25', cantidad: 2 }, { precio: '2.50', cantidad: 1 }]) === 500);
probar('totales 15% sin descuento: iva', calcularTotales(500, 0, 1500).iva === 75);
probar('totales 15% sin descuento: total', calcularTotales(500, 0, 1500).total === 575);
probar('totales 15% con descuento: iva', calcularTotales(500, 100, 1500).iva === 60);
probar('totales 15% con descuento: total', calcularTotales(500, 100, 1500).total === 460);
probar('totales 0%', calcularTotales(125, 25, 0).total === 100);
probar('iva 0.1485 sube a 0.15', calcularTotales(99, 0, 1500).iva === 15);
probar('total 0.99 + 0.15', calcularTotales(99, 0, 1500).total === 114);
probar('iva 0.015 sube a 0.02', calcularTotales(10, 0, 1500).iva === 2);
probar('iva 0.0495 baja a 0.05', calcularTotales(33, 0, 1500).iva === 5);
probar('iva 0.1875 sube a 0.19', calcularTotales(125, 0, 1500).iva === 19);
probar('iva 0.225 sube a 0.23', calcularTotales(150, 0, 1500).iva === 23);
probar('total 2.50 - 1.00 + iva', calcularTotales(250, 100, 1500).total === 173);
probar('descuento igual al subtotal', calcularTotales(125, 125, 1500).total === 0);
probar('descuento mayor: no queda negativo', calcularTotales(100, 500, 1500).total === 0);
probar('subtotal cero', calcularTotales(0, 0, 1500).total === 0);
probar('iva 8.5%', calcularTotales(1000, 0, 850).iva === 85);
probar('iva 19.99 al 15%', calcularTotales(1999, 0, 1500).iva === 300);

console.log(`${total} pruebas, ${fallos} fallos`);
if (fallos > 0) throw new Error('Hay pruebas fallidas');
