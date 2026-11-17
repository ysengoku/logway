import { GOOGLE_DRIVE_FILE_NAME } from '@/constants/database';
import type { FileMetadata, DriveFileData } from '@/shared/types/database';

const GOOGLE_API_BASE_URL = 'https://www.googleapis.com';
const GOOGLE_API_DRIVE_URL = `${GOOGLE_API_BASE_URL}/drive/v3/files`;
const GOOGLE_API_UPLOAD_URL = `${GOOGLE_API_BASE_URL}/upload/drive/v3/files`;

/**
 * `unauthorized`: 401.
 * `not_found`: 404 (e.g. the file was deleted by another device).
 * `unavailable`: covers everything else, including network failures and 403.
 */
type DriveError = 'unauthorized' | 'not_found' | 'unavailable';
type DriveResult<T> = { success: true; data: T } | { success: false; error: DriveError };

/**
 * Fetches the list of files in Google Drive appDataFolder.
 * Only the first page (up to 100 files) is read. appDataFolder holds only this app's files.
 *
 * @returns List of each file's `id`, `name`, `md5Checksum`, and `createdTime`, or the error.
 */
export async function fetchList(accessToken: string): Promise<DriveResult<DriveFileData[]>> {
  const params = {
    spaces: 'appDataFolder',
    fields: 'files(id,name,md5Checksum,createdTime)',
  };
  const queryParams = new URLSearchParams(params);
  const url = `${GOOGLE_API_DRIVE_URL}?${queryParams}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      return { success: false, error: resolveError(response.status) };
    }
    const body: { files?: DriveFileData[] } = await response.json();
    return { success: true, data: body.files ?? [] };
  } catch {
    return { success: false, error: 'unavailable' };
  }
}

/**
 * Creates the data file in appDataFolder.
 * Drive allows duplicate names, so check with `fetchList` that the file does not exist first.
 * `uploadType=multipart` expects FormData that contains the metadata and the content in one request.
 *
 * @returns The new file's `id` and `md5Checksum`, or the error.
 */
export async function createFile(
  accessToken: string,
  data: Uint8Array<ArrayBuffer>,
): Promise<DriveResult<FileMetadata>> {
  const url = `${GOOGLE_API_UPLOAD_URL}?uploadType=multipart&fields=id,md5Checksum`;
  const metadata = {
    name: GOOGLE_DRIVE_FILE_NAME,
    parents: ['appDataFolder'],
    mimeType: 'application/octet-stream',
  };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([data], { type: 'application/octet-stream' }));
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    });
    if (!response.ok) {
      return { success: false, error: resolveError(response.status) };
    }
    const body: { id: string; md5Checksum: string } = await response.json();
    return { success: true, data: { fileId: body.id, md5Checksum: body.md5Checksum } };
  } catch {
    return { success: false, error: 'unavailable' };
  }
}

/**
 * Downloads the raw file with the given `fileId`.
 *
 * @returns The raw file, or the error.
 */
export async function downloadFile(
  accessToken: string,
  fileId: string,
): Promise<DriveResult<ArrayBuffer>> {
  const url = `${GOOGLE_API_DRIVE_URL}/${encodeURIComponent(fileId)}?alt=media`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      return { success: false, error: resolveError(response.status) };
    }
    const file = await response.arrayBuffer();
    return { success: true, data: file };
  } catch {
    return { success: false, error: 'unavailable' };
  }
}

/**
 * Replaces the content of the existing data file.
 * `uploadType=media` takes the raw file as the body.
 * (FormData cannot be used because it would store its boundaries in the file.)
 *
 * @returns The file's `id` and new `md5Checksum`, or the error.
 */
export async function updateFile(
  accessToken: string,
  fileId: string,
  data: Uint8Array<ArrayBuffer>,
): Promise<DriveResult<FileMetadata>> {
  const url = `${GOOGLE_API_UPLOAD_URL}/${encodeURIComponent(fileId)}?uploadType=media&fields=id,md5Checksum`;
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
      },
      body: data,
    });
    if (!response.ok) {
      return { success: false, error: resolveError(response.status) };
    }
    const body: { id: string; md5Checksum: string } = await response.json();
    return { success: true, data: { fileId: body.id, md5Checksum: body.md5Checksum } };
  } catch {
    return { success: false, error: 'unavailable' };
  }
}

/**
 * Deletes the file with the given `fileId`.
 *
 * @returns `null` on success, or the error.
 */
export async function deleteFile(accessToken: string, fileId: string): Promise<DriveResult<null>> {
  const url = `${GOOGLE_API_DRIVE_URL}/${encodeURIComponent(fileId)}`;
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      return { success: false, error: resolveError(response.status) };
    }
    return { success: true, data: null };
  } catch {
    return { success: false, error: 'unavailable' };
  }
}

function resolveError(status: number): DriveError {
  switch (status) {
    case 401:
      return 'unauthorized';
    case 404:
      return 'not_found';
    default:
      return 'unavailable';
  }
}
