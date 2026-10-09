import { randomUUID } from 'node:crypto';

// Initial reference, not an exhaustive directory. Sources:
// https://www.beac.int/pays/tchad/ (cities)
// https://www.dgi.td/docs/circulaire/circulaire2023.pdf (neighborhoods)
const SEED = [
  { pays:'Tchad', ville:"N’Djaména", quartier:'Farcha ancien' },
  { pays:'Tchad', ville:"N’Djaména", quartier:'Farcha Résidentiel' },
  { pays:'Tchad', ville:"N’Djaména", quartier:'Moursal' },
  { pays:'Tchad', ville:"N’Djaména", quartier:'Paris-Congo' },
  { pays:'Tchad', ville:"N’Djaména", quartier:'Diguel Est' },
  { pays:'Tchad', ville:"N’Djaména", quartier:'Chagoua Est' },
  ...['Moundou','Sarh','Abéché'].map(ville=>({pays:'Tchad',ville,quartier:''})),
];
export async function initializeLocations(db) {
  await db.transaction(async()=>{
    if(db.kind==='postgres')await db.exec('SELECT pg_advisory_xact_lock(72431003)');
    if(await db.prepare('SELECT value FROM settings WHERE key=?').get('locations_initialized'))return;
    for(const row of SEED)await db.prepare('INSERT INTO locations(id,pays,ville,quartier) VALUES(?,?,?,?) ON CONFLICT(pays,ville,quartier) DO NOTHING').run(randomUUID(),row.pays,row.ville,row.quartier);
    await db.prepare('INSERT INTO settings(key,value) VALUES(?,?)').run('locations_initialized','true');
  });
}
export function locationRoutes({db,visibleList,body,json,fail,requireAdmin}) {
  const rows=()=>db.prepare('SELECT * FROM locations ORDER BY pays,ville,quartier').all();
  return async(req,res,path,method)=>{
    if(path==='/api/locations'&&method==='GET'){
      const reference=await rows();
      for(const item of [...await visibleList('pharmacies'),...await visibleList('cliniques')])if(!item.is_demo&&item.pays&&item.ville)reference.push({pays:item.pays,ville:item.ville,quartier:item.quartier||''});
      const unique=new Map(reference.map(row=>[[row.pays,row.ville,row.quartier].join('\0'),{pays:row.pays,ville:row.ville,quartier:row.quartier}]));
      json(res,200,[...unique.values()]);return true;
    }
    if(!/^\/api\/admin\/locations(?:\/|$)/.test(path))return false;
    await requireAdmin(req);
    if(path==='/api/admin/locations'&&method==='GET'){json(res,200,await rows());return true;}
    if(path==='/api/admin/locations'&&method==='POST'){
      const input=await body(req),record={id:randomUUID()};
      for(const key of ['pays','ville','quartier'])record[key]=String(input[key]||'').trim().normalize('NFC').slice(0,120);
      if(!record.pays||!record.ville)fail(400,'Renseignez le pays et la ville. Le quartier est optionnel.');
      try{await db.prepare('INSERT INTO locations(id,pays,ville,quartier) VALUES(?,?,?,?)').run(record.id,record.pays,record.ville,record.quartier);}
      catch(error){if(error.code==='23505'||/UNIQUE constraint failed/.test(error.message))fail(409,'Ce lieu existe déjà dans la liste.');throw error;}
      json(res,201,record);return true;
    }
    const match=path.match(/^\/api\/admin\/locations\/([^/]+)$/);
    if(match&&method==='DELETE'){const existing=await db.prepare('SELECT id FROM locations WHERE id=?').get(match[1]);if(!existing)fail(404,'Lieu introuvable.');await db.prepare('DELETE FROM locations WHERE id=?').run(match[1]);json(res,200,{success:true});return true;}
    fail(405,'Méthode non autorisée.');
  };
}
