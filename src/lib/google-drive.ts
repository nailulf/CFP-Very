import 'server-only';
import { getOwnerAccessToken } from './google-oauth';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';
// Upload target. Preferred: a specific folder ID you own (from its Drive URL,
// .../folders/<ID>). If unset, the app falls back to a folder it creates by name.
const PROOF_FOLDER_ID = process.env.GOOGLE_DRIVE_PROOF_FOLDER_ID;
const FOLDER_NAME = process.env.KONSULTASI_PROOF_FOLDER || 'Bukti Pembayaran Konsultasi';
// Reviewer the app-created folder is auto-shared with (only used in the fallback).
const SHARE_WITH = process.env.KONSULTASI_PROOF_SHARE_EMAIL || 'adityacleverina@gmail.com';

type DriveFile = { id: string; webViewLink?: string };

async function driveFetch(token: string, url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
    cache: 'no-store',
  });
}

/**
 * The proof folder id — found among files this app created (the `drive.file` scope
 * only ever sees app-created files, so a name search reliably resolves it). Created
 * and shared with the reviewer on first use.
 */
async function findOrCreateFolder(token: string): Promise<string> {
  const q = `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME.replace(/'/g, "\\'")}' and trashed=false`;
  const list = await driveFetch(token, `${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=files(id,name)&spaces=drive`);
  if (list.ok) {
    const data = (await list.json()) as { files?: { id: string }[] };
    if (data.files && data.files.length > 0) return data.files[0].id;
  }

  const create = await driveFetch(token, `${DRIVE_API}/files?fields=id`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
  });
  if (!create.ok) {
    throw new Error(`Drive folder create failed (${create.status}): ${await create.text()}`);
  }
  const folderId = ((await create.json()) as DriveFile).id;

  // Best-effort: share the folder with the reviewer so both can see proofs.
  if (SHARE_WITH) {
    try {
      await driveFetch(token, `${DRIVE_API}/files/${folderId}/permissions?sendNotificationEmail=false`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'reader', type: 'user', emailAddress: SHARE_WITH }),
      });
    } catch (error) {
      console.error('Proof folder share failed (non-fatal):', error);
    }
  }
  return folderId;
}

export type ProofUpload = {
  bookingId: string;
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
};

/** Upload a payment-proof file to the owner's Drive; returns its view link. */
export async function uploadPaymentProof(p: ProofUpload): Promise<{ link: string }> {
  const token = await getOwnerAccessToken(); // throws OAuthNotConfigured when unset
  const folderId = PROOF_FOLDER_ID || (await findOrCreateFolder(token));

  const metadata = { name: `${p.bookingId} - ${p.fileName}`, parents: [folderId] };
  const boundary = `kbproof${p.bookingId}`;
  const head = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\nContent-Type: ${p.mimeType}\r\n\r\n`,
  );
  const tail = Buffer.from(`\r\n--${boundary}--`);
  const body = Buffer.concat([head, Buffer.from(p.bytes), tail]);

  const res = await driveFetch(token, `${DRIVE_UPLOAD}?uploadType=multipart&fields=id,webViewLink`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
  if (!res.ok) {
    throw new Error(`Drive upload failed (${res.status}): ${await res.text()}`);
  }
  const file = (await res.json()) as DriveFile;
  return { link: file.webViewLink ?? `https://drive.google.com/file/d/${file.id}/view` };
}
