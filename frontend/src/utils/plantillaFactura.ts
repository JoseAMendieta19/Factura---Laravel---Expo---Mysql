import type { Factura } from '../models/Factura';
import { formatoFechaCorta } from './fechas';
import { aCentavos, formatoDinero } from './formato';

// Cámbialo por el nombre de tu negocio: aparece en la cabecera del PDF.
export const NOMBRE_NEGOCIO = 'Facturación';

/** Todo texto que viene de la base de datos pasa por aquí antes de entrar al HTML. */
export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function plantillaFacturaHtml(factura: Factura): string {
  const e = escaparHtml;
  const cliente = factura.cliente;
  const vendedor = factura.vendedor;

  const dato = (etiqueta: string, valor?: string | null): string =>
    valor ? `<div class="dato"><span class="etq">${e(etiqueta)}:</span> ${e(valor)}</div>` : '';

  const filas = (factura.detalles ?? [])
    .map(
      (d) => `
        <tr>
          <td>${e(d.producto?.produc_serie ?? '')}</td>
          <td>${e(d.producto?.produc_nombre ?? `Producto #${d.produc_id}`)}</td>
          <td class="der">${d.det_fac_cant}</td>
          <td class="der">${formatoDinero(d.det_fac_precio_unitario)}</td>
          <td class="der">${formatoDinero(d.det_fac_total)}</td>
        </tr>`
    )
    .join('');

  const descuento =
    aCentavos(factura.fac_descuento) > 0
      ? `-${formatoDinero(factura.fac_descuento)}`
      : formatoDinero(factura.fac_descuento);

  const etiquetaIva = factura.iva ? `IVA (${Number(factura.iva.iva_valor)}%)` : 'IVA';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { box-sizing: border-box; }
    body { font-family: Helvetica, Arial, sans-serif; color: #1f2d26; font-size: 13px; margin: 0; padding: 24px; }
    .cabecera { display: flex; justify-content: space-between; align-items: flex-start;
                border-bottom: 3px solid #2f6f4f; padding-bottom: 12px; margin-bottom: 18px; }
    .negocio { font-size: 22px; font-weight: bold; color: #2f6f4f; }
    .titulo { text-align: right; }
    .titulo .factura { font-size: 20px; font-weight: bold; }
    .titulo .numero { font-size: 16px; color: #1f4d36; font-weight: bold; margin-top: 2px; }
    .titulo .fecha { margin-top: 2px; }
    .bloques { display: flex; gap: 16px; margin-bottom: 18px; }
    .bloque { flex: 1; border: 1px solid #c5d2ca; border-radius: 6px; padding: 10px 12px; }
    .bloque h3 { margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #5f6f66; }
    .nombre { font-size: 15px; font-weight: bold; margin-bottom: 4px; }
    .dato { margin-top: 2px; }
    .etq { color: #5f6f66; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #e3eee8; text-align: left; padding: 8px; font-size: 12px; border-bottom: 1px solid #c5d2ca; }
    td { padding: 8px; border-bottom: 1px solid #e3eee8; vertical-align: top; }
    tr { page-break-inside: avoid; }
    .der { text-align: right; }
    .totales { width: 45%; margin-left: auto; page-break-inside: avoid; }
    .totales div { display: flex; justify-content: space-between; padding: 4px 0; }
    .totales .total { border-top: 2px solid #2f6f4f; margin-top: 4px; padding-top: 8px; font-size: 17px; font-weight: bold; color: #1f4d36; }
    .pie { margin-top: 28px; text-align: center; font-size: 11px; color: #5f6f66; }
  </style>
</head>
<body>
  <div class="cabecera">
    <div class="negocio">${e(NOMBRE_NEGOCIO)}</div>
    <div class="titulo">
      <div class="factura">FACTURA</div>
      <div class="numero">${e(factura.fac_numero)}</div>
      <div class="fecha">Fecha: ${e(formatoFechaCorta(factura.fac_fecha))}</div>
    </div>
  </div>

  <div class="bloques">
    <div class="bloque">
      <h3>Cliente</h3>
      <div class="nombre">${e(cliente?.cli_nombres ?? 'Sin datos del cliente')}</div>
      ${dato('Cédula', cliente?.cli_cedula)}
      ${dato('Correo', cliente?.cli_correo)}
      ${dato('Teléfono', cliente?.cli_telefono)}
      ${dato('Dirección', cliente?.cli_direccion)}
    </div>
    <div class="bloque">
      <h3>Vendedor</h3>
      <div class="nombre">${e(vendedor?.vend_nombre ?? 'Sin datos del vendedor')}</div>
      ${dato('Código', vendedor?.vend_codigo)}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Serie</th>
        <th>Producto</th>
        <th class="der">Cant.</th>
        <th class="der">P. unitario</th>
        <th class="der">Total</th>
      </tr>
    </thead>
    <tbody>${filas}
    </tbody>
  </table>

  <div class="totales">
    <div><span>Subtotal</span><span>${formatoDinero(factura.fac_subtotal)}</span></div>
    <div><span>Descuento</span><span>${descuento}</span></div>
    <div><span>${e(etiquetaIva)}</span><span>${formatoDinero(factura.iva_monto)}</span></div>
    <div class="total"><span>Total</span><span>${formatoDinero(factura.fac_total)}</span></div>
  </div>

  <div class="pie">Documento generado por la aplicación ${e(NOMBRE_NEGOCIO)}.</div>
</body>
</html>`;
}
/** Nombre del archivo PDF: "FAC-000001.pdf" (cualquier carácter raro se cambia por "_"). */
export function nombreArchivoPdf(factura: Factura): string {
  return `${factura.fac_numero.replace(/[^A-Za-z0-9_-]/g, '_')}.pdf`;
}