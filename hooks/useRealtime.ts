"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function useRealtime(channelName: string) {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    const channel = supabase.channel(channelName);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName]);
}
