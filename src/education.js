import { Link } from 'react-router-dom';
import './education.css';
import { Sparkles } from 'lucide-react';
import { Users } from 'lucide-react';

export function Education() {
    return (
        <div className="education">
            <h1 className="header"> 
                <div className="header-center">
                    <Sparkles size={35} color="#EAB308" />
                    <Link to="/"><span className="gradient-text">The Republic/Storia</span></Link>
                    <Sparkles size={35} color="#EC4899" />
                </div>
                <Link to="/add" className="addPerson">
                    <Users className="users" size={25} color="#ffffffff"/>
                </Link>
            </h1>
            <main>
                <p>education</p>
            </main>
        </div>
    )
}