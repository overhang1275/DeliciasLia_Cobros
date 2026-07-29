export function publicBaseUrl() {
  return (process.env.TUNNEL_URL || process.env.NEXT_PUBLIC_TUNNEL_URL || process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/$/, "");
}

export function publicEstadoUrl(token: string) {
  const base = publicBaseUrl();
  return base ? `${base}/estado/${token}` : `/estado/${token}`;
}
