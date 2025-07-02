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
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);


  return (
    <div className="max-w-xl mx-auto p-4 align-middle hero min-h-screen">
      <div className='hero-content flex-col'>
        <h1 className="text-4xl xl:text-5xl text-center font-bold mb-10">Form Peminjaman Ruangan</h1>
        <form onSubmit={handleSubmit} className="w-full mb-10">

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Nama: </legend>
            <input name="nama" type="text" className="input w-full p-2 border rounded" placeholder="Nama" onChange={handleChange} required />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Kontak: </legend>
            <input name="kontak" type="text" className="input w-full p-2 border rounded" placeholder="Kontak" onChange={handleChange} required />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Unit: </legend>
            <input name="unit" type="text" className="input w-full p-2 border rounded" placeholder="Unit" onChange={handleChange} required />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Ruangan:</legend>
            <select name='ruangan' defaultValue="Pick a browser" className="select w-full p-2 border rounded" onChange={handleChange} required>
              <option value="" >Pilih Ruangan</option>
              <option value="Ruang Meeting Besar">Ruang Meeting Besar (50 orang)</option>
              <option value="Ruang Meeting Kecil">Ruang Meeting Kecil (10 orang)</option>
            </select>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Jumlah Peserta: </legend>
            <input name="peserta" type="text" className="input w-full p-2 border rounded" placeholder="Jumlah Peserta" onChange={handleChange} required />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Kegiatan: </legend>
            <input name="judul" type="text" className="input w-full p-2 border rounded" placeholder="Kegiatan" onChange={handleChange} required />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Peminjaman: </legend>
            <input
              name="waktu"
              type="datetime-local"
              value={formData.waktu}
              onChange={handleChange}
              className="input w-full p-2 border rounded"
              required
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Selesai: </legend>
            <input
              name="selesai"
              type="datetime-local"
              value={formData.selesai}
              min={formData.waktu} // ⛔️ batasi tanggal dan JAM
              onChange={handleChange}
              className="input w-full p-2 border rounded"
              required
            />
          </fieldset>



          <button type="submit" className="btn btn-primary w-full mt-5">Kirim</button>
        </form>
        {showAlert && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md">
            <div
              role="alert"
              className={`alert shadow-lg text-black  ${status.includes('Berhasil')
                ? 'alert-success'
                : status.includes('Ruangan')
                  ? 'alert-warning'
                  : 'alert-error'
                }`}
            >
              {/* ICON BERDASARKAN STATUS */}
              {status.includes('Berhasil') ? (
                // ✅ Ikon sukses (centang)
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
                // ❌ Ikon gagal (tanda seru)
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
                    d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z"
                  />
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
