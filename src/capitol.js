import React from "react";
import { useState } from "react";

function DistrictBox({ location, people = [] }) {
  const [selectedPerson, setSelectedPerson] = useState(null);

  return (
    <>
    <div className="districtBox">
      <div className="districtName">{location}</div>

      <ul className="districtList">
        {people.map((p) => (
          <li
            key={p.name}
            className={`person ${p.Party}`}   // uses Party as class
            onClick={() => setSelectedPerson(p)}
          >
            {p.name}
          </li>
        ))}
      </ul>
    </div>

    {selectedPerson && (
        <div
          className="modalOverlay"
          onClick={() => setSelectedPerson(null)}
        >
          <div
            className="modalBox"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{selectedPerson.name}</h3>
            <p>Party: {selectedPerson.Party}</p>

            <button onClick={() => setSelectedPerson(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function CapitolLayout({ groupedPeople }) {
  const capitol = groupedPeople?.Capitol ?? {};

  const districts = Array.from({ length: 5 }, () => []);
  for (const [location, people] of Object.entries(capitol)) {
    districts[location] = people;
  }

  return (
    <main className="capitolWrap">
        <div className="capitolRow">
            <DistrictBox location={'Capitol'} people={districts['Capitol']} />
        </div>
    </main>
  );
}