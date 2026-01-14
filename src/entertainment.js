import { Link } from 'react-router-dom';
import './entertainment.css';
import { Sparkles, Users, Clapperboard, Star, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

export function Entertainment() {
    const [companies, setCompanies] = useState([]);
    const [shows, setShows] = useState([]);
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("default");

    useEffect(() => {
        Promise.all([
            fetch("/.netlify/functions/companies").then(res => res.json()),
            fetch("/.netlify/functions/shows").then(res => res.json()),
            fetch("/.netlify/functions/people").then(res => res.json())
        ]).then(([compData, showData, peopleData]) => {
            setCompanies(Array.isArray(compData) ? compData : []);
            setShows(Array.isArray(showData) ? showData : []);
            // peopleData is now keyed by ID and contains 'name' inside
            const peopleArr = Object.values(peopleData);
            console.log("Entertainment Page Debug:", {
                peopleCount: peopleArr.length,
                showsCount: showData.length,
                debug: peopleData._debug
            });
            setPeople(peopleArr);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-10 text-white">Loading...</div>;

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

            {view === "default" ? (
                <DefaultView onSelect={setView} />
            ) : (
                <DetailView
                    view={view}
                    onBack={() => setView("default")}
                    companies={companies}
                    shows={shows}
                    people={people}
                />
            )}
        </div>
    )
}

function DefaultView({ onSelect }) {
    const studios = ["Levon", "Flickr", "Once"];

    return (
        <div className="entertainmentinfo">
            <div className="head">
                <h1 className="entertainmentTitle">Entertainment</h1>
            </div>
            <div className="container">
                <div className="row row-cols-1 row-cols-md-3 g-5">
                    {studios.map(studio => (
                        <div key={studio} className="col-md-6 col-lg-4 p-3 card-wrapper-centerleft">
                            <div className="card rotate-centerleft">
                                <div className="card-body" onClick={() => onSelect(studio.toLowerCase())}>
                                    <div className="circle"><Sparkles className="sparkle" /></div>
                                    <h5 className="card-title">{studio}</h5>
                                    <div className="divider">
                                        <div className="dash"></div>
                                        <div className="diamond">✦</div>
                                        <div className="dash"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function DetailView({ view, onBack, companies, shows, people }) {
    // view is "levon", "flickr", or "once"
    const studioName = view.charAt(0).toUpperCase() + view.slice(1);
    const company = companies.find(c => c.name === studioName);
    const staff = people.filter(p => p.company && p.company.name === studioName);
    const studioShows = shows.filter(s => company && s.company_id === company.id);

    return (
        <div className="entertainmentinfo">
            <div className="head">
                <h1 className="entertainmentTitle">Entertainment</h1>
                <p className="back" onClick={onBack}><ArrowLeft size={20} /> Back</p>
            </div>

            <div className="studio-detail-wrap">
                <div className="d-flex justify-content-center mb-5">
                    <div className="position-relative">
                        <div className="glow-bg position-absolute top-0 start-0 w-100 h-100 rounded-pill"></div>
                        <div className="glow-pill position-relative px-5 py-3 rounded-pill shadow-lg">
                            <h1 className="h4 fw-bold text-white mb-0">{studioName}</h1>
                        </div>
                    </div>
                </div>

                <div className="studio-grid-detail">
                    <div className="studio-card detail">
                        <div className="studio-header">
                            <Clapperboard size={24} className="studio-icon" />
                            <h2>Staff & Executives</h2>
                        </div>
                        <div className="studio-content">
                            <div className="staff-list">
                                {staff.length > 0 ? staff.map(member => (
                                    <div key={member.id} className="staff-member">
                                        <span className="member-name">{member.name}</span>
                                        <span className="member-role">{member.company.position || "Staff"}</span>
                                    </div>
                                )) : <p className="empty">No staff assigned</p>}
                            </div>
                        </div>
                    </div>

                    <div className="studio-card detail">
                        <div className="studio-header">
                            <Star size={24} className="studio-icon" />
                            <h2>Current Productions</h2>
                        </div>
                        <div className="studio-content">
                            <div className="shows-list">
                                {studioShows.length > 0 ? studioShows.map(show => {
                                    const castAssignments = [];
                                    people.forEach(p => {
                                        if (p.shows) {
                                            p.shows.forEach(ps => {
                                                if (String(ps.id) === String(show.id)) {
                                                    castAssignments.push({
                                                        personId: p.id,
                                                        personName: p.name,
                                                        role: ps.role || "Actor",
                                                        firstSeason: ps.first_season || 1,
                                                        lastSeason: ps.last_season || 1
                                                    });
                                                }
                                            });
                                        }
                                    });

                                    return (
                                        <div key={show.id} className="show-card">
                                            <div className="show-title">
                                                <Star size={16} fill="#ec4899" color="#ec4899" />
                                                {show.name}
                                            </div>
                                            <ShowTimeline assignments={castAssignments} />
                                        </div>
                                    )
                                }) : <p className="empty">No active shows</p>}
                            </div>
                        </div>
                    </div>

                    <div className="studio-card detail">
                        <div className="studio-header">
                            <Users size={24} className="studio-icon" />
                            <h2>Studio Talent</h2>
                        </div>
                        <div className="studio-content">
                            <div className="staff-list">
                                {people.filter(p => p.studios && p.studios.some(s => String(s.id) === String(company.id))).map(person => {
                                    const studioInfo = person.studios.find(s => String(s.id) === String(company.id));
                                    return (
                                        <div key={person.id} className="staff-member">
                                            <span className="member-name">{person.name}</span>
                                            <span className="member-role">{studioInfo.position || "Talent"}</span>
                                        </div>
                                    );
                                })}
                                {people.filter(p => p.studios && p.studios.some(s => String(s.id) === String(company.id))).length === 0 && <p className="empty">No talent assigned</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ShowTimeline({ assignments = [] }) {
    const COLORS = [
        "#ef4444", "#fbbf24", "#10b981", "#f97316", "#06b6d4",
        "#6366f1", "#f43f5e", "#f59e0b", "#34d399", "#fb923c",
        "#22d3ee", "#818cf8"
    ];

    const personColors = useMemo(() => {
        if (!assignments || assignments.length === 0) return {};
        const colors = {};
        const uniquePeople = Array.from(new Set(assignments.map(a => a.personId)));
        uniquePeople.forEach((pid, idx) => {
            colors[pid] = COLORS[idx % COLORS.length];
        });
        return colors;
    }, [assignments]);

    if (!assignments || assignments.length === 0) return <div className="cast-list"><span className="empty">Cast TBA</span></div>;

    // Group by role
    const roles = Array.from(new Set(assignments.map(a => a.role))).sort();
    const maxSeason = Math.max(...assignments.map(a => a.lastSeason), 1);
    const minSeason = Math.min(...assignments.map(a => a.firstSeason), 1);
    const totalSeasons = Math.max(maxSeason - minSeason + 1, 1);

    // Helper to get relative position
    const getPos = (season) => ((season - minSeason) / totalSeasons) * 100;
    const getWidth = (start, end) => ((end - start + 1) / totalSeasons) * 100;

    return (
        <div className="timeline-container">
            <div className="timeline-grid">
                <div className="timeline-axis-x">
                    {Array.from({ length: totalSeasons }).map((_, i) => (
                        <div key={i} className="axis-tick" style={{ left: `${(i / totalSeasons) * 100}%` }}>
                            <span>{minSeason + i}</span>
                        </div>
                    ))}
                    <div className="axis-tick" style={{ left: '100%' }}><span>{maxSeason + 1}</span></div>
                </div>

                {roles.map(role => (
                    <div key={role} className="timeline-row">
                        <div className="role-label" title={role}>{role}</div>
                        <div className="bar-area">
                            {assignments.filter(a => a.role === role).map((asgn, idx) => (
                                <div
                                    key={`${asgn.personId}-${idx}`}
                                    className="timeline-bar"
                                    style={{
                                        left: `${getPos(asgn.firstSeason)}%`,
                                        width: `${getWidth(asgn.firstSeason, asgn.lastSeason)}%`,
                                        backgroundColor: personColors[asgn.personId]
                                    }}
                                    title={`${asgn.personName}: Season ${asgn.firstSeason} - ${asgn.lastSeason}`}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="timeline-legend">
                {Object.keys(personColors).map(pid => {
                    const personName = assignments.find(a => String(a.personId) === String(pid))?.personName;
                    return (
                        <div key={pid} className="legend-item">
                            <span className="legend-dot" style={{ backgroundColor: personColors[pid] }}></span>
                            <span className="legend-name">{personName}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}