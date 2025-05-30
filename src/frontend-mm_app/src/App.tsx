import { SignupForm } from './Pages/Signup-Form'; // ADDED: Import SignupForm
import { LoginForm } from './Pages/Login-Form';   // ADDED: Import LoginForm
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'; // Importing react-router
import BracketPage from "./Pages/Bracket/BracketPage";
import Navbar from './components/navbar';
import Homepage from './Pages/Homepage';
import LiveBracketPage from './Pages/Bracket/LiveBracketPage';
import Chatbot from './components/Chatbot';
import { LiveScoresPage } from './Pages/LiveScoresPage';
import AccountPage from './Pages/AccountPage';
import WelcomeMessage from './components/WelcomeMessage';
import AIPrediction from './components/AIPrediction';

// Main App component with React Router integrated
function App() {
  console.log('App component rendering'); // Debug log

  return (
    <>
      <WelcomeMessage />
      <Router>
        <div className="relative min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/bracket" element={<BracketPage />} />
            <Route path="/liveBracket" element={<LiveBracketPage />} />
            <Route path="/scores" element={<LiveScoresPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/ai-predictions" element={<AIPrediction />} />
          </Routes>
          <Chatbot />
        </div>
      </Router>
    </>
  );
}

export default App;
