import { Link } from 'react-router-dom';
import { Sparkles, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import './educators.css';

function CustomDropdown({ value, options, onChange, placeholder = "-- Select School --" }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selected = options.find(o => String(o.id) === String(value));

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className="custom-dropdown" ref={dropdownRef}>
            <div className={`dropdown-header ${selected ? 'has-value' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                <span>{selected ? selected.name : placeholder}</span>
                <ChevronDown size={16} className={`arrow ${isOpen ? 'open' : ''}`} />
            </div>
            {isOpen && (
                <div className="dropdown-list">
                    <div className="dropdown-item" onClick={() => handleSelect("")}>
                        <span className="gradient-text-item">{placeholder}</span>
                    </div>
                    {options.map(opt => (
                        <div key={opt.id} className="dropdown-item" onClick={() => handleSelect(opt.id)}>
                            <span className="gradient-text-item">{opt.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export function Educators() {
    const [educators, setEducators] = useState([]);
    const [schools, setSchools] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [peopleData, schoolData, subjectData] = await Promise.all([
                    fetch("/.netlify/functions/people").then(res => res.json()),
                    fetch("/.netlify/functions/schools").then(res => res.json()),
                    fetch("/.netlify/functions/subjects").then(res => res.json())
                ]);

                const peopleArr = Array.isArray(peopleData) ? peopleData : Object.values(peopleData);
                const eds = peopleArr.filter(p => p.is_educator);

                setEducators(eds);
                setSchools(Array.isArray(schoolData) ? schoolData : []);
                setSubjects(Array.isArray(subjectData) ? subjectData : []);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleUpdate = async (person, updates) => {
        // Optimistic update
        setEducators(prev => prev.map(p =>
            p.id === person.id ? { ...p, ...updates } : p
        ));

        const updatedPerson = { ...person, ...updates };

        const payload = {
            id: updatedPerson.id,
            name: updatedPerson.name,
            region: updatedPerson.Region,
            district: updatedPerson.Location,
            party: updatedPerson.Party,
            fid: updatedPerson.fid,
            mid: updatedPerson.mid,
            sid: updatedPerson.sid,
            is_educator: true,
            is_politician: updatedPerson.is_politician,
            is_entertainer: updatedPerson.is_entertainer,
            role_id: updatedPerson.role_id,
            education_assignments: (updatedPerson.schools || []).map(s => ({
                school_id: s.id,
                position: s.position,
                grade_levels: Array.isArray(s.grade_levels) ? s.grade_levels : (s.grade_levels ? s.grade_levels.split(',').map(g => g.trim()) : []),
                subjects: (s.subjects || []).map(sub => sub.id),
                schedules: s.schedules || []
            }))
        };

        try {
            const res = await fetch("/.netlify/functions/people", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const errorData = await res.json();
                console.error("Save error:", errorData);
                alert("Failed to save changes: " + (errorData.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Connection error:", error);
            alert("Failed to connect to server.");
        }
    };

    const addSchool = (person) => {
        const currentSchools = person.schools || [];
        const available = schools.find(s => !currentSchools.some(cs => String(cs.id) === String(s.id)));
        const newSchools = [...currentSchools, {
            id: available?.id || "",
            name: available?.name || "",
            position: "",
            grade_levels: [],
            subjects: []
        }];
        handleUpdate(person, { schools: newSchools });
    };

    const removeSchool = (person, schoolId) => {
        const newSchools = (person.schools || []).filter(s => String(s.id) !== String(schoolId));
        handleUpdate(person, { schools: newSchools });
    };

    const handleSchoolChange = (person, oldSchoolId, newSchoolId) => {
        const schoolName = schools.find(s => String(s.id) === String(newSchoolId))?.name || "";
        const newSchools = (person.schools || []).map(s =>
            String(s.id) === String(oldSchoolId) ? { ...s, id: newSchoolId, name: schoolName } : s
        );
        handleUpdate(person, { schools: newSchools });
    };

    const handleFieldChange = (person, schoolId, field, value) => {
        const newSchools = (person.schools || []).map(s =>
            String(s.id) === String(schoolId) ? { ...s, [field]: value } : s
        );
        handleUpdate(person, { schools: newSchools });
    };

    const toggleSubject = (person, schoolId, subject) => {
        const newSchools = (person.schools || []).map(s => {
            if (String(s.id) === String(schoolId)) {
                const currentSubjects = s.subjects || [];
                const exists = currentSubjects.some(sub => String(sub.id) === String(subject.id));
                const newSubjects = exists
                    ? currentSubjects.filter(sub => String(sub.id) !== String(subject.id))
                    : [...currentSubjects, subject];
                return { ...s, subjects: newSubjects };
            }
            return s;
        });
        handleUpdate(person, { schools: newSchools });
    };

    if (loading) return <div className="p-10 text-white">Loading...</div>;

    return (
        <div className="educators-page">
            <h1 className="header">
                <div className="header-center">
                    <Sparkles size={35} color="#EAB308" />
                    <Link to="/"><span className="gradient-text">The Republic/Storia</span></Link>
                    <Sparkles size={35} color="#EC4899" />
                </div>
            </h1>

            <div className="educators-container">
                <div className="head">
                    <Link to="/education"><span className="educationTitle">Educators</span></Link>
                </div>

                {educators.length === 0 ? (
                    <div className="empty-state">No educators found.</div>
                ) : (
                    educators.map(p => (
                        <div key={p.id} className="educator-card">
                            <div className="ed-info">
                                <h3>{p.name}</h3>
                                <p>{p.Region} - {p.Location}</p>
                            </div>

                            <div className="ed-schools">
                                <label className="section-label">School Assignments</label>
                                {(p.schools || []).map((sch, idx) => (
                                    <div key={idx} className="school-assignment-row">
                                        <div className="school-main-inputs">
                                            <CustomDropdown
                                                value={sch.id}
                                                options={schools}
                                                onChange={(val) => handleSchoolChange(p, sch.id, val)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Position (e.g. Professor)"
                                                value={sch.position || ""}
                                                onChange={(e) => handleFieldChange(p, sch.id, 'position', e.target.value)}
                                                className="ed-input"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Grades (e.g. 1st, 2nd)"
                                                value={Array.isArray(sch.grade_levels) ? sch.grade_levels.join(', ') : (sch.grade_levels || "")}
                                                onChange={(e) => handleFieldChange(p, sch.id, 'grade_levels', e.target.value)}
                                                className="ed-input"
                                            />
                                            <button className="remove-btn" onClick={() => removeSchool(p, sch.id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="subject-selection">
                                            <label>Subjects:</label>
                                            <div className="subjects-list">
                                                {subjects.map(sub => {
                                                    const isTaught = sch.subjects?.some(s => String(s.id) === String(sub.id));
                                                    return (
                                                        <span
                                                            key={sub.id}
                                                            className={`subject-chip ${isTaught ? 'active' : ''}`}
                                                            onClick={() => toggleSubject(p, sch.id, sub)}
                                                        >
                                                            {sub.name}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button className="add-btn" onClick={() => addSchool(p)}>
                                    <Plus size={18} /> Add School
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
