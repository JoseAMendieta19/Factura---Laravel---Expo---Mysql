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
  validarDescuento,
  validarRangoFechas
} from '../src/utils/validaciones';
import type { Factura } from '../src/models/Factura';
import { escaparHtml, nombreArchivoPdf, plantillaFacturaHtml } from '../src/utils/plantillaFactura';
import { base64ABytes } from '../src/utils/base64';

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

// Rango de fechas Desde/Hasta
const sinErrorRango = (d: string, h: string): boolean => {
  const r = validarRangoFechas(d, h);
  return r.desde === null && r.hasta === null;
};
probar('rango vacío', sinErrorRango('', ''));
probar('rango solo desde', sinErrorRango('2026-11-25', ''));
probar('rango solo hasta', sinErrorRango('', '2026-11-25'));
probar('rango válido', sinErrorRango('2026-11-24', '2026-11-26'));
probar('rango mismo día', sinErrorRango('2026-11-25', '2026-11-25'));
probar('rango con espacios', sinErrorRango(' 2026-11-24 ', ' 2026-11-26 '));
probar('rango desde irreal', contiene(validarRangoFechas('2026-02-30', '').desde, 'fecha real'));
probar('rango hasta con barras', contiene(validarRangoFechas('', '25/11/2026').hasta, 'AAAA-MM-DD'));
probar('rango desde incompleta', validarRangoFechas('2026-11', '').desde !== null);
probar('rango hasta anterior', contiene(validarRangoFechas('2026-11-25', '2026-11-24').hasta, 'anterior'));
probar('rango hasta anterior no marca desde', validarRangoFechas('2026-11-25', '2026-11-24').desde === null);
probar('rango irreal tapa la comparación', validarRangoFechas('2026-02-30', '2026-01-01').hasta === null);

// Plantilla del PDF
const facturaPrueba: Factura = {
  fac_id: 1,
  fac_numero: 'FAC-000001',
  fac_fecha: '2026-11-25',
  cli_id: 1,
  vend_id: 1,
  fac_subtotal: '5.00',
  iva_id: 2,
  fac_descuento: '0.00',
  fac_total: '5.75',
  iva_monto: '0.75',
  cliente: {
    cli_id: 1,
    cli_cedula: '1300000005',
    cli_nombres: 'Cliente Factura',
    cli_correo: 'cliente.fac@correo.com',
    cli_telefono: '0991234567',
    cli_direccion: 'Av. Principal',
  },
  vendedor: { vend_id: 1, vend_nombre: 'Vendedor Factura', vend_codigo: 'VF01' },
  iva: { iva_id: 2, iva_nombre: 'IVA 15%', iva_valor: '15.00' },
  detalles: [
    {
      det_fac_id: 1,
      fac_id: 1,
      produc_id: 1,
      det_fac_cant: 2,
      det_fac_precio_unitario: '1.25',
      det_fac_total: '2.50',
      producto: { produc_id: 1, produc_serie: 'FT-001', produc_nombre: 'Café <Premium> & Co' },
    },
    {
      det_fac_id: 2,
      fac_id: 1,
      produc_id: 2,
      det_fac_cant: 1,
      det_fac_precio_unitario: '2.50',
      det_fac_total: '2.50',
      producto: { produc_id: 2, produc_serie: 'FT-002', produc_nombre: 'Aceite 1L' },
    },
  ],
};
const htmlPrueba = plantillaFacturaHtml(facturaPrueba);

probar('escapar caracteres', escaparHtml('<b>&"\'') === '&lt;b&gt;&amp;&quot;&#39;');
probar('pdf número', htmlPrueba.includes('FAC-000001'));
probar('pdf fecha', htmlPrueba.includes('25/11/2026'));
probar('pdf cliente', htmlPrueba.includes('Cliente Factura') && htmlPrueba.includes('1300000005'));
probar('pdf vendedor', htmlPrueba.includes('Vendedor Factura') && htmlPrueba.includes('VF01'));
probar('pdf producto escapado', htmlPrueba.includes('Café &lt;Premium&gt; &amp; Co'));
probar('pdf producto sin etiqueta cruda', !htmlPrueba.includes('<Premium>'));
probar('pdf línea unitario', htmlPrueba.includes('$1.25'));
probar('pdf subtotal', htmlPrueba.includes('$5.00'));
probar('pdf iva', htmlPrueba.includes('IVA (15%)') && htmlPrueba.includes('$0.75'));
probar('pdf total', htmlPrueba.includes('$5.75'));
probar('pdf descuento cero', htmlPrueba.includes('$0.00') && !htmlPrueba.includes('-$0.00'));
probar(
  'pdf descuento con signo',
  plantillaFacturaHtml({ ...facturaPrueba, fac_descuento: '1.00' }).includes('-$1.00')
);
probar(
  'pdf sin detalles',
  plantillaFacturaHtml({ ...facturaPrueba, detalles: undefined }).includes('FAC-000001')
);
probar(
  'pdf sin cliente',
  plantillaFacturaHtml({ ...facturaPrueba, cliente: undefined }).includes('Sin datos del cliente')
);
probar(
  'pdf nombre malicioso',
  !plantillaFacturaHtml({
    ...facturaPrueba,
    cliente: { cli_id: 1, cli_cedula: '1', cli_nombres: '<script>alert(1)</script>' },
  }).includes('<script>')
);

// Base64 a bytes (ida y vuelta con btoa, de 0 a 12 bytes para cubrir todos los rellenos)
for (let n = 0; n <= 12; n++) {
  const originales = Uint8Array.from({ length: n }, (_, i) => (i * 37 + 11) % 256);
  const decodificados = base64ABytes(btoa(String.fromCharCode(...originales)));
  probar(
    `base64 ida y vuelta (${n} bytes)`,
    decodificados.length === n && decodificados.every((b, i) => b === originales[i])
  );
}
const grandes = Uint8Array.from({ length: 5000 }, (_, i) => (i * 7) % 256);
const grandesDecodificados = base64ABytes(btoa(String.fromCharCode(...grandes)));
probar(
  'base64 ida y vuelta (5000 bytes)',
  grandesDecodificados.length === 5000 && grandesDecodificados.every((b, i) => b === grandes[i])
);
probar('base64 Man', base64ABytes('TWFu').join(',') === '77,97,110');
probar('base64 con relleno', base64ABytes('TWE=').join(',') === '77,97');
probar('base64 con doble relleno', base64ABytes('TQ==').join(',') === '77');
probar('base64 con espacios y saltos', base64ABytes('TW\n Fu ').join(',') === '77,97,110');
probar('base64 vacío', base64ABytes('').length === 0);

// Nombre del archivo PDF
probar('nombre de archivo', nombreArchivoPdf(facturaPrueba) === 'FAC-000001.pdf');
probar(
  'nombre de archivo con caracteres raros',
  nombreArchivoPdf({ ...facturaPrueba, fac_numero: 'FA/C 1:2' }) === 'FA_C_1_2.pdf'
);

console.log(`${total} pruebas, ${fallos} fallos`);
if (fallos > 0) throw new Error('Hay pruebas fallidas');
