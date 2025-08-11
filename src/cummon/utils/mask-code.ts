export function maskCode(code?: string | null, visible = 16) {
  if (!code) return code ?? '';
  const head = code.slice(0, visible);
  const tailLen = Math.max(code.length - visible, 0);
  return head + '*'.repeat(tailLen); // mask semua sisa karakter
  // kalau mau 8 bintang tetap: return head + "********";
}
