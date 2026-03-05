import { Instagram, Facebook, Twitter } from "lucide-react";
import logo from "@/assets/logo.png";

const StoreHeader = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-3 md:py-4 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Tacti8AI logo" className="h-20 w-auto drop-shadow-md" />
        </div>
        <div className="flex items-center gap-4">
          <a href="https://instagram.com/YOUR_HANDLE" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors drop-shadow-sm" aria-label="Instagram">
            <Instagram size={20} />
          </a>
          <a href="https://facebook.com/YOUR_PAGE" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors drop-shadow-sm" aria-label="Facebook">
            <Facebook size={20} />
          </a>
          <a href="https://twitter.com/YOUR_HANDLE" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors drop-shadow-sm" aria-label="Twitter">
            <Twitter size={20} />
          </a>
        </div>
      </div>
    </header>
  );
};

export default StoreHeader;
