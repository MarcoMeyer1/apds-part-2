import React, { useState } from 'react';
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

    return (
        <div className="dashboard-container">
            <div className="profile-header">
                <div className="profile-info">
                    <h2>Welcome back John</h2>
                    <p>johndoe@example.com</p>
                    <p><strong>Employee ID:</strong> 12345</p>
                    <p><strong>Position:</strong> Transaction Specialist</p>
                    <p><strong>Department:</strong> Finance</p>
                    <p><strong>Manager:</strong> Jane Smith</p>
                </div>
                <div className="profile-picture-container" onClick={triggerFileInput}>
                    <div className="profile-picture">
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%' }} />
                        ) : (
                            'Profile Pic'
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
            </div>
            <div className="button-container">
                <button onClick={handleVerifyTransactions} className="action-button">
                    Verify Transaction
                </button>
                <button onClick={handleManageTransactions} className="action-button">
                    Manage Transactions
                </button>
            </div>
        </div>
    );
};

export default EmployeeDashboard; 