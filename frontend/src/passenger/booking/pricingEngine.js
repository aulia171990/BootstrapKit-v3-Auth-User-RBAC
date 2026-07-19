// Shared Passenger Pricing Engine (frontend).
//
// This is the SINGLE source of truth for fare calculation in the Passenger App.
// It mirrors the backend `PricingEngineService` / `FareResult` model (see
// backend/laravel/app/Services/PricingEngineService.php) so the fare the
// customer sees in Vehicle Selection (3B-2C) and Fare Review (3B-2D) is
// computed identically — no duplicated or divergent math.
//
// The backend engine is gated behind admin RBAC (`pricing.calculate`), so it is
// not directly callable by a customer token in this build. When the backend
// exposes a passenger-scoped estimate endpoint, swap `estimateFare()` for a
// `papi.estimateFare(...)` call that returns the same `{components, currency,
// finalFare}` shape — the screen components consuming this module will not
// change.
//
// Component codes intentionally match the backend `FareComponent` codes:
//   base_fare | distance_fare | duration_fare | minimum_fare | surge |
//   platform_fee | insurance_fee | promo_discount | voucher_discount | tax

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/**
 * Vehicle catalog. Each entry mirrors a backend `PricingRule` (base_fare,
 * per_km_rate, per_minute_rate, minimum_fare, currency) plus passenger-facing
 * display fields (capacity, icon, tone).
 *
 * `service_type` matches the backend `service_type` dimension so a future
 * backend estimate call can be wired without reshaping this catalog.
 */
export const VEHICLES = [
  {
    id: 'bike',
    name: 'Motor',
    description: 'Cepat lewat macet, cocok untuk satu penumpang tanpa banyak barang.',
    serviceType: 'ride',
    vehicleType: 'bike',
    icon: 'bike',
    tone: 'primary',
    capacity: 1,
    capacityLabel: '1 orang',
    // Pricing rule params (IDR) — mirrors backend PricingRule columns.
    baseFare: 6000,
    perKmRate: 2200,
    perMinuteRate: 300,
    minimumFare: 10000,
    currency: 'IDR',
  },
  {
    id: 'car',
    name: 'Mobil',
    description: 'Nyaman untuk perjalanan keluarga atau bawaan banyak.',
    serviceType: 'ride',
    vehicleType: 'car',
    icon: 'car',
    tone: 'info',
    capacity: 4,
    capacityLabel: '4 orang',
    baseFare: 10000,
    perKmRate: 4500,
    perMinuteRate: 600,
    minimumFare: 18000,
    currency: 'IDR',
  },
  {
    id: 'xl',
    name: 'Mobil XL',
    description: 'Kapasitas besar untuk rombongan atau barang voluminous.',
    serviceType: 'ride',
    vehicleType: 'xl',
    icon: 'car',
    tone: 'success',
    capacity: 6,
    capacityLabel: '6 orang',
    baseFare: 14000,
    perKmRate: 6000,
    perMinuteRate: 800,
    minimumFare: 25000,
    currency: 'IDR',
  },
];

export const getVehicle = (id) => VEHICLES.find((v) => v.id === id) || null;

/**
 * Estimate a fare for a vehicle over a route.
 *
 * @param {object} vehicle        a VEHICLES entry
 * @param {object} route          { distanceKm, durationMin }
 * @param {object} [opts]
 * @param {number} [opts.surgeMultiplier=1] dynamic-pricing surge (1 = no surge)
 * @param {number} [opts.platformFee=2000]  flat platform/service fee
 * @param {number} [opts.insuranceFee=500]  passenger insurance
 * @param {number} [opts.promoDiscount=0]   promo deduction (>=0)
 * @param {number} [opts.voucherDiscount=0] voucher deduction (>=0)
 * @param {number} [opts.taxRate=0.11]       VAT rate applied to taxable base
 * @returns {{components:Array, currency:string, finalFare:number, baseSubtotal:number}}
 */
export function estimateFare(vehicle, route = {}, opts = {}) {
  const distanceKm = Number(route.distanceKm) || 0;
  const durationMin = Number(route.durationMin) || 0;

  const baseFare = round2(vehicle.baseFare);
  const distanceFare = round2(distanceKm * vehicle.perKmRate);
  const durationFare = round2(durationMin * vehicle.perMinuteRate);

  const preMinimum = round2(baseFare + distanceFare + durationFare);
  const minimumFare = round2(vehicle.minimumFare);
  const minimumApplied = preMinimum < minimumFare;
  const subtotal = minimumApplied ? minimumFare : preMinimum;

  const surgeMultiplier = Math.max(0, Number(opts.surgeMultiplier) || 1);
  const surge = round2(subtotal * (surgeMultiplier - 1));

  const platformFee = round2(opts.platformFee ?? 2000);
  const insuranceFee = round2(opts.insuranceFee ?? 500);
  const promoDiscount = round2(opts.promoDiscount ?? 0);
  const voucherDiscount = round2(opts.voucherDiscount ?? 0);

  // Taxable base = subtotal + surge + platform + insurance (− discounts).
  const taxableBase = round2(
    subtotal + surge + platformFee + insuranceFee - promoDiscount - voucherDiscount,
  );
  const taxRate = Number(opts.taxRate ?? 0.11);
  const tax = round2(taxableBase * taxRate);

  const components = [
    { code: 'base_fare', label: 'Tarif dasar', amount: baseFare },
    { code: 'distance_fare', label: `Jarak (${distanceKm.toLocaleString('id-ID')} km)`, amount: distanceFare },
    { code: 'duration_fare', label: `Waktu (${durationMin.toLocaleString('id-ID')} mnt)`, amount: durationFare },
    { code: 'minimum_fare', label: 'Tarif minimum', amount: minimumApplied ? round2(minimumFare - preMinimum) : 0 },
    { code: 'surge', label: surgeMultiplier > 1 ? `Surge ×${surgeMultiplier.toFixed(2)}` : 'Surge', amount: surge },
    { code: 'platform_fee', label: 'Biaya platform', amount: platformFee },
    { code: 'insurance_fee', label: 'Asuransi', amount: insuranceFee },
    { code: 'promo_discount', label: 'Diskon promo', amount: -promoDiscount },
    { code: 'voucher_discount', label: 'Diskon voucher', amount: -voucherDiscount },
    { code: 'tax', label: `Pajak (${(taxRate * 100).toFixed(0)}%)`, amount: tax },
  ];

  const finalFare = round2(components.reduce((sum, c) => sum + Number(c.amount), 0));

  return { components, currency: vehicle.currency, finalFare, baseSubtotal: subtotal };
}

/** Format a numeric amount as IDR (no decimals). */
export function formatIDR(amount, currency = 'IDR') {
  const n = Number(amount) || 0;
  if (currency === 'IDR') return `Rp ${n.toLocaleString('id-ID')}`;
  return `${currency} ${n.toLocaleString('id-ID')}`;
}
