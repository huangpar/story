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

export default function StorybrookeLayout({ groupedPeople }) {
  const storybrooke = groupedPeople?.Storybrooke ?? {};

  const districts = Array.from({ length: 5 }, () => []);
  for (const [location, people] of Object.entries(storybrooke)) {
    districts[location] = people;
  }

  return (
    <main className="storybrookeWrap">
      <div className="storybrookeRow rowTop">
        <DistrictBox location={'West Hyperion'} people={districts['West Hyperion']} />
        <DistrictBox location={'Hyperion Heights'} people={districts['Hyperion Heights']} />
      </div>

      <div className="storybrookeRow rowTop">
        <DistrictBox location={'Industrial District'} people={districts['Industrial District']} />
        <DistrictBox location={'Downtown'} people={districts['Downtown']} />
      </div>
    </main>
  );
}