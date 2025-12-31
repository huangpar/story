import React from "react";
import { useState } from "react";

function getDistrictNumber(location) {
  // "District 1" -> 1
  const match = String(location).match(/\d+/);
  return match ? Number(match[0]) : null;
}

function DistrictBox({ number, people = [] }) {
  const [selectedPerson, setSelectedPerson] = useState(null);

  return (
    <>
    <div className="districtBox">
      <div className="districtNum">{number}</div>

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

export default function CamelotLayout({ groupedPeople }) {
  const camelot = groupedPeople?.Camelot ?? {};

  // Build an array districts[1..8] where each is a list of people in that district
  const districts = Array.from({ length: 9 }, () => []);
  for (const [location, people] of Object.entries(camelot)) {
    const d = getDistrictNumber(location);
    if (d && d >= 1 && d <= 8) {
      districts[d] = people;
    }
  }

  return (
    <main className="camelotWrap">
      {/* Row 1: 5 | 6 */}
      <div className="camelotRow rowTop">
        <DistrictBox number={5} people={districts[5]} />
        <DistrictBox number={6} people={districts[6]} />
      </div>

      {/* Row 2: 3 | 8 | 4 */}
      <div className="camelotRow rowMid">
        <DistrictBox number={3} people={districts[3]} />
        <DistrictBox number={8} people={districts[8]} />
        <DistrictBox number={4} people={districts[4]} />
      </div>

      {/* Row 3: 1 | 7 | 2 */}
      <div className="camelotRow rowBot">
        <DistrictBox number={1} people={districts[1]} />
        <DistrictBox number={7} people={districts[7]} />
        <DistrictBox number={2} people={districts[2]} />
      </div>
    </main>
  );
}