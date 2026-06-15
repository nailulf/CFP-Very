import 'server-only';
import { readSheetValues, updateSheetRange, appendSheetRow, ensureSheetTab } from './google-sheets';
import {
  DEFAULT_PRICING,
  mergePricing,
  mergeAvailability,
  type PackagePricing,
} from './settings-config';
import { BOOKING_AVAILABILITY, type BookingAvailability } from './booking-availability';

const CACHE_TTL_MS = 60_000;
const HEADERS = ['Key', 'Value', 'Updated At', 'Updated By'] as const;

function tab(): string {
  return process.env.GOOGLE_SETTINGS_TAB || 'Settings';
}

type CacheEntry<T> = { value: T; at: number };
let pricingCache: CacheEntry<PackagePricing> | null = null;
let availabilityCache: CacheEntry<BookingAvailability> | null = null;

function fresh<T>(c: CacheEntry<T> | null): T | null {
  if (c && Date.now() - c.at < CACHE_TTL_MS) return c.value;
  return null;
}

/** Read a single key's parsed JSON value. Returns null (fail-open) on any error. */
async function readSetting(key: string): Promise<unknown | null> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return null;
  try {
    const rows = await readSheetValues(sheetId, `${tab()}!A:D`);
    for (let i = 1; i < rows.length; i++) {
      if ((rows[i]?.[0] || '').trim() === key) {
        return JSON.parse(rows[i][1] || 'null');
      }
    }
  } catch {
    return null;
  }
  return null;
}

async function writeSetting(key: string, value: unknown, updatedBy: string): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not configured');
  await ensureSheetTab(sheetId, tab());

  const range = `${tab()}!A:D`;
  let rows: string[][] = [];
  try {
    rows = await readSheetValues(sheetId, range);
  } catch {
    rows = [];
  }

  const record = [key, JSON.stringify(value), new Date().toISOString(), updatedBy];

  if (rows.length === 0) {
    await appendSheetRow(sheetId, range, [...HEADERS]);
    await appendSheetRow(sheetId, range, record);
    return;
  }

  let foundRow = -1;
  for (let i = 1; i < rows.length; i++) {
    if ((rows[i]?.[0] || '').trim() === key) {
      foundRow = i;
      break;
    }
  }
  if (foundRow >= 0) {
    const sheetRow = foundRow + 1; // header is sheet row 1
    await updateSheetRange(sheetId, `${tab()}!A${sheetRow}:D${sheetRow}`, [record]);
  } else {
    await appendSheetRow(sheetId, range, record);
  }
}

export async function getPackagePricing(): Promise<PackagePricing> {
  const cached = fresh(pricingCache);
  if (cached) return cached;
  const raw = await readSetting('packages');
  const value = mergePricing(raw as never);
  pricingCache = { value, at: Date.now() };
  return value;
}

export async function getAvailabilityConfig(): Promise<BookingAvailability> {
  const cached = fresh(availabilityCache);
  if (cached) return cached;
  const raw = await readSetting('availability');
  const value = mergeAvailability(raw as never);
  availabilityCache = { value, at: Date.now() };
  return value;
}

export async function savePackagePricing(value: PackagePricing, updatedBy: string): Promise<void> {
  await writeSetting('packages', value, updatedBy);
  pricingCache = { value: mergePricing(value as never), at: Date.now() };
}

export async function saveAvailabilityConfig(value: BookingAvailability, updatedBy: string): Promise<void> {
  await writeSetting('availability', value, updatedBy);
  availabilityCache = { value: mergeAvailability(value), at: Date.now() };
}

// Re-export defaults for callers that want them without reaching into settings-config.
export { DEFAULT_PRICING, BOOKING_AVAILABILITY };
