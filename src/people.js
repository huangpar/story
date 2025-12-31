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

    function group(data) {
        const grouped = {};

        for (const [name, info] of Object.entries(data)) {
            const { Region, Location, Party } = info;

            // Create region if it doesn't exist
            if (!grouped[Region]) grouped[Region] = {};

            // Create location inside region if it doesn't exist
            if (!grouped[Region][Location]) grouped[Region][Location] = [];

            // Add person
            grouped[Region][Location].push({ name, Party });
        }
        return grouped;
    }

    const [groupedPeople, setGroupedPeople] = useState({});
    const [view, setView] = useState("default");

    useEffect(() => {
        console.log("useEffect fired, view =", view);

        if (view !== "republic") return;

        fetch("/people.json")
            .then(res => {
                console.log("fetch response:", res);
                return res.json();
            })
            .then(data => {
                console.log("data loaded:", data);
                setGroupedPeople(group(data));
            })
            .catch(err => console.error("fetch error:", err));
    }, [view]);

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