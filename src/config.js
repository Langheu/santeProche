// Backend local du projet, configurable pour un hébergement séparé.
export const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
import { SITE } from './site.js';
export const WHATSAPP = SITE.whatsapp;
