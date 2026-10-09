// Identité du site : modifiez ce fichier pour changer le nom et les coordonnées partout.
export const SITE = {
  name: 'SantéProche',
  tagline: 'La santé à deux pas de chez vous',
  description:
    'SantéProche vous aide à trouver une pharmacie ouverte, un médicament ou une clinique près de chez vous, en quelques secondes.',
  phone: '+235 66566871',
  phoneHref: '+23566566871',
  whatsapp: '23566566871',
  email: 'contact@santeproche.example',
  address: 'Afrique',
  company: 'SantéProche',
  socials: {
    facebook: '#',
    instagram: '#',
    twitter: '#',
    linkedin: '#',
  },
};

export const whatsappLink = text => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
