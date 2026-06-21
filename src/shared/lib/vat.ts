export const VAT_RATE = 0.22

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}

export function calcVatFromNet(net: number) {
  return roundMoney(Math.max(0, net) * VAT_RATE)
}

export function calcPricesFromNet(priceWithoutVat: number) {
  const net = roundMoney(Math.max(0, priceWithoutVat))
  const vat = calcVatFromNet(net)
  const priceWithVat = roundMoney(net + vat)

  return { priceWithoutVat: net, vat, priceWithVat }
}

export function calcPricesFromGross(priceWithVat: number) {
  const gross = roundMoney(Math.max(0, priceWithVat))
  const priceWithoutVat = roundMoney(gross / (1 + VAT_RATE))
  const vat = roundMoney(gross - priceWithoutVat)

  return { priceWithoutVat, vat, priceWithVat: gross }
}

export function sumEstimateNettos(nettos: number[]) {
  return calcPricesFromNet(nettos.reduce((sum, netto) => sum + netto, 0))
}
