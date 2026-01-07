import { Link } from 'react-router-dom';
import './entertainment.css';
import { Sparkles, Users, Clapperboard } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Entertainment() {
    const [companies, setCompanies] = useState([]);
    const [shows, setShows] = useState([]);
    const [people, setPeople] = useState([]);

    useEffect(() => {
        Promise.all([
            fetch("/.netlify/functions/companies").then(res => res.json()),
            fetch("/.netlify/functions/shows").then(res => res.json()),
            fetch("/.netlify/functions/people").then(res => res.json())
        ]).then(([compData, showData, peopleData]) => {
            setCompanies(Array.isArray(compData) ? compData : []);
            setShows(Array.isArray(showData) ? showData : []);
            const peopleArr = Object.values(peopleData).map(p => ({ ...p, name: p.name || Object.keys(peopleData).find(key => peopleData[key] === p) }));
            setPeople(peopleArr);
        }).catch(err => console.error(err));
    }, []);

    return (
        <div className="entertainment">
            <h1 className="header">
                <div className="header-center">
                    <Sparkles size={35} color="#EAB308" />
                    <Link to="/"><span className="gradient-text">The Republic/Storia</span></Link>
                    <Sparkles size={35} color="#EC4899" />
                </div>
                <Link to="/entertainers" className="addPerson">
                    <Users className="users" size={25} color="#ffffffff" />
                </Link>
            </h1>
            <main className="ent-main">
                <h1 className="page-title">Entertainment</h1>
                <div className="studios-grid">
                    {companies.map(company => {
                        const companyShows = shows.filter(s => s.company_id === company.id);
                        const staff = people.filter(p => p.company?.id === company.id);

                        return (
                            <div key={company.id} className="studio-card">
                                <div className="studio-header">
                                    <h2>{company.name}</h2>
                                </div>

                                <div className="studio-section">
                                    <h3>Staff & Executives</h3>
                                    <div className="staff-list">
                                        {staff.length > 0 ? staff.map(p => (
                                            <div key={p.id} className="staff-member">
                                                <span className="name">{p.name}</span>
                                                <span className="role">{p.company.position}</span>
                                            </div>
                                        )) : <span className="empty">No staff assigned</span>}
                                    </div>
                                </div>

                                <div className="studio-section">
                                    <h3>In Production</h3>
                                    <div className="shows-list">
                                        {companyShows.map(show => {
                                            const cast = people.filter(p => p.shows?.some(s => s.id === show.id));
                                            return (
                                                <div key={show.id} className="show-card">
                                                    <div className="show-title">
                                                        <Clapperboard size={16} /> {show.name}
                                                    </div>
                                                    <div className="cast-list">
                                                        {cast.length > 0 ? cast.map(c => (
                                                            <span key={c.id} className="cast-name">{c.name}</span>
                                                        )) : <span className="empty">Casting in progress...</span>}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>
        </div>
    )
}