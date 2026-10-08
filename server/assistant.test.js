import test from 'node:test';
import assert from 'node:assert/strict';
import { classicIntent, interpret, searchCatalog } from './assistant.js';

test('Recherche classique, dosages, stock, ville et distance sans résultats inventés', () => {
  const intent = classicIntent('Je cherche du paracétamol 500 mg près de moi');
  assert.equal(intent.kind, 'medicaments');
  const items = [
    { id: 'a', designation: 'Paracétamol 500 mg', quantite: 5, latitude: 0, longitude: 1, ville: 'Ville A' },
    { id: 'b', designation: 'Paracétamol 500 mg', quantite: 5, latitude: 0, longitude: .1, ville: 'Ville A' },
    { id: 'c', designation: 'Paracétamol 5000 mg', quantite: 5, ville: 'Ville A' },
    { id: 'd', designation: 'Paracétamol 500 mg', quantite: 0, ville: 'Ville A' }
  ];
  const catalog = { medicaments: items, pharmacies: [{ id: 'p', nom: 'Pharmacie test', ville: 'Ville A', garde: true }], cliniques: [] };
  const response = searchCatalog(intent, catalog, { lat: 0, lng: 0 });
  assert.equal(response.total, 2); assert.equal(response.results[0].id, 'b');
  assert.equal(searchCatalog({ ...intent, query: 'Produit inconnu' }, catalog).total, 0);
  assert.equal(searchCatalog({ ...intent, query: 'Paracétamol 500' }, catalog).total, 2);
  assert.equal(searchCatalog({ ...intent, city: 'Ville B' }, catalog).total, 0);
  assert.equal(searchCatalog(classicIntent('Je cherche une pharmacie ouverte'), catalog).total, 0);
  assert.equal(searchCatalog(classicIntent('Je cherche une pharmacie de garde'), catalog).total, 1);
  assert.equal(classicIntent('Quel traitement prendre pour me soigner').kind, 'unsupported');
});

test('IA : contrat Responses, images avec consentement, confirmation et erreurs explicites', async () => {
  const original = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    assert.equal((await interpret({ message: 'paracétamol' })).mode, 'classic');
    await assert.rejects(interpret({ image: { data: 'anything' } }), error => error.status === 503);
    process.env.OPENAI_API_KEY = 'test-key-only';
    const recognized = { kind: 'medicaments', query: 'Paracétamol 500 mg', city: '', open_now: false, on_call: false, product: { name: 'Paracétamol', dosage: '500 mg', presentation: 'Comprimés' } };
    let calls = 0;
    const fetchImpl = async (url, options) => {
      calls++; assert.equal(url, 'https://api.openai.com/v1/responses');
      const body = JSON.parse(options.body);
      assert.equal(body.store, false); assert.equal(body.text.format.strict, true);
      assert.equal(body.input[0].content[1].type, 'input_image');
      assert.match(body.input[0].content[1].image_url, /^data:image\/png;base64,/);
      return { ok: true, json: async () => ({ status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify(recognized) }] }] }) };
    };
    const image = { data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXZkAAAAASUVORK5CYII=' };
    await assert.rejects(interpret({ image }, { fetchImpl }), error => error.status === 400);
    assert.equal(calls, 0);
    const result = await interpret({ image, consent_image: true }, { fetchImpl });
    assert.equal(result.confirmation, true); assert.equal(result.intent.product.dosage, '500 mg');
    assert.equal('results' in result, false);
    await assert.rejects(interpret({ message: 'test' }, { fetchImpl: async () => ({ ok: false }) }), error => error.status === 502);
    await assert.rejects(interpret({ message: 'test' }, { fetchImpl: async () => ({ ok: true, json: async () => ({ status: 'incomplete', output: [] }) }) }), error => error.status === 502);
    await assert.rejects(interpret({ image: { data: Buffer.from('<svg/>').toString('base64') }, consent_image: true }, { fetchImpl }), error => error.status === 400);
  } finally { if (original == null) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = original; }
});
