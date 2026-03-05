import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "+201553745990"; // Replace with actual number

const WhatsAppButton = () => {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(142,70%,45%)] text-white shadow-lg transition-transform hover:scale-110 active:scale-95 md:bottom-6 md:right-6 md:h-14 md:w-14"
    >
      <MessageCircle size={26} />
    </a>
  );
};

export default WhatsAppButton;
