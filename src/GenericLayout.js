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
    const houses = [
        {
            animal: "palpatine",
            name: "House Palpatine",
            head: "Sheev Palpatine",
            seat: "Theed Palace",
            image: "/palpatine.png",
            color: "#8b8a87"
        },
        {
            animal: "snoke",
            name: "House Snoke",
            head: "Alistair Snoke",
            seat: "Corvax Fortress",
            image: "/snoke.png",
            color: "#f00b0b"
        },
        {
            animal: "talzin",
            name: "House Talzin",
            head: "Lord Edward Talzin",
            seat: "Peridia Castle",
            image: "/talzin.png",
            color: "#9d0af1" 
        }
    ];
    
    return(
        <div>
            <div className="container">
                <div className="row row-cols-2 g-5">
                    {houses.map((house, index) => (
                        <div key={index} className="card-wrapper-centerright">
                            <div className="home-card-wrapper category-people">
                                <div className="home-card-glow"></div>
                                <div className="home-card-inner">
                                    <div className="relative mb-6 flex justify-center items-center" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                                        <img src={house.image} alt={house.animal} className="home-card-image" style={{ width: '40%', height: 'auto', display: 'block', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.4))' }} />
                                    </div>
                                    <div className="home-card-content" style={{ gap: '1rem' }}>
                                        <div style={{ height: '1px', width: '100%', background: `linear-gradient(to right, transparent, ${house.color}80, transparent)` }} />
                                        <h2 className="home-card-title" style={{ margin: 0 }}>{house.name}</h2>
                                        <div className="detailBox" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', marginTop: '0.25rem' }}>
                                            <div className="row1">
                                                <p className="houseDetail" style={{ margin: '0 0 0.25rem 0', color: '#cbd5e1', fontSize: '0.9rem' }}>Head: <span style={{ color: '#f8fafc' }}>{house.head}</span></p>
                                                <p className="houseDetail" style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem' }}>Seat: <span style={{ color: '#f8fafc' }}>{house.seat}</span></p>
                                            </div>
                                            {/* <div className="row2">
                                                <p className="houseDetail" style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem' }}>Other People: <span style={{ color: '#f8fafc' }}>{house.other}</span></p>
                                            </div> */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

