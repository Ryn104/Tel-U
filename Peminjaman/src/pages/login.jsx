import React, { useEffect, useState } from 'react';
import Google from '../assets/icon/google.png';
import { supabase } from '../supabaseClient';

export default function Login() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        window.location.href = '/home'; // ✅ Redirect jika sudah login
      }
    };

    checkUser();
  }, []);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      alert('Login gagal: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 rounded shadow-md border text-center space-y-4">
        <h1 className="text-2xl font-bold">Login dengan Google</h1>
        {user ? (
          <>
            <p>Halo, {user.email}</p>
            <button onClick={handleLogout} className="btn btn-warning">
              Logout
            </button>
          </>
        ) : (
          <button onClick={handleLogin} className="btn btn-primary">
            <img src={Google} alt="" className='w-5' />Login
          </button>
        )}
      </div>
    </div>
  );
}
