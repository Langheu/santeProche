import { useId, useState } from 'react';
import './PasswordField.css';
export default function PasswordField({ label, className='', disabled, ...props }) {
  const id=useId(),[visible,setVisible]=useState(false);
  return <div className={`password-field ${className}`}><label htmlFor={id}>{label}</label><div className="password-input"><input {...props} id={id} type={visible?'text':'password'} disabled={disabled}/><button type="button" className="password-toggle" disabled={disabled} aria-label={`${visible?'Masquer':'Afficher'} ${label.toLowerCase()}`} aria-pressed={visible} aria-controls={id} onClick={()=>setVisible(value=>!value)}><i className={`bi ${visible?'bi-eye-slash':'bi-eye'}`} aria-hidden="true"/></button></div></div>;
}
