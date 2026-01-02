import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import './politics.css';
import { Sparkles } from 'lucide-react';
import { Users } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';

export function Politics() {
    const [activeTab, setActiveTab] = useState("governors");                                                                                                                                                                                                                                                                                                                                            
    const [view, setView] = useState("default");
    return (
        <div className="politics">
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
                />                                                                                                                                                                                                                                                                                                                  
            )}   
        </div>                                                                  
    )
}

function DefaultView({ onSelect }) {
    return (
        <div className="politicsinfo">
            <div className="head">
                <h1 className="politicsTitle">Politics</h1>
            </div>
            <div className="executive">
                <div className="president"><h2>President:</h2><h2>Caitlyn Kiraman</h2></div>
                <div className="vicePresident"><h2>Vice President:</h2><h2>Fiona Lefay</h2></div>
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
                                <div className="circle"><Sparkles className="sparkle"/></div>
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
                                <div className="circle"><Sparkles className="sparkle"/></div>
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
    setActiveTab
}) {
    const VIEWS = {
    governors:<div>
                <div className="governorWrap">
                    <h1 className="governorTitle">Governors</h1>
                    <div className="governors">
                        <div className="governorRow rowTop">
                            <div className="governorBox">
                                <div className="districtName">District 1</div>
                                <h2></h2>
                            </div>
                            <div className="governorBox">
                                <div className="districtName">District 2</div>
                                <h2></h2>
                            </div>
                            <div className="governorBox">
                                <div className="districtName">District 3</div>
                                <h2></h2>
                            </div>
                        </div>
                        <div className="governorRow rowTop">
                            <div className="governorBox">
                                <div className="districtName">District 4</div>
                                <h2></h2>
                            </div>
                            <div className="governorBox">
                                <div className="districtName">District 5</div>
                                <h2></h2>
                            </div>
                            <div className="governorBox">
                                <div className="districtName">District 6</div>
                                <h2></h2>
                            </div>
                        </div>
                        <div className="governorRow rowTop">
                            <div className="governorBox">
                                <div className="districtName">District 7</div>
                                <h2></h2>
                            </div>
                            <div className="governorBox">
                                <div className="districtName">District 8</div>
                                <h2></h2>
                            </div>
                            <div className="governorBox">
                                <div className="districtName">Downtown</div>
                                <h2></h2>
                            </div>
                        </div>
                        <div className="governorRow rowTop">
                            <div className="governorBox">
                                <div className="districtName">Hyperion Hights</div>
                                <h2></h2>
                            </div>
                            <div className="governorBox">
                                <div className="districtName">West Hyperion</div>
                                <h2></h2>
                            </div>
                            <div className="governorBox">
                                <div className="districtName">Industrial District</div>
                                <h2></h2>
                            </div>
                        </div>
                        <div className="governorRow rowBot">
                            <div></div>
                            <div className="governorBox">
                                <div className="districtName">Capitol</div>
                                <h2></h2>
                            </div>
                        </div>
                    </div>
                </div>
              </div>,
    senate: <div>
                <div className="senateWrap">
                    <h1 className="governorTitle">Senate</h1>
                    <div className="senators">
                        <div className="senatorBox seat-1" style={{position: "absolute", top: "86%", left: "7%"}}>
                            <div className="senatorName">Senator 1</div>
                            <h2></h2>
                        </div>
                        <div className="senatorBox seat-2"  style={{position: "absolute", top: "74%", left: "7.5%"}}>
                            <div className="senatorName">Senator 1</div>
                            <h2></h2>
                        </div>
                        <div className="senatorBox seat-3" style={{position: "absolute", top: "62%", left: "10%"}}>
                            <div className="senatorName">Senator 1</div>
                            <h2></h2>
                        </div>
                        <div className="senatorBox seat-4" style={{position: "absolute", top: "50%", left: "14%"}}>
                            <div className="senatorName">Senator 1</div>
                            <h2></h2>
                        </div>
                        <div className="senatorBox seat-5" style={{position: "absolute", top: "38%", left: "21%"}}>
                            <div className="senatorName">Senator 1</div>
                            <h2></h2>
                        </div>
                        <div className="senatorBox seat-6" style={{position: "absolute", top: "29%", left: "33%"}}>
                            <div className="senatorName">Senator 1</div>
                            <h2></h2>
                        </div>
                        <div className="chancellorBox" style={{position: "absolute", top: "26%", right: "50%", left : "50%", transform: "translateX(-50%)"}}>
                            <div className="senatorName">chancellor</div>
                            <h2></h2>
                        </div>
                        <div className="senatorBox seat-7" style={{position: "absolute", top: "29%", right: "33%"}}>
                            <div className="senatorName">Senator 1</div>
                            <h2></h2>
                        </div>
                        <div className="senatorBox seat-8" style={{position: "absolute", top: "38%", right: "21%"}}>
                            <div className="senatorName">Senator 1</div>
                            <h2></h2>
                        </div>
                        <div className="senatorBox seat-9" style={{position: "absolute", top: "50%", right: "14%"}}>
                            <div className="senatorName">Senator 1</div>
                            <h2></h2>
                        </div>
                        <div className="senatorBox seat-10" style={{position: "absolute", top: "62%", right: "10%"}}>
                            <div className="senatorName">Senator 1</div>
                            <h2></h2>
                        </div>
                        <div className="senatorBox seat-11" style={{position: "absolute", top: "74%", right: "7.5%"}}>
                            <div className="senatorName">Senator 1</div>
                            <h2></h2>
                        </div>
                        <div className="senatorBox seat-12" style={{position: "absolute", top: "86%", right: "7%"}}>
                            <div className="senatorName">Senator 1</div>
                            <h2></h2>
                        </div>
                    </div>
                    <div className="half-circle"></div>
                </div>
            </div>,
    highCourt: <div>
                <div className="highCourtWrap">
                    <h1 className="governorTitle">High Court</h1>
                    <div className="justices"> 
                        <div className="justiceBox" style={{position: "absolute", top: "65%", left: "25%"}}>
                            <div className="senatorName">Senator 1</div>
                        </div>
                        <div className="justiceBox" style={{position: "absolute", top: "65%", left: "50%", right: "50%", transform: "translateX(-50%)"}}>
                            <div className="senatorName">Senator 1</div>
                        </div>
                        <div className="justiceBox" style={{position: "absolute", top: "65%", right: "25%"}}>
                            <div className="senatorName">Senator 1</div>
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
                <p className="back" onClick={onBack}><ArrowLeft size={20}/> Back</p>
            </div>

            {VIEWS[view] ?? <div>Unknown view: {view}</div>}
        </div>
    )
}