import React, { useState } from "react";
import PersonModal from "./PersonModal";

function DistrictBox({ location, people = [], refreshData, peopleList }) {
    const [selectedPerson, setSelectedPerson] = useState(null);

    return (
        <>
            <div className="districtBox">
                <div className="districtName">{location}</div>

                <ul className="districtList">
                    {people.map((p) => (
                        <li
                            key={p.id}
                            className={`${p.Party}`}   // uses Party as class
                            onClick={() => setSelectedPerson(p)}
                        >
                            {p.name}
                        </li>
                    ))}
                    {people.length === 0 && <li className="empty">No residents</li>}
                </ul>
            </div>

            {selectedPerson && (
                <PersonModal
                    person={selectedPerson}
                    onClose={() => setSelectedPerson(null)}
                    onSave={refreshData}
                    peopleList={peopleList}
                />
            )}
        </>
    );
}

export default function GenericLayout({ regionName, groupedPeople, refreshData, peopleList }) {
    const regionData = groupedPeople?.[regionName] ?? {};
    const locations = Object.entries(regionData);

    return (
        <main className="genericWrap">
            <div className="camelotRow rowTop">
                {locations.length > 0 ? (
                    locations.map(([location, people]) => (
                        <DistrictBox
                            key={location}
                            location={location}
                            people={people}
                            refreshData={refreshData}
                            peopleList={peopleList}
                        />
                    ))
                ) : (
                    <div className="text-white opacity-50 text-center w-100 mt-5">
                        No locations found for {regionName}
                    </div>
                )}
            </div>
        </main>
    );
}
