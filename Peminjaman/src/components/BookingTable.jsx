// src/components/BookingTable.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import axios from 'axios';

export default function BookingTable() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [status, setStatus] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [user, setUser] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterRuangan, setFilterRuangan] = useState('');


  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Peminjaman Ruang')
      .select('*')
      .order('tanggal_peminjaman', { ascending: true })
      .order('waktu_peminjaman', { ascending: true });
    if (!error) setBookings(data);
    setLoading(false);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('Peminjaman Ruang').delete().eq('id', deleteId);
    if (!error) fetchBookings();
    setShowConfirmModal(false);
    setDeleteId(null);
  };

  const handleEditSubmit = async () => {
    const waktuStart = new Date(editData.waktu_peminjaman);
    const waktuEnd = new Date(editData.waktu_selesai);
    const payload = {
      ...editData,
      tanggal_peminjaman: waktuStart.toISOString().split('T')[0],
      waktu_peminjaman: waktuStart.toTimeString().slice(0, 5),
      tanggal_selesai: waktuEnd.toISOString().split('T')[0],
      waktu_selesai: waktuEnd.toTimeString().slice(0, 5),
      id: editData.id,
      user_id: user.id,
    };

    try {
      const res = await axios.post('https://n8n.srv870769.hstgr.cloud/webhook/edit-booking', payload);
      if (res.data.success === true) {
        const { error } = await supabase.from('Peminjaman Ruang').update({
          judul: editData.judul,
          nama: editData.nama,
          kontak: editData.kontak,
          unit: editData.unit,
          ruangan: editData.ruangan,
          peserta: editData.peserta,
          tanggal_peminjaman: payload.tanggal_peminjaman,
          waktu_peminjaman: payload.waktu_peminjaman,
          tanggal_selesai: payload.tanggal_selesai,
          waktu_selesai: payload.waktu_selesai,
        }).eq('id', editData.id);
        if (!error) {
          fetchBookings();
          setShowEditModal(false);
          setEditData(null);
        }
      } else {
        setStatus("Ruangan sudah terpakai!");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
      }
    } catch (err) {
      alert("Terjadi kesalahan saat mengirim.");
    }
  };

  const downloadCSV = () => {
    if (!bookings || bookings.length === 0) return;
    const headers = Object.keys(bookings[0]).filter(key => key !== 'id' && key !== 'created_at' && key !== 'user_id');
    const rows = bookings.map(booking => headers.map(field => `"${String(booking[field] ?? '').replace(/"/g, '""')}"`).join(';'));
    const csvContent = [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'data_peminjaman.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateTimeLocal = (date, time) => date && time ? `${date}T${time.slice(0, 5)}` : '';

  return (
    <div className='bg-gradient-to-br from-blue-50 to-white min-h-screen px-4 pt-5 pb-21'>
      <div className="w-full max-w-7xl mx-auto shadow-xl bg-white border border-gray-200 rounded-2xl p-6 max-h-4xl">
        {showAlert && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md">
            <div className={`alert ${status.includes('Berhasil') ? 'alert-success' : 'alert-warning'} shadow-lg`}>
              <span>{status}</span>
            </div>
          </div>
        )}

        <h1 className="text-3xl xl:text-5xl xl:mb-16 mb-10 mt-5 text-center font-bold text-blue-900">
          Data Peminjaman Ruangan
        </h1>

        <div className="mb-4 flex flex-col md:flex-row md:justify-between gap-2 items-stretch">
          <button onClick={downloadCSV} className="btn btn-primary w-full sm:w-auto">
            Download CSV
          </button>

          <div className="flex sm:flex-row gap-2">
            <label className='input w-[52%]'>
              <span className="label">
                <svg className="xl:w-6 xl:h-6 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4h18l-7 9v5l-4 2v-7L3 4z"
                  />
                </svg>
              </span>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="sm:w-full w-31 ms-[-0.6rem] md:ms-0"
                placeholder="Filter tanggal"
              />
            </label>

            <select
              value={filterRuangan}
              onChange={(e) => setFilterRuangan(e.target.value)}
              className="select select-bordered xl:w-full  w-[50%]"
            >
              <option value="">Semua Ruangan</option>
              <option value="Ruang Meeting Besar">Ruang Meeting Besar</option>
              <option value="Ruang Meeting Kecil">Ruang Meeting Kecil</option>
            </select>
          </div>
        </div>




        {loading ? (
          <div className='flex justify-center'><span className="loading loading-spinner loading-lg"></span></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-xs xl:table-md table-zebra w-full">
              <thead>
                <tr className='text-center'>
                  <th>#</th>
                  <th>Judul</th>
                  <th>Nama</th>
                  <th>Unit</th>
                  <th>Ruangan</th>
                  <th>Peserta</th>
                  <th>Peminjaman</th>
                  <th className='px-5'>Selesai</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings
                  .filter(item =>
                    (!filterDate || item.tanggal_peminjaman === filterDate) &&
                    (!filterRuangan || item.ruangan === filterRuangan)
                  )
                  .map((item, index) => (
                    <tr key={item.id} className='text-center'>
                      <th>{index + 1}</th>
                      <td>{item.judul}</td>
                      <td>{item.nama}</td>
                      <td>{item.unit}</td>
                      <td>{item.ruangan}</td>
                      <td>{item.peserta}</td>
                      <td>{item.tanggal_peminjaman} {item.waktu_peminjaman}</td>
                      <td>{item.tanggal_selesai} {item.waktu_selesai}</td>
                      <td>
                        {user?.id === item.user_id && (
                          <div className="flex gap-2">
                            <button className="btn btn-info btn-xs" onClick={() => {
                              setEditData({
                                ...item,
                                waktu_peminjaman: formatDateTimeLocal(item.tanggal_peminjaman, item.waktu_peminjaman),
                                waktu_selesai: formatDateTimeLocal(item.tanggal_selesai, item.waktu_selesai),
                              });
                              setShowEditModal(true);
                            }}>Edit</button>
                            <button className="btn btn-error btn-xs" onClick={() => handleDeleteClick(item.id)}>Hapus</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {showConfirmModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg text-red-600">Konfirmasi Hapus</h3>
              <p className="py-4">Apakah kamu yakin ingin menghapus data ini?</p>
              <div className="modal-action">
                <button onClick={confirmDelete} className="btn btn-error">Ya, Hapus</button>
                <button onClick={() => setShowConfirmModal(false)} className="btn">Batal</button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && editData && (
          <div className="modal modal-open">
            <div className="modal-box max-w-3xl">
              <h3 className="font-bold text-lg mb-4 text-blue-700">Edit Data Peminjaman</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Judul" value={editData.judul} onChange={(e) => setEditData({ ...editData, judul: e.target.value })} className="input input-bordered w-full" />
                <input type="text" placeholder="Nama" value={editData.nama} onChange={(e) => setEditData({ ...editData, nama: e.target.value })} className="input input-bordered w-full" />
                <input type="text" placeholder="Kontak" value={editData.kontak} onChange={(e) => setEditData({ ...editData, kontak: e.target.value })} className="input input-bordered w-full" />
                <input type="text" placeholder="Unit" value={editData.unit} onChange={(e) => setEditData({ ...editData, unit: e.target.value })} className="input input-bordered w-full" />
                <select value={editData.ruangan} onChange={(e) => setEditData({ ...editData, ruangan: e.target.value })} className="select select-bordered w-full">
                  <option value="">Pilih Ruangan</option>
                  <option value="Ruang Meeting Besar">Ruang Meeting Besar (50 orang)</option>
                  <option value="Ruang Meeting Kecil">Ruang Meeting Kecil (10 orang)</option>
                </select>
                <input type="text" placeholder="Peserta" value={editData.peserta} onChange={(e) => setEditData({ ...editData, peserta: e.target.value })} className="input input-bordered w-full" />
                <input type="datetime-local" value={editData.waktu_peminjaman} onChange={(e) => setEditData({ ...editData, waktu_peminjaman: e.target.value })} className="input input-bordered w-full" />
                <input type="datetime-local" value={editData.waktu_selesai} onChange={(e) => setEditData({ ...editData, waktu_selesai: e.target.value })} className="input input-bordered w-full" />
              </div>
              <div className="modal-action mt-6">
                <button onClick={handleEditSubmit} className="btn btn-primary">Simpan</button>
                <button onClick={() => setShowEditModal(false)} className="btn">Batal</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}