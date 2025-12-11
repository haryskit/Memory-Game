import React from 'react';
import '../styles/ConfirmationModal.css';

function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Yes", cancelText = "No" }) {
    if (!isOpen) return null;

    return (
        <div className="confirmation-overlay">
            <div className="confirmation-box">
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirmation-actions">
                    <button className="btn-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className="btn-confirm" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;
