import { Link } from 'react-router-dom';
// import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { api } from './api';
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
            await api.createPerson(formData);
            setStatus('Person added successfully!');
            setFormData({ name: '', region: '', location: '', party: '' });
        } catch (error) {
            console.error('Error adding person:', error);
            setStatus('Error: Failed to connect to server');
        }
    };

    return (
        <div className="people">
            <div className="bg-layer">
                <div className="bg-wash"></div>
                <div className="orb orb-emerald"></div>
                <div className="orb orb-teal"></div>
            </div>
            <h1 className="header">
                <div className="header-center">
                    <Link to="/"><span className="gradient-text">The Republic/Storia</span></Link>
                </div>
            </h1>
            <div className="info">
                <div className="head">
                    <h1 className="peopleTitle">Add a New Person</h1>
                </div>
                <div className="add-container">
                    <form onSubmit={handleSubmit}>
                        <label>Name
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <label>Region
                            <input
                                type="text"
                                name="region"
                                value={formData.region}
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <label>Location
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <label>Party
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