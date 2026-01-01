import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { Sparkles } from 'lucide-react';
import { Users } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import CamelotLayout from "./camelot";
import StorybrookeLayout from "./storybrooke";
import CapitolLayout from './capitol';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';


export function People() {
    const [activeTab, setActiveTab] = useState("camelot")

    function group(input) {
        const grouped = {};

        // If the function returned { count, data }, unwrap it
        const payload = input?.data ?? input;

        // Case 1: array of DB rows
        if (Array.isArray(payload)) {
            for (const row of payload) {
            const Region = row.Region ?? row.region;
            const Location = row.Location ?? row.district ?? row.location;
            const Party = row.Party ?? row.party;
            const name = row.name;

            if (!Region || !Location || !Party || !name) continue;

            if (!grouped[Region]) grouped[Region] = {};
            if (!grouped[Region][Location]) grouped[Region][Location] = [];

            grouped[Region][Location].push({
                name,
                Party,
                id: row.id,
                fid: row.fid,
                mid: row.mid,
                sid: row.sid,
            });
            }
            return grouped;
        }

        // Case 2: object keyed by name
        for (const [name, info] of Object.entries(payload || {})) {
            const Region = info.Region ?? info.region;
            const Location = info.Location ?? info.district ?? info.location;
            const Party = info.Party ?? info.party;

            if (!Region || !Location || !Party) continue;

            if (!grouped[Region]) grouped[Region] = {};
            if (!grouped[Region][Location]) grouped[Region][Location] = [];

            grouped[Region][Location].push({
                name,
                Party,
                id: info.id,
                fid: info.fid,
                mid: info.mid,
                sid: info.sid,
            });
        }

        return grouped;
    }


    const [groupedPeople, setGroupedPeople] = useState({});
    const [view, setView] = useState("default");

    useEffect(() => {
        console.log("useEffect fired, view =", view);

        if (view !== "republic") return;

        fetch("/.netlify/functions/people?nocache=1", {
            cache: "no-store",
            headers: {"accept": "application/json"},
        })
            .then(async (res) => {
                const ct = res.headers.get("content-type") || "";
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                if (!ct.includes("application/json")) {
                    const text = await res.text();
                    throw new Error(
                        `Expected JSON but got ${ct}. First 200 chars:\n` + text.slice(0, 200)
                    );
                }

                return res.json();
            })
            .then((json) => {
                console.log("RAW function JSON:", json);
                const g = group(json);
                console.log("GROUPED REGIONS:", Object.keys(g));
                setGroupedPeople(g);
                // TEMP: inspect keys
                console.log("Top-level keys:", Object.keys(json));
                setGroupedPeople(group(json));
            })
            .then((data) => {
                const grouped = group(data);
                setGroupedPeople(grouped);

                // Count how many people exist after grouping
                const count = Object.values(grouped).reduce((sum, regionObj) => {
                    return (
                        sum +
                        Object.values(regionObj).reduce((s2, arr) => s2 + arr.length, 0)
                    );
                }, 0);

                console.log("COUNT AFTER GROUPING:", count);
                console.log("RAW COUNT (top-level keys):", Object.keys(data).length);
            })
            .catch(err => console.error("fetch error:", err));
    }, [view]);
    
    useEffect(() => {
        console.log("GROUPED:", groupedPeople);
        console.log("Regions:", Object.keys(groupedPeople));
    }, [groupedPeople]);

    return (
        <div className="people">
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
            {view === "default" ? (
                <DefaultView onSelect={setView} />
            ) : (
                <DetailView 
                    view={view} 
                    onBack={() => setView("default")} 
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    groupedPeople={groupedPeople}
                />
            )}
        </div>
    )
}

function DefaultView({ onSelect }) {
    return (
        <div className="info">
            <div className="head">
                <h1 className="peopleTitle">People</h1>
            </div>
            <div className="container">
                <div className="row row-cols-1 row-cols-md-3 g-5">
                    <div className="col-md-6 col-lg-4 p-3 card-wrapper-centerright">
                        <div className="card rotate-centerright">
                            <div className="card-body" onClick={() => onSelect("republic")}>
                                <div className="circle"><Sparkles className="sparkle" /></div>
                                <h5 className="card-title">The Republic</h5>
                                <div className="divider">
                                    <div className="dash"></div>
                                    <div className="diamond">✦</div>
                                    <div className="dash"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-4 p-3 card-wrapper-centerright">
                        <div className="card rotate-centerright">
                            <div className="card-body" onClick={() => onSelect("storia")}>
                                <div className="circle"><Sparkles className="sparkle"/></div>
                                <h5 className="card-title">Storia</h5>
                                <div className="divider">
                                    <div className="dash"></div>
                                    <div className="diamond">✦</div>
                                    <div className="dash"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-4 p-3 card-wrapper-centerright">
                        <div className="card rotate-centerright">
                            <div className="card-body" onClick={() => onSelect("familyTree")}>
                                <div className="circle"><Sparkles className="sparkle"/></div>
                                <h5 className="card-title">Family Tree</h5>
                                <div className="divider">
                                    <div className="dash"></div>
                                    <div className="diamond">✦</div>
                                    <div className="dash"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function DetailView({ 
    view, 
    onBack, 
    activeTab, 
    setActiveTab, 
    groupedPeople
}) {
    const VIEWS = {
    storia: <div></div>,
    republic: <div>
                <div className="bar">
                    <div className={`region pos-0 ${activeTab === "camelot" ? "active" : ""}`} onClick={() => setActiveTab("camelot")}>Camelot</div>
                    <div className={`region pos-1 ${activeTab === "storybrooke" ? "active" : ""}`} onClick={() => setActiveTab("storybrooke")}>Storybrooke</div>
                    <div className={`region pos-2 ${activeTab === "capitol" ? "active" : ""}`} onClick={() => setActiveTab("capitol")}>The Capitol</div>
                </div>
                <div className='map'>
                    {activeTab === "camelot" && <CamelotLayout groupedPeople={groupedPeople} />}
                    {activeTab === "storybrooke" && <StorybrookeLayout groupedPeople={groupedPeople} />}
                    {activeTab === "capitol" && <CapitolLayout groupedPeople={groupedPeople} />}
                </div>
            </div>,
    familyTree: <div></div>,
    };

    return (
        <div className="info">
            <div className="head">
                <h1 className="peopleTitle">People</h1>
                <p className="back" onClick={onBack}><ArrowLeft size={20}/> Back</p>
            </div>

            {VIEWS[view] ?? <div>Unknown view: {view}</div>}
        </div>
    )
}