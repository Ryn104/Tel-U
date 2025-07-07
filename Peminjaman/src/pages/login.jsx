import React, { useEffect, useState } from 'react';
import Google from '../assets/icon/google.png';
import { supabase } from '../supabaseClient';

export default function Login() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) window.location.href = '/home';
    };
    checkUser();
  }, []);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) alert('Login gagal: ' + error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleGuestLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'guest@example.com',
      password: 'guest123',
    });
    if (error) {
      alert('Login tamu gagal: ' + error.message);
    } else {
      setUser(data.user);
      window.location.href = '/home'; // langsung redirect setelah login berhasil
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center px-4">
      <div className="flex flex-col lg:flex-row items-center gap-12 max-w-5xl w-full mb-5">

        {/* Card Login - tampil kiri di desktop, bawah di mobile */}
        <div className="card w-full max-w-md min-h-[28rem] shadow-2xl bg-white border border-blue-200 rounded-3xl p-6 order-2 lg:order-1">
          <div className="card-body flex flex-col justify-center items-center text-center space-y-6">
            <h1 className="text-3xl font-extrabold text-blue-800">Masuk dengan Google</h1>
            <p className="text-gray-600">
              Gunakan akun Google Anda untuk mengakses sistem ini.
            </p>

            {user ? (
              <>
                <p className="text-gray-700 text-lg">
                  Halo, <span className="font-semibold">{user.email}</span>
                </p>
                <button
                  onClick={handleLogout}
                  className="btn btn-warning w-full max-w-xs transition-all hover:scale-105"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="btn btn-outline btn-primary w-full max-w-xs flex items-center justify-center gap-3 transition-all hover:scale-105 hover:shadow-md"
                >
                  <img src={Google} alt="Google" className="w-5 h-5" />
                  <span className="font-medium">Login dengan Google</span>
                </button>
                <button
                  onClick={handleGuestLogin}
                  className="btn btn-outline btn-info w-full max-w-xs transition-all hover:scale-105 hover:shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg"
                    fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                    stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75H4.5v-.75z" />
                  </svg>

                  <span>Login sebagai Tamu</span>
                </button>
              </>

            )}
          </div>
        </div>

        {/* Informasi & Heading - tampil kanan di desktop, atas di mobile */}
        <div className="text-center lg:text-left max-w-md order-1 lg:order-2">
          <h1 className="text-4xl lg:text-5xl font-bold text-blue-900 leading-tight">
            Selamat Datang di Sistem<br />Peminjaman Ruangan!
          </h1>
          <p className="py-6 text-gray-700">
            Booking ruangan jadi lebih mudah! Cukup login dan pilih ruangan yang kamu butuhkan.
          </p>
        </div>

      </div>
    </div>

  );
}
