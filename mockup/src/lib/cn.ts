/** Gabung nama kelas, abaikan nilai falsy. */
export function cn(...xs: (string | false | null | undefined)[]): string {
  return xs.filter(Boolean).join(' ')
}
