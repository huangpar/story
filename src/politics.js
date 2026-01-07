import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
// forcing rebuild
import './politics.css';
import { Sparkles } from 'lucide-react';
import { Users } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.css';

export function Politics() {
    const [activeTab, setActiveTab] = useState("governors");
    const [view, setView] = useState("default");
    const [peopleList, setPeopleList] = useState([]);

    useEffect(() => {
        fetch("/.netlify/functions/people")
            .then(res => res.json())
            .then(data => {
                const arr = Object.values(data).map(p => ({ ...p, name: p.name || Object.keys(data).find(key => data[key] === p) }));
                setPeopleList(arr);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="politics">
            <h1 className="header">
                <div className="header-center">
                    <Sparkles size={35} color="#EAB308" />
                    <Link to="/"><span className="gradient-text">The Republic/Storia</span></Link>
                    <Sparkles size={35} color="#EC4899" />
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
    const president = peopleList.find(p => p.role_name === "President");
    const vicePresident = peopleList.find(p => p.role_name === "Vice President");

    return (
        <div className="politicsinfo">
            <div className="head">
                <h1 className="politicsTitle">Politics</h1>
            </div>
            <div className="executive">
                <div className="president"><p>President</p><h2>{president ? president.name : "Vacant"}</h2></div>
                <div className="spacer"></div>
                <div className="vicePresident"><p>Vice President</p><h2>{vicePresident ? vicePresident.name : "Vacant"}</h2></div>
            </div>
            <div className="container">
                <div className="row row-cols-1 row-cols-md-3 g-5">
                    <div className="col-md-6 col-lg-4 p-3 card-wrapper-left">
                        <div className="card rotate-left">
                            <div className="card-body" onClick={() => onSelect("governors")}>
                                <div className="circle"><Sparkles className="sparkle" /></div>
                                <h5 className="card-title">Governors</h5>
                                <div className="divider">
                                    <div className="dash"></div>
                                    <div className="diamond">✦</div>
                                    <div className="dash"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-4 p-3 card-wrapper-left">
                        <div className="card rotate-left">
                            <div className="card-body" onClick={() => onSelect("senate")}>
                                <div className="circle"><Sparkles className="sparkle" /></div>
                                <h5 className="card-title">Senate</h5>
                                <div className="divider">
                                    <div className="dash"></div>
                                    <div className="diamond">✦</div>
                                    <div className="dash"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-4 p-3 card-wrapper-left">
                        <div className="card rotate-left">
                            <div className="card-body" onClick={() => onSelect("highCourt")}>
                                <div className="circle"><Sparkles className="sparkle" /></div>
                                <h5 className="card-title">High Court</h5>
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
    peopleList = []
}) {
    // Helper to find governor for a district
    const getGovernor = (districtName) => {
        const gov = peopleList.find(p =>
            p.role_name === 'Governor' &&
            (p.Location === districtName || p.district === districtName)
        );
        return gov ? gov.name : "Vacant";
    };

    // Helper to get person by exact role name (returns array)
    const getByRole = (roleName) => peopleList.filter(p => p.role_name === roleName);

    const senators = getByRole("Senator");
    const justices = getByRole("Justice"); // Or whatever the role name is
    const chancellor = getByRole("Chancellor")[0]; // Assuming one

    const formatSenator = (index) => senators[index] ? senators[index].name : "Vacant";
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
                            <div className="govName">{getGovernor("District 1")}</div>
                        </div>
                        <div className="governorBox">
                            <div className="districtName">District 2</div>
                            <div className="govName">{getGovernor("District 2")}</div>
                        </div>
                        <div className="governorBox">
                            <div className="districtName">District 3</div>
                            <div className="govName">{getGovernor("District 3")}</div>
                        </div>
                    </div>
                    <div className="governorRow rowTop">
                        <div className="governorBox">
                            <div className="districtName">District 4</div>
                            <div className="govName">{getGovernor("District 4")}</div>
                        </div>
                        <div className="governorBox">
                            <div className="districtName">District 5</div>
                            <div className="govName">{getGovernor("District 5")}</div>
                        </div>
                        <div className="governorBox">
                            <div className="districtName">District 6</div>
                            <div className="govName">{getGovernor("District 6")}</div>
                        </div>
                    </div>
                    <div className="governorRow rowTop">
                        <div className="governorBox">
                            <div className="districtName">District 7</div>
                            <div className="govName">{getGovernor("District 7")}</div>
                        </div>
                        <div className="governorBox">
                            <div className="districtName">District 8</div>
                            <div className="govName">{getGovernor("District 8")}</div>
                        </div>
                        <div className="governorBox">
                            <div className="districtName">Downtown</div>
                            <div className="govName">{getGovernor("Downtown")}</div>
                        </div>
                    </div>
                    <div className="governorRow rowTop">
                        <div className="governorBox">
                            <div className="districtName">Hyperion Hights</div>
                            <div className="govName">{getGovernor("Hyperion Hights")}</div>
                        </div>
                        <div className="governorBox">
                            <div className="districtName">West Hyperion</div>
                            <div className="govName">{getGovernor("West Hyperion")}</div>
                        </div>
                        <div className="governorBox">
                            <div className="districtName">Industrial District</div>
                            <div className="govName">{getGovernor("Industrial District")}</div>
                        </div>
                    </div>
                    <div className="governorRow rowBot">
                        <div></div>
                        <div className="governorBox">
                            <div className="districtName">Capitol</div>
                            <div className="govName">{getGovernor("Capitol")}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        senate: <div>
            <div className="senateWrap">
                <div className="d-flex justify-content-center mb-5">
                    <div className="position-relative">
                        <div className="glow-bg position-absolute top-0 start-0 w-100 h-100 rounded-pill"></div>
                        <div className="glow-pill position-relative px-5 py-3 rounded-pill shadow-lg">
                            <h1 className="h4 fw-bold text-white mb-0">Senate</h1>
                        </div>
                    </div>
                </div>
                <div className="senators">
                    <div className="senatorBox seat-1" style={{ position: "absolute", top: "81%", left: "9.5%" }}>
                        <div className="senatorAura" />
                        <div className="senatorContent">
                            <div className="senatorName">{formatSenator(0)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-2" style={{ position: "absolute", top: "70%", left: "10.5%" }}>
                        <div className="senatorAura" />
                        <div className="senatorContent">
                            <div className="senatorName">{formatSenator(1)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-3" style={{ position: "absolute", top: "59%", left: "13%" }}>
                        <div className="senatorAura" />
                        <div className="senatorContent">
                            <div className="senatorName">{formatSenator(2)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-4" style={{ position: "absolute", top: "48%", left: "17%" }}>
                        <div className="senatorAura" />
                        <div className="senatorContent">
                            <div className="senatorName">{formatSenator(3)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-5" style={{ position: "absolute", top: "38%", left: "24%" }}>
                        <div className="senatorAura" />
                        <div className="senatorContent">
                            <div className="senatorName">{formatSenator(4)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-6" style={{ position: "absolute", top: "30%", left: "33%" }}>
                        <div className="senatorAura" />
                        <div className="senatorContent">
                            <div className="senatorName">{formatSenator(5)}</div>
                        </div>
                    </div>
                    <div className="chancellorBox" style={{ position: "absolute", top: "27%", right: "50%", left: "50%", transform: "translateX(-50%)" }}>
                        <div className="chancellorAura" />
                        <div className="chancellorContent">
                            <div className="senatorName">{chancellor ? chancellor.name : "Chancellor"}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-7" style={{ position: "absolute", top: "30%", right: "33%" }}>
                        <div className="senatorAura" />
                        <div className="senatorContent">
                            <div className="senatorName">{formatSenator(6)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-8" style={{ position: "absolute", top: "38%", right: "24%" }}>
                        <div className="senatorAura" />
                        <div className="senatorContent">
                            <div className="senatorName">{formatSenator(7)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-9" style={{ position: "absolute", top: "48%", right: "17%" }}>
                        <div className="senatorAura" />
                        <div className="senatorContent">
                            <div className="senatorName">{formatSenator(8)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-10" style={{ position: "absolute", top: "59%", right: "13%" }}>
                        <div className="senatorAura" />
                        <div className="senatorContent">
                            <div className="senatorName">{formatSenator(9)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-11" style={{ position: "absolute", top: "70%", right: "10.5%" }}>
                        <div className="senatorAura" />
                        <div className="senatorContent">
                            <div className="senatorName">{formatSenator(10)}</div>
                        </div>
                    </div>
                    <div className="senatorBox seat-12" style={{ position: "absolute", top: "81%", right: "9.5%" }}>
                        <div className="senatorAura" />
                        <div className="senatorContent">
                            <div className="senatorName">{formatSenator(11)}</div>
                        </div>
                    </div>
                </div>
                <div className="d-flex justify-content-center my-5">
                    <svg width="900" height="400" viewBox="0 5 220 120">
                        <defs>
                            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="50%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>

                        <path
                            d="M 0 120 A 90 90 1 1 1 220 120"
                            fill="none"
                            stroke="url(#arcGradient)"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
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