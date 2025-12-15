export function nanoid(length = 8) {
  return crypto.randomUUID().replace(/-/g, '').slice(0, length);
}
