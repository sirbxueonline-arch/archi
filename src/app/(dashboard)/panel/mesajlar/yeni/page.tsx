"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { getOrCreateConversation } from "@/server/actions/messages";
import { Building2 } from "lucide-react";

function NewConversationInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toUserId = searchParams.get("to");

  useEffect(() => {
    if (!toUserId) {
      router.replace("/panel/mesajlar");
      return;
    }

    const start = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/giris");
        return;
      }

      const result = await getOrCreateConversation(session.user.id, toUserId);
      if ("conversationId" in result) {
        router.replace(`/panel/mesajlar/${result.conversationId}`);
      } else {
        router.replace("/panel/mesajlar");
      }
    };

    start();
  }, [toUserId, router]);

  return (
    <div className="flex items-center justify-center h-64">
      <Building2 className="w-8 h-8 text-primary animate-pulse" />
    </div>
  );
}

export default function NewConversationPage() {
  return <Suspense fallback={<div className="flex items-center justify-center h-64"><Building2 className="w-8 h-8 text-primary animate-pulse" /></div>}><NewConversationInner /></Suspense>;
}
