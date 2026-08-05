export function validate(schema, source = 'body'){
  return (req, res, next) => {
    //parseamos el soruce (body, params, query) con el schema de zod
    const result = schema.safeParse(req[source]);

    //tiramos el error de zod y lo maneja el errorHandler
    if (!result.success) {
      throw result.error
    }

    //se guarda un nuevo source "validated" con la data validada con el schema de zod
    req.validated = {};
    req.validated[source] = result.data

    next();
  }
}