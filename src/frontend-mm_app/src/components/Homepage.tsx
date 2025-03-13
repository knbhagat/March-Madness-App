import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import "./Homepage.css";

export function Homepage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check login status on mount
  useEffect(() => {
    const status = localStorage.getItem("loggedIn");
    if (status === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  // Handler for signing out
  const handleSignOut = () => {
    localStorage.removeItem("loggedIn");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div className="homepage flex flex-col min-h-screen relative">
      <div className="overlay"></div>

      {/* NAVBAR */}
      <nav className="nav-container">
        <ul className="nav-links flex gap-6">
          <li
            className="cursor-pointer font-bold transition-all text-base sm:text-lg md:text-xl lg:text-2xl hover:text-gray-400"
            onClick={() => navigate("/bracket")}>
            Brackets
          </li>
          <li
            className="cursor-pointer font-bold transition-all text-base sm:text-lg md:text-xl lg:text-2xl hover:text-gray-400"
            onClick={() => navigate("/scores")}>
            Scores
          </li>
          <li
            className="cursor-pointer font-bold transition-all text-base sm:text-lg md:text-xl lg:text-2xl hover:text-gray-400"
            onClick={() => navigate("/news")}>
            News
          </li>
        </ul>

        <div className="nav-actions ml-auto">
          {isLoggedIn ? (
            <Button className="px-4 py-2 text-base sm:text-lg md:text-xl lg:text-2xl" onClick={handleSignOut}>
              Sign Out
            </Button>
          ) : (
            <Button className="px-4 py-2 text-base sm:text-lg md:text-xl lg:text-2xl" onClick={() => navigate("/login")}>
              Sign In
            </Button>
          )}
        </div>
      </nav>

      {/* Main Content: Text & Image Side by Side */}
      <div className="absolute left-[35%] transform -translate-x-1/4 top-1/2 -translate-y-1/2 flex flex-col md:flex-row items-center">
        {/* Left Side - Text Section */}
        <div className="text-left max-w-lg">

          <p className="text-white text-lg md:text-2xl font-medium leading-snug">
            One stop for all your <br />
            March Madness needs
          </p>

          <h1 className="text-blue-500 text-4xl md:text-5xl lg:text-6xl font-bold mt-4 leading-tight">
            Brackets,<br />
            Scores, <br />
            Insights, <br />
            and More!
          </h1>


          <p className="text-gray-300 text-xl md:text-base font-medium mt-4 leading-snug">
            The best March Madness platform <br />
            with live scores, team analysis, <br />
            and comprehensive betting information.
          </p>


          {!isLoggedIn && (
            <Button
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white text-xl md:text-2xl px-8 py-4 rounded-lg"
              onClick={() => navigate("/signup")}
            >
              SIGN UP NOW
            </Button>
          )}
        </div>

        {/* Right Side - Image Section */}
        <div className="ml-10 md:ml-20">
          <img
            src="/basketball.jpg"
            alt="Basketball"
            className="w-[700px] md:w-[800px] lg:w-[1000px] h-auto"
          />
        </div>
      </div>
    </div>
  );
}
