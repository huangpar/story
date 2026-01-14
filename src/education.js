import { Link } from 'react-router-dom';
import './education.css';
import { Sparkles, Users, GraduationCap, School, BookOpen, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

export function Education() {
    const [academies, setAcademies] = useState([]);
    const [majors, setMajors] = useState([]);
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("default");

    useEffect(() => {
        Promise.all([
            fetch("/.netlify/functions/academies").then(res => res.json()),
            fetch("/.netlify/functions/majors").then(res => res.json()),
            fetch("/.netlify/functions/people").then(res => res.json())
        ]).then(([acadData, majorData, peopleData]) => {
            setAcademies(Array.isArray(acadData) ? acadData : []);
            setMajors(Array.isArray(majorData) ? majorData : []);
            setPeople(Array.isArray(peopleData) ? peopleData : Object.values(peopleData));
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    return (
        <div className="education">
            <h1 className="header">
                <div className="header-center">
                    <Sparkles size={35} color="#EAB308" />
                    <Link to="/"><span className="gradient-text">The Republic/Storia</span></Link>
                    <Sparkles size={35} color="#EC4899" />
                </div>
                <Link to="/add" className="addPerson">
                    <Users className="users" size={25} color="#ffffffff" />
                </Link>
            </h1>

            {view === "default" ? (
                <DefaultView onSelect={setView} academies={academies} loading={loading} />
            ) : (
                <DetailView
                    view={view}
                    onBack={() => setView("default")}
                    academies={academies}
                    majors={majors}
                    people={people}
                />
            )}
        </div>
    )
}

function DefaultView({ onSelect, academies, loading }) {
    return (
        <div className="educationinfo">
            <div className="head">
                <h1 className="educationTitle">Education</h1>
            </div>
            <div className="container">
                <div className="row row-cols-1 row-cols-md-3 g-5">
                    {academies.map(academy => (
                        <div key={academy.id} className="col-md-6 col-lg-4 p-3 card-wrapper-centerleft">
                            <div className="card rotate-centerleft">
                                <div className="card-body" onClick={() => onSelect(academy.id)}>
                                    <div className="circle"><GraduationCap className="sparkle" /></div>
                                    <h5 className="card-title">{academy.name}</h5>
                                    <div className="divider">
                                        <div className="dash"></div>
                                        <div className="diamond">✦</div>
                                        <div className="dash"></div>
                                    </div>
                                    <p className="card-text text-white-50 small mt-2">{academy.location}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {academies.length === 0 && !loading && (
                        <div className="col-12 text-center text-white-50 mt-5">
                            <p>No schools found in the database.</p>
                        </div>
                    )}
                </div>
            </div>
            {loading && (
                <div className="fetch-indicator">
                    <div className="spinner"></div>
                    <span>Fetching latest data...</span>
                </div>
            )}
        </div>
    )
}

function DetailView({ view, onBack, academies, majors, people }) {
    const [activeTab, setActiveTab] = useState("overview");
    const academy = academies.find(a => String(a.id) === String(view));
    const schoolMajors = majors.filter(m => String(m.academy_id) === String(view));

    // Consolidate all school members
    const schoolMembers = useMemo(() => {
        if (!academy) return [];
        return people.filter(p => String(p.academy_id) === String(academy.id));
    }, [people, academy]);

    const staffMembers = schoolMembers.filter(m =>
        ["professor", "headmaster", "dean", "head", "staff", "admin", "teacher"].some(kw => (m.edu_role || "").toLowerCase().includes(kw))
    );

    const students = schoolMembers.filter(m =>
        !["professor", "headmaster", "dean", "head", "staff", "admin", "teacher"].some(kw => (m.edu_role || "").toLowerCase().includes(kw))
    );

    if (!academy) return <div className="p-10 text-white">Academy not found</div>;

    return (
        <div className="educationinfo">
            <div className="head">
                <h1 className="educationTitle">Education</h1>
                <p className="back" onClick={onBack}><ArrowLeft size={20} /> Back</p>
            </div>

            <div className="academy-detail-wrap">
                <div className="d-flex justify-content-center mb-4">
                    <div className="position-relative">
                        <div className="glow-bg edu position-absolute top-0 start-0 w-100 h-100 rounded-pill"></div>
                        <div className="glow-pill edu position-relative px-5 py-3 rounded-pill shadow-lg">
                            <h1 className="h4 fw-bold text-white mb-0">{academy.name}</h1>
                        </div>
                    </div>
                </div>

                <div className="education-bar">
                    <div
                        className={`edu-tab ${activeTab === "overview" ? "active" : ""}`}
                        onClick={() => setActiveTab("overview")}
                    >
                        Overview
                    </div>
                    {schoolMajors.map(major => (
                        <div
                            key={major.id}
                            className={`edu-tab ${String(activeTab) === String(major.id) ? "active" : ""}`}
                            onClick={() => setActiveTab(major.id)}
                        >
                            {major.name}
                        </div>
                    ))}
                </div>

                {activeTab === "overview" ? (
                    <div className="academy-overview-grid">
                        <div className="edu-card detail">
                            <div className="edu-header">
                                <School size={24} className="edu-icon" />
                                <h2>School Staff</h2>
                            </div>
                            <div className="edu-content">
                                <div className="staff-list">
                                    {staffMembers.length > 0 ? staffMembers.map(member => (
                                        <div key={member.id} className="staff-member">
                                            <span className="member-name">{member.name}</span>
                                            <span className="member-role">{member.edu_role || "Staff"}</span>
                                        </div>
                                    )) : <p className="empty">No staff listed</p>}
                                </div>
                            </div>
                        </div>

                        <div className="edu-card detail">
                            <div className="edu-header">
                                <Users size={24} className="edu-icon" />
                                <h2>All Students</h2>
                            </div>
                            <div className="edu-content">
                                <div className="staff-list">
                                    {students.length > 0 ? students.map(student => (
                                        <div key={student.id} className="staff-member">
                                            <span className="member-name">{student.name}</span>
                                            <span className="member-role">{student.major_name || student.edu_role || "Student"}</span>
                                        </div>
                                    )) : <p className="empty">No students listed</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="major-detail-view">
                        <div className="edu-card detail">
                            <div className="edu-header">
                                <BookOpen size={24} className="edu-icon" />
                                <h2>{schoolMajors.find(m => String(m.id) === String(activeTab))?.name} Students</h2>
                            </div>
                            <div className="edu-content">
                                <div className="staff-list">
                                    {students.filter(s => String(s.major_id) === String(activeTab)).map(student => (
                                        <div key={student.id} className="staff-member">
                                            <span className="member-name">{student.name}</span>
                                            <span className="member-role">{student.edu_role || "Student"}</span>
                                        </div>
                                    ))}
                                    {students.filter(s => String(s.major_id) === String(activeTab)).length === 0 && <p className="empty">No students in this major</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}