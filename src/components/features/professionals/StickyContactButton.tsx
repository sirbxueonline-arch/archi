"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StickyContactButtonProps {
  profileUserId: string;
}

export function StickyContactButton({ profileUserId }: StickyContactButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling past 400px (past the header area)
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    // Try to find the contact section or message button and scroll to it
    const contactSection = document.querySelector("[data-contact-section]");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    // Fallback: navigate to message page
    window.location.href = `/panel/mesajlar/yeni?to=${profileUserId}`;
  };

  if (!visible) return null;

  return (
    <div className="fixed right-6 bottom-8 z-40 hidden lg:block">
      <Button
        variant="gradient"
        size="lg"
        className="gap-2 shadow-xl rounded-full px-6"
        onClick={handleClick}
      >
        <MessageSquare className="w-5 h-5" />
        Əlaqə Qur
      </Button>
    </div>
  );
}
