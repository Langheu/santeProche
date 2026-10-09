import { assetUrl } from '../data/api.js';
import LocationFields from './LocationFields.jsx';
import PositionPicker from './PositionPicker.jsx';
export const PHARMACY_DAYS = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
export function PharmacyFields({ value, onChange, onPhoto, disabled }) {
  const change = (key, next) => onChange({ ...value, [key]: next });
  const fields = [['nom','Nom de la pharmacie','text',true],['telephone','Téléphone de la pharmacie','tel',true],['adresse','Adresse','text',true],['email','Email public de la pharmacie','email',false]];
  return <fieldset disabled={disabled} className="partner-fields">
    {fields.map(([key,label,type,required]) => <label key={key}>{label}<input value={value[key] || ''} type={type} required={required} maxLength={200} onChange={event => change(key,event.target.value)} /></label>)}
    <LocationFields value={value} onChange={onChange} disabled={disabled}/>
    <label className="partner-wide">Description<textarea value={value.description || ''} rows={3} maxLength={5000} onChange={event=>change('description',event.target.value)} /></label>
    <label className="partner-wide">Photo de la pharmacie (JPG, PNG ou WEBP · 4 Mo maximum)<input aria-label="Photo de la pharmacie" type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>onPhoto(event.target.files[0] || null)} />{value.image && <img className="partner-preview" src={assetUrl(value.image)} alt="Photo actuelle de la pharmacie" />}</label>
    <PositionPicker value={value} disabled={disabled} onChange={position=>onChange({...value,...position})}/>

    <label className="partner-check partner-wide"><input type="checkbox" checked={!!value.garde} onChange={e=>change('garde',e.target.checked)} />Pharmacie de garde</label>
    <details className="partner-wide"><summary>Horaires d’ouverture</summary>{PHARMACY_DAYS.map(day=><div className="partner-day" key={day}><label>{day}<select aria-label={`Statut ${day}`} value={value[`${day}_ouvert`] == null ? 'unknown' : value[`${day}_ouvert`] ? 'open' : 'closed'} onChange={e=>change(`${day}_ouvert`,e.target.value === 'unknown' ? null : e.target.value === 'open')}><option value="unknown">Non renseigné</option><option value="open">Ouvert</option><option value="closed">Fermé</option></select></label><label>Ouverture<input type="time" value={value[`${day}_heure_ouverture`]?.slice(0,5) || ''} required={value[`${day}_ouvert`] === true} onChange={e=>change(`${day}_heure_ouverture`,e.target.value)} /></label><label>Fermeture<input type="time" value={value[`${day}_heure_fermeture`]?.slice(0,5) || ''} required={value[`${day}_ouvert`] === true} onChange={e=>change(`${day}_heure_fermeture`,e.target.value)} /></label></div>)}</details>
  </fieldset>;
}
