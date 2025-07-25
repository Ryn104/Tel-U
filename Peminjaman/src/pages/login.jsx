import React, { useEffect, useState } from 'react';
import Google from '../assets/icon/google.png';
import { supabase } from '../supabaseClient';

export default function Login() {
  const [user, setUser] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [status, setStatus] = useState('');


  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const email = user.email;
        const domain = email.split('@')[1];
        const allowedDomains = ['smbbtelkom.ac.id', 'telkomuniversity.ac.id'];

        if (!allowedDomains.includes(domain)) {
          setStatus('Login hanya diperbolehkan untuk email Telkom.');
          setShowAlert(true);
          await supabase.auth.signOut();
          setTimeout(() => setShowAlert(false), 3000); // auto-hide alert

          return;
        }

        setUser(user);
        if (user) {
          console.log('🔍 Cek user:', user);
          // Cek apakah user sudah ada di user_profiles
          const { data: existingUser, error: findError } = await supabase
            .from('user_profiles')
            .select('id') // cukup ambil 1 kolom saja untuk cek keberadaan
            .eq('uid', user.id)
            .maybeSingle();

          if (findError) {
            console.error('❌ Error saat cek user:', findError);
          } else if (!existingUser) {
            // 🔹 Jika belum ada → INSERT data baru
            const { error: insertError } = await supabase.from('user_profiles').insert({
              uid: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || user.user_metadata?.name || '',
              created: new Date(),
              last_online: new Date(),
            });

            if (insertError) console.error('❌ Gagal insert:', insertError);
            else console.log('✅ User baru berhasil disimpan');
          } else {
            // 🔸 Jika sudah ada → UPDATE last_online saja
            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({ last_online: new Date() })
              .eq('uid', user.id);

            if (updateError) console.error('❌ Gagal update last_online:', updateError);
            else console.log('✅ last_online diperbarui');
          }
        }
        window.location.href = '/home';
      }
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
      password: 'guest12345',
    });

    if (error) {
      alert('Login tamu gagal: ' + error.message);
    } else {
      setUser(data.user);
      window.location.href = '/home';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr bg-[#f2f2f2] flex items-center justify-center px-4">
      <div className="flex flex-col lg:flex-row items-center gap-12 max-w-5xl mt-[-5rem] xl:mt-0">
        {/* Card Login */}
        <div className="card w-full max-w-md min-h-[22rem] shadow-2xl bg-white border-gray-200 border rounded-3xl p-3 lg:p-6 order-2 lg:order-1 mt-[-2rem]">
          <div className="card-body flex flex-col justify-center items-center text-center space-y-6">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#002B5B]">Masuk dengan Akun Telkom University</h1>
            <p className="text-gray-600">
              Gunakan akun resmi Telkom University Anda untuk mengakses sistem ini.
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
                  className="btn btn-outline border-[#E60000] text-[#E60000] hover:bg-[#E60000] hover:text-white w-full max-w-xs flex items-center justify-center gap-3 transition-all hover:scale-105 hover:shadow-md"
                >
                  <span className="font-semibold">Login Dengan Akun Telkom University</span>
                </button>
                <button
                  onClick={handleGuestLogin}
                  className="btn btn-outline border-[#002B5B] text-[#002B5B] hover:bg-[#002B5B] hover:text-white w-full max-w-xs transition-all hover:scale-105 hover:shadow-md"
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

        {/* Informasi & Heading */}
        <div className="text-center lg:text-left max-w-md order-1 lg:order-2">
          <h1 className="text-3xl lg:text-5xl font-bold text-[#002B5B] leading-tight">
            Selamat Datang di Sistem Peminjaman Ruangan!
          </h1>
          <p className="lg:pt-6 pt-2 text-gray-700">
            Booking ruangan jadi lebih mudah! Cukup login dan pilih ruangan yang kamu butuhkan.
          </p>
        </div>
      </div>
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md">
          <div
            role="alert"
            className={`alert shadow-md text-black rounded-lg ${status.includes('Berhasil')
              ? 'alert-success'
              : status.includes('Ruangan')
                ? 'alert-warning'
                : 'alert-error'
              }`}
          >
            {status.includes('Berhasil') ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01M4.93 19h14.14c1.38 0 2.18-1.538 1.51-2.74L13.51 4.76c-.68-1.202-2.34-1.202-3.02 0L3.42 16.26C2.75 17.462 3.55 19 4.93 19z"
                />
              </svg>
            )}
            <span>{status}</span>
          </div>
        </div>
      )}

    </div>
  );
}
