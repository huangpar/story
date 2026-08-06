const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const api = {
  getPeople: () => fetch(`${API_BASE}/api/people`).then(res => res.json()),
  getRoles: () => fetch(`${API_BASE}/api/roles`).then(res => res.json()),
  getCompanies: () => fetch(`${API_BASE}/api/companies`).then(res => res.json()),
  getShows: () => fetch(`${API_BASE}/api/shows`).then(res => res.json()),
  getSchools: () => fetch(`${API_BASE}/api/schools`).then(res => res.json()),
  getSubjects: () => fetch(`${API_BASE}/api/subjects`).then(res => res.json()),
  updatePerson: (id, data) =>
    fetch(`${API_BASE}/api/people/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
  createPerson: (data) =>
    fetch(`${API_BASE}/api/people`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
};
