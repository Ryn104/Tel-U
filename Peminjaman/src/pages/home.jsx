import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../App.css';
import Form from '../components/BookingForm';
import Navbar from '../components/NavBar';

const App = () => {

    useEffect(() => {
        const checkLogin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = '/login';
            }
        };
        checkLogin();
    }, []);
    return (
        <>
            <Form />
            <Navbar />
        </>
    )
};

export default App;
