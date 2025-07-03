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
      .from('test')
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
    const { error } = await supabase.from('test').delete().eq('id', deleteId);
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
        const { error } = await supabase.from('test').update({
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
    <div className="p-4 max-w-7xl mx-auto mb-12">
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md">
          <div className={`alert ${status.includes('Berhasil') ? 'alert-success' : 'alert-warning'} shadow-lg`}>
            <span>{status}</span>
          </div>
        </div>
      )}

      <h1 className="text-3xl xl:text-5xl mb-10 mt-5 text-center font-bold text-blue-900">
          Data Peminjaman Ruangan
        </h1>

      <div className="mb-4 text-right">
        <button onClick={downloadCSV} className="btn btn-primary">Download CSV</button>
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
                <th>Selesai</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((item, index) => (
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
  );
}