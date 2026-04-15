import { useState, useEffect } from "react";
import { Phone, MessageCircle, ArrowUp } from "lucide-react";

const FloatingButtons = () => {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handler = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-px bg-primary/20">
      <a
        href="tel:19001234"
        className="bg-primary text-black p-4 shadow-lg transition-all hover:bg-white active:scale-95"
        aria-label="Call Support"
      >
        <Phone className="h-5 w-5" />
      </a>
      <a
        href="#"
        className="bg-card text-foreground p-4 shadow-lg transition-all hover:bg-primary hover:text-black active:scale-95 border-x border-primary/10"
        aria-label="Chat Message"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="bg-background border border-primary/20 text-primary p-4 shadow-lg transition-all hover:bg-primary hover:text-black active:scale-95"
          aria-label="Scroll to Top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};


export default FloatingButtons;
