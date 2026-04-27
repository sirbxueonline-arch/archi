"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingRequestModal } from "./BookingRequestModal";

interface BookingButtonProps {
  profileUserId: string;
  professionalName: string;
}

export function BookingButton({ profileUserId, professionalName }: BookingButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Calendar className="w-4 h-4" />
        Görüş Planla
      </Button>
      {open && (
        <BookingRequestModal
          profileUserId={profileUserId}
          professionalName={professionalName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
