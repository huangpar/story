import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import './add.css';

export function Add() {
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
                    <form>
                        <label>Name:      
                            <input type="text" name="name" required />
                        </label>
                        <label>Region:
                            <input type="text" name="region" required />
                        </label>
                        <label>Location:
                            <input type="text" name="location" required />
                        </label>
                        <label>Party:
                            <input type="text" name="party" required />
                        </label>
                        <button type="submit">Add Person</button>
                    </form>
                </div>
            </div>
        </div>
    )
}