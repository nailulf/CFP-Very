import { describe, it, expect, vi, beforeEach } from 'vitest';

const readSheetValues = vi.fn();
const updateSheetRange = vi.fn();
const appendSheetRow = vi.fn();
const ensureSheetTab = vi.fn();

vi.mock('./google-sheets', () => ({
  readSheetValues: (...a: unknown[]) => readSheetValues(...a),
  updateSheetRange: (...a: unknown[]) => updateSheetRange(...a),
  appendSheetRow: (...a: unknown[]) => appendSheetRow(...a),
  ensureSheetTab: (...a: unknown[]) => ensureSheetTab(...a),
}));

import { DEFAULT_PRICING } from './settings-config';

// Imported dynamically inside tests so the module-level cache resets per test via vi.resetModules.
async function freshStore() {
  vi.resetModules();
  return import('./settings-store');
}

describe('settings-store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_SHEET_ID = 'sheet-1';
    process.env.GOOGLE_SETTINGS_TAB = 'Settings';
  });

  it('falls back to default pricing when the Sheet read throws', async () => {
    readSheetValues.mockRejectedValue(new Error('tab missing'));
    const store = await freshStore();
    expect(await store.getPackagePricing()).toEqual(DEFAULT_PRICING);
  });

  it('returns merged pricing from a stored row', async () => {
    readSheetValues.mockResolvedValue([
      ['Key', 'Value', 'Updated At', 'Updated By'],
      ['packages', JSON.stringify({ starter: { price: 600000, salePrice: 450000 } }), '', ''],
    ]);
    const store = await freshStore();
    const pricing = await store.getPackagePricing();
    expect(pricing.starter).toEqual({ price: 600000, salePrice: 450000 });
    expect(pricing.family).toEqual(DEFAULT_PRICING.family);
  });

  it('caches reads within the TTL (second call does not re-read)', async () => {
    readSheetValues.mockResolvedValue([['Key', 'Value']]);
    const store = await freshStore();
    await store.getPackagePricing();
    await store.getPackagePricing();
    expect(readSheetValues).toHaveBeenCalledTimes(1);
  });

  it('updates an existing key row and busts the cache', async () => {
    readSheetValues.mockResolvedValue([
      ['Key', 'Value', 'Updated At', 'Updated By'],
      ['packages', '{}', '', ''],
    ]);
    const store = await freshStore();
    await store.savePackagePricing(
      {
        starter: { price: 700000, salePrice: null },
        family: { price: 1000000, salePrice: null },
        comprehensive: { price: 2000000, salePrice: null },
      },
      'admin@x.com',
    );
    expect(ensureSheetTab).toHaveBeenCalledWith('sheet-1', 'Settings');
    // existing 'packages' row is at data index 1 → sheet row 2
    expect(updateSheetRange).toHaveBeenCalledWith(
      'sheet-1',
      'Settings!A2:D2',
      expect.any(Array),
    );
  });
});
