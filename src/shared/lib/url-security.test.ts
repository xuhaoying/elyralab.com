import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateProxyResponse,
  validatePublicFetchUrl,
} from './url-security';

test('validatePublicFetchUrl rejects unsafe protocols, credentials, and private hosts', async () => {
  const cases = [
    'file:///etc/passwd',
    'https://user:pass@example.com/file.png',
    'http://localhost/file.png',
    'http://app.local/file.png',
    'http://127.0.0.1/file.png',
    'http://10.0.0.1/file.png',
    'http://172.16.0.1/file.png',
    'http://192.168.1.10/file.png',
    'http://[::1]/file.png',
    'http://[fc00::1]/file.png',
  ];

  for (const url of cases) {
    const result = await validatePublicFetchUrl(url);
    assert.equal(result.ok, false, url);
  }
});

test('validatePublicFetchUrl accepts public http and https URLs', async () => {
  const result = await validatePublicFetchUrl(
    'https://example.com/report.pdf'
  );

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.url.href, 'https://example.com/report.pdf');
  }
});

test('validateProxyResponse rejects oversized or unsafe response types', () => {
  const hugePdf = new Response(null, {
    headers: {
      'content-length': String(101 * 1024 * 1024),
      'content-type': 'application/pdf',
    },
  });
  const svg = new Response(null, {
    headers: {
      'content-type': 'image/svg+xml',
    },
  });
  const html = new Response(null, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
    },
  });

  assert.deepEqual(validateProxyResponse(hugePdf), {
    ok: false,
    error: 'File is too large',
    status: 413,
  });
  assert.deepEqual(validateProxyResponse(svg), {
    ok: false,
    error: 'File type is not allowed',
    status: 415,
  });
  assert.deepEqual(validateProxyResponse(html), {
    ok: false,
    error: 'File type is not allowed',
    status: 415,
  });
});

test('validateProxyResponse accepts common download-safe response types', () => {
  const pdf = new Response(null, {
    headers: {
      'content-type': 'application/pdf; charset=utf-8',
    },
  });

  assert.deepEqual(validateProxyResponse(pdf), {
    ok: true,
    contentType: 'application/pdf; charset=utf-8',
  });
});
