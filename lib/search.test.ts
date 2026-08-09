import assert from 'node:assert/strict';
import test from 'node:test';
import type { DNSRecord, Zone } from './api.ts';
import { filterDNSRecords, filterZones, matchesSearch } from './search.ts';

const record = (overrides: Partial<DNSRecord>): DNSRecord => ({
  id: 'record-id',
  type: 'A',
  name: 'api.example.com',
  content: '192.0.2.1',
  proxied: false,
  ttl: 1,
  created_on: '2026-01-01T00:00:00Z',
  modified_on: '2026-01-01T00:00:00Z',
  ...overrides,
});

test('matchesSearch ignores casing and surrounding whitespace', () => {
  assert.equal(matchesSearch('  API.Example  ', ['api.example.com']), true);
});

test('filterDNSRecords searches all visible record fields', () => {
  const records = [
    record({ id: 'api', type: 'A', name: 'api.example.com', content: '192.0.2.1' }),
    record({ id: 'mail', type: 'MX', name: 'example.com', content: 'mail.example.com' }),
    record({ id: 'verify', type: 'TXT', name: 'example.com', content: 'token', comment: 'Domain verification' }),
  ];

  assert.deepEqual(filterDNSRecords(records, 'api'), [records[0]]);
  assert.deepEqual(filterDNSRecords(records, 'mx mail'), [records[1]]);
  assert.deepEqual(filterDNSRecords(records, 'VERIFICATION'), [records[2]]);
  assert.deepEqual(filterDNSRecords(records, '192.0.2'), [records[0]]);
});

test('an empty DNS query returns every record', () => {
  const records = [record({ id: 'one' }), record({ id: 'two' })];
  assert.deepEqual(filterDNSRecords(records, '   '), records);
});

test('filterZones searches zone, status, and account name', () => {
  const zones: Zone[] = [
    { id: 'one', name: 'example.com', status: 'active', account: { id: 'a', name: 'Production' } },
    { id: 'two', name: 'example.net', status: 'pending', account: { id: 'b', name: 'Sandbox' } },
  ];

  assert.deepEqual(filterZones(zones, 'EXAMPLE.NET'), [zones[1]]);
  assert.deepEqual(filterZones(zones, 'production active'), [zones[0]]);
});
