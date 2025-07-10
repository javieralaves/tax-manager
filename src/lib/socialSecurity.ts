export interface SocialSecurityBand {
  min: number
  max: number
  monthly: number
}

export const SOCIAL_SECURITY_BANDS: Readonly<SocialSecurityBand[]> = [
  { min: 0, max: 670, monthly: 200 },
  { min: 670, max: 900, monthly: 235 },
  { min: 900, max: 1166.7, monthly: 265 },
  { min: 1166.7, max: 1300, monthly: 275 },
  { min: 1300, max: 1500, monthly: 291 },
  { min: 1500, max: 1700, monthly: 294 },
  { min: 1700, max: 1850, monthly: 299 },
  { min: 1850, max: 2030, monthly: 305 },
  { min: 2030, max: 2330, monthly: 315 },
  { min: 2330, max: 2760, monthly: 325 },
  { min: 2760, max: 3190, monthly: 335 },
  { min: 3190, max: 3650, monthly: 355 },
  { min: 3650, max: 4250, monthly: 375 },
  { min: 4250, max: 6000, monthly: 415 },
  { min: 6000, max: Infinity, monthly: 530 },
] as const

export interface SocialSecurityCalculation {
  monthly: number
  annual: number
  toNextBand: number | null
  toPrevBand: number | null
}

export function calculateSocialSecurityQuota(
  annualNetRevenue: number
): SocialSecurityCalculation {
  const band =
    SOCIAL_SECURITY_BANDS.find(
      (b) => annualNetRevenue >= b.min && annualNetRevenue < b.max
    ) ?? SOCIAL_SECURITY_BANDS[SOCIAL_SECURITY_BANDS.length - 1]

  const index = SOCIAL_SECURITY_BANDS.indexOf(band)
  const next = SOCIAL_SECURITY_BANDS[index + 1]
  const prev = SOCIAL_SECURITY_BANDS[index - 1]

  const toNextBand = next ? next.min - annualNetRevenue : null
  const toPrevBand = prev ? annualNetRevenue - prev.max : null

  return {
    monthly: band.monthly,
    annual: band.monthly * 12,
    toNextBand,
    toPrevBand,
  }
}
