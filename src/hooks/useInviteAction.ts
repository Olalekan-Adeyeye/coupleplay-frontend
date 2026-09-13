import * as Clipboard from "expo-clipboard";
import { useCallback, useState } from "react";
import { Share } from "react-native";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useCoupleStore } from "@/stores/coupleStore";
import { useSocketStore } from "@/hooks/useSocket";

/**
 * Single invite implementation shared by Home, Settings and Us.
 * Ensures a code exists, then shares/copies a real deep link.
 * No dead Share buttons, no Alert-only copy.
 */
export function useInviteAction() {
  const token = useAuthStore((s) => s.token);
  const couple = useCoupleStore((s) => s.couple);
  const generateInvite = useCoupleStore((s) => s.generateInvite);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureCode = useCallback(async (): Promise<string> => {
    const existing = couple?.inviteCode;
    if (existing) return existing;
    if (!token) throw new Error("Not signed in.");
    const cpl = await generateInvite(token);
    if (!cpl.inviteCode) throw new Error("Could not create an invite code.");
    return cpl.inviteCode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couple, token, generateInvite]);

  const inviteText = useCallback(
    (code: string) =>
      `Join me on CouplePlay — enter code ${code} or open coupleplay://join/${code}`,
    [],
  );

  const share = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const code = await ensureCode();
      await Share.share({ message: inviteText(code) });
    } catch (e: any) {
      if (e?.message) setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [ensureCode, inviteText]);

  const copy = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const code = await ensureCode();
      await Clipboard.setStringAsync(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return code;
    } catch (e: any) {
      setError(e.message ?? "Could not copy the code.");
      return null;
    } finally {
      setBusy(false);
    }
  }, [ensureCode]);

  const join = useCallback(
    async (rawCode: string) => {
      if (!token) throw new Error("Not signed in.");
      const code = rawCode.trim().toUpperCase();
      if (code.length < 4) throw new Error("That code looks too short.");
      const couple = await api.couples.joinByCode(code, token);
      // Notify partner in realtime
      const socket = useSocketStore.getState().socket;
      socket?.emit("couples:joined", { couple });
      return couple;
    },
    [token],
  );

  return {
    code: couple?.inviteCode ?? null,
    busy,
    copied,
    error,
    share,
    copy,
    join,
  };
}
