const BACKEND_URL =
  process.env.BACKEND_URL ?? "https://cargaplus-production.up.railway.app";

export async function backendFetch(path: string, options: RequestInit = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${BACKEND_URL}${normalizedPath}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  return res;
}
