import { getGame, GAME_IMAGES } from "@/data/games";
import { usePartnerName } from "@/hooks/usePartnerName";
import { useSocketStore } from "@/hooks/useSocket";
import { useGameAbandoned } from "@/hooks/useGameAbandoned";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { PeepAvatar } from "@/components/peeps/PeepAvatar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useRoomStore } from "@/stores/roomStore";
import { CARD_SHADOW, BUTTON_SHADOW } from "@/lib/shadows";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type Phase = "creating" | "waiting" | "joined" | "ready";

function PulsingHeart() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 650 }),
        withTiming(1, { duration: 650 }),
      ),
      -1,
      false,
    );
  }, [scale]);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          marginHorizontal: -10,
          marginTop: 22,
          zIndex: 10,
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: "#FF5C8A",
          borderWidth: 2,
          borderColor: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
        },
        heartStyle,
      ]}
    >
      <MaterialCommunityIcons name="heart" size={14} color="#FFFFFF" />
    </Animated.View>
  );
}

function LobbyAvatar({
  peep,
  seed,
  name,
}: {
  peep?: string | null;
  seed?: string | null;
  name?: string;
}) {
  return (
    <View className="h-[88px] w-[88px] items-center justify-center">
      <PeepAvatar peep={peep} seed={seed} name={name} size={88} ring="#FFFFFF" />
    </View>
  );
}

