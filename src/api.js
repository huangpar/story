// Use Netlify functions in production, localhost in development
const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const API_BASE = isDev ? 'http://localhost:3001' : '';

export const api = {
  getPeople: () =>
    isDev
      ? fetch(`${API_BASE}/api/people`).then(res => res.json())
      : fetch('/.netlify/functions/people').then(res => res.json()),
  getRoles: () =>
    isDev
      ? fetch(`${API_BASE}/api/roles`).then(res => res.json())
      : fetch('/.netlify/functions/roles').then(res => res.json()),
  getCompanies: () =>
    isDev
      ? fetch(`${API_BASE}/api/companies`).then(res => res.json())
      : fetch('/.netlify/functions/companies').then(res => res.json()),
  getShows: () =>
    isDev
      ? fetch(`${API_BASE}/api/shows`).then(res => res.json())
      : fetch('/.netlify/functions/shows').then(res => res.json()),
  getSchools: () =>
    isDev
      ? fetch(`${API_BASE}/api/schools`).then(res => res.json())
      : fetch('/.netlify/functions/schools').then(res => res.json()),
  getSubjects: () =>
    isDev
      ? fetch(`${API_BASE}/api/subjects`).then(res => res.json())
      : fetch('/.netlify/functions/subjects').then(res => res.json()),
  updatePerson: (id, data) =>
    isDev
      ? fetch(`${API_BASE}/api/people/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then(res => res.json())
      : fetch(`/.netlify/functions/people`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then(res => res.json()),
  createPerson: (data) =>
    isDev
      ? fetch(`${API_BASE}/api/people`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then(res => res.json())
      : fetch('/.netlify/functions/people', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then(res => res.json()),
};
