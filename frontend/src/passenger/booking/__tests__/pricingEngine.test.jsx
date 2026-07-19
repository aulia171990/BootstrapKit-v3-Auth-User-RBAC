import { describe, it, expect } from 'vitest';
import {
  VEHICLES, getVehicle, estimateFare, formatIDR,
} from '../pricingEngine.js';

describe('Pricing Engine — catalog', () => {
  it('exposes three vehicles with pricing + capacity', () => {
    expect(VEHICLES).toHaveLength(3);
    const ids = VEHICLES.map((v) => v.id);
    expect(ids).toEqual(['bike', 'car', 'xl']);
    VEHICLES.forEach((v) => {
      expect(v.baseFare).toBeGreaterThan(0);
      expect(v.perKmRate).toBeGreaterThan(0);
      expect(v.perMinuteRate).toBeGreaterThan(0);
      expect(v.capacity).toBeGreaterThan(0);
    });
  });

  it('getVehicle finds by id', () => {
    expect(getVehicle('car')?.name).toBe('Mobil');
    expect(getVehicle('nope')).toBeNull();
  });
});

describe('Pricing Engine — fare math (mirrors backend FareResult)', () => {
  const route = { distanceKm: 10, durationMin: 20 };
  const bike = getVehicle('bike');

  it('computes base + distance + duration + fees + tax', () => {
    const r = estimateFare(bike, route);
    // base 6000 + 10*2200 + 20*300 = 6000 + 22000 + 6000 = 34000
    expect(r.finalFare).toBe(34000 + 2000 + 500 + Math.round((34000 + 2000 + 500) * 0.11));
    const codes = r.components.map((c) => c.code);
    expect(codes).toEqual(expect.arrayContaining(['base_fare', 'distance_fare', 'duration_fare', 'surge', 'platform_fee', 'insurance_fee', 'tax']));
    const base = r.components.find((c) => c.code === 'base_fare').amount;
    const dist = r.components.find((c) => c.code === 'distance_fare').amount;
    const dur = r.components.find((c) => c.code === 'duration_fare').amount;
    expect([base, dist, dur]).toEqual([6000, 22000, 6000]);
  });

  it('applies minimum fare when subtotal is below it', () => {
    const r = estimateFare(getVehicle('car'), { distanceKm: 0.5, durationMin: 1 });
    // car subtotal = 10000 + 0.5*4500 + 1*600 = 10000 + 2250 + 600 = 12850 < 18000 min
    const minComp = r.components.find((c) => c.code === 'minimum_fare').amount;
    expect(minComp).toBeGreaterThan(0); // top-up to minimum
  });

  it('applies surge multiplier dynamic pricing', () => {
    const noSurge = estimateFare(bike, route, { surgeMultiplier: 1 });
    const surged = estimateFare(bike, route, { surgeMultiplier: 1.8 });
    // Engine computes surge on the subtotal (base+distance+duration), not on fees.
    const subtotal = 6000 + 22000 + 6000; // 34000
    const surgeComp = surged.components.find((c) => c.code === 'surge').amount;
    expect(surgeComp).toBe(Math.round(subtotal * 0.8));
    expect(surged.finalFare).toBeGreaterThan(noSurge.finalFare);
  });

  it('subtracts promo / voucher discounts', () => {
    const r = estimateFare(bike, route, { promoDiscount: 2000, voucherDiscount: 1000 });
    expect(r.components.find((c) => c.code === 'promo_discount').amount).toBe(-2000);
    expect(r.components.find((c) => c.code === 'voucher_discount').amount).toBe(-1000);
    expect(r.finalFare).toBeLessThan(estimateFare(bike, route).finalFare);
  });

  it('formatIDR renders Indonesian Rupiah', () => {
    expect(formatIDR(12345)).toBe('Rp 12.345');
    expect(formatIDR(10000, 'USD')).toBe('USD 10.000');
  });
});
