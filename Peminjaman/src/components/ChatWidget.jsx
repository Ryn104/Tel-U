// src/components/ChatWidget.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { FaWhatsapp } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5'; // ikon X
import Telkom from '../assets/icon/Tel-U.png'

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasSubmittedInfo, setHasSubmittedInfo] = useState(false);
    const [form, setForm] = useState({ nama: '', nomor: '', divisi: '', pesan: '' });
    const [status, setStatus] = useState('');
    const [alertType, setAlertType] = useState('');
    const [loading, setLoading] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmitInfo = (e) => {
        e.preventDefault();
        if (form.nama && form.nomor && form.divisi) {
            setHasSubmittedInfo(true);
        }
    };

    const handleSubmitChat = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                nama: form.nama,
                nomor: form.nomor,
                divisi: form.divisi,
                pesan: form.pesan,
            };

            const res = await axios.post('https://n8n.srv870769.hstgr.cloud/webhook/admin', payload);
            if (res.data.success || res.status === 200) {
                setAlertType("success"); // ⬅️ set alert type
                setStatus("Pesan berhasil dikirim!");
                setForm({ ...form, pesan: '' });
            } else {
                setAlertType("error");
                setStatus("Gagal mengirim pesan.");
            }
        } catch (error) {
            setAlertType("error");
            setStatus("Terjadi kesalahan saat mengirim pesan.");
        } finally {
            setLoading(false);
            setTimeout(() => setStatus(''), 4000);
        }
    };

    return (
        <>
            <div className="fixed bottom-20 right-4 lg:bottom-22 lg:right-6 z-50">
                {status && (
                    <div
                        role="alert"
                        className={`alert ${alertType === 'success' ? 'alert-success' : 'alert-error'
                            } mb-3 transition-all duration-300 fixed top-3 right-3 xl:top-5 xl:right-5`}
                    >
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
                                d={
                                    alertType === 'success'
                                        ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                        : 'M6 18L18 6M6 6l12 12'
                                }
                            />
                        </svg>
                        <span>{status}</span>
                    </div>
                )}
                {/* Tombol WhatsApp (disembunyikan saat chat terbuka) */}
                {!isOpen && (
                    <button
                        onClick={toggleChat}
                        className="btn btn-circle w-14 h-14 lg:w-14 lg:h-14 bg-[#E60000] hover:bg-[#b80000] border border-gray-200 text-white shadow-xl"
                    >
                        <FaWhatsapp className="text-2xl lg:text-3xl" />
                    </button>
                )}

                {/* Chat box */}
                {isOpen && (
                    <div className="relative mt-2 shadow-xl bg-white border border-gray-200 rounded-2xl px-4 pt-2 pb-3 lg:py-4 lg:px-6 w-65 lg:w-98">
                        {/* Tombol Close (X) */}
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-[#D62828] rounded-t-2xl rounded-bl-[30%] z-0"></div>
                        <div className="relative z-10 p-4 text-white">
                            <button
                                onClick={toggleChat}
                                className="absolute top-2 right-2 text-white hover:text-red-300 text-xl lg:text-2xl"
                                aria-label="Tutup"
                            >
                                <IoClose />
                            </button>
                            <h3 className="text-lg lg:text-2xl text-center text-white font-semibold lg:mb-5">Hubungi Admin</h3>
                        </div>
                        <form onSubmit={handleSubmitChat} className="flex flex-col gap-2 lg:gap-3">
                            <div className='bg-white rounded-lg p-3 flex flex-col z-10 border border-gray-200'>
                                <label className="label text-sm">Nama</label>
                                <input
                                    type="text"
                                    name="nama"
                                    placeholder="Masukan Nama"
                                    className="input input-bordered h-8 lg:h-10 lg:text-md mb-3"
                                    value={form.nama}
                                    onChange={handleChange}
                                    required
                                />
                                <label className="label text-sm">Nomor</label>
                                <input
                                    type="number"
                                    name="nomor"
                                    placeholder="Masukan Nomor"
                                    className="input input-bordered h-8 lg:h-10 lg:text-md mb-3"
                                    value={form.nomor}
                                    onChange={handleChange}
                                    required
                                />
                                <label className="label text-sm">Unit/Divisi</label>
                                <input
                                    type="text"
                                    name="divisi"
                                    placeholder="Masukan Divisi"
                                    className="input input-bordered h-8 lg:h-10 lg:text-md mb-3"
                                    value={form.divisi}
                                    onChange={handleChange}
                                    required
                                />
                                <label className="label text-sm">Pesan</label>
                                <textarea
                                    name="pesan"
                                    rows="3"
                                    className="textarea textarea-bordered lg:text-md"
                                    placeholder="Ketik pesan..."
                                    value={form.pesan}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="btn bg-[#E60000] hover:bg-[#b80000] text-white border-none mt-2 lg:mt-4 h-8 lg:h-10 lg:text-md shadow-none mb-2 lg:mb-4"
                                disabled={loading}
                            >
                                {loading ? 'Mengirim...' : 'Kirim'}
                            </button>

                        </form>
                        <div className='text-center'>
                            <div className='w-full h-0.5 border-t border-gray-300 mb-1'></div>
                            <span className='text-xs lg:text-sm text-center text-gray-500'>Hubungi Langsung <a href="https://wa.me/6281320627300" className='hover:text-red-500 font-medium'>+6281320627300</a></span>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}
