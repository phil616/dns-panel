import assert from 'node:assert/strict';
import test from 'node:test';
import { api, type Zone } from './api.ts';

test('getZones aggregates every Cloudflare result page', async (context) => {
  const originalFetch = globalThis.fetch;
  const requestedUrls: string[] = [];
  context.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async (input) => {
    const url = String(input);
    requestedUrls.push(url);
    const page = new URL(url, 'http://localhost').searchParams.get('page');
    const result: Zone[] = page === '1'
      ? [
          { id: 'one', name: 'one.example', status: 'active', account: { id: 'a', name: 'Account' } },
          { id: 'two', name: 'two.example', status: 'active', account: { id: 'a', name: 'Account' } },
        ]
      : [
          { id: 'three', name: 'three.example', status: 'active', account: { id: 'a', name: 'Account' } },
        ];

    return new Response(JSON.stringify({
      success: true,
      result,
      result_info: { page: Number(page), total_pages: 2 },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  const zones = await api.getZones();

  assert.deepEqual(zones.map((zone) => zone.id), ['one', 'two', 'three']);
  assert.deepEqual(requestedUrls, [
    '/api/cloudflare/zones?page=1&per_page=50',
    '/api/cloudflare/zones?page=2&per_page=50',
  ]);
});
