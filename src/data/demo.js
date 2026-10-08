// Données de démonstration entièrement fictives.
// Remplacez-les par votre propre base (voir src/data/api.js).

const WEEK = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

function hours(open, close, sundayClosed = false) {
  const h = {};
  for (const day of WEEK) {
    const closed = sundayClosed && day === 'dimanche';
    h[`${day}_ouvert`] = closed ? 0 : 1;
    h[`${day}_heure_ouverture`] = closed ? null : `${open}:00`;
    h[`${day}_heure_fermeture`] = closed ? null : `${close}:00`;
  }
  return h;
}

const slugify = s =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// [nom, quartier, adresse, lat, lng, ouverture, fermeture, fermé le dimanche, de garde]
const PHARMACIES = [
  ['Pharmacie du Rond-Point', 'Kaloum', 'Avenue de la République, près du rond-point', 9.5092, -13.7122, '08:00', '21:00', true, false],
  ['Pharmacie Les Palmiers', 'Dixinn', 'Rue des Palmiers, face au marché', 9.5401, -13.6789, '07:30', '22:00', false, true],
  ['Pharmacie de l’Espoir', 'Ratoma', 'Carrefour de l’Espoir', 9.5862, -13.6491, '08:00', '23:00', false, true],
  ['Pharmacie Bel Air', 'Matam', 'Route du Niger, immeuble Bel Air', 9.5503, -13.6612, '08:00', '21:00', true, false],
  ['Pharmacie La Corniche', 'Kaloum', 'Corniche Sud, à côté de la poste', 9.5154, -13.7051, '08:30', '20:30', true, false],
  ['Pharmacie Horizon', 'Ratoma', 'Axe Hamdallaye–Bambeto', 9.5812, -13.6402, '07:00', '23:59', false, true],
  ['Pharmacie Sainte-Marie', 'Dixinn', 'Avenue de l’Université', 9.5455, -13.6730, '08:00', '22:00', false, false],
  ['Pharmacie du Marché', 'Matoto', 'Marché central, entrée nord', 9.5728, -13.6122, '07:30', '21:30', false, false],
  ['Pharmacie Lumière', 'Ratoma', 'Kipé, rue de la Lumière', 9.5946, -13.6550, '08:00', '22:30', false, true],
  ['Pharmacie Nouvelle Santé', 'Matam', 'Boulevard du Commerce', 9.5481, -13.6531, '08:00', '21:00', true, false],
  ['Pharmacie de la Plage', 'Ratoma', 'Route de la plage, Taouyah', 9.5779, -13.6655, '09:00', '23:00', false, false],
  ['Pharmacie Étoile', 'Matoto', 'Carrefour de l’Étoile', 9.5866, -13.6012, '08:00', '22:00', false, true],
  ['Pharmacie Bon Secours', 'Dixinn', 'Rue du Bon Secours', 9.5389, -13.6851, '07:30', '21:00', true, false],
  ['Pharmacie Les Manguiers', 'Ratoma', 'Lambanyi, allée des Manguiers', 9.6234, -13.6290, '08:00', '21:30', false, false],
  ['Pharmacie Centrale du Port', 'Kaloum', 'Boulevard du Port', 9.5121, -13.7180, '08:00', '20:00', true, false],
  ['Pharmacie Sourire', 'Matoto', 'Gbessia, route de l’aéroport', 9.5770, -13.6195, '07:00', '23:00', false, true],
  ['Pharmacie du Stade', 'Dixinn', 'Face au stade', 9.5422, -13.6702, '08:00', '22:00', false, false],
  ['Pharmacie Vitalis', 'Ratoma', 'Nongo, centre commercial', 9.6312, -13.6401, '08:30', '21:30', false, false],
  ['Pharmacie de la Colline', 'Ratoma', 'Koloma, montée de la colline', 9.6051, -13.6302, '08:00', '22:00', false, true],
  ['Pharmacie Riviera', 'Ratoma', 'Cité Riviera', 9.5998, -13.6680, '08:00', '21:00', true, false],
  ['Pharmacie Le Baobab', 'Matam', 'Place du Baobab', 9.5532, -13.6460, '07:30', '22:30', false, false],
  ['Pharmacie Arc-en-Ciel', 'Matoto', 'Sangoyah, carrefour principal', 9.5951, -13.5890, '08:00', '21:00', false, false],
  ['Pharmacie Concorde', 'Kaloum', 'Rue de la Concorde', 9.5170, -13.7090, '08:00', '20:30', true, false],
  ['Pharmacie Harmonie', 'Ratoma', 'Cosa, près de l’école', 9.6110, -13.6510, '08:00', '23:00', false, true],
];

// [nom, quartier, adresse, lat, lng, ouverture, fermeture, spécialité]
const CLINIQUES = [
  ['Clinique Les Acacias', 'Ratoma', 'Kipé, rue des Acacias', 9.5961, -13.6522, '00:00', '23:59', 'Médecine générale et urgences'],
  ['Clinique Mère et Enfant', 'Dixinn', 'Avenue de l’Université', 9.5432, -13.6741, '07:00', '22:00', 'Pédiatrie et maternité'],
  ['Centre Médical Horizon', 'Matam', 'Boulevard du Commerce', 9.5492, -13.6550, '08:00', '20:00', 'Consultations et analyses'],
  ['Clinique du Littoral', 'Kaloum', 'Corniche Nord', 9.5180, -13.7022, '00:00', '23:59', 'Urgences et chirurgie'],
  ['Cabinet Dentaire Sourire', 'Ratoma', 'Taouyah, immeuble Azur', 9.5788, -13.6640, '08:30', '18:30', 'Soins dentaires'],
  ['Clinique Vision Plus', 'Matoto', 'Route de l’aéroport', 9.5755, -13.6201, '08:00', '19:00', 'Ophtalmologie'],
  ['Centre de Santé Lambanyi', 'Ratoma', 'Lambanyi, centre', 9.6240, -13.6302, '07:30', '21:00', 'Médecine générale'],
  ['Clinique Cardio Santé', 'Dixinn', 'Rue du Bon Secours', 9.5395, -13.6840, '08:00', '20:00', 'Cardiologie'],
  ['Laboratoire Analyse Express', 'Matam', 'Place du Baobab', 9.5540, -13.6472, '07:00', '19:00', 'Analyses médicales'],
  ['Clinique Les Jardins', 'Ratoma', 'Nongo, allée des Jardins', 9.6301, -13.6390, '00:00', '23:59', 'Hospitalisation et urgences'],
];

