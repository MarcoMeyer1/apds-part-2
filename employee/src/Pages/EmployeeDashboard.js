import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState(null);

    const handleVerifyTransactions = () => {
        navigate('/verify-transactions');
    };

    const handleManageTransactions = () => {
        navigate('/manage-transactions');
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        document.getElementById('file-upload').click();
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        else if (hour < 18) return "Good Afternoon";
        else return "Good Evening";
    };

    return (
        <div className="dashboard-container">
    {/*gradient banner */}
    <div className="profile-banner"></div>

    <div className="spacer"></div>

    {/* Profile Card */}
    <div className="profile-card">
        <div className="profile-picture-container" onClick={triggerFileInput}>
            <div className="profile-picture">
            {profileImage ? (
                            <img src={profileImage} alt="Profile" />
                        ) : (
                            <img src="/default-profile.png" alt="Default Profile" />
                        )}
            </div>
            <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden-file-input"
            />
        </div>

        {/* Profile Information */}
        <div className="profile-info">
        <h2>{`${getGreeting()}, John Doe`}</h2>
            <p>johndoe@example.com</p>
            
            <div className="profile-details">
              <p><strong>Employee ID:</strong> 12345</p>
              <p><strong>Position:</strong> Specialist</p>
              <p><strong>Department:</strong> Finance</p>
              <p><strong>Manager:</strong> Jane Smith</p>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="button-container">
            <button onClick={handleVerifyTransactions} className="action-button">
                Verify Transactions
            </button>
        </div>
    </div>
</div>
    );
};

export default EmployeeDashboard; 