export default function WaitingRoomScreen() {
  const { gameType, roomId } = useLocalSearchParams<{
    gameType: string;
    roomId: string;
  }>();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const socket = useSocketStore((s) => s.socket);
  const partnerName = usePartnerName();
  const game = getGame(gameType);

  const [phase, setPhase] = useState<Phase>("creating");
  const [iAmReady, setIAmReady] = useState(false);
  const [partnerReady, setPartnerReady] = useState(false);
  const startedRef = useRef(false);
  const leftRef = useRef(false);
  const navigation = useNavigation();

  const myFirstName = user?.name?.split(" ")[0] ?? "You";

  // Join the room, then move from "creating" into "waiting".
  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit("room:join", { roomId });
    const t = setTimeout(() => {
      setPhase((p) => (p === "creating" ? "waiting" : p));
    }, 1600);
    return () => clearTimeout(t);
  }, [socket, roomId]);

  // Fallback: poll room state via HTTP to catch partner presence
  // if socket events were missed (e.g. partner joined via HTTP before our socket connected).
  useEffect(() => {
    if (!token || !roomId) return;
    let active = true;
    const poll = async () => {
      try {
        const room = await api.rooms.get(roomId, token);
        if (!active) return;
        const partnerInRoom = room.players?.some(
          (p: any) => p.userId !== user?.id,
        );
        if (partnerInRoom) {
          // Don't read ready from DB — only detect presence.
          // Readiness is tracked via socket player:status events.
          setPhase("joined");
        }
      } catch {}
    };
    // Small delay to let socket join happen first
    const t = setTimeout(poll, 800);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [token, roomId, user?.id]);

  // Socket events: partner presence + readiness.
  useEffect(() => {
    if (!socket) return;
    const onJoined = (d: any) => {
      if (d.userId === user?.id) return;
      setPartnerReady(false);
      setPhase("joined");
    };
    const onStatus = (d: any) => {
      if (d.userId !== user?.id && d.ready) setPartnerReady(true);
    };
    socket.on("room:player_joined", onJoined);
    socket.on("player:status", onStatus);
    return () => {
      socket.off("room:player_joined", onJoined);
      socket.off("player:status", onStatus);
    };
  }, [socket, user?.id]);

  useGameAbandoned(socket, roomId, partnerName, { clearRoom: true });

  // Server started the game -> auto-navigate both players into play.
  useEffect(() => {
    if (!socket) return;
    const onStart = (d: any) => {
      if (d.roomId !== roomId) return;
      startedRef.current = true;
      router.replace(`/games/${gameType}/play?roomId=${roomId}` as any);
    };
    socket.on("game:start", onStart);
    return () => {
      socket.off("game:start", onStart);
    };
  }, [socket, roomId, gameType]);

  const handleReady = () => {
    if (iAmReady) return;
    socket?.emit("player:ready", { roomId });
    setIAmReady(true);
  };

  const handleLeave = () => {
    Alert.alert(
      "Leave game?",
      "The game room will be closed for both of you.",
      [
        { text: "Stay", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            leftRef.current = true;
            socket?.emit("room:leave", { roomId });
            useRoomStore.getState().setRoom(null);
            router.replace("/(tabs)/games");
          },
        },
      ],
    );
  };

  // Intercept Android back button
  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove" as any, (e: any) => {
      e.preventDefault();
      if (leftRef.current) return;
      Alert.alert("Leave game?", "The game room will be closed for both of you.", [
        { text: "Stay", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            leftRef.current = true;
            socket?.emit("room:leave", { roomId });
            useRoomStore.getState().setRoom(null);
            navigation.dispatch(e.data.action);
          },
        },
      ]);
    });
    return () => unsub();
  }, [navigation, socket, roomId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!leftRef.current && roomId) {
        socket?.emit("room:leave", { roomId });
        useRoomStore.getState().setRoom(null);
      }
    };
  }, [roomId, socket]);

  const rounds = game?.rounds ?? 5;
  const duration = game?.duration ?? "~5 min";

  return (
    <View className="flex-1 bg-paper">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <View className="w-full max-w-[460px] flex-1 self-center px-[22px] pt-[14px] pb-[24px]">

          {/* ---- 1. Creating ---- */}
          {phase === "creating" && (
            <View className="flex-1 items-center justify-center gap-5 pb-10">
              <View className="relative flex-row items-center">
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={18}
                  color="#B8A8F5"
                  style={{ position: "absolute", top: -18, left: -6 }}
                />
                <LobbyAvatar peep={user?.avatar} seed={user?.id} name={myFirstName} />
                <PulsingHeart />
                <LobbyAvatar seed={partnerName} name={partnerName} />
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={14}
                  color="#F0A7C9"
                  style={{ position: "absolute", bottom: -14, right: -2 }}
                />
              </View>
              <View className="items-center">
                <Text className="font-display-bold text-[24px] text-ink">
                  Getting everything
                </Text>
                <Text className="font-display-bold text-[24px] text-primary">
                  ready...
                </Text>
                <Text className="mt-3 text-center font-ui-medium text-[14px] leading-[20px] text-ink-secondary">
                  Setting up your game room
                </Text>
              </View>
              <Pressable
                onPress={handleLeave}
                className="items-center py-1 active:opacity-70"
              >
                <Text className="font-ui-semibold text-[14px] text-red-500">
                  Leave Game
                </Text>
              </Pressable>
            </View>
          )}

          {/* ---- 2. Waiting for partner ---- */}
          {phase === "waiting" && (
            <View className="flex-1 items-center justify-center gap-5 pb-10">
              {/* Avatars row */}
              <View className="relative flex-row items-center">
                <LobbyAvatar peep={user?.avatar} seed={user?.id} name={myFirstName} />
                <PulsingHeart />
                <View>
                  <LobbyAvatar seed={partnerName} name={partnerName} />
                  <View className="absolute right-1 top-1 h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-ink-tertiary/40">
                    <Text className="text-[11px] text-white">?</Text>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={16}
                  color="#B8A8F5"
                  style={{ position: "absolute", top: -20, left: -10 }}
                />
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={12}
                  color="#F0A7C9"
                  style={{ position: "absolute", bottom: -16, right: -4 }}
                />
              </View>

              <View className="items-center gap-1.5">
                <Text className="font-display-bold text-[24px] text-ink">
                  Waiting for{" "}
                  <Text className="text-primary">{partnerName}...</Text>
                </Text>
                <Text className="text-center font-ui-medium leading-[20px] text-ink-secondary">
                  We&apos;ll start the game as soon as they join.
                </Text>
              </View>
              <View className="w-full flex-row items-center gap-3 rounded-2xl bg-surface px-4 py-3.5 border border-hairline">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
                  <MaterialCommunityIcons
                    name="wifi"
                    size={18}
                    color="#946BFF"
                  />
                </View>
                <Text className="flex-1 font-ui-medium text-[13px] leading-[18px] text-ink-secondary">
                  Make sure you both have a good connection!
                </Text>
              </View>
              <Pressable
                onPress={handleLeave}
                className="items-center py-1 active:opacity-70"
              >
                <Text className="font-ui-semibold text-[14px] text-red-500">
                  Leave Game
                </Text>
              </Pressable>
            </View>
          )}

          {/* ---- 3. Partner joined ---- */}
          {phase === "joined" && (
            <View className="flex-1 items-center justify-center gap-6 pb-10">
              <View className="relative flex-row items-center">
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={18}
                  color="#B8A8F5"
                  style={{ position: "absolute", top: -20, left: -8 }}
                />
                <LobbyAvatar peep={user?.avatar} seed={user?.id} name={myFirstName} />
                <PulsingHeart />
                <View>
                  <LobbyAvatar seed={partnerName} name={partnerName} />
                  <View className="absolute -right-0.5 -bottom-0.5 h-5 w-5 rounded-full border-2 border-white bg-success" />
                </View>
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={14}
                  color="#F0A7C9"
                  style={{ position: "absolute", bottom: -18, right: -6 }}
                />
              </View>
              <View className="items-center gap-1.5">
                <Text className="font-display-bold text-[24px] text-ink">
                  <Text className="text-primary">{partnerName}</Text> is here!
                </Text>
                <Text className="font-ui-medium text-[14px] text-ink-secondary">
                  Looks like someone&apos;s ready to play.
                </Text>
              </View>
              <Pressable
                onPress={() => setPhase("ready")}
                className="w-full flex-row items-center justify-center gap-2 rounded-full bg-primary py-4 active:opacity-85"
                style={BUTTON_SHADOW}
              >
                <Text className="font-ui-bold text-[15px] text-white">
                  Continue
                </Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={18}
                  color="#FFFFFF"
                />
              </Pressable>
              <Pressable
                onPress={handleLeave}
                className="items-center py-1 active:opacity-70"
              >
                <Text className="font-ui-semibold text-[14px] text-red-500">
                  Leave Game
                </Text>
              </Pressable>
            </View>
          )}

          {/* ---- 4. Ready screen ---- */}
          {phase === "ready" && (
            <View className="flex-1 gap-5 pt-2">
              {/* Game header */}
              <View className="items-center gap-2">
                {game?.heroImage && GAME_IMAGES[game.heroImage] ? (
                  <Image
                    source={GAME_IMAGES[game.heroImage]}
                    style={{ width: 72, height: 72 }}
                    contentFit="contain"
                  />
                ) : (
                  <View className="h-[72px] w-[72px] items-center justify-center rounded-2xl bg-surface">
                    <MaterialCommunityIcons
                      name="gamepad-variant"
                      size={34}
                      color="#946BFF"
                    />
                  </View>
                )}
                <Text className="font-display-bold text-[24px] text-ink">
                  {game?.name ?? "Game"}
                </Text>
                <View className="flex-row gap-2.5">
                  <View className="rounded-full bg-surface px-3.5 py-1.5 border border-hairline">
                    <Text className="font-ui-semibold text-[12px] text-ink">
                      {rounds} Rounds
                    </Text>
                  </View>
                  <View className="rounded-full bg-surface px-3.5 py-1.5 border border-hairline">
                    <Text className="font-ui-semibold text-[12px] text-ink">
                      {duration}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Player cards */}
              <View className="flex-row items-center justify-center gap-3">
                <View className="flex-1 items-center gap-2 rounded-3xl bg-surface px-3 py-5 border border-hairline">
                  <Text
                    className="font-display-bold text-[14px] text-ink"
                    numberOfLines={1}
                  >
                    {myFirstName}
                  </Text>
                  <LobbyAvatar peep={user?.avatar} seed={user?.id} name={myFirstName} />
                  <View
                    className="flex-row items-center gap-1.5 rounded-full px-3 py-1"
                    style={{
                      backgroundColor: iAmReady ? "#22C55E26" : "#252132",
                    }}
                  >
                    {iAmReady && (
                      <MaterialCommunityIcons
                        name="check"
                        size={13}
                        color="#22C55E"
                      />
                    )}
                    <Text
                      className="font-ui-bold text-[12px]"
                      style={{ color: iAmReady ? "#22C55E" : "#B3A8C9" }}
                    >
                      {iAmReady ? "Ready" : "Not ready"}
                    </Text>
                  </View>
                </View>

                <PulsingHeart />

                <View className="flex-1 items-center gap-2 rounded-3xl bg-surface px-3 py-5 border border-hairline">
                  <Text
                    className="font-display-bold text-[14px] text-ink"
                    numberOfLines={1}
                  >
                    {partnerName}
                  </Text>
                  <View>
                    <LobbyAvatar seed={partnerName} name={partnerName} />
                    <View className="absolute -right-0.5 -bottom-0.5 h-5 w-5 rounded-full border-2 border-white bg-success" />
                  </View>

                  <View
                    className="flex-row items-center gap-1.5 rounded-full px-3 py-1"
                    style={{
                      backgroundColor: partnerReady ? "#22C55E26" : "#252132",
                    }}
                  >
                    {partnerReady && (
                      <MaterialCommunityIcons
                        name="check"
                        size={13}
                        color="#22C55E"
                      />
                    )}
                    <Text
                      className="font-ui-bold text-[12px]"
                      style={{ color: partnerReady ? "#22C55E" : "#B3A8C9" }}
                    >
                      {partnerReady ? "Ready" : "Not ready"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View className="mt-auto gap-4 pb-4">
                {/* Instructions */}
                <View className="items-center gap-1">
                  <View className="flex-row items-center gap-1.5">
                    <MaterialCommunityIcons
                      name="trophy-outline"
                      size={16}
                      color="#F59E0B"
                    />
                    <Text className="font-display-bold text-[14px] text-ink">
                      {game?.objective ?? "First to 10 points wins!"}
                    </Text>
                  </View>
                  <Text className="font-ui-medium text-[13px] text-ink-secondary">
                    Both players need to be ready to start the game.
                  </Text>
                </View>
                <Pressable
                  onPress={handleReady}
                  disabled={iAmReady}
                  className="flex-row items-center justify-center gap-2 rounded-full bg-primary py-4 active:opacity-85"
                  style={[BUTTON_SHADOW, { opacity: iAmReady ? 0.6 : 1 }]}
                >
                  <MaterialCommunityIcons
                    name={iAmReady ? "heart-outline" : "heart"}
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text className="font-ui-bold text-[15px] text-white">
                    {iAmReady
                      ? `Waiting for ${partnerName}...`
                      : "I'm Ready!"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleLeave}
                  className="items-center py-1 active:opacity-70"
                >
                  <Text className="font-ui-semibold text-[14px] text-red-500">
                    Leave Game
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
