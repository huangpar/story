import React from "react";
import { useState } from "react";

// function getDistrictNumber(location) {
//   // "District 1" -> 1
//   const match = String(location).match(/\d+/);
//   return match ? Number(match[0]) : null;
// }

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

export default function CamelotLayout({ groupedPeople, refreshData, peopleList }) {
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
        <DistrictBox location={'District 5'} people={districts['District 5']} refreshData={refreshData} peopleList={peopleList} />
        <DistrictBox location={'District 6'} people={districts['District 6']} refreshData={refreshData} peopleList={peopleList} />
      </div>

      {/* Row 2: 3 | 8 | 4 */}
      <div className="camelotRow rowMid">
        <DistrictBox location={'District 3'} people={districts['District 3']} refreshData={refreshData} peopleList={peopleList} />
        <DistrictBox location={'District 8'} people={districts['District 8']} refreshData={refreshData} peopleList={peopleList} />
        <DistrictBox location={'District 4'} people={districts['District 4']} refreshData={refreshData} peopleList={peopleList} />
      </div>

      {/* Row 3: 1 | 7 | 2 */}
      <div className="camelotRow rowBot">
        <DistrictBox location={'District 1'} people={districts['District 1']} refreshData={refreshData} peopleList={peopleList} />
        <DistrictBox location={'District 7'} people={districts['District 7']} refreshData={refreshData} peopleList={peopleList} />
        <DistrictBox location={'District 2'} people={districts['District 2']} refreshData={refreshData} peopleList={peopleList} />
      </div>

      {/* {other.length > 0 && (
        <div className="camelotRow rowOther">
          <DistrictBox location={"Other"} people={other} refreshData={refreshData} peopleList={peopleList} />
        </div>
      )} */}
    </main>
  );
}