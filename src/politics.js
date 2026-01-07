import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
// forcing rebuild
import './politics.css';
import { Sparkles } from 'lucide-react';
import { Users } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';

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
                <div className="president"><h2>President:</h2><h2>{president ? president.name : "Vacant"}</h2></div>
                <div className="vicePresident"><h2>Vice President:</h2><h2>{vicePresident ? vicePresident.name : "Vacant"}</h2></div>
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
                <h1 className="governorTitle">Governors</h1>
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
                <h1 className="governorTitle">Senate</h1>
                <div className="senators">
                    <div className="senatorBox seat-1" style={{ position: "absolute", top: "86%", left: "7%" }}>
                        <div className="senatorName">{formatSenator(0)}</div>
                    </div>
                    <div className="senatorBox seat-2" style={{ position: "absolute", top: "74%", left: "7.5%" }}>
                        <div className="senatorName">{formatSenator(1)}</div>
                    </div>
                    <div className="senatorBox seat-3" style={{ position: "absolute", top: "62%", left: "10%" }}>
                        <div className="senatorName">{formatSenator(2)}</div>
                    </div>
                    <div className="senatorBox seat-4" style={{ position: "absolute", top: "50%", left: "14%" }}>
                        <div className="senatorName">{formatSenator(3)}</div>
                    </div>
                    <div className="senatorBox seat-5" style={{ position: "absolute", top: "38%", left: "21%" }}>
                        <div className="senatorName">{formatSenator(4)}</div>
                    </div>
                    <div className="senatorBox seat-6" style={{ position: "absolute", top: "29%", left: "33%" }}>
                        <div className="senatorName">{formatSenator(5)}</div>
                    </div>
                    <div className="chancellorBox" style={{ position: "absolute", top: "26%", right: "50%", left: "50%", transform: "translateX(-50%)" }}>
                        <div className="senatorName">{chancellor ? chancellor.name : "Chancellor"}</div>
                    </div>
                    <div className="senatorBox seat-7" style={{ position: "absolute", top: "29%", right: "33%" }}>
                        <div className="senatorName">{formatSenator(6)}</div>
                    </div>
                    <div className="senatorBox seat-8" style={{ position: "absolute", top: "38%", right: "21%" }}>
                        <div className="senatorName">{formatSenator(7)}</div>
                    </div>
                    <div className="senatorBox seat-9" style={{ position: "absolute", top: "50%", right: "14%" }}>
                        <div className="senatorName">{formatSenator(8)}</div>
                    </div>
                    <div className="senatorBox seat-10" style={{ position: "absolute", top: "62%", right: "10%" }}>
                        <div className="senatorName">{formatSenator(9)}</div>
                    </div>
                    <div className="senatorBox seat-11" style={{ position: "absolute", top: "74%", right: "7.5%" }}>
                        <div className="senatorName">{formatSenator(10)}</div>
                    </div>
                    <div className="senatorBox seat-12" style={{ position: "absolute", top: "86%", right: "7%" }}>
                        <div className="senatorName">{formatSenator(11)}</div>
                    </div>
                </div>
                <div className="half-circle"></div>
            </div>
        </div>,
        highCourt: <div>
            <div className="highCourtWrap">
                <h1 className="governorTitle">High Court</h1>
                <div className="justices">
                    <div className="justiceBox" style={{ position: "absolute", top: "65%", left: "25%" }}>
                        <div className="senatorName">{formatJustice(0)}</div>
                    </div>
                    <div className="justiceBox" style={{ position: "absolute", top: "65%", left: "50%", right: "50%", transform: "translateX(-50%)" }}>
                        <div className="senatorName">{formatJustice(1)}</div>
                    </div>
                    <div className="justiceBox" style={{ position: "absolute", top: "65%", right: "25%" }}>
                        <div className="senatorName">{formatJustice(2)}</div>
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