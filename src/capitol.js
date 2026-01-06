import React from "react";
import { useState } from "react";

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

export default function CapitolLayout({ groupedPeople, refreshData, peopleList }) {
  const capitol = groupedPeople?.Capitol ?? {};

  const districts = Array.from({ length: 5 }, () => []);
  for (const [location, people] of Object.entries(capitol)) {
    districts[location] = people;
  }

  return (
    <main className="capitolWrap">
      <div className="capitolRow">
        <DistrictBox location={'Capitol'} people={districts['Capitol']} refreshData={refreshData} peopleList={peopleList} />
      </div>
    </main>
  );
}