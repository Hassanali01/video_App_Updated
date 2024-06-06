import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Mainpage from './Pages/Mainpage';
import CallPage from './Pages/CallPage';

function App() {
  return (
//     <div >
// <Mainpage></Mainpage>
//     </div>
<BrowserRouter>
        
<Routes>
  <Route exact path="/" element={<Mainpage/>} />
  <Route path="/call/:id" element={<CallPage/>} />
</Routes>
</BrowserRouter>
  );
}

export default App;
