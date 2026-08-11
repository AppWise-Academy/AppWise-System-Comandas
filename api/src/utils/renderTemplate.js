import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Handlebars from "handlebars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Elegimos Handlebars sobre EJS por dos razones prácticas para un equipo:
// 1) Es "logic-less": el template solo puede mostrar datos ({{variable}})
//    e iterar/condicionar ({{#each}}, {{#if}}), no ejecutar JS arbitrario.
//    Eso obliga a que la lógica de negocio (calcular totales, formatear
//    fechas, etc.) viva en el service, no mezclada en el HTML del mail.
// 2) Escapa por defecto ({{variable}} → HTML-safe), lo que evita inyección
//    de HTML si algún dato viene de un usuario (ej: nombre del cliente).
const TEMPLATES_DIR = path.join(__dirname, "../shared/templates/emails");

// Cache de templates ya compilados: leer y parsear el .hbs es trabajo de
// disco/CPU que no tiene sentido repetir en cada correo que se envía.
// La primera vez que se pide un template se compila y se guarda acá; las
// siguientes veces se reutiliza la función compilada directamente.
const compiledTemplates = new Map();

/**
 * Renderiza un template de correo (.hbs) ubicado en shared/templates/emails
 * con los datos recibidos, y devuelve el HTML final listo para enviar.
 *
 * @param {string} templateName - nombre del archivo sin extensión (ej: "welcome")
 * @param {object} data - datos que se inyectan en el template
 * @returns {string} HTML renderizado
 */
export function renderEmailTemplate(templateName, data = {}) {
  let compile = compiledTemplates.get(templateName);

  if (!compile) {
    const filePath = path.join(TEMPLATES_DIR, `${templateName}.hbs`);

    if (!fs.existsSync(filePath)) {
      throw new Error(
        `No existe el template de email "${templateName}" en ${TEMPLATES_DIR}`,
      );
    }

    const source = fs.readFileSync(filePath, "utf-8");
    compile = Handlebars.compile(source);
    compiledTemplates.set(templateName, compile);
  }

  return compile(data);
}
