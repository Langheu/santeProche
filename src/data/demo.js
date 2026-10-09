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
  [
    "Pharmacie du Rond-Point",
    "",
    "",
    null,
    null,
    "08:00",
    "21:00",
    true,
    false
  ],
  [
    "Pharmacie Les Palmiers",
    "",
    "",
    null,
    null,
    "07:30",
    "22:00",
    false,
    true
  ],
  [
    "Pharmacie de l’Espoir",
    "",
    "",
    null,
    null,
    "08:00",
    "23:00",
    false,
    true
  ],
  [
    "Pharmacie Bel Air",
    "",
    "",
    null,
    null,
    "08:00",
    "21:00",
    true,
    false
  ],
  [
    "Pharmacie La Corniche",
    "",
    "",
    null,
    null,
    "08:30",
    "20:30",
    true,
    false
  ],
  [
    "Pharmacie Horizon",
    "",
    "",
    null,
    null,
    "07:00",
    "23:59",
    false,
    true
  ],
  [
    "Pharmacie Sainte-Marie",
    "",
    "",
    null,
    null,
    "08:00",
    "22:00",
    false,
    false
  ],
  [
    "Pharmacie du Marché",
    "",
    "",
    null,
    null,
    "07:30",
    "21:30",
    false,
    false
  ],
  [
    "Pharmacie Lumière",
    "",
    "",
    null,
    null,
    "08:00",
    "22:30",
    false,
    true
  ],
  [
    "Pharmacie Nouvelle Santé",
    "",
    "",
    null,
    null,
    "08:00",
    "21:00",
    true,
    false
  ],
  [
    "Pharmacie de la Plage",
    "",
    "",
    null,
    null,
    "09:00",
    "23:00",
    false,
    false
  ],
  [
    "Pharmacie Étoile",
    "",
    "",
    null,
    null,
    "08:00",
    "22:00",
    false,
    true
  ],
  [
    "Pharmacie Bon Secours",
    "",
    "",
    null,
    null,
    "07:30",
    "21:00",
    true,
    false
  ],
  [
    "Pharmacie Les Manguiers",
    "",
    "",
    null,
    null,
    "08:00",
    "21:30",
    false,
    false
  ],
  [
    "Pharmacie Centrale du Port",
    "",
    "",
    null,
    null,
    "08:00",
    "20:00",
    true,
    false
  ],
  [
    "Pharmacie Sourire",
    "",
    "",
    null,
    null,
    "07:00",
    "23:00",
    false,
    true
  ],
  [
    "Pharmacie du Stade",
    "",
    "",
    null,
    null,
    "08:00",
    "22:00",
    false,
    false
  ],
  [
    "Pharmacie Vitalis",
    "",
    "",
    null,
    null,
    "08:30",
    "21:30",
    false,
    false
  ],
  [
    "Pharmacie de la Colline",
    "",
    "",
    null,
    null,
    "08:00",
    "22:00",
    false,
    true
  ],
  [
    "Pharmacie Riviera",
    "",
    "",
    null,
    null,
    "08:00",
    "21:00",
    true,
    false
  ],
  [
    "Pharmacie Le Baobab",
    "",
    "",
    null,
    null,
    "07:30",
    "22:30",
    false,
    false
  ],
  [
    "Pharmacie Arc-en-Ciel",
    "",
    "",
    null,
    null,
    "08:00",
    "21:00",
    false,
    false
  ],
  [
    "Pharmacie Concorde",
    "",
    "",
    null,
    null,
    "08:00",
    "20:30",
    true,
    false
  ],
  [
    "Pharmacie Harmonie",
    "",
    "",
    null,
    null,
    "08:00",
    "23:00",
    false,
    true
  ]
];

// [nom, quartier, adresse, lat, lng, ouverture, fermeture, spécialité]
const CLINIQUES = [
  [
    "Clinique Les Acacias",
    "",
    "",
    null,
    null,
    "00:00",
    "23:59",
    "Médecine générale et urgences"
  ],
  [
    "Clinique Mère et Enfant",
    "",
    "",
    null,
    null,
    "07:00",
    "22:00",
    "Pédiatrie et maternité"
  ],
  [
    "Centre Médical Horizon",
    "",
    "",
    null,
    null,
    "08:00",
    "20:00",
    "Consultations et analyses"
  ],
  [
    "Clinique du Littoral",
    "",
    "",
    null,
    null,
    "00:00",
    "23:59",
    "Urgences et chirurgie"
  ],
  [
    "Cabinet Dentaire Sourire",
    "",
    "",
    null,
    null,
    "08:30",
    "18:30",
    "Soins dentaires"
  ],
  [
    "Clinique Vision Plus",
    "",
    "",
    null,
    null,
    "08:00",
    "19:00",
    "Ophtalmologie"
  ],
  [
    "Centre de Santé du Quartier",
    "",
    "",
    null,
    null,
    "07:30",
    "21:00",
    "Médecine générale"
  ],
  [
    "Clinique Cardio Santé",
    "",
    "",
    null,
    null,
    "08:00",
    "20:00",
    "Cardiologie"
  ],
  [
    "Laboratoire Analyse Express",
    "",
    "",
    null,
    null,
    "07:00",
    "19:00",
    "Analyses médicales"
  ],
  [
    "Clinique Les Jardins",
    "",
    "",
    null,
    null,
    "00:00",
    "23:59",
    "Hospitalisation et urgences"
  ]
];

// [désignation, forme, prix indicatif sans devise]
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

const pharmacyCommon = {
  type_etablissement: 'pharmacie',
  pays: 'Afrique',
  email: null,
  description: 'Pharmacie de quartier : conseils, médicaments et produits de santé.',
};

export const PHARMACY_LIST = PHARMACIES.map(([nom, ville, adresse, lat, lng, open, close, sundayClosed, garde], i) => ({
  id: i + 1,
  nom,
  slug: slugify(nom),
  ville,
  adresse: 'Afrique',
  latitude: lat,
  longitude: lng,
  telephone: '',
  garde,
  ...pharmacyCommon,
  ...hours(open, close, sundayClosed),
}));

export const CLINIC_LIST = CLINIQUES.map(([nom, ville, adresse, lat, lng, open, close, specialite], i) => ({
  id: 100 + i,
  nom,
  slug: slugify(nom),
  ville,
  adresse: 'Afrique',
  latitude: lat,
  longitude: lng,
  telephone: '',
  type_etablissement: 'clinique',
  pays: 'Afrique',
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