// [désignation, forme, prix public (GNF)]
const MEDICAMENTS = [
  ['Paracétamol 500 mg', 'comprimés, boîte de 16', 8000],
  ['Paracétamol 1 g', 'comprimés, boîte de 8', 10000],
  ['Ibuprofène 400 mg', 'comprimés, boîte de 20', 15000],
  ['Amoxicilline 500 mg', 'gélules, boîte de 12', 25000],
  ['Amoxicilline 1 g', 'comprimés, boîte de 6', 30000],
  ['Métronidazole 250 mg', 'comprimés, boîte de 20', 12000],
  ['Oméprazole 20 mg', 'gélules, boîte de 14', 22000],
  ['Artéméther-Luméfantrine', 'comprimés, boîte de 24', 35000],
  ['Sels de réhydratation orale', 'sachets, boîte de 10', 6000],
  ['Vitamine C 500 mg', 'comprimés à croquer, tube de 20', 9000],
  ['Fer + acide folique', 'comprimés, boîte de 30', 14000],
  ['Loratadine 10 mg', 'comprimés, boîte de 10', 11000],
  ['Salbutamol 100 µg', 'aérosol doseur', 40000],
  ['Metformine 500 mg', 'comprimés, boîte de 30', 18000],
  ['Amlodipine 5 mg', 'comprimés, boîte de 30', 20000],
  ['Diclofénac gel 1 %', 'tube de 50 g', 16000],
  ['Sirop contre la toux', 'flacon de 125 ml', 19000],
  ['Zinc 20 mg', 'comprimés dispersibles, boîte de 10', 7000],
  ['Ciprofloxacine 500 mg', 'comprimés, boîte de 10', 28000],
  ['Albendazole 400 mg', 'comprimé unique', 5000],
  ['Cétirizine 10 mg', 'comprimés, boîte de 15', 12000],
  ['Doliprane enfant 2,4 %', 'suspension buvable, 100 ml', 17000],
  ['Gel hydroalcoolique', 'flacon de 100 ml', 8000],
  ['Pansements stériles', 'boîte de 20', 10000],
  ['Thermomètre digital', 'unité', 45000],
  ['Compresses stériles', 'boîte de 50', 13000],
  ['Bétadine 10 %', 'flacon de 125 ml', 24000],
  ['Spasfon 80 mg', 'comprimés, boîte de 30', 21000],
  ['Smecta 3 g', 'sachets, boîte de 12', 23000],
  ['Vitamine D3', 'gouttes, flacon de 10 ml', 27000],
];

const pad2 = n => String(n % 100).padStart(2, '0');
// Numéro fictif au format guinéen : +224 6XX XX XX XX
const fakePhone = (prefix, i) => `+224 ${prefix}${i % 10} ${pad2(10 + i)} ${pad2(20 + i * 3)} ${pad2(30 + i * 7)}`;

const pharmacyCommon = {
  type_etablissement: 'pharmacie',
  pays: 'Guinée',
  email: null,
  description: 'Pharmacie de quartier : conseils, médicaments et produits de santé.',
};

export const PHARMACY_LIST = PHARMACIES.map(([nom, ville, adresse, lat, lng, open, close, sundayClosed, garde], i) => ({
  id: i + 1,
  nom,
  slug: slugify(nom),
  ville,
  adresse,
  latitude: lat,
  longitude: lng,
  telephone: fakePhone('62', i),
  garde,
  ...pharmacyCommon,
  ...hours(open, close, sundayClosed),
}));

export const CLINIC_LIST = CLINIQUES.map(([nom, ville, adresse, lat, lng, open, close, specialite], i) => ({
  id: 100 + i,
  nom,
  slug: slugify(nom),
  ville,
  adresse,
  latitude: lat,
  longitude: lng,
  telephone: fakePhone('66', i + 3),
  type_etablissement: 'clinique',
  pays: 'Guinée',
  email: `contact@${slugify(nom)}.example`,
  description: specialite,
  ...hours(open, close),
}));

// Chaque médicament est proposé par plusieurs pharmacies, avec un prix légèrement différent.
export const MEDICINE_LIST = MEDICAMENTS.flatMap(([designation, forme, prix], m) =>
  PHARMACY_LIST.filter((_, p) => (p + m) % 4 === 0).map((ph, k) => ({
    id: m * 100 + k,
    designation,
    slug: slugify(designation),
    // Visuel de démonstration propre au produit ; les autres photos restent à fournir.
    image: designation === 'Paracétamol 500 mg' ? '/img/medicaments/paracetamol-demo.jpg' : null,
    forme,
    prix_public: prix + ((k % 3) - 1) * 500,
    quantite: 5 + ((m * 7 + k * 3) % 40),
    pharmacie: ph.nom,
    pharmacie_slug: ph.slug,
    telephone: ph.telephone,
    adresse: ph.adresse,
    ville: ph.ville,
    latitude: ph.latitude,
    longitude: ph.longitude,
  }))
);
