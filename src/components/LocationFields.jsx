import { useEffect, useId, useState } from 'react';
import { request } from '../data/api.js';

function Choice({label,value,options,onChange,required,disabled}) {
  const id=useId(),[custom,setCustom]=useState(false);
  const other=custom||Boolean(value&&!options.includes(value));
  return <div><label htmlFor={id}>{label}</label><select id={id} value={other?'__other':value||''} required={required} disabled={disabled} onChange={e=>{if(e.target.value==='__other'){setCustom(true);onChange('');}else{setCustom(false);onChange(e.target.value);}}}><option value="">Choisir {label.toLowerCase()}</option>{options.map(option=><option key={option} value={option}>{option}</option>)}<option value="__other">Autre {label.toLowerCase()}…</option></select>{other&&<label>Précisez {label==='Pays'?'le pays':label==='Ville'?'la ville':'le quartier'}<input value={value||''} required={required} disabled={disabled} maxLength={120} onChange={e=>onChange(e.target.value)}/></label>}</div>;
}
export default function LocationFields({value,onChange,disabled}) {
  const [rows,setRows]=useState([]),[error,setError]=useState('');
  useEffect(()=>{let active=true;request('/locations').then(data=>{if(active)setRows(data);}).catch(()=>{if(active)setError('La liste des lieux est indisponible. Utilisez « Autre… » pour saisir votre adresse.');});return()=>{active=false;};},[]);
  const choices=field=>[...new Set(rows.filter(row=>field==='pays'||row.pays===value.pays&&(field==='ville'||row.ville===value.ville)).map(row=>row[field]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));
  return <><Choice label="Pays" value={value.pays} options={choices('pays')} required disabled={disabled} onChange={pays=>onChange({...value,pays,ville:'',quartier:''})}/><Choice key={`ville:${value.pays}`} label="Ville" value={value.ville} options={choices('ville')} required disabled={disabled||!value.pays} onChange={ville=>onChange({...value,ville,quartier:''})}/><Choice key={`quartier:${value.pays}:${value.ville}`} label="Quartier" value={value.quartier} options={choices('quartier')} disabled={disabled||!value.ville} onChange={quartier=>onChange({...value,quartier})}/>{error&&<p className="partner-wide" role="status">{error}</p>}</>;
}
