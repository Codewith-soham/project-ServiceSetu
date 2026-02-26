import { useNavigate } from "react-router-dom";
import servicesetulogo from "../assets/servicesetulogo.png";

const LandingPage = () => {
  const navigate = useNavigate();

   return (
    <div className="bg-[#0b1b35] text-white min-h-screen flex flex-col">

      {/* HEADER SECTION */}
      <header className="bg-[#0b1b35] border-b border-blue-500/20 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-2 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center text-2xl font-bold text-blue-500">
           <img src={servicesetulogo} alt="ServiceSetu Logo" style={{ width: "80px", height: "auto" }}/>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="hover:text-blue-400 transition">Home</a>
            <a href="#" className="hover:text-blue-400 transition">Services</a>
            <a href="#" className="hover:text-blue-400 transition">About Us</a>
            <a href="#" className="hover:text-blue-400 transition">Contact</a>
          </nav>

          {/* Login/Sign Up Buttons */}
          <div className="flex items-center gap-4">
            <button className="text-gray-300 hover:text-white transition">Login</button>
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition">Sign Up</button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab')] bg-cover bg-center grow">
        <div className="bg-[#0b1b35]/80 min-h-[85vh] flex items-center">
          
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl">

              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Find Trusted Local <br /> Services Near You
              </h1>

              <p className="mt-4 text-gray-300 text-lg">
                Connect with verified service professionals in your area.
              </p>

              <div className="mt-8">
                <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition duration-300">
                  Get Started
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* FOOTER SECTION */}
      <footer className="bg-[#0b1b35] border-t border-blue-500/20 py-4">
        <div className="max-w-5xl mx-auto px-6 text-center text-gray-400">
          <p>@2026 serviceSetu.com</p>
        </div>
      </footer>
      
    </div>
  );
}

export default LandingPage