// src/components/BookingTable.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function BookingTable() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editData, setEditData] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        const { error } = await supabase.from('test').delete().eq('id', deleteId);
        if (error) {
            alert("Gagal menghapus: " + error.message);
        } else {
            fetchBookings();
        }

        setShowConfirmModal(false);
        setDeleteId(null);
    };

    const handleEditSubmit = async () => {
        const { waktu_peminjaman, waktu_selesai, ...rest } = editData;

        const tanggal_peminjaman = waktu_peminjaman.split('T')[0];
        const jam_peminjaman = waktu_peminjaman.split('T')[1];
        const tanggal_selesai = waktu_selesai.split('T')[0];
        const jam_selesai = waktu_selesai.split('T')[1];

        const { error } = await supabase
            .from('test')
            .update({
                ...rest,
                tanggal_peminjaman,
                waktu_peminjaman: jam_peminjaman,
                tanggal_selesai,
                waktu_selesai: jam_selesai,
            })
            .eq('id', editData.id);

        if (error) {
            alert('Gagal menyimpan: ' + error.message);
        } else {
            fetchBookings();
            setShowEditModal(false);
            setEditData(null);
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('test')
            .select('*')
            .order('tanggal_peminjaman', { ascending: true })
            .order('waktu_peminjaman', { ascending: true });

        if (error) {
            console.error('Gagal mengambil data:', error.message);
        } else {
            setBookings(data);
        }

        setLoading(false);
    };

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

    const downloadCSV = () => {
        if (!bookings || bookings.length === 0) return;

        const headers = Object.keys(bookings[0]).filter(key => key !== 'id' && key !== 'created_at');

        const rows = bookings.map(booking =>
            headers.map(field => {
                const value = booking[field] ?? '';
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(';')
        );

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

    const formatDateTimeLocal = (date, time) => {
        if (!date || !time) return '';
        return `${date}T${time.slice(0, 5)}`;
    };

    return (
        <div className="mx-auto p-4 mt-10 xl:w-[100%]">
            <h2 className="text-4xl text-center font-bold mb-10">Data Peminjaman Ruangan</h2>
            <div className="text-right mb-4 xl:w-[100%]">
                <button onClick={downloadCSV} className="btn btn-primary">
                    Download CSV
                </button>
            </div>
            {loading ? (
                <p>Memuat data...</p>
            ) : (
                <div className="overflow-x-auto xl:w-[100%] xl:flex xl:justify-center">
                    <div className='xl:w-[90%]'>
                        <table className="table w-full table-xs xl:table-sm table-pin-rows table-pin-cols mx-auto">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th className="text-center">Judul</th>
                                    <th className="text-center">Nama</th>
                                    <th className="text-center">Kontak</th>
                                    <th className="text-center">Unit</th>
                                    <th className="text-center">Ruangan</th>
                                    <th className="text-center">Peserta</th>
                                    <th className="text-center">Tanggal Peminjaman</th>
                                    <th className="text-center">Waktu Peminjaman</th>
                                    <th className="text-center">Tanggal Selesai</th>
                                    <th className="text-center">Waktu Selesai</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((item, index) => (
                                    <tr key={item.id}>
                                        <th>{index + 1}</th>
                                        <td>{item.judul}</td>
                                        <td>{item.nama}</td>
                                        <td>{item.kontak}</td>
                                        <td>{item.unit}</td>
                                        <td>{item.ruangan}</td>
                                        <td className="text-center">{item.peserta}</td>
                                        <td className="text-center">{item.tanggal_peminjaman}</td>
                                        <td className="text-center">{item.waktu_peminjaman}</td>
                                        <td className="text-center">{item.tanggal_selesai}</td>
                                        <td className="text-center">{item.waktu_selesai}</td>
                                        {user?.id === item.user_id && (
                                            <td className='flex justify-center'>
                                                <button
                                                    className="btn btn-info btn-xs mr-2"
                                                    onClick={() => {
                                                        setEditData({
                                                            ...item,
                                                            waktu_peminjaman: formatDateTimeLocal(item.tanggal_peminjaman, item.waktu_peminjaman),
                                                            waktu_selesai: formatDateTimeLocal(item.tanggal_selesai, item.waktu_selesai),
                                                        });
                                                        setShowEditModal(true);
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(item.id)}
                                                    className="btn btn-error btn-xs"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {showConfirmModal && (
                <dialog open className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Konfirmasi Hapus</h3>
                        <p className="py-4">Apakah kamu yakin ingin menghapus data ini?</p>
                        <div className="modal-action">
                            <button onClick={confirmDelete} className="btn btn-error">Ya, Hapus</button>
                            <button onClick={() => setShowConfirmModal(false)} className="btn">Batal</button>
                        </div>
                    </div>
                </dialog>
            )}
            {showEditModal && editData && (
                <dialog open className="modal modal-open">
                    <div className="modal-box max-w-2xl">
                        <h3 className="font-bold text-lg mb-4">Edit Data Peminjaman</h3>
                        <div className="space-y-3">
                            <input name="nama" type="text" value={editData.nama} onChange={(e) => setEditData({ ...editData, nama: e.target.value })} className="input w-full" required />
                            <input name="kontak" type="text" value={editData.kontak} onChange={(e) => setEditData({ ...editData, kontak: e.target.value })} className="input w-full" required />
                            <input name="unit" type="text" value={editData.unit} onChange={(e) => setEditData({ ...editData, unit: e.target.value })} className="input w-full" required />
                            <select name="ruangan" value={editData.ruangan} onChange={(e) => setEditData({ ...editData, ruangan: e.target.value })} className="select w-full" required>
                                <option value="">Pilih Ruangan</option>
                                <option value="Ruang Meeting Besar">Ruang Meeting Besar (50 orang)</option>
                                <option value="Ruang Meeting Kecil">Ruang Meeting Kecil (10 orang)</option>
                            </select>
                            <input name="peserta" type="text" value={editData.peserta} onChange={(e) => setEditData({ ...editData, peserta: e.target.value })} className="input w-full" required />
                            <input name="judul" type="text" value={editData.judul} onChange={(e) => setEditData({ ...editData, judul: e.target.value })} className="input w-full" required />
                            <input name="waktu_peminjaman" type="datetime-local" value={editData.waktu_peminjaman} onChange={(e) => setEditData({ ...editData, waktu_peminjaman: e.target.value })} className="input w-full" required />
                            <input name="waktu_selesai" type="datetime-local" value={editData.waktu_selesai} onChange={(e) => setEditData({ ...editData, waktu_selesai: e.target.value })} className="input w-full" required />
                        </div>
                        <div className="modal-action">
                            <button onClick={handleEditSubmit} className="btn btn-primary">Simpan</button>
                            <button onClick={() => setShowEditModal(false)} className="btn">Batal</button>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
}
