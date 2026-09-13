import { useActiveRoom } from "@/hooks/useActiveRoom";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  TabList,
  TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import * as Haptics from "expo-haptics";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS: {
  name: string;
  href: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  activeIcon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  {
    name: "index",
    href: "/",
    label: "Home",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    name: "games",
    href: "/games",
    label: "Games",
    icon: "gamepad-variant-outline",
    activeIcon: "gamepad-variant",
  },
  {
    name: "activity",
    href: "/activity",
    label: "Activity",
    icon: "chart-line",
    activeIcon: "chart-line",
  },
  {
    name: "us",
    href: "/us",
    label: "Us",
    icon: "heart-outline",
    activeIcon: "heart",
  },
];

export default function AppTabs() {
  const { room } = useActiveRoom();
  const badges: Record<string, boolean> = { games: room != null };

  return (
    <Tabs>
      <TabSlot style={{ height: "100%" }} />
      <TabList asChild>
        <DockTabList>
          {TABS.map((tab) => (
            <TabTrigger
              key={tab.name}
              name={tab.name}
              href={tab.href as any}
              asChild
            >
              <DockButton
                name={tab.name}
                label={tab.label}
                icon={tab.icon}
                activeIcon={tab.activeIcon}
                badged={badges[tab.name] ?? false}
              />
            </TabTrigger>
          ))}
        </DockTabList>
      </TabList>
    </Tabs>
  );
}

function DockButton({
  label,
  icon,
  activeIcon,
  badged,
  isFocused,
  style,
  onPress,
  ...props
}: TabTriggerSlotProps & {
  name: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  activeIcon: keyof typeof MaterialCommunityIcons.glyphMap;
  badged?: boolean;
}) {
  return (
    <Pressable
      {...props}
      onPress={(e) => {
        Haptics.selectionAsync().catch(() => {});
        (onPress as any)?.(e);
      }}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      className="flex-1 active:opacity-75"
      style={(state) => [
        typeof style === "function" ? style(state) : style,
        { alignItems: "center", justifyContent: "center" },
      ]}
    >
      {({ pressed }) => (
        <View
          className="items-center gap-1 px-3 py-1.5"
          style={{ opacity: pressed ? 0.7 : 1 }}
        >
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: 52,
              height: 30,
              // backgroundColor: isFocused ? "#EFEAFF" : "transparent",x
            }}
          >
            <MaterialCommunityIcons
              name={isFocused ? activeIcon : icon}
              size={23}
              color={isFocused ? "#946BFF" : "#A79DBE"}
            />
            {badged && !isFocused && (
              <View
                className="absolute rounded-full bg-rose"
                style={{ width: 8, height: 8, top: 4, right: 12 }}
              />
            )}
          </View>
          <Text
            className={
              isFocused
                ? "font-ui-bold text-[11px]"
                : "font-ui-medium text-[11px]"
            }
            style={{ color: isFocused ? "#946BFF" : "#A79DBE" }}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function DockTabList({ style, ...props }: TabListProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 20,
        right: 20,
        bottom: insets.bottom + 10,
        alignItems: "center",
      }}
    >
      <View
        {...props}
        className="w-full max-w-[420px] flex-row items-center border border-hairline bg-surface/95 px-2 pb-1.5 pt-2"
        style={[
          style,
          {
            borderRadius: 22,
            shadowColor: "#4A3B6B",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 8,
          },
        ]}
      >
        {props.children}
      </View>
    </View>
  );
}
