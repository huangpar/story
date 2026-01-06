import React, { useState, useEffect } from "react";
import './index.css';

export default function PersonModal({ person, onClose, onSave }) {
    const [formData, setFormData] = useState({
        region: "",
        district: "",
        fid: "",
        mid: "",
        sid: "",
        is_educator: false,
        is_politician: false,
        is_entertainer: false,
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (person) {
            setFormData({
                region: person.Region || "",
                district: person.Location || "",
                fid: person.fid || "",
                mid: Array.isArray(person.mid) ? person.mid.join(", ") : (person.mid || ""),
                sid: Array.isArray(person.sid) ? person.sid.join(", ") : (person.sid || ""),
                is_educator: person.is_educator || false,
                is_politician: person.is_politician || false,
                is_entertainer: person.is_entertainer || false,
            });
        }
    }, [person]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Helper to parse comma-separated integers to array
            const parseArray = (str) => {
                if (!str) return null;
                return str.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
            };

            const payload = {
                id: person.id,
                region: formData.region,
                district: formData.district,
                fid: formData.fid ? parseInt(formData.fid) : null,
                mid: parseArray(formData.mid),
                sid: parseArray(formData.sid),
                is_educator: formData.is_educator,
                is_politician: formData.is_politician,
                is_entertainer: formData.is_entertainer,
            };

            const res = await fetch("/.netlify/functions/people", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to update");

            if (onSave) onSave(); // Callback to refresh data
            onClose();
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    if (!person) return null;

    return (
        <div className="modalOverlay" onClick={onClose}>
            <div className="modalBox" onClick={e => e.stopPropagation()}>
                <h3>Edit {person.name}</h3>

                <div className="form-group">
                    <label>Region</label>
                    <input name="region" value={formData.region} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>District</label>
                    <input name="district" value={formData.district} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>FID</label>
                    <input type="number" name="fid" value={formData.fid} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>MID (comma separated)</label>
                    <input name="mid" value={formData.mid} onChange={handleChange} placeholder="1, 2, 3" />
                </div>

                <div className="form-group">
                    <label>SID (comma separated)</label>
                    <input name="sid" value={formData.sid} onChange={handleChange} placeholder="4, 5, 6" />
                </div>

                <div className="toggles">
                    <label>
                        <input type="checkbox" name="is_educator" checked={formData.is_educator} onChange={handleChange} />
                        Educator
                    </label>
                    <label>
                        <input type="checkbox" name="is_politician" checked={formData.is_politician} onChange={handleChange} />
                        Politician
                    </label>
                    <label>
                        <input type="checkbox" name="is_entertainer" checked={formData.is_entertainer} onChange={handleChange} />
                        Entertainer
                    </label>
                </div>

                <div className="actions">
                    <button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                    <button onClick={onClose} disabled={saving}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
