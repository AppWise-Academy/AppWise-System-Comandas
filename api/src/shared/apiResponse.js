export function ok(res, data, extra = {}) {
  return res.status(200).json({ ok: true, data, ...extra });
}

export async function created(res, data, extra = {}) {
  return res.status(201).json({ ok: true, data, ...extra });
}
