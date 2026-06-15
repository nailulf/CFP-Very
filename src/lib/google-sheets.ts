import 'server-only';
import { getGoogleAccessToken } from './google-auth';

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

type CellValue = string | number | boolean;

export async function appendSheetRow(
  spreadsheetId: string,
  range: string,
  row: CellValue[]
): Promise<void> {
  const token = await getGoogleAccessToken();
  const url = `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: [row] }),
  });
  if (!res.ok) {
    throw new Error(
      `Google Sheets append failed (${res.status}): ${await res.text()}`
    );
  }
}

export async function getSheetRowCount(
  spreadsheetId: string,
  range: string
): Promise<number> {
  const rows = await readSheetValues(spreadsheetId, range);
  return rows.length;
}

export async function readSheetValues(
  spreadsheetId: string,
  range: string
): Promise<string[][]> {
  const token = await getGoogleAccessToken();
  const url = `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(
      `Google Sheets read failed (${res.status}): ${await res.text()}`
    );
  }
  const data = (await res.json()) as { values?: string[][] };
  return data.values ?? [];
}

export async function updateSheetRange(
  spreadsheetId: string,
  range: string,
  values: CellValue[][]
): Promise<void> {
  const token = await getGoogleAccessToken();
  const url = `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });
  if (!res.ok) {
    throw new Error(
      `Google Sheets update failed (${res.status}): ${await res.text()}`
    );
  }
}

async function getSheetGridId(
  spreadsheetId: string,
  tabName: string
): Promise<number> {
  const token = await getGoogleAccessToken();
  const url = `${SHEETS_API}/${spreadsheetId}?fields=sheets.properties`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(
      `Google Sheets metadata failed (${res.status}): ${await res.text()}`
    );
  }
  const data = (await res.json()) as {
    sheets?: { properties: { sheetId: number; title: string } }[];
  };
  const sheet = data.sheets?.find((s) => s.properties.title === tabName);
  if (!sheet) {
    throw new Error(`Tab "${tabName}" not found in spreadsheet.`);
  }
  return sheet.properties.sheetId;
}

/**
 * Create a tab if it does not already exist. No-op when the tab is present.
 * Used so the admin dashboard can self-bootstrap the "Settings" tab.
 */
export async function ensureSheetTab(
  spreadsheetId: string,
  tabName: string
): Promise<void> {
  const token = await getGoogleAccessToken();
  const metaUrl = `${SHEETS_API}/${spreadsheetId}?fields=sheets.properties`;
  const metaRes = await fetch(metaUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!metaRes.ok) {
    throw new Error(`Google Sheets metadata failed (${metaRes.status}): ${await metaRes.text()}`);
  }
  const data = (await metaRes.json()) as {
    sheets?: { properties: { title: string } }[];
  };
  if (data.sheets?.some((s) => s.properties.title === tabName)) return;

  const url = `${SHEETS_API}/${spreadsheetId}:batchUpdate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{ addSheet: { properties: { title: tabName } } }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Google Sheets addSheet failed (${res.status}): ${await res.text()}`);
  }
}

export async function deleteSheetRow(
  spreadsheetId: string,
  tabName: string,
  rowIndex: number
): Promise<void> {
  const gridId = await getSheetGridId(spreadsheetId, tabName);
  const token = await getGoogleAccessToken();
  const url = `${SHEETS_API}/${spreadsheetId}:batchUpdate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: gridId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(
      `Google Sheets delete failed (${res.status}): ${await res.text()}`
    );
  }
}
