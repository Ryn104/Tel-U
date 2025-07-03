import React from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const NavBar = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const linkClasses = (path) =>
        `flex flex-col items-center px-3 py-1 transition-colors duration-200 ${currentPath === path
            ? 'text-blue-600 border-b-2 border-blue-500'
            : 'text-gray-700 hover:text-blue-700'
        }`;

    return (
        <div className="dock dock-sm xl:w-[50%] xl:mx-auto">
            {/* Tombol Data */}
            <a href="/data">
                <button className={linkClasses('/data')}>
                    <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g fill="currentColor" strokeLinejoin="miter" strokeLinecap="butt">
                            <polyline
                                points="3 14 9 14 9 17 15 17 15 14 21 14"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="square"
                                strokeWidth="2"
                            />
                        </g>
                    </svg>
                    <span class="dock-label">Data</span>
                </button>
            </a>

            {/* Tombol Home */}
            <a href="/home">
                <button className={linkClasses('/home')}>
                    <svg className="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g fill="currentColor" strokeLinejoin="miter" strokeLinecap="butt">
                            <polyline points="1 11 12 2 23 11" fill="none" stroke="currentColor" strokeWidth="2" />
                            <path
                                d="m5,13v7c0,1.105.895,2,2,2h10c1.105,0,2-.895,2-2v-7"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="square"
                                strokeWidth="2"
                            />
                            <line
                                x1="12"
                                y1="22"
                                x2="12"
                                y2="18"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="square"
                                strokeWidth="2"
                            />
                        </g>
                    </svg>
                    <span class="dock-label">Home</span>
                </button>
            </a>

            {/* Tombol Settings */}
            <button
                onClick={handleLogout}
                className="p-2 rounded hover:text-red-600 transition-colors duration-200"
                title="Logout"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-[1.4em]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m0 14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2h4a2 2 0 012 2"
                    />
                </svg>
                <span class="dock-label">Logout</span>                
            </button>


        </div>
    );
};

export default NavBar;
