import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { base64ABytes } from '../utils/base64';

const texto = (error: unknown): string => (error instanceof Error ? error.message : String(error));

export const pdfService = {
  /**
   * Genera el PDF, lo guarda con nombre propio en la caché de la app y abre el menú de compartir.
   * Si compartir no es posible, abre la pantalla de impresión del sistema (que permite guardar como PDF).
   */
  async generarYCompartir(html: string, nombreArchivo: string): Promise<void> {
    // 1. Crear el PDF y pedir también su contenido en base64.
    let base64: string;
    try {
      const resultado = await Print.printToFileAsync({ html, base64: true });
      if (!resultado.base64) {
        throw new Error('La librería no devolvió el contenido del PDF.');
      }
      base64 = resultado.base64;
    } catch (error) {
      throw new Error(`[Paso: crear el PDF] ${texto(error)}`);
    }

    // 2. Volver a escribirlo en la carpeta de caché de la app: ahí sí se puede compartir.
    //    (El archivo que deja expo-print en Android no lo puede leer expo-sharing dentro de Expo Go.)
    let uri: string | null = null;
    let fallo: string | null = null;
    try {
      const archivo = new File(Paths.cache, nombreArchivo);
      archivo.create({ overwrite: true });
      archivo.write(base64ABytes(base64));
      uri = archivo.uri;
    } catch (error) {
      fallo = `[Paso: guardar el archivo] ${texto(error)}`;
    }

    // 3. Abrir el menú de compartir.
    if (uri !== null) {
      try {
        if (!(await Sharing.isAvailableAsync())) {
          throw new Error('COMPARTIR_NO_DISPONIBLE');
        }
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: '.pdf' });
        return;
      } catch (error) {
        fallo = `[Paso: abrir el menú de compartir] ${texto(error)}`;
      }
    }

    // 4. Respaldo: la pantalla de impresión del sistema también permite guardar como PDF.
    console.warn('No se pudo compartir el PDF; se abre la pantalla de impresión.', fallo);
    try {
      await Print.printAsync({ html });
    } catch (error) {
      throw new Error(`${fallo ?? ''} | [Respaldo: pantalla de impresión] ${texto(error)}`);
    }
  },
};