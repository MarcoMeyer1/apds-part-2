import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState(null);

    const [employeeInfo, setEmployeeInfo] = useState({
        fullName: '',
        username: '',
        email: '',
        employeeID: '',
        position: '',
        department: '',
        manager: ''
    });

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

    useEffect(() => {
        const fetchEmployeeInfo = async () => {
            try {
                const response = await fetch('https://localhost:5000/api/employee/profile', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch employee information');
                }

                const data = await response.json();
                setEmployeeInfo({
                    fullName: data.FullName,
                    username: data.Username,
                    email: data.Email,
                    employeeID: data.EmployeeID,
                    position: data.Position,
                    department: data.Department,
                    manager: data.Manager
                });
            } catch (error) {
                console.error("Error fetching employee information:", error);
            }
        };

        fetchEmployeeInfo();
    }, []);

    return (
        <div className="dashboard-container">
            {/* Gradient banner */}
            <div className="profile-banner"></div>

            {/* Spacer */}
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
                    <h2>{`${getGreeting()}, ${employeeInfo.fullName}`}</h2>
                    <p>{employeeInfo.email}</p>

                    <div className="profile-details">
                        <p><strong>Employee ID:</strong> {employeeInfo.employeeID}</p>
                        <p><strong>Position:</strong> {employeeInfo.position}</p>
                        <p><strong>Department:</strong> {employeeInfo.department}</p>
                        <p><strong>Manager:</strong> {employeeInfo.manager}</p>
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
