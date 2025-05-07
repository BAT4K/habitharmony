import React, { useState, useEffect } from "react";
import Profile from "../assets/ProfilePicture.png";
import { Award, Settings, NotebookPen, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from '../services/api';

const ProfileHeader = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ name: '', surname: '' });
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            fetch('http://localhost:5000/api/auth/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    setUserData(data);
                })
                .catch(err => {
                    console.error('Error fetching user data:', err);
                    setError('Failed to load profile data.');
                });
        }
    }, []);

    const handleLogout = () => {
        // Call API logout if it exists
        try {
            api.logout();
        } catch (error) {
            console.error("Error during API logout:", error);
        }
        
        // Ensure both storage locations are cleared
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('staySignedIn');
        
        console.log("Logged out successfully, tokens cleared");
        
        // Navigate to login page with state information
        navigate('/login', { state: { fromLogout: true }, replace: true });
    };

    return (
        <div>
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <div className="flex items-center space-x-4 mt-4">
                <img
                    src={Profile}
                    alt="Profile Picture"
                    className="border-2 border-black rounded-full h-[76px] w-[76px]"
                />
                <div className="flex justify-center flex-col w-full">
                    <div className="flex justify-between items-center">
                        <p className="text-2xl font-semibold">
                            {error ? error : `${userData.name} ${userData.surname}`}
                        </p>
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={() => navigate("/settings")} 
                                className="flex items-center justify-center p-2 rounded-full hover:bg-[#FFF3DA] transition-colors"
                                title="Settings"
                            >
                                <Settings size={20} className="text-gray-700" />
                            </button>
                            <button 
                                onClick={handleLogout} 
                                className="flex items-center space-x-2 py-2 px-4 rounded-3xl bg-[#FFF3DA] text-[#FEA800] font-medium hover:bg-[#FFE9C0] transition-colors"
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                    <p className="flex pl-3 py-2 bg-[#FFF3DA] w-max pr-5 rounded-3xl text-sm items-center text-[#FEA800] font-medium mt-2">
                        <Award size={16} className="mr-2" />
                        1452 Points
                    </p>
                </div>
            </div>
            <div className="px-4 pt-6">
                <div className="flex items-center gap-3">
                    <NotebookPen />
                    <div>
                        <p className="mb-[-4px] p-0 text-normal text-[#5253E3]">Journal</p>
                        <p className="m-0 p-0 text-[12px] text-black/80">
                            Write your own progress
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;