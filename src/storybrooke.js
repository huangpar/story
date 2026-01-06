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

export default function StorybrookeLayout({ groupedPeople, refreshData, peopleList }) {
  const storybrooke = groupedPeople?.Storybrooke ?? {};

  const districts = Array.from({ length: 5 }, () => []);
  for (const [location, people] of Object.entries(storybrooke)) {
    districts[location] = people;
  }

  return (
    <main className="storybrookeWrap">
      <div className="storybrookeRow rowTop">
        <DistrictBox location={'West Hyperion'} people={districts['West Hyperion']} refreshData={refreshData} peopleList={peopleList} />
        <DistrictBox location={'Hyperion Heights'} people={districts['Hyperion Heights']} refreshData={refreshData} peopleList={peopleList} />
      </div>

      <div className="storybrookeRow rowTop">
        <DistrictBox location={'Industrial District'} people={districts['Industrial District']} refreshData={refreshData} peopleList={peopleList} />
        <DistrictBox location={'Downtown'} people={districts['Downtown']} refreshData={refreshData} peopleList={peopleList} />
      </div>
    </main>
  );
}