import { Link } from 'react-router-dom';
import './education.css';
import { Sparkles, Users, GraduationCap, School, BookOpen, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

export function Education() {
    const [schools, setSchools] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("default");

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            fetch("/.netlify/functions/schools").then(res => res.json()),
            fetch("/.netlify/functions/subjects").then(res => res.json()),
            fetch("/.netlify/functions/people").then(res => res.json())
        ]).then(([schData, subjData, peopleData]) => {
            setSchools(Array.isArray(schData) ? schData : []);
            setSubjects(Array.isArray(subjData) ? subjData : []);
            setPeople(Array.isArray(peopleData) ? peopleData : Object.values(peopleData));
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="education">
            <h1 className="header">
                <div className="header-center">
                    <Sparkles size={35} color="#EAB308" />
                    <Link to="/"><span className="gradient-text">The Republic/Storia</span></Link>
                    <Sparkles size={35} color="#EC4899" />
                </div>
                <Link to="/educators" className="addPerson">
                    <Users className="users" size={25} color="#ffffffff" />
                </Link>
            </h1>

            {view === "default" ? (
                <DefaultView onSelect={setView} schools={schools} loading={loading} />
            ) : (
                <DetailView
                    view={view}
                    onBack={() => setView("default")}
                    schools={schools}
                    subjects={subjects}
                    people={people}
                    onRefresh={fetchData}
                />
            )}
        </div>
    )
}

