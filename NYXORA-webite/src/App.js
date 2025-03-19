import './App.css';
import SleepAnalysisLogin from './pages/Login';
import SignUp from './pages/Signup';
import Home from './pages/Home';
import SleepAnalysis from './pages/Sleep';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Chatbot from './pages/Chatbot';
function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<SleepAnalysisLogin />} /> 
          <Route path="/signup" element={<SignUp />} /> 
          <Route path="/home" element={<Home />} /> 
          <Route path="/sleepanalysis" element={<SleepAnalysis />} /> 
          <Route path="/chatbot" element={<Chatbot />} /> 




       
        </Routes>
      </Router>
    </div>
  );
}

export default App;