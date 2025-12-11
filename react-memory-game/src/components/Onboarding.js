import React, { useState } from 'react';
import '../styles/Onboarding.css';

function Onboarding({ onComplete }) {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }
        if (!age || isNaN(age) || age < 5 || age > 120) {
            setError('Please enter a valid age (5-120)');
            return;
        }

        onComplete({ name: name.trim(), age: parseInt(age) });
    };

    return (
        <div className="screen active" id="onboarding-screen">
            <div className="onboarding-card">
                <h1>Welcome to<br />Memory Master GO</h1>
                <p className="subtitle">Let's get to know you!</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="name">What's your name?</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            autoComplete="off"
                            maxLength={20}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="age">How old are you?</label>
                        <input
                            type="number"
                            id="age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="Age"
                            min="5"
                            max="120"
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="btn-primary btn-large">
                        Get Started
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Onboarding;
