// src/components/BookingTable.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

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
  const [csvStartDate, setCsvStartDate] = useState('');
  const [csvEndDate, setCsvEndDate] = useState('');
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingApproveId, setLoadingApproveId] = useState(null);
  const [loadingRejectId, setLoadingRejectId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTargetId, setRejectTargetId] = useState(null);





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
      .from('peminjaman_ruang')
      .select('*, user_id') // Pastikan user_id di-select
      .order('tanggal_peminjaman', { ascending: true });

    if (error) console.error("Error:", error);
    else setBookings(data);
    setLoading(false);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirmModal(true);
  };

  const handleDelete = async (id) => {
    setLoadingDeleteId(id);
    try {
      const booking = bookings.find((b) => b.id === id);
      if (!booking) throw new Error("Booking tidak ditemukan");

      // ✅ Panggil webhook n8n
      await axios.post(
        'https://n8n.srv870769.hstgr.cloud/webhook/hapus',
        {
          ...booking,
          id: id,
          deleted_at: new Date().toISOString(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      const { error } = await supabase
        .from('peminjaman_ruang')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStatus("Data berhasil dihapus.");
      setShowAlert(true);
      fetchBookings();
    } catch (error) {
      console.error("Gagal menghapus:", error);
      setStatus("Gagal menghapus data.");
      setShowAlert(true);
    } finally {
      setLoadingDeleteId(null);
      setDeleteId(null);
      setShowConfirmModal(false);
      setTimeout(() => setShowAlert(false), 4000);
    }
  };

  const handleApprove = async (bookingId) => {
    setLoadingApproveId(bookingId);
    try {
      // Update approval status in database
      const { error } = await supabase
        .from('peminjaman_ruang')
        .update({ approval: true })
        .eq('id', bookingId);

      if (error) throw error;

      // Send approval to n8n
      const booking = bookings.find(b => b.id === bookingId);
      const res = await axios.post('https://n8n.srv870769.hstgr.cloud/webhook/approve', {
        ...booking,
        approval: true
      });

      if (res.data.success) {
        setStatus("Booking berhasil disetujui!");
        setShowAlert(true);
        fetchBookings();
      } else {
        throw new Error("Approval failed in n8n");
      }
    } catch (error) {
      console.error("Approval error:", error);
      setStatus("Gagal menyetujui booking");
      setShowAlert(true);
    } finally {
      setLoadingApproveId(null);
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  const handleReject = async (bookingId, reason) => {
    setLoadingRejectId(bookingId);
    try {
      const booking = bookings.find(b => b.id === bookingId);

      if (!booking) {
        throw new Error(`Booking dengan ID ${bookingId} tidak ditemukan`);
      }

      const res = await axios.post(
        'https://n8n.srv870769.hstgr.cloud/webhook/reject',
        {
          ...booking,
          approval: false,
          reason: reason
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (res.data.success) {
        const { error } = await supabase
          .from('peminjaman_ruang')
          .delete()
          .eq('id', bookingId);

        if (error) throw error;

        setStatus("Booking berhasil ditolak!");
        setShowAlert(true);
        fetchBookings();
      } else {
        throw new Error("Gagal di n8n");
      }
    } catch (error) {
      console.error("Rejection error:", error);
      setStatus("Gagal menolak booking: " + (error.response?.data?.message || error.message));
      setShowAlert(true);
    } finally {
      setLoadingRejectId(null);
      setRejectReason('');
      setRejectTargetId(null);
      setShowRejectModal(false);
      setTimeout(() => setShowAlert(false), 5000);
    }
  };



  const handleEditSubmit = async () => {
    setEditLoading(true); // mulai loading
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
        const { error } = await supabase.from('peminjaman_ruang').update({
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
          setStatus("Data berhasil diubah!");
          setShowAlert(true);
        }
      } else {
        setStatus("Ruangan sudah terpakai!");
        setShowAlert(true);
      }
    } catch (err) {
      setStatus("Terjadi kesalahan saat mengirim.");
      setShowAlert(true);
    } finally {
      setEditLoading(false); // stop loading
      setTimeout(() => setShowAlert(false), 5000);
    }
  };


  const downloadCSV = () => {
    if (!bookings || bookings.length === 0) return;

    const start = csvStartDate ? new Date(csvStartDate) : null;
    const end = csvEndDate ? new Date(csvEndDate) : null;

    const filtered = bookings.filter(booking => {
      const bookingDate = new Date(booking.tanggal_peminjaman);
      return (!start || bookingDate >= start) && (!end || bookingDate <= end);
    });

    if (filtered.length === 0) {
      alert('Tidak ada data dalam rentang tanggal yang dipilih.');
      return;
    }

    const headers = Object.keys(filtered[0]).filter(key => key !== 'id' && key !== 'created_at' && key !== 'user_id');
    const rows = filtered.map(booking => headers.map(field => `"${String(booking[field] ?? '').replace(/"/g, '""')}"`).join(';'));
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
  const tanggalMulai = detailData
    ? dayjs(`${detailData.tanggal_peminjaman}T${detailData.waktu_peminjaman}`).locale('id')
    : null;
  const tanggalSelesai = detailData
    ? dayjs(`${detailData.tanggal_selesai}T${detailData.waktu_selesai}`).locale('id')
    : null;



  // Check if user is the specific admin
  const isAdmin = user?.id === 'aac4ce7e-5c19-4abd-a178-929d1cdd8f82';

  return (
    <div className='bg-gradient-to-br bg-[#f2f2f2] min-h-screen px-4 pt-5 pb-21'>
      <div className="w-full max-w-7xl mx-auto shadow-xl bg-white border border-gray-200 rounded-2xl p-6 max-h-4xl">
        {showAlert && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md">
            <div className={`alert ${status.includes('berhasil') ? 'alert-success' : 'alert-warning'} shadow-lg`}>
              <span>{status}</span>
            </div>
          </div>
        )}

        <h1 className="text-3xl xl:text-5xl xl:mb-16 mb-10 mt-5 text-center font-bold text-[#002B5B]">
          Data Peminjaman Ruangan
        </h1>

        <div className="mb-4 flex flex-col md:flex-row md:justify-between gap-2 items-stretch">
          <button onClick={() => setShowCSVModal(true)} className="btn w-full sm:w-auto bg-[#E60000] hover:bg-[#b80000] text-white border-none">
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

        {showCSVModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Download CSV Berdasarkan Tanggal</h3>

              <div className="flex flex-col gap-4">
                <input
                  type="date"
                  value={csvStartDate}
                  onChange={(e) => setCsvStartDate(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Dari tanggal"
                />
                <input
                  type="date"
                  value={csvEndDate}
                  onChange={(e) => setCsvEndDate(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Sampai tanggal"
                />
              </div>

              <div className="modal-action mt-6">
                <button
                  onClick={() => {
                    downloadCSV();
                    setShowCSVModal(false);
                  }}
                  className="btn btn-primary"
                >
                  Download
                </button>
                <button onClick={() => setShowCSVModal(false)} className="btn">Batal</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className='flex justify-center'><span className="loading loading-spinner loading-lg"></span></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-xs table-zebra xl:table-md w-full">
              <thead>
                <tr className='text-center'>
                  <th>#</th>
                  <th>Judul</th>
                  <th>Nama</th>
                  <th>Unit</th>
                  <th>Ruangan</th>
                  <th>Peserta</th>
                  <th>Peminjaman</th>
                  <th className='px-8'>Selesai</th>
                  <th>Status</th>
                  <th>Action</th>
                  {isAdmin && (
                    <th>Approval</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {bookings
                  .filter(item => {
                    const bookingEndTime = new Date(`${item.tanggal_selesai}T${item.waktu_selesai}`);
                    const now = new Date();

                    return bookingEndTime > now && // hanya tampilkan jika belum lewat
                      (!filterDate || item.tanggal_peminjaman === filterDate) &&
                      (!filterRuangan || item.ruangan === filterRuangan);
                  })
                  .map((item, index) => (
                    <tr
                      key={item.id}
                      className='text-center hover:bg-gray-100 cursor-pointer'
                      onClick={() => {
                        setDetailData(item);
                        document.getElementById('detail_modal').showModal();
                      }}
                    >
                      <th>{index + 1}</th>
                      <td>{item.judul}</td>
                      <td>{item.nama}</td>
                      <td>{item.unit}</td>
                      <td>{item.ruangan}</td>
                      <td>{item.peserta}</td>
                      <td>
                        {item.tanggal_peminjaman &&
                          dayjs(item.tanggal_peminjaman).locale('id').format('DD-MM-YYYY')}<br />
                        {item.waktu_peminjaman} WIB
                      </td>
                      <td>
                        {item.tanggal_selesai &&
                          dayjs(item.tanggal_selesai).locale('id').format('DD-MM-YYYY')}<br />
                        {item.waktu_selesai} WIB
                      </td>
                      <td>
                        {item.approval ? (
                          <span className="badge badge-outline badge-success rounded-sm">Diterima</span>
                        ) : (
                          <span className="badge badge-outline badge-warning rounded-sm">Menunggu</span>
                        )}
                      </td>
                      <td>
                        {/* Hanya tampilkan edit/hapus jika user adalah pemilik data ATAU admin */}
                        {user?.id !== '50bcd3a3-4b94-472e-b012-996f27df045a' && (user?.id === item.user_id || isAdmin) && (
                          <div className="flex gap-2">
                            <button
                              className="btn btn-xs bg-[#002B5B] hover:bg-[#001933] text-white border-none"
                              onClick={(e) => {
                                e.stopPropagation();
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(item.id);
                              }}
                              className="btn btn-xs bg-[#E60000] hover:bg-[#b80000] text-white"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                      </td>
                      {isAdmin && (
                        <td onClick={(e) => e.stopPropagation()}>
                          {!item.approval && (
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(item.id);
                                }}
                                className="btn btn-xs bg-green-700 hover:bg-green-900 text-white"
                                disabled={loadingApproveId === item.id}
                              >
                                {loadingApproveId === item.id ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  'Approve'
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRejectTargetId(item.id);
                                  setShowRejectModal(true);
                                }}
                                className="btn btn-xs bg-orange-600 hover:bg-orange-800 text-white"
                              >
                                Reject
                              </button>

                            </div>
                          )}
                        </td>
                      )}
                    </tr>

                  ))}
              </tbody>
            </table>
          </div>
        )}

        {showConfirmModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg text-[#E60000]">Konfirmasi Hapus</h3>
              <p className="py-4">Apakah kamu yakin ingin menghapus data ini?</p>
              <div className="modal-action">
                <button
                  className={`btn bg-red-600 text-white ${loadingDeleteId ? 'loading' : ''}`}
                  onClick={() => handleDelete(deleteId)}
                  disabled={loadingDeleteId !== null}
                >
                  {loadingDeleteId ? 'Menghapus...' : 'Ya, Hapus!'}
                </button>


                <button onClick={() => setShowConfirmModal(false)} className="btn">Batal</button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && editData && (
          <div className="modal modal-open">
            <div className="modal-box max-w-3xl">
              <h3 className="font-bold text-lg mb-4 text-[#002B5B]">Edit Data Peminjaman</h3>
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
                <button
                  onClick={handleEditSubmit}
                  className="btn bg-[#002B5B] hover:bg-[#001933] text-white border-none"
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </button>


                <button onClick={() => setShowEditModal(false)} className="btn">Batal</button>
              </div>
            </div>
          </div>
        )}

        {showRejectModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg text-orange-600">Tolak Peminjaman</h3>
              <p className="mb-4">Berikan alasan penolakan:</p>
              <textarea
                className="textarea textarea-bordered w-full"
                rows="4"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Ruangan sudah digunakan untuk acara lain."
              ></textarea>

              <div className="modal-action">
                <button
                  className={`btn bg-orange-600 text-white ${loadingRejectId ? 'loading' : ''}`}
                  onClick={() => handleReject(rejectTargetId, rejectReason)}
                  disabled={!rejectReason.trim() || loadingRejectId}
                >
                  {loadingRejectId ? 'Mengirim...' : 'Kirim Penolakan'}
                </button>

                <button
                  className="btn"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setRejectTargetId(null);
                  }}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}


        <dialog id="detail_modal" className="modal modal-bottom sm:modal-middle">
          <div className="modal-box max-w-2xl bg-white rounded-xl shadow-lg">
            {detailData && (
              <div className="mb-6 flex justify-between">
                <h3 className="text-2xl font-bold text-[#002B5B] flex items-center gap-2">
                  Detail Peminjaman
                </h3>
                {detailData.approval ? (
                  <span className="badge badge-outline badge-success rounded-sm gap-2">Diterima</span>
                ) : (
                  <span className="badge badge-outline badge-warning rounded-sm gap-2">Menunggu</span>
                )}
              </div>
            )}

            {detailData && (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full text-sm">
                  <tbody>
                    <tr>
                      <th className="text-start w-1/3">📌 Judul</th>
                      <td>{detailData.judul}</td>
                    </tr>
                    <tr>
                      <th className="text-start">👤 Nama</th>
                      <td>{detailData.nama}</td>
                    </tr>
                    <tr>
                      <th className="text-start">📞 Kontak</th>
                      <td>{detailData.kontak}</td>
                    </tr>
                    <tr>
                      <th className="text-start">🏢 Unit</th>
                      <td>{detailData.unit}</td>
                    </tr>
                    <tr>
                      <th className="text-start">🏛️ Ruangan</th>
                      <td>{detailData.ruangan}</td>
                    </tr>
                    <tr>
                      <th className="text-start">👥 Peserta</th>
                      <td>{detailData.peserta} Peserta</td>
                    </tr>
                    <tr>
                      <th className="text-start">
                        <div className='block'>
                          <div>🕒 Mulai </div>
                          <div>- Tanggal</div>
                          <div>- Waktu</div>
                        </div>
                      </th>
                      <td>
                        {tanggalMulai && (
                          <div className='block'>
                            <div className="text-transparent">
                              -
                            </div>
                            <div>{tanggalMulai.format('dddd')}, {tanggalMulai.format('DD-MMMM-YYYY')} </div>
                            <div>{detailData.waktu_peminjaman} WIB</div>
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th className="text-start">
                        <div className='block'>
                          <div>🕒 Selesai </div>
                          <div>- Tanggal</div>
                          <div>- Waktu</div>
                        </div>
                      </th>
                      <td>
                        {tanggalSelesai && (
                          <div className='block'>
                            <div className="text-transparent">
                              -
                            </div>
                            <div>{tanggalSelesai.format('dddd')}, {tanggalSelesai.format('DD-MMMM-YYYY')} </div>
                            <div>{detailData.waktu_selesai} WIB</div>
                          </div>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal-action mt-6">
              <form method="dialog">
                <button className="btn btn-outline btn-primary">Tutup</button>
              </form>
            </div>
          </div>
        </dialog>



      </div>
    </div>
  );
}