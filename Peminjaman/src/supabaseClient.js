// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vuzniunmfioxxrksujly.supabase.co'; // Ganti dengan URL Supabase-mu
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1em5pdW5tZmlveHhya3N1amx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNDQxOTIsImV4cCI6MjA2NjkyMDE5Mn0.1dlk4WYyypceTdGOioY_c4vCeZQvVDmLvdHAAIdM8nc'; // Ganti dengan anon key dari Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);
