import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../data/projects.json' with { type: 'json' };
import { validateProjectData } from '../scripts/project-data.mjs';

test('the bundled sample collection satisfies its public schema', () => {
  assert.equal(validateProjectData(data).projects.length, 3);
});

for (const [field, value] of [
  ['lat', 90.1], ['lat', -90.1], ['lng', 180.1], ['lng', -180.1],
  ['lat', '37.7'], ['lat', NaN], ['lng', Infinity],
  ['importance', -0.1], ['importance', 1.1], ['status', 'unknown'], ['id', ''],
]) {
  test(`rejects ${field}=${value}`, () => {
    const invalid = structuredClone(data);
    invalid.projects[0][field] = value;
    assert.throws(() => validateProjectData(invalid), /Invalid project data/);
  });
}

test('accepts coordinate boundaries and an empty project collection', () => {
  const edge = structuredClone(data);
  Object.assign(edge.projects[0], { lat: 90, lng: -180, importance: 0 });
  Object.assign(edge.projects[1], { lat: -90, lng: 180, importance: 1 });
  assert.doesNotThrow(() => validateProjectData(edge));
  assert.doesNotThrow(() => validateProjectData({ ...data, projects: [] }));
});

test('rejects duplicate IDs even when other project fields differ', () => {
  const invalid = structuredClone(data);
  invalid.projects[1].id = invalid.projects[0].id;
  assert.throws(() => validateProjectData(invalid), /Duplicate project id/);
});

test('rejects missing fields, unknown fields, and unsupported schema versions', () => {
  for (const mutate of [
    item => { delete item.projects[0].name; },
    item => { item.projects[0].latitude = 10; },
    item => { item.schemaVersion = 2; },
    item => { item.dataKind = 'observations'; },
  ]) {
    const invalid = structuredClone(data);
    mutate(invalid);
    assert.throws(() => validateProjectData(invalid), /Invalid project data/);
  }
});
