export function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`❌ Falta la variable de entorno que es requerida: ${name}`);
    process.exit(1);
  }
  return value;
}
