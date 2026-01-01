import React from "react";
import { useState } from "react";

// function getDistrictNumber(location) {
//   // "District 1" -> 1
//   const match = String(location).match(/\d+/);
//   return match ? Number(match[0]) : null;
// }

function DistrictBox({ location, people = [] }) {
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
    districts[location] = people;
  }
  // const other = [];

  // for (const [location, people] of Object.entries(camelot)) {
  //   const d = getDistrictNumber(location);
  //   if (d && d >= 1 && d <= 8) {
  //     districts[d] = people;
  //   } else {
  //     // push everyone from non-1..8 locations into "Other"
  //     other.push(...people.map(p => ({ ...p, Location: location })));
  //   }
  // }

  return (
    <main className="camelotWrap">
      {/* Row 1: 5 | 6 */}
      <div className="camelotRow rowTop">
        <DistrictBox location={'District 5'} people={districts['District 5']} />
        <DistrictBox location={'District 6'} people={districts['District 6']} />
      </div>

      {/* Row 2: 3 | 8 | 4 */}
      <div className="camelotRow rowMid">
        <DistrictBox location={'District 3'} people={districts['District 3']} />
        <DistrictBox location={'District 8'} people={districts['District 8']} />
        <DistrictBox location={'District 4'} people={districts['District 4']} />
      </div>

      {/* Row 3: 1 | 7 | 2 */}
      <div className="camelotRow rowBot">
        <DistrictBox location={'District 1'} people={districts['District 1']} />
        <DistrictBox location={'District 7'} people={districts['District 7']} />
        <DistrictBox location={'District 2'} people={districts['District 2']} />
      </div>

      {/* {other.length > 0 && (
        <div className="camelotRow rowOther">
          <DistrictBox location={"Other"} people={other} />
        </div>
      )} */}
    </main>
  );
}