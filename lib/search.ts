import type { DNSRecord, Zone } from './api';

const normalize = (value: unknown) => String(value ?? '').trim().toLowerCase();

export const matchesSearch = (query: string, values: unknown[]): boolean => {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const searchableValues = values.map(normalize);
  return terms.every((term) => searchableValues.some((value) => value.includes(term)));
};

export const filterZones = (zones: Zone[], query: string): Zone[] => {
  return zones.filter((zone) => matchesSearch(query, [
    zone.name,
    zone.status,
    zone.account?.name,
  ]));
};

export const filterDNSRecords = (records: DNSRecord[], query: string): DNSRecord[] => {
  return records.filter((record) => matchesSearch(query, [
    record.type,
    record.name,
    record.content,
    record.comment,
    record.ttl,
  ]));
};
