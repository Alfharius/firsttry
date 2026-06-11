/** Склонение существительного «человек» после числительного (1 человек, 2 человека, 5 человек). */
export function peopleWord(count: number): string {
  const abs = Math.abs(count)
  const n = abs % 100
  const n1 = abs % 10
  if (n >= 11 && n <= 14) return 'человек'
  if (n1 === 1) return 'человек'
  if (n1 >= 2 && n1 <= 4) return 'человека'
  return 'человек'
}