function DefaultView({ onSelect, schools, loading }) {
    return (
        <div className="educationinfo">
            <div className="head">
                <h1 className="educationTitle">Education</h1>
            </div>
            <div className="container">
                <div className="row row-cols-1 row-cols-md-3 g-5">
                    {schools.map(school => (
                        <div key={school.id} className="col-md-6 col-lg-4 p-3 card-wrapper-centerleft">
                            <div className="card rotate-right">
                                <div className="card-body" onClick={() => onSelect(school.id)}>
                                    <div className="circle"><GraduationCap className="sparkle" /></div>
                                    <h5 className="card-title">{school.name}</h5>
                                    <div className="divider">
                                        <div className="dash"></div>
                                        <div className="diamond">✦</div>
                                        <div className="dash"></div>
                                    </div>
                                    <p className="card-text text-white-50 small mt-2">{school.city}, {school.region}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {schools.length === 0 && !loading && (
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

export function DetailView({ view, onBack, schools, subjects, people, onRefresh }) {
    const [activeTab, setActiveTab] = useState("overview");
    const school = useMemo(() => schools.find(s => String(s.id) === String(view)), [schools, view]);

    // People assigned to THIS school
    const schoolMembers = useMemo(() => {
        if (!school) return [];
        return people.filter(p => p.schools?.some(s => Number(s.id) === Number(school.id)));
    }, [people, school]);

    // Subjects taught at THIS school (implied by assignments)
    const schoolSubjects = useMemo(() => {
        const subIds = new Set();
        schoolMembers.forEach(p => {
            const sch = p.schools.find(s => Number(s.id) === Number(school.id));
            sch.subjects?.forEach(sub => subIds.add(String(sub.id)));
        });
        return subjects.filter(s => subIds.has(String(s.id)));
    }, [schoolMembers, subjects, school]);

    const staffMembers = schoolMembers; // Everyone in educator_schools is staff-like in this schema

    if (!school) return <div className="p-10 text-white">School not found</div>;

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
                            <h1 className="h4 fw-bold text-white mb-0">{school.name}</h1>
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
                    <div
                        className={`edu-tab ${activeTab === "schedule" ? "active" : ""}`}
                        onClick={() => setActiveTab("schedule")}
                    >
                        Schedule
                    </div>
                    {schoolSubjects.map(subject => (
                        <div
                            key={subject.id}
                            className={`edu-tab ${String(activeTab) === String(subject.id) ? "active" : ""}`}
                            onClick={() => setActiveTab(subject.id)}
                        >
                            {subject.name}
                        </div>
                    ))}
                </div>

                {activeTab === "overview" ? (
                    <div className="academy-overview-grid">
                        <div className="edu-card detail">
                            <div className="edu-header">
                                <School size={24} className="edu-icon" />
                                <h2>School Faculty</h2>
                            </div>
                            <div className="edu-content">
                                <div className="staff-list">
                                    {staffMembers.length > 0 ? staffMembers.map(member => {
                                        const schInfo = member.schools.find(s => String(s.id) === String(school.id));
                                        return (
                                            <div key={member.id} className="staff-member">
                                                <span className="member-name">{member.name}</span>
                                                <span className="member-role">{schInfo.position || "Educator"}</span>
                                            </div>
                                        );
                                    }) : <p className="empty">No faculty listed</p>}
                                </div>
                            </div>
                        </div>

                        <div className="edu-card detail">
                            <div className="edu-header">
                                <Users size={24} className="edu-icon" />
                                <h2>Info & Ownership</h2>
                            </div>
                            <div className="edu-content">

                                <div className="board-info mt-4">
                                    <h3 className="small-label">School Board</h3>
                                    <div className="staff-list">
                                        {people.filter(p =>
                                            p.board_memberships?.some(bm => Number(bm.school_id) === Number(school.id))
                                        ).map(member => {
                                            const mb = member.board_memberships.find(bm => Number(bm.school_id) === Number(school.id));
                                            return (
                                                <div key={member.id} className="staff-member">
                                                    <span className="member-name">
                                                        {member.name}
                                                        {mb.is_chairperson && <span className="chair-badge ms-2">Chair</span>}
                                                    </span>
                                                    <span className="member-role text-orange">{mb.ownership_percentage}% Ownership</span>
                                                </div>
                                            );
                                        })}
                                        {people.filter(p => p.board_memberships?.some(bm => String(bm.school_id) === String(school.id))).length === 0 && (
                                            <p className="empty">No board members listed</p>
                                        )}
                                    </div>
                                </div>

                                <h3 className="small-label mt-4">Key Statistics</h3>
                                <div className="stats mt-2">
                                    <p className="small text-muted">Total Faculty: {staffMembers.length}</p>
                                    <p className="small text-muted">Subjects Taught: {schoolSubjects.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === "schedule" ? (
                    <ScheduleTable school={school} staff={staffMembers} subjects={subjects} onRefresh={onRefresh} />
                ) : (
                    <div className="major-detail-view">
                        <div className="edu-card detail">
                            <div className="edu-header">
                                <BookOpen size={24} className="edu-icon" />
                                <h2>{subjects.find(s => String(s.id) === String(activeTab))?.name} Teachers</h2>
                            </div>
                            <div className="edu-content">
                                <div className="staff-list">
                                    {schoolMembers.filter(p => {
                                        const sch = p.schools.find(s => String(s.id) === String(school.id));
                                        return sch.subjects?.some(sub => String(sub.id) === String(activeTab));
                                    }).map(teacher => (
                                        <div key={teacher.id} className="staff-member">
                                            <span className="member-name">{teacher.name}</span>
                                            <span className="member-role">{teacher.schools.find(s => String(s.id) === String(school.id)).position || "Teacher"}</span>
                                        </div>
                                    ))}
                                    {schoolMembers.filter(p => {
                                        const sch = p.schools.find(s => String(s.id) === String(school.id));
                                        return sch.subjects?.some(sub => String(sub.id) === String(activeTab));
                                    }).length === 0 && <p className="empty">No teachers for this subject</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ScheduleTable({ school, staff, subjects, onRefresh }) {
    const [dayType, setDayType] = useState("regular");
    const [localStaff, setLocalStaff] = useState(staff);
    const [isEditing, setIsEditing] = useState(false);
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];

    useEffect(() => {
        setLocalStaff(staff);
    }, [staff]);

    const handlePeriodChange = (teacher, period, subjectId) => {
        const schInfo = teacher.schools.find(s => Number(s.id) === Number(school.id));
        const currentSchedules = schInfo.schedules || [];

        let newSchedules;
        if (!subjectId) {
            newSchedules = currentSchedules.filter(s => !(String(s.period) === String(period) && s.day_type === dayType));
        } else {
            const exists = currentSchedules.find(s => String(s.period) === String(period) && s.day_type === dayType);
            if (exists) {
                newSchedules = currentSchedules.map(s =>
                    (String(s.period) === String(period) && s.day_type === dayType) ? { ...s, subject_id: String(subjectId) } : s
                );
            } else {
                newSchedules = [...currentSchedules, { period: parseInt(period), subject_id: String(subjectId), day_type: dayType }];
            }
        }

        const updatedStaff = localStaff.map(p => {
            if (p.id === teacher.id) {
                const newSchools = p.schools.map(s =>
                    Number(s.id) === Number(school.id)
                        ? { ...s, schedules: newSchedules }
                        : s
                );
                return { ...p, schools: newSchools };
            }
            return p;
        });
        setLocalStaff(updatedStaff);
    };

    const handleSave = async () => {
        setIsEditing(false);
        let successCount = 0;
        let failCount = 0;

        // Save all changes made during editing
        for (const teacher of localStaff) {
            const payload = {
                id: teacher.id,
                name: teacher.name,
                region: teacher.Region,
                district: teacher.Location,
                party: teacher.Party,
                fid: teacher.fid,
                mid: teacher.mid,
                sid: teacher.sid,
                is_educator: true,
                is_politician: teacher.is_politician,
                is_entertainer: teacher.is_entertainer,
                role_id: teacher.role_id,
                education_assignments: (teacher.schools || []).map(s => ({
                    school_id: s.id,
                    position: s.position,
                    grade_levels: Array.isArray(s.grade_levels) ? s.grade_levels : (s.grade_levels ? s.grade_levels.split(',').map(g => g.trim()) : []),
                    subjects: (s.subjects || []).map(sub => sub?.id || sub),
                    schedules: s.schedules || []
                })),
                board_assignments: (teacher.board_memberships || []).map(bm => ({
                    school_id: bm.school_id,
                    ownership_percentage: bm.ownership_percentage,
                    is_chairperson: !!bm.is_chairperson
                }))
            };

            try {
                const res = await fetch("/.netlify/functions/people", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    successCount++;
                } else {
                    failCount++;
                    console.error(`Failed to save for ${teacher.name}`);
                }
            } catch (err) {
                failCount++;
                console.error(`Error saving for ${teacher.name}:`, err);
            }
        }

        if (failCount > 0) {
            alert(`Saved ${successCount} teachers, but ${failCount} failed.`);
        } else {
            console.log("All saves successful, triggering refresh");
            if (onRefresh) onRefresh();
            alert(`Schedules saved successfully.`);
        }
    };

    return (
        <div className="edu-card detail schedule-container">
            <div className="edu-header schedule-header">
                <div className="d-flex align-items-center gap-3">
                    <BookOpen size={24} className="edu-icon" />
                    <h2>Class Schedule</h2>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className="day-type-toggle">
                        <button
                            className={`toggle-btn ${dayType === "regular" ? "active" : ""}`}
                            onClick={() => setDayType("regular")}
                        >
                            Regular
                        </button>
                        <button
                            className={`toggle-btn ${dayType === "friday" ? "active" : ""}`}
                            onClick={() => setDayType("friday")}
                        >
                            Friday
                        </button>
                    </div>
                    {isEditing ? (
                        <button className="edit-btn save" onClick={handleSave}>Save</button>
                    ) : (
                        <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Schedule</button>
                    )}
                </div>
            </div>
            <div className="edu-content schedule-table-wrapper">
                <table className="schedule-table">
                    <thead>
                        <tr>
                            <th>Teacher</th>
                            {periods.map(p => <th key={p}>P{p}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {localStaff.map(teacher => {
                            const schInfo = teacher.schools.find(s => Number(s.id) === Number(school.id));
                            const teacherSubjects = schInfo.subjects || [];
                            return (
                                <tr key={teacher.id}>
                                    <td className="teacher-name-cell">{teacher.name}</td>
                                    {periods.map(p => {
                                        const assignment = (schInfo.schedules || []).find(s => String(s.period) === String(p) && s.day_type === dayType);

                                        return (
                                            <td key={p}>
                                                {isEditing ? (
                                                    <select
                                                        className="period-select"
                                                        value={assignment?.subject_id || ""}
                                                        onChange={(e) => handlePeriodChange(teacher, p, e.target.value)}
                                                    >
                                                        <option value="">--</option>
                                                        {teacherSubjects.map(sub => (
                                                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className={`schedule-text ${assignment ? 'active' : ''}`}>
                                                        {subjects.find(sub => String(sub.id) === String(assignment?.subject_id))?.name || "--"}
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
