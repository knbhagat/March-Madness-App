import { Link } from "react-router-dom";


export default function Navbar() {

  return (
    <div className="flex w-full py-4 px-5 items-center"> 
        <div className="bg-blue-600 ml-8 w-16 h-16 rounded-full"/> 
        <div className="ml-auto flex gap-20 mr-1 p-2 font-medium items-center"> 
            <Link to="/"> Home </Link>
            <Link to="/bracket"> My Bracket </Link>
            <Link to="/scores"> Scores </Link>
            <Link to="/news"> News </Link>
            <Link to="/signup" className="border rounded-md px-7 py-2 font-bold hover:border-blue-700"> SIGN UP  </Link>
        </div> 
    </div>
  );
}
