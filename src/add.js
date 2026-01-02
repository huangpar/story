import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import './add.css';

export function Add() {
    const [formData, setFormData] = useState({
        name: '',
        region: '',
        location: '',
        party: ''
    });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Submitting...');

        try {
            const response = await fetch('/.netlify/functions/people', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus('Person added successfully!');
                setFormData({ name: '', region: '', location: '', party: '' });
            } else {
                const errorData = await response.json();
                setStatus(`Error: ${errorData.error || 'Failed to add person'}`);
            }
        } catch (error) {
            console.error('Error adding person:', error);
            setStatus('Error: Failed to connect to server');
        }
    };

    return (
        <div className="home">
            <h1 className="header">
                <div className="header-center">
                    <Sparkles size={35} color="#EAB308" />
                    <Link to="/"><span className="gradient-text">The Republic/Storia</span></Link>
                    <Sparkles size={35} color="#EC4899" />
                </div>
            </h1>
            <div className="form-wrapper">
                <div className="add-person-form">
                    <h2>Add a New Person</h2>
                    <form onSubmit={handleSubmit}>
                        <label>Name:
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <label>Region:
                            <input
                                type="text"
                                name="region"
                                value={formData.region}
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <label>Location:
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <label>Party:
                            <input
                                type="text"
                                name="party"
                                value={formData.party}
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <button type="submit">Add Person</button>
                    </form>
                    {status && <p className="status-message">{status}</p>}
                </div>
            </div>
        </div>
    )
}