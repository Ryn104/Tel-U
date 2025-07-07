// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://llrkzetrrgghndpxylcx.supabase.co'; // Ganti dengan URL Supabase-mu
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxscmt6ZXRycmdnaG5kcHh5bGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NjE4MzcsImV4cCI6MjA2NzQzNzgzN30.Baq6dAtS4eQ88GXqKAci4Y66hOyZPiyYL6e3mm64WL0'; // Ganti dengan anon key dari Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);
