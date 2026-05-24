"use client";

import { useEffect, useMemo, useState } from "react";
import type { LiveConditions } from "@/types/liveConditions";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function useLiveConditions() {
  const [conditions, setConditions] = useState<LiveConditions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientNowMs, setClientNowMs] = useState(() => Date.now());
  const [timeOffsetMs, setTimeOffsetMs] = useState(0);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setClientNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const fetchConditions = async () => {
      try {
        const response = await fetch("/api/live-conditions", {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Failed to load live conditions.");
        }

        const nextConditions = (await response.json()) as LiveConditions;

        if (isCancelled) {
          return;
        }

        setConditions(nextConditions);
        setTimeOffsetMs(nextConditions.nowEpochMs - Date.now());
        setError(null);
      } catch (fetchError) {
        if (isCancelled) {
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load live conditions."
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchConditions();
    const refresh = window.setInterval(fetchConditions, REFRESH_INTERVAL_MS);

    return () => {
      isCancelled = true;
      window.clearInterval(refresh);
    };
  }, []);

  const now = useMemo(
    () => new Date(clientNowMs + timeOffsetMs),
    [clientNowMs, timeOffsetMs]
  );

  return {
    conditions,
    now,
    isLoading,
    error
  };
}
