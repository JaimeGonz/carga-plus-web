const BACKEND_URL =
  process.env.BACKEND_URL ?? "https://cargaplus-production.up.railway.app";

export async function backendFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  return res;
}
