import './App.css';
import { Routes, Route } from "react-router-dom";
import { Home } from "./home";
import { People } from "./people";
import { Politics } from "./politics";
import { Entertainment } from "./entertainment";
import { Education } from "./education";
import { Add } from "./add";
import { Politicians } from "./politicians";
import { Entertainers } from "./entertainers";
import { Educators } from "./educators";



function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/people" element={<People />} />
      <Route path="/politics" element={<Politics />} />
      <Route path="/entertainment" element={<Entertainment />} />
      <Route path="/education" element={<Education />} />
      <Route path="/add" element={<Add />} />
      <Route path="/politicians" element={<Politicians />} />
      <Route path="/entertainers" element={<Entertainers />} />
      <Route path="/educators" element={<Educators />} />
    </Routes>
  );
}

export default App;
