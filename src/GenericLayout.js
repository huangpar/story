// import React, { useState } from "react";
// import PersonModal from "./PersonModal";

// function DistrictBox({ location, people = [], refreshData, peopleList }) {
//     const [selectedPerson, setSelectedPerson] = useState(null);

//     return (
//         <>
//             <div className="districtBox">
//                 <div className="districtName">{location}</div>

//                 <ul className="districtList">
//                     {people.map((p) => (
//                         <li
//                             key={p.id}
//                             className={`${p.Party}`}   // uses Party as class
//                             onClick={() => setSelectedPerson(p)}
//                         >
//                             {p.name}
//                         </li>
//                     ))}
//                     {people.length === 0 && <li className="empty">No residents</li>}
//                 </ul>
//             </div>

//             {selectedPerson && (
//                 <PersonModal
//                     person={selectedPerson}
//                     onClose={() => setSelectedPerson(null)}
//                     onSave={refreshData}
//                     peopleList={peopleList}
//                 />
//             )}
//         </>
//     );
// }

// export default function GenericLayout({ regionName, groupedPeople, refreshData, peopleList }) {
//     const regionData = groupedPeople?.[regionName] ?? {};
//     const locations = Object.entries(regionData);

//     return (
//         <main className="genericWrap">
//             <div className="camelotRow rowTop">
//                 {locations.length > 0 ? (
//                     locations.map(([location, people]) => (
//                         <DistrictBox
//                             key={location}
//                             location={location}
//                             people={people}
//                             refreshData={refreshData}
//                             peopleList={peopleList}
//                         />
//                     ))
//                 ) : (
//                     <div className="text-white opacity-50 text-center w-100 mt-5">
//                         No locations found for {regionName}
//                     </div>
//                 )}
//             </div>
//         </main>
//     );
// }

export default function CoruscantLayout() {
    return(
        <div>
            <div className="container">
                <div className="row row-cols-1 g-5">
                    <div className="card-wrapper-centerright">
                        <div className="home-card-wrapper category-people">
                            <div className="home-card-glow"></div>
                            <div className="home-card-inner">
                                <div className="home-card-content">
                                    <h2 className="home-card-title">House Palpatine</h2>
                                    <div className="detailBox">
                                        <p className="houseDetail">Head: Sheev Palpatine</p>
                                        <p className="houseDetail">Seat: Theed Palace</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-wrapper-centerright">
                        <div className="home-card-wrapper category-people">
                            <div className="home-card-glow"></div>
                            <div className="home-card-inner">
                                <div className="home-card-content">
                                    <h2 className="home-card-title">House Snoke</h2>
                                    <div className="detailBox">
                                        <p className="houseDetail">Head: Alistair Snoke</p>
                                        <p className="houseDetail">Seat: Corvax Fortress</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-wrapper-centerright">
                        <div className="home-card-wrapper category-people">
                            <div className="home-card-glow"></div>
                            <div className="home-card-inner">
                                <div className="home-card-content">
                                    <h2 className="home-card-title">House Talzin</h2>
                                    <div className="detailBox">
                                        <p className="houseDetail">Head: Edward Talzin</p>
                                        <p className="houseDetail">Seat: Peridia Castle</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

