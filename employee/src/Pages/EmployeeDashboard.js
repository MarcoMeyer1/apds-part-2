import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState(null);

    const handleVerifyTransactions = () => {
        navigate('/verify-transactions');
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

    return (
        <div className="dashboard-container">
            <div className="profile-container">
                <div className="profile-picture-container">
                    <div className="profile-picture" onClick={triggerFileInput}>
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%' }} />
                        ) : (
                            'No Image'
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
                <div className="profile-title">Employee Profile</div>
                <div className="profile-info">
                    <span>Username:</span> johndoe
                </div>
                <div className="profile-info">
                    <span>Employee ID:</span> 12345
                </div>
                <div className="profile-info">
                    <span>Position:</span> Transaction Specialist
                </div>
                <div className="profile-info">
                    <span>Department:</span> Finance
                </div>
                <div className="profile-info">
                    <span>Hire Date:</span> January 15, 2020
                </div>
                <div className="profile-info">
                    <span>Office Location:</span> New York HQ
                </div>
                <div className="profile-info">
                    <span>Manager:</span> Jane Smith
                </div>
                <div className="profile-info">
                    <span>Email:</span> johndoe@example.com
                </div>
                <div className="profile-info">
                    <span>Phone:</span> +1 (555) 012-3456
                </div>
                <button onClick={handleVerifyTransactions} className="verify-button">
                    Verify Transactions
                </button>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
