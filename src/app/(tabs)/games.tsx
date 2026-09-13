import { PageHeader, TabScreen } from "@/components/tab-screen";
import { HeaderButton } from "@/components/ui/header-button";
import { GAMES, GAME_IMAGES } from "@/data/games";
import { isGameImplemented } from "@/features/games/registry";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const FILTERS = [
  { id: "all", label: "All", icon: "apps" as const },
  { id: "quick", label: "Quick", icon: "lightning-bolt" as const },
  { id: "competitive", label: "Versus", icon: "sword-cross" as const },
  { id: "coop", label: "Co-op", icon: "account-group" as const },
  { id: "brain", label: "Brain", icon: "brain" as const },
];

export default function GamesScreen() {
  const [filter, setFilter] = useState("all");
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");

  const games = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GAMES.filter((g) => {
      if (filter !== "all" && !(g.modes ?? []).includes(filter)) return false;
      if (q && !`${g.name} ${g.tag} ${g.desc}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [filter, query]);

  const playable = games.filter((g) => isGameImplemented(g.id));
  const soon = games.filter((g) => !isGameImplemented(g.id));

  return (
    <TabScreen>
      <PageHeader
        title="Games"
        subtitle="Pick something fun to play together"
        right={
          <HeaderButton
            icon={searching ? "close" : "magnify"}
            onPress={() => {
              setSearching((s) => !s);
              setQuery("");
            }}
            accessibilityLabel={searching ? "Close search" : "Search games"}
          />
        }
      />

      {searching && (
        <View className="flex-row items-center gap-2 rounded-xl border border-hairline bg-surface px-4">
          <MaterialCommunityIcons name="magnify" size={18} color="#A79DBE" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search games or vibes…"
            placeholderTextColor="#A79DBE"
            autoFocus
            className="flex-1 py-3 font-ui text-[15px] text-ink"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color="#A79DBE"
              />
            </Pressable>
          )}
        </View>
      )}

      <View>
        <View className="flex-row gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setFilter(f.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                className="flex-row items-center gap-1.5 rounded-full px-4 py-2.5 active:opacity-80"
                style={{
                  backgroundColor: active ? "#946BFF" : "#1B1826",
                  borderWidth: 1,
                  borderColor: active ? "#946BFF" : "#2B2539",
                }}
              >
                <MaterialCommunityIcons
                  name={f.icon}
                  size={14}
                  color={active ? "#FFFFFF" : "#B3A8C9"}
                />
                <Text
                  className="font-ui-semibold text-[13px]"
                  style={{ color: active ? "#FFFFFF" : "#B3A8C9" }}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {games.length === 0 && (
        <View className="items-center rounded-2xl border border-hairline bg-surface px-6 py-10">
          <MaterialCommunityIcons
            name="gamepad-variant-outline"
            size={36}
            color="#A79DBE"
          />
          <Text className="mt-3 font-display-bold text-[16px] text-ink">
            Nothing matches
          </Text>
          <Text className="mt-1 font-ui-medium text-[13px] text-ink-secondary">
            Try a different search or filter.
          </Text>
        </View>
      )}

      {playable.length > 0 && (
        <View className="gap-2.5">
          {playable.map((g) => (
            <GameRow key={g.id} gameId={g.id} />
          ))}
        </View>
      )}

      {soon.length > 0 && (
        <View className="gap-2.5">
          <Text className="font-ui-bold text-[11px] tracking-[1.5px] text-ink-tertiary">
            COMING SOON
          </Text>
          {soon.map((g) => (
            <GameRow key={g.id} gameId={g.id} />
          ))}
        </View>
      )}
    </TabScreen>
  );
}

function GameRow({ gameId }: { gameId: string }) {
  const g = GAMES.find((x) => x.id === gameId)!;
  const implemented = isGameImplemented(g.id);
  const art = GAME_IMAGES[g.icon];

  return (
    <Pressable
      onPress={() =>
        implemented
          ? router.push(`/games/${g.id}`)
          : router.push(`/games/soon?gameType=${g.id}` as any)
      }
      accessibilityLabel={`${g.name}${implemented ? "" : ", coming soon"}`}
      className="rounded-2xl border border-hairline bg-surface active:opacity-85"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View className="flex-row items-center gap-4 p-4">
        <View
          className="h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-xl"
          style={{ backgroundColor: g.accent }}
        >
          {art ? (
            <Image
              source={art}
              style={{ width: 52, height: 52 }}
              contentFit="contain"
            />
          ) : (
            <MaterialCommunityIcons
              name={(g.iconName ?? "gamepad-variant") as any}
              size={30}
              color={g.tagColor}
            />
          )}
        </View>

        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-display-bold text-[16px] text-ink">
              {g.name}
            </Text>
            {implemented ? (
              <View
                className="rounded-full px-2 py-[3px]"
                style={{ backgroundColor: g.tagColor + "18" }}
              >
                <Text
                  className="font-ui-bold text-[10px]"
                  style={{ color: g.tagColor }}
                >
                  {g.tag}
                </Text>
              </View>
            ) : (
              <View className="rounded-full bg-paper px-2 py-[3px]">
                <Text className="font-ui-bold text-[10px] tracking-[0.8px] text-ink-tertiary">
                  SOON
                </Text>
              </View>
            )}
          </View>
          <Text
            numberOfLines={2}
            className="font-ui-medium text-[12.5px] leading-[17px] text-ink-secondary"
          >
            {g.desc}
          </Text>
          <View className="mt-0.5 flex-row gap-3">
            <View className="flex-row items-center gap-1">
              <MaterialCommunityIcons
                name="account-group"
                size={12}
                color="#A79DBE"
              />
              <Text className="font-ui-medium text-[11px] text-ink-tertiary">
                {g.players}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <MaterialCommunityIcons
                name="clock-outline"
                size={12}
                color="#A79DBE"
              />
              <Text className="font-ui-medium text-[11px] text-ink-tertiary">
                {g.duration}
              </Text>
            </View>
          </View>
        </View>

        <View className="h-8 w-8 items-center justify-center rounded-full bg-paper">
          <MaterialCommunityIcons
            name={implemented ? "chevron-right" : "bell-outline"}
            size={17}
            color="#B3A8C9"
          />
        </View>
      </View>
    </Pressable>
  );
}
