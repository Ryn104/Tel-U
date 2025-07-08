// BookingForm.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

import axios from 'axios';

export default function BookingForm() {
  const [formData, setFormData] = useState({
    nama: '',
    kontak: '',
    unit: '',
    ruangan: '',
    peserta: '',
    judul: '',
    waktu: '',
    selesai: '',
  });

  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(formData.selesai) <= new Date(formData.waktu)) {
      setStatus("Waktu selesai harus lebih besar dari waktu peminjaman.");
      return;
    }

    // ✅ Ambil user yang sedang login
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setStatus('Kamu harus login terlebih dahulu.');
      return;
    }

    // ✅ Tambahkan user_id ke payload yang dikirim
    const payload = {
      ...formData,
      user_id: user.id,
    };

    try {
      const res = await axios.post(
        'https://n8n.srv870769.hstgr.cloud/webhook/booking-form ',
        payload
      );

      if (res.data.success) {
        setStatus('Ruangan Berhasil Di Booking!');
      } else {
        setStatus('Ruangan Sudah Terpakai!');
      }
    } catch (err) {
      setStatus('Terjadi kesalahan saat mengirim.');
      console.error(err);
    }
  };


  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (status) {
      setShowAlert(true);
      const timer = setTimeout(() => {
        setShowAlert(false);
        setStatus('');
      }, 2000);
      window.location.href = '/data';
      return () => clearTimeout(timer);
    }
  }, [status]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex justify-center px-4 pt-5 pb-21">
      <div className="flex-col w-full max-w-2xl shadow-xl bg-white border border-gray-200 rounded-2xl p-8">
        <h1 className="text-3xl xl:text-5xl text-center font-bold text-blue-900">
          Form Peminjaman Ruangan
        </h1>

        <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 gap-5">
          {/* Nama */}
          <div>
            <label className="label font-semibold">Nama</label>
            <input
              name="nama"
              type="text"
              className="input input-bordered w-full"
              placeholder="Nama Lengkap"
              onChange={handleChange}
              required
            />
          </div>

          {/* Kontak */}
          <div>
            <label className="label font-semibold">Kontak</label>
            <input
              name="kontak"
              type="text"
              className="input input-bordered w-full"
              placeholder="Nomor WA atau Email"
              onChange={handleChange}
              required
            />
          </div>

          {/* Unit */}
          <div>
            <label className="label font-semibold">Unit</label>
            <input
              name="unit"
              type="text"
              className="input input-bordered w-full"
              placeholder="Unit/Departemen"
              onChange={handleChange}
              required
            />
          </div>

          {/* Ruangan */}
          <div>
            <label className="label font-semibold">Ruangan</label>
            <select
              name="ruangan"
              className="select select-bordered w-full"
              onChange={handleChange}
              required
            >
              <option value="">Pilih Ruangan</option>
              <option value="Ruang Meeting Besar">Ruang Meeting Besar (50 orang)</option>
              <option value="Ruang Meeting Kecil">Ruang Meeting Kecil (10 orang)</option>
            </select>
          </div>

          {/* Jumlah Peserta */}
          <div>
            <label className="label font-semibold">Jumlah Peserta</label>
            <input
              name="peserta"
              type="number"
              className="input input-bordered w-full"
              placeholder="Contoh: 20"
              onChange={handleChange}
              required
            />
          </div>

          {/* Judul Kegiatan */}
          <div>
            <label className="label font-semibold">Judul Kegiatan</label>
            <input
              name="judul"
              type="text"
              className="input input-bordered w-full"
              placeholder="Nama Acara"
              onChange={handleChange}
              required
            />
          </div>

          {/* Waktu Mulai */}
          <div>
            <label className="label font-semibold">Waktu Mulai</label>
            <input
              name="waktu"
              type="datetime-local"
              className="input input-bordered w-full"
              value={formData.waktu}
              onChange={handleChange}
              required
            />
          </div>

          {/* Waktu Selesai */}
          <div>
            <label className="label font-semibold">Waktu Selesai</label>
            <input
              name="selesai"
              type="datetime-local"
              className="input input-bordered w-full"
              value={formData.selesai}
              min={formData.waktu}
              onChange={handleChange}
              required
            />
          </div>

          {/* Tombol */}
          <button type="submit" className="btn btn-primary w-full text-lg mt-2">
            Kirim Permintaan
          </button>
        </form>

        {/* Alert */}
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M4.93 19h14.14c1.38 0 2.18-1.538 1.51-2.74L13.51 4.76c-.68-1.202-2.34-1.202-3.02 0L3.42 16.26C2.75 17.462 3.55 19 4.93 19z" />
                </svg>
              )}
              <span>{status}</span>
            </div>
          </div>
        )}
      </div>
    </div>

  );
}
