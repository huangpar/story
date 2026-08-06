import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import { api } from './api';
// forcing rebuild
import './politics.css';
import { Gavel, Star } from 'lucide-react';
import { Users } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.css';

export function Politics() {
    const [activeTab, setActiveTab] = useState("governors");
    const [view, setView] = useState("default");
    const [peopleList, setPeopleList] = useState([]);

    useEffect(() => {
        api.getPeople()
            .then(data => {
                // data is now keyed by ID and contains 'name' inside
                const arr = Object.values(data);
                setPeopleList(arr);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="politics">
            <div className="bg-layer">
                <div className="bg-wash"></div>
                <div className="orb orb-indigo"></div>
                <div className="orb orb-purple"></div>
            </div>
            <h1 className="header">
                <div className="header-center">
                    {/* <Sparkles size={35} color="#EAB308" /> */}
                    <Link to="/"><span className="gradient-text">The Republic/Storia</span></Link>
                    {/* <Sparkles size={35} color="#EC4899" /> */}
                </div>
                <Link to="/politicians" className="addPerson">
                    <Users className="users" size={25} color="#ffffffff" />
                </Link>
            </h1>
            {view === "default" ? (
                <DefaultView onSelect={setView} peopleList={peopleList} />
            ) : (
                <DetailView
                    view={view}
                    onBack={() => setView("default")}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    peopleList={peopleList}
                />
            )}
        </div>
    )
}

function DefaultView({ onSelect, peopleList = [] }) {
    const president = peopleList.find(p => (p.role_name || "").toLowerCase() === "president");
    const vicePresident = peopleList.find(p => (p.role_name || "").toLowerCase() === "vice president");

    return (
        <div className="politicsinfo">
            <div className="head">
                <h1 className="politicsTitle">Politics</h1>
            </div>
            <div className="executive">
                <div className="president"><p>President</p><h2 className={president?.Party || ""}>{president ? president.name : "Vacant"}</h2></div>
                <div className="spacer"></div>
                <div className="vicePresident"><p>Vice President</p><h2 className={vicePresident?.Party || ""}>{vicePresident ? vicePresident.name : "Vacant"}</h2></div>
            </div>
            <div className="container">
                <div className="row row-cols-1 row-cols-md-3 g-5">
                    <div className="col-md-6 col-lg-4 p-3 card-wrapper-left">
                        <div className="home-card-wrapper category-politics">
                            <div className="home-card-glow"></div>
                            <div className="home-card-inner" onClick={() => onSelect("governors")}>
                                <div className="home-card-content">
                                    <div className="home-card-icon-circle">
                                        <div className="home-card-icon-glow"></div>
                                        <Gavel className="home-card-icon" />
                                    </div>
                                    <h2 className="home-card-title">Governors</h2>
                                    <div className="home-card-divider">
                                        <div className="divider-line divider-line-left"></div>
                                        <Star className="divider-star" />
                                        <div className="divider-line divider-line-right"></div>
                                    </div>
                                    <p className="home-card-enter">Enter</p>
                                </div>
                                <div className="corner-accent corner-tr"></div>
                                <div className="corner-accent corner-bl"></div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-4 p-3 card-wrapper-left">
                        <div className="home-card-wrapper category-politics">
                            <div className="home-card-glow"></div>
                            <div className="home-card-inner" onClick={() => onSelect("senate")}>
                                <div className="home-card-content">
                                    <div className="home-card-icon-circle">
                                        <div className="home-card-icon-glow"></div>
                                        <Gavel className="home-card-icon" />
                                    </div>
                                    <h2 className="home-card-title">Senators</h2>
                                    <div className="home-card-divider">
                                        <div className="divider-line divider-line-left"></div>
                                        <Star className="divider-star" />
                                        <div className="divider-line divider-line-right"></div>
                                    </div>
                                    <p className="home-card-enter">Enter</p>
                                </div>
                                <div className="corner-accent corner-tr"></div>
                                <div className="corner-accent corner-bl"></div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-4 p-3 card-wrapper-left">
                        <div className="home-card-wrapper category-politics">
                            <div className="home-card-glow"></div>
                            <div className="home-card-inner" onClick={() => onSelect("highCourt")}>
                                <div className="home-card-content">
                                    <div className="home-card-icon-circle">
                                        <div className="home-card-icon-glow"></div>
                                        <Gavel className="home-card-icon" />
                                    </div>
                                    <h2 className="home-card-title">High Court</h2>
                                    <div className="home-card-divider">
                                        <div className="divider-line divider-line-left"></div>
                                        <Star className="divider-star" />
                                        <div className="divider-line divider-line-right"></div>
                                    </div>
                                    <p className="home-card-enter">Enter</p>
                                </div>
                                <div className="corner-accent corner-tr"></div>
                                <div className="corner-accent corner-bl"></div>
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
    peopleList = []
}) {
    // Helper to find governor for a district
    const getGovernor = (districtName) => {
        if (!districtName) return "Vacant";
        const normalizedTarget = districtName.toLowerCase().replace(/hights/g, 'heights').trim();

        const gov = peopleList.find(p => {
            if ((p.role_name || "").toLowerCase() !== 'governor') return false;
            const loc = (p.Location || p.district || "").toLowerCase().replace(/hights/g, 'heights').trim();
            return loc === normalizedTarget;
        });
        return gov ? gov.name : "Vacant";
    };

    const getGovernorParty = (districtName) => {
        if (!districtName) return "";
        const normalizedTarget = districtName.toLowerCase().replace(/hights/g, 'heights').trim();

        const gov = peopleList.find(p => {
            if ((p.role_name || "").toLowerCase() !== 'governor') return false;
            const loc = (p.Location || p.district || "").toLowerCase().replace(/hights/g, 'heights').trim();
            return loc === normalizedTarget;
        });
        return gov ? (gov.Party || "") : "";
    };

    // Helper to get person by exact role name (returns array)
    const getByRole = (roleName) => {
        if (!roleName) return [];
        const target = roleName.toLowerCase();
        return peopleList.filter(p => (p.role_name || "").toLowerCase() === target);
    };

    const senators = getByRole("Senator");
    const justices = getByRole("Justice"); // Or whatever the role name is
    const chancellor = getByRole("Chancellor")[0]; // Assuming one

    const formatSenator = (index) => senators[index] ? senators[index].name : "Vacant";
    const getSenatorParty = (index) => senators[index] ? (senators[index].Party || "") : "";
    const formatDistrict = (index) => senators[index] ? (senators[index].Location || senators[index].district || "") : "";
    const formatChancellorDistrict = () => chancellor ? (chancellor.Location || chancellor.district || "") : "";
    const formatJustice = (index) => justices[index] ? justices[index].name : "Vacant";

    const VIEWS = {
        governors: <div>
            <div className="governorWrap">
                <div class="d-flex justify-content-center mb-5">
                    <div className="position-relative">
                        <div className="glow-bg position-absolute top-0 start-0 w-100 h-100 rounded-pill"></div>
                        <div className="glow-pill position-relative px-5 py-3 rounded-pill shadow-lg">
                            <h1 className="h4 fw-bold text-white mb-0">Governors</h1>
                        </div>
                    </div>
                </div>
                <div className="governors">
                    <div className="governorRow rowTop">
                        <div className="governorBox">
                            <div className="districtName">District 1</div>
                            <div className={getGovernorParty("District 1")}>{getGovernor("District 1")}</div>
                        </div>
                        <div className="governorBox">
                            <div className="districtName">District 2</div>
                            <div className={getGovernorParty("District 2")}>{getGovernor("District 2")}</div>
                        </div>
                        <div className="governorBox">
                            <div className="districtName">District 3</div>
                            <div className={getGovernorParty("District 3")}>{getGovernor("District 3")}</div>
                        </div>
                    </div>
                    <div className="governorRow rowTop">
                        <div className="governorBox">
                            <div className="districtName">District 4</div>
                            <div className={getGovernorParty("District 4")}>{getGovernor("District 4")}</div>
                        </div>
                        <div className="governorBox">
                            <div className="districtName">District 5</div>
                            <div className={getGovernorParty("District 5")}>{getGovernor("District 5")}</div>
                        </div>
                        <div className="governorBox">
                            <div className="districtName">District 6</div>
                            <div className={getGovernorParty("District 6")}>{getGovernor("District 6")}</div>
                        </div>
                    </div>
                    <div className="governorRow rowTop">
                        <div className="governorBox">
                            <div className="districtName">District 7</div>
                            <div className={getGovernorParty("District 7")}>{getGovernor("District 7")}</div>
                        </div>
                        <div className="governorBox">
                            <div className="districtName">District 8</div>
                            <div className={getGovernorParty("District 8")}>{getGovernor("District 8")}</div>
                        </div>
                        <div className="governorBox">
                            <div className="districtName">Downtown</div>
                            <div className={getGovernorParty("Downtown")}>{getGovernor("Downtown")}</div>
                        </div>
                    </div>
                    <div className="governorRow rowTop">
                        <div className="governorBox">
                            <div className="districtName">Hyperion Heights</div>
                            <div className={getGovernorParty("Hyperion Hights")}>{getGovernor("Hyperion Heights")}</div>
                        </div>
                        <div className="governorBox">
                            <div className="districtName">West Hyperion</div>
                            <div className={getGovernorParty("West Hyperion")}>{getGovernor("West Hyperion")}</div>
                        </div>
                        <div className="governorBox">
                            <div className="districtName">Industrial District</div>
                            <div className={getGovernorParty("Industrial District")}>{getGovernor("Industrial District")}</div>
                        </div>
                    </div>
                    <div className="governorRow rowBot">
                        <div></div>
                        <div className="governorBox">
                            <div className="districtName">Capitol</div>
                            <div className={getGovernorParty("Capitol")}>{getGovernor("Capitol")}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        senate: <div>
            <div className="senateWrap">
                <div className="d-flex justify-content-center mb-1">
                    <div className="position-relative">
                        <div className="glow-bg position-absolute top-0 start-0 w-100 h-100 rounded-pill"></div>
                        <div className="glow-pill position-relative px-5 py-3 rounded-pill shadow-lg">
                            <h1 className="h4 fw-bold text-white mb-0">Senate</h1>
                        </div>
                    </div>
                </div>
                <div className="senators">
                    <div className="senatorBox seat-1" style={{ position: "absolute", top: "91.6%", left: "1.0%" }}>
                        <div className="senatorContent">
                            <div className="senatorDistrict">{formatDistrict(0)}</div>
                            <div className={`senatorName ${getSenatorParty(0)}`}>{formatSenator(0)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-2" style={{ position: "absolute", top: "75.3%", left: "3.0%" }}>
                        <div className="senatorContent">
                            <div className="senatorDistrict">{formatDistrict(1)}</div>
                            <div className={`senatorName ${getSenatorParty(1)}`}>{formatSenator(1)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-3" style={{ position: "absolute", top: "59.1%", left: "4.6%" }}>
                        <div className="senatorContent">
                            <div className="senatorDistrict">{formatDistrict(2)}</div>
                            <div className={`senatorName ${getSenatorParty(2)}`}>{formatSenator(2)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-4" style={{ position: "absolute", top: "43.1%", left: "11.3%" }}>
                        <div className="senatorContent">
                            <div className="senatorDistrict">{formatDistrict(3)}</div>
                            <div className={`senatorName ${getSenatorParty(3)}`}>{formatSenator(3)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-5" style={{ position: "absolute", top: "29.3%", left: "20.1%" }}>
                        <div className="senatorContent">
                            <div className="senatorDistrict">{formatDistrict(4)}</div>
                            <div className={`senatorName ${getSenatorParty(4)}`}>{formatSenator(4)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-6" style={{ position: "absolute", top: "16.3%", left: "33.6%" }}>
                        <div className="senatorContent">
                            <div className="senatorDistrict">{formatDistrict(5)}</div>
                            <div className={`senatorName ${getSenatorParty(5)}`}>{formatSenator(5)}</div>
                        </div>
                    </div>
                    <div className="chancellorBox" style={{ position: "absolute", top: "10.0%", left: "50%", transform: "translate(-50%, -50%)", width: "auto" }}>
                        <div className="chancellorContent">
                            <div className="senatorDistrict">{formatChancellorDistrict()}</div>
                            <div className={`senatorName ${chancellor ? (chancellor.Party || "") : ""}`} style={{ fontWeight: 'bold' }}>{chancellor ? chancellor.name : "Chancellor"}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-7" style={{ position: "absolute", top: "16.3%", left: "66.4%" }}>
                        <div className="senatorContent">
                            <div className="senatorDistrict">{formatDistrict(6)}</div>
                            <div className={`senatorName ${getSenatorParty(6)}`}>{formatSenator(6)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-8" style={{ position: "absolute", top: "29.3%", left: "79.9%" }}>
                        <div className="senatorContent">
                            <div className="senatorDistrict">{formatDistrict(7)}</div>
                            <div className={`senatorName ${getSenatorParty(7)}`}>{formatSenator(7)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-9" style={{ position: "absolute", top: "43.1%", left: "88.7%" }}>
                        <div className="senatorContent">
                            <div className="senatorDistrict">{formatDistrict(8)}</div>
                            <div className={`senatorName ${getSenatorParty(8)}`}>{formatSenator(8)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-10" style={{ position: "absolute", top: "59.1%", left: "95.4%" }}>
                        <div className="senatorContent">
                            <div className="senatorDistrict">{formatDistrict(9)}</div>
                            <div className={`senatorName ${getSenatorParty(9)}`}>{formatSenator(9)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-11" style={{ position: "absolute", top: "75.3%", left: "97.0%" }}>
                        <div className="senatorContent">
                            <div className="senatorDistrict">{formatDistrict(10)}</div>
                            <div className={`senatorName ${getSenatorParty(10)}`}>{formatSenator(10)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-12" style={{ position: "absolute", top: "91.6%", left: "99.0%" }}>
                        <div className="senatorContent">
                            <div className="senatorDistrict">{formatDistrict(11)}</div>
                            <div className={`senatorName ${getSenatorParty(11)}`}>{formatSenator(11)}</div>
                        </div>
                    </div>

                    <div className="arc-container" style={{ position: "absolute", bottom: "0", left: "0", width: "100%", height: "100%", pointerEvents: "none" }}>
                        <svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#2563EB" />
                                    <stop offset="50%" stopColor="#4338CA" />
                                    <stop offset="100%" stopColor="#6B21A8" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M 100 550 A 400 400 0 0 1 900 550"
                                fill="none"
                                stroke="url(#arcGradient)"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>,
        highCourt: <div>
            <div className="highCourtWrap">
                <div className="d-flex justify-content-center mb-5">
                    <div className="position-relative">
                        <div className="glow-bg position-absolute top-0 start-0 w-100 h-100 rounded-pill"></div>
                        <div className="glow-pill position-relative px-5 py-3 rounded-pill shadow-lg">
                            <h1 className="h4 fw-bold text-white mb-0">High Court</h1>
                        </div>
                    </div>
                </div>
                <div className="justices">
                    <div className="justiceBox">
                        <div className="justiceName">{formatJustice(0)}</div>
                    </div>
                    <div className="justiceBox">
                        <div className="justiceName">{formatJustice(1)}</div>
                    </div>
                    <div className="justiceBox">
                        <div className="justiceName">{formatJustice(2)}</div>
                    </div>
                    <div className="line"></div>
                </div>
            </div>
        </div>,
    };

    return (
        <div className="politicsinfo">
            <div className="head">
                <h1 className="politicsTitle">Politics</h1>
                <p className="back" onClick={onBack}><ArrowLeft size={20} /> Back</p>
            </div>

            {VIEWS[view] ?? <div>Unknown view: {view}</div>}
        </div>
    )
}