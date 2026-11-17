import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFile, deleteFile, downloadFile, fetchList, updateFile } from '@/api/google';

const TOKEN = 'test-token';
const FILE_ID = '1VGcSnAmmuN4MeyYzbr6bpiIcASAJ0xB5KA-n6RpPOE7gR8yL8A';
const CHECKSUM = '5289df737df57326fcdd22597afb1fac';
const UPDATED_CHECKSUM = '9f3c1a6e2b7d4e0f8a5c3b1d6e2f7a40';
const DRIVE_URL = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** The URL and options of the single request sent by the function under test. */
function sentRequest(): { url: URL; init: RequestInit } {
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [input, init] = fetchMock.mock.calls[0]!;
  return { url: new URL(String(input)), init: init ?? {} };
}

function bytes(): Uint8Array<ArrayBuffer> {
  return new Uint8Array([0x53, 0x51, 0x4c, 0x69, 0x74, 0x65]);
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchList', () => {
  it('lists appDataFolder with the fields the sync needs', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ files: [] }));

    await fetchList(TOKEN);

    const { url, init } = sentRequest();
    expect(`${url.origin}${url.pathname}`).toBe(DRIVE_URL);
    expect(url.searchParams.get('spaces')).toBe('appDataFolder');
    expect(url.searchParams.get('fields')).toBe('files(id,name,md5Checksum,createdTime)');
    expect(init.method).toBe('GET');
  });

  it('returns the files', async () => {
    const file = {
      id: FILE_ID,
      name: 'logway.sqlite',
      createdTime: '2026-11-17T10:22:43.460Z',
      md5Checksum: CHECKSUM,
    };
    fetchMock.mockResolvedValue(jsonResponse({ files: [file] }));

    expect(await fetchList(TOKEN)).toEqual({ success: true, data: [file] });
  });

  it('returns an empty list when there are no files', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ files: [] }));

    expect(await fetchList(TOKEN)).toEqual({ success: true, data: [] });
  });
});

describe('downloadFile', () => {
  it('requests the file content', async () => {
    fetchMock.mockResolvedValue(new Response(bytes()));

    await downloadFile(TOKEN, FILE_ID);

    const { url, init } = sentRequest();
    expect(`${url.origin}${url.pathname}`).toBe(`${DRIVE_URL}/${FILE_ID}`);
    expect(url.searchParams.get('alt')).toBe('media');
    expect(init.method).toBe('GET');
  });

  it('returns the bytes as they are', async () => {
    fetchMock.mockResolvedValue(new Response(bytes()));

    expect(await downloadFile(TOKEN, FILE_ID)).toEqual({ success: true, data: bytes().buffer });
  });
});

describe('createFile', () => {
  it('sends the metadata and the content as multipart', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: FILE_ID, md5Checksum: CHECKSUM }));

    await createFile(TOKEN, bytes());

    const { url, init } = sentRequest();
    expect(`${url.origin}${url.pathname}`).toBe(UPLOAD_URL);
    expect(url.searchParams.get('uploadType')).toBe('multipart');
    expect(url.searchParams.get('fields')).toBe('id,md5Checksum');
    expect(init.method).toBe('POST');

    const form = init.body as FormData;
    const metadata = JSON.parse(await (form.get('metadata') as Blob).text());
    expect(metadata).toMatchObject({ name: 'logway.sqlite', parents: ['appDataFolder'] });
    const content = new Uint8Array(await (form.get('file') as Blob).arrayBuffer());
    expect(content).toEqual(bytes());
  });

  it('returns the new file id and checksum', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: FILE_ID, md5Checksum: CHECKSUM }));

    expect(await createFile(TOKEN, bytes())).toEqual({
      success: true,
      data: { fileId: FILE_ID, md5Checksum: CHECKSUM },
    });
  });
});

describe('updateFile', () => {
  it('sends the raw bytes, not FormData', async () => {
    const data = bytes();
    fetchMock.mockResolvedValue(jsonResponse({ id: FILE_ID, md5Checksum: UPDATED_CHECKSUM }));

    await updateFile(TOKEN, FILE_ID, data);

    const { url, init } = sentRequest();
    expect(`${url.origin}${url.pathname}`).toBe(`${UPLOAD_URL}/${FILE_ID}`);
    expect(url.searchParams.get('uploadType')).toBe('media');
    expect(url.searchParams.get('fields')).toBe('id,md5Checksum');
    expect(init.method).toBe('PATCH');
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/octet-stream' });
    expect(init.body).toBe(data);
  });

  it('returns the file id and the new checksum', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: FILE_ID, md5Checksum: UPDATED_CHECKSUM }));

    expect(await updateFile(TOKEN, FILE_ID, bytes())).toEqual({
      success: true,
      data: { fileId: FILE_ID, md5Checksum: UPDATED_CHECKSUM },
    });
  });
});

describe('deleteFile', () => {
  it('deletes the file', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const result = await deleteFile(TOKEN, FILE_ID);

    const { url, init } = sentRequest();
    expect(`${url.origin}${url.pathname}`).toBe(`${DRIVE_URL}/${FILE_ID}`);
    expect(init.method).toBe('DELETE');
    expect(result).toEqual({ success: true, data: null });
  });
});

describe.each([
  ['fetchList', () => fetchList(TOKEN)],
  ['downloadFile', () => downloadFile(TOKEN, FILE_ID)],
  ['createFile', () => createFile(TOKEN, bytes())],
  ['updateFile', () => updateFile(TOKEN, FILE_ID, bytes())],
  ['deleteFile', () => deleteFile(TOKEN, FILE_ID)],
])('%s (common)', (_, call) => {
  it('sends the access token', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await call();

    expect(sentRequest().init.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` });
  });

  it.each([
    [401, 'unauthorized'],
    [404, 'not_found'],
    [403, 'unavailable'],
    [429, 'unavailable'],
    [500, 'unavailable'],
  ])('maps status %i to `%s`', async (status, error) => {
    fetchMock.mockResolvedValue(new Response(null, { status }));

    expect(await call()).toEqual({ success: false, error });
  });

  it('returns `unavailable` when the request fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    expect(await call()).toEqual({ success: false, error: 'unavailable' });
  });
});
