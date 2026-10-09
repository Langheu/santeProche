import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

test('Pharmacies : inscription privée, validation, isolation des comptes et suspension', async () => {
  const directory=mkdtempSync(join(tmpdir(),'santeproche-partners-test-'));
  process.env.DATA_DIR=directory;process.env.NODE_ENV='test';process.env.SEED_DEMO='false';process.env.LOCAL_POSTGRES='false';delete process.env.OPENAI_API_KEY;
  let client,schema;
  if(process.env.TEST_DATABASE_URL){
    const url=new URL(process.env.TEST_DATABASE_URL);assert.match(url.pathname,/^\/santeproche_test_[a-z0-9_]+$/);
    client=new pg.Client({connectionString:url.href});await client.connect();schema=`partners_${randomUUID().replaceAll('-','')}`;await client.query(`CREATE SCHEMA ${schema}`);url.searchParams.set('options',`-c search_path=${schema}`);process.env.DATABASE_URL=url.href;
  }else delete process.env.DATABASE_URL;
  const {server,db}=await import('./index.js');await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}/api`;
  const api=(path,method='GET',data,cookie='',headers={})=>fetch(base+path,{method,headers:{...(data?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...headers},...(data?{body:JSON.stringify(data)}:{})});
  const image={data:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXZkAAAAASUVORK5CYII='};
  const registration=name=>({email:`${name}@example.test`,password:'pharmacy-test-2026',confirm_password:'pharmacy-test-2026',responsable:`Responsable ${name}`,accept_review:true,profile:{nom:`Pharmacie ${name}`,telephone:'+23560000000',adresse:'Rue du test',ville:'Ville test',pays:'Pays test',latitude:0,longitude:0},document:image,photo:image});
  const cookie=response=>response.headers.get('set-cookie').split(';')[0];
  try{
    assert.equal((await api('/partner/document')).status,401);
    assert.equal((await api('/partner/register','POST',registration('foreign'),'',{Origin:'https://foreign.test'})).status,403);
    const aResponse=await api('/partner/register','POST',registration('alpha'));assert.equal(aResponse.status,201);const aCookie=cookie(aResponse),a=await aResponse.json();assert.equal(a.status,'pending');assert.equal(a.hash,undefined);assert.match(aCookie,/^sp_partner=/);
    assert.equal((await api('/partner/medicaments','POST',{},aCookie)).status,403);
    assert.equal((await(await api('/pharmacies')).json()).total,0);
    assert.equal((await api('/partner/document','GET',undefined,aCookie)).headers.get('cache-control'),'no-store');
    assert.equal((await api('/admin/partners','GET',undefined,aCookie)).status,401);
    const setup=await api('/auth/setup','POST',{email:'owner@example.test',password:'owner-password-2026'});const owner=cookie(setup);
    assert.equal((await api(`/admin/partners/${a.id}/document`,'GET',undefined,owner)).status,200);
    const row=await db.prepare('SELECT document FROM partners WHERE id=?').get(a.id);
    assert.equal((await api('/uploads/'+row.document)).status,404);
    let approved=await api(`/admin/partners/${a.id}/review`,'PUT',{action:'approve'},owner);assert.equal(approved.status,200);const aProfile=(await approved.json()).profile;
    const aId=(await(await api('/partner/status','GET',undefined,aCookie)).json()).pharmacy_id;
    assert.equal((await api('/partner/upload','POST',{data:Buffer.alloc(4*1024*1024+1).toString('base64')},aCookie)).status,400);
    assert.equal((await api(`/admin/partners/${a.id}/review`,'PUT',{action:'approve'},owner)).status,409);
    const bResponse=await api('/partner/register','POST',registration('beta'));const bCookie=cookie(bResponse),b=await bResponse.json();await api(`/admin/partners/${b.id}/review`,'PUT',{action:'approve'},owner);
    const bId=(await(await api('/partner/status','GET',undefined,bCookie)).json()).pharmacy_id;
    const medicine={designation:'Produit commun',forme:'500 mg',prix_public:2500,currency:'XAF',quantite:5,pharmacie_id:bId};
    const aMedicine=await(await api('/partner/medicaments','POST',medicine,aCookie)).json();assert.equal(aMedicine.pharmacie_id,aId);assert.equal(aMedicine.is_demo,false);
    await api('/partner/medicaments','POST',medicine,bCookie);
    assert.equal((await api(`/partner/medicaments/${aMedicine.id}`,'PUT',medicine,bCookie)).status,404);
    assert.equal((await api(`/partner/medicaments/${aMedicine.id}`,'DELETE',undefined,bCookie)).status,404);
    const edit=await api('/partner/profile','PUT',{...aProfile,id:bId,nom:'Pharmacie alpha modifiée',telephone:'+23561111111',is_demo:true},aCookie);assert.equal(edit.status,200);assert.equal((await edit.json()).id,aId);
    assert.equal((await(await api('/partner/profile','GET',undefined,bCookie)).json()).nom,'Pharmacie beta');
    assert.equal((await api('/admin/pharmacies','GET',undefined,aCookie)).status,401);
    assert.equal((await api(`/admin/pharmacies/${aId}`,'DELETE',undefined,owner)).status,409);
    assert.equal((await api(`/admin/partners/${a.id}/review`,'PUT',{action:'suspend'},owner)).status,400);
    assert.equal((await api(`/admin/partners/${a.id}/review`,'PUT',{action:'suspend',reason:'Vérification requise'},owner)).status,200);
    assert.equal((await(await api('/pharmacies')).json()).total,1);
    assert.equal((await(await api('/medicaments')).json()).total,1);
    assert.equal((await api('/etablissements/'+aProfile.slug)).status,404);
    assert.equal((await api('/partner/medicaments','GET',undefined,aCookie)).status,403);
    assert.equal((await api('/partner/profile','PUT',aProfile,aCookie)).status,403);
    assert.equal((await(await api('/assistant/search','POST',{message:'Produit commun'})).json()).results.length,1);
    await api(`/admin/partners/${a.id}/review`,'PUT',{action:'approve'},owner);
    assert.equal((await(await api('/medicaments')).json()).total,2);
    const cResponse=await api('/partner/register','POST',registration('gamma'));const cCookie=cookie(cResponse),c=await cResponse.json();await api(`/admin/partners/${c.id}/review`,'PUT',{action:'reject',reason:'Compléter les horaires'},owner);
    assert.equal((await(await api('/partner/status','GET',undefined,cCookie)).json()).status,'rejected');
    assert.equal((await api('/partner/application','PUT',{profile:c.profile},cCookie)).status,200);
    assert.equal((await(await api('/partner/status','GET',undefined,cCookie)).json()).status,'pending');
    assert.equal((await api('/partner/register','POST',registration('alpha'))).status,409);
    await api('/partner/logout','POST',{},aCookie);assert.equal(await(await api('/partner/status','GET',undefined,aCookie)).json(),null);
    assert.equal((await api('/partner/login','POST',{email:'alpha@example.test',password:'pharmacy-test-2026'})).status,200);
    assert.equal((await api('/auth/status','GET',undefined,owner)).status,200);
  }finally{
    await new Promise(resolve=>server.close(resolve));await db.close();
    if(client){await client.query(`DROP SCHEMA ${schema} CASCADE`);await client.end();}
    rmSync(directory,{recursive:true,force:true});
  }
});
