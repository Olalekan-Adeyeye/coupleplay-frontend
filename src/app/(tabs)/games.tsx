import { HeaderButton } from "@/components/ui/header-button";
import { GAMES, GAME_IMAGES } from "@/data/games";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FILTERS = [
  { id: "all", label: "All", icon: "apps" as const },
  { id: "quick", label: "Quick", icon: "lightning-bolt" as const },
  { id: "competitive", label: "Competitive", icon: "sword-cross" as const },
  { id: "coop", label: "Co-op", icon: "account-group" as const },
  { id: "brain", label: "Brain", icon: "brain" as const },
];

export default function GamesScreen() {
  const [filter, setFilter] = useState("all");

  return (
    <View className="flex-1 bg-lavender">
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="w-full max-w-[460px] self-center gap-5 px-[22px] pt-[18px] pb-[116px]">
            {/* Header */}
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-display-bold text-[24px] leading-[40px] text-ink">
                  Games
                </Text>
                <Text className="font-ui-medium text-[14px] text-ink-secondary">
                  Pick something fun to play together
                </Text>
              </View>

              <HeaderButton
                icon="magnify"
                onPress={() => {}}
                accessibilityLabel="Search games"
              />
            </View>

            {/* Featured game */}

            {/* Filter chips */}
            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {FILTERS.map((f, i) => {
                  const active = filter === f.id;
                  return (
                    <View key={f.id}>
                      <Pressable
                        onPress={() => setFilter(f.id)}
                        className="flex-row items-center gap-1.5 rounded-full px-4 py-2.5"
                        style={{
                          backgroundColor: active ? "#8A4BE0" : "#FFFFFF",
                          shadowColor: "#4A3B6B",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: active ? 0.15 : 0.05,
                          shadowRadius: 6,
                          elevation: active ? 3 : 1,
                        }}
                      >
                        <MaterialCommunityIcons
                          name={f.icon}
                          size={14}
                          color={active ? "white" : "#7A748C"}
                        />
                        <Text
                          className="font-ui-semibold text-[13px]"
                          style={{ color: active ? "white" : "#7A748C" }}
                        >
                          {f.label}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </ScrollView>
            </View>

            {/* Game list */}
            <View className="gap-3">
              {GAMES.map((g, i) => (
                <View key={g.id}>
                  <Pressable
                    onPress={() => router.push(`/games/${g.id}`)}
                    className="overflow-hidden rounded-3xl bg-white active:opacity-85"
                    style={({ pressed }) => ({
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      shadowColor: "#4A3B6B",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.08,
                      shadowRadius: 10,
                      elevation: 2,
                    })}
                  >
                    <View className="flex-row items-center gap-4 p-4">
                      {/* Game icon */}
                      <View
                        className="h-[76px] w-[72px] items-center justify-center rounded-2xl"
                        // style={{ backgroundColor: g.accent }}
                      >
                        {GAME_IMAGES[g.icon] ? (
                          <Image
                            source={GAME_IMAGES[g.icon]}
                            style={{ width: 52, height: 52 }}
                            contentFit="contain"
                          />
                        ) : (
                          <Text className="text-[40px]">{g.emoji}</Text>
                        )}
                      </View>

                      {/* Game info */}
                      <View className="flex-1 gap-1.5">
                        <View className="flex-row items-center gap-2">
                          <Text className="font-display-bold text-[17px] text-ink">
                            {g.name}
                          </Text>
                          <View
                            className="rounded-full px-2 py-[3px]"
                            style={{
                              backgroundColor: g.tagColor + "18",
                            }}
                          >
                            <Text
                              className="font-ui-bold text-[10px]"
                              style={{ color: g.tagColor }}
                            >
                              {g.tag}
                            </Text>
                          </View>
                        </View>
                        <Text
                          numberOfLines={2}
                          className="font-ui-medium text-[12.5px] leading-[17px] text-ink-secondary"
                        >
                          {g.desc}
                        </Text>
                        <View className="mt-1 flex-row gap-3">
                          <View className="flex-row items-center gap-1">
                            <MaterialCommunityIcons
                              name="account-group"
                              size={12}
                              color="#B0A9C2"
                            />
                            <Text className="font-ui-medium text-[11px] text-ink-tertiary">
                              {g.players}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-1">
                            <MaterialCommunityIcons
                              name="clock-outline"
                              size={12}
                              color="#B0A9C2"
                            />
                            <Text className="font-ui-medium text-[11px] text-ink-tertiary">
                              {g.duration}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Chevron */}
                      <View className="h-8 w-8 items-center justify-center rounded-full bg-lavender">
                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={18}
                          color="#B0A9C2"
                        />
                      </View>
                    </View>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
