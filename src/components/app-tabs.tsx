import { Image } from "expo-image";
import {
  TabList,
  TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_ICONS: Record<string, number> = {
  index: require("@/assets/images/tabIcons/home.png"),
  games: require("@/assets/images/tabIcons/games.png"),
  activity: require("@/assets/images/tabIcons/activity.png"),
  us: require("@/assets/images/tabIcons/us.png"),
};

const TABS: {
  name: string;
  href: string;
  label: string;
}[] = [
  { name: "index", href: "/", label: "Home" },
  { name: "games", href: "/games", label: "Games" },
  { name: "activity", href: "/activity", label: "Activity" },
  { name: "us", href: "/us", label: "Us" },
];

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: "100%" }} />
      <TabList asChild>
        <CustomTabList>
          {TABS.map((tab) => (
            <TabTrigger
              key={tab.name}
              name={tab.name}
              href={tab.href as any}
              asChild
            >
              <TabButton name={tab.name} label={tab.label} />
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({
  name,
  label,
  isFocused,
  style,
  ...props
}: TabTriggerSlotProps & {
  name: string;
  label: string;
}) {
  const activeColor = isFocused ? "#5D3BE8" : "#B0A9C2";

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      className="flex-1 active:opacity-75"
      style={(state) => [
        typeof style === "function" ? style(state) : style,
        {
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      {({ pressed }) => (
        <View
          className="items-center gap-1 px-3 py-1.5"
          style={{ opacity: pressed ? 0.75 : 1 }}
        >
          <Image
            source={TAB_ICONS[name]}
            style={{
              width: 26,
              height: 26,
            }}
            tintColor={activeColor}
            contentFit="contain"
          />
          <Text
            className={
              isFocused
                ? "font-ui-semibold text-[11px]"
                : "font-ui-medium text-[11px]"
            }
            style={{ color: activeColor }}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function CustomTabList({ style, ...props }: TabListProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      {...props}
      className="absolute bottom-0 left-0 right-0 flex-row items-center justify-between border-t border-surface-border bg-white px-6 pt-2"
      style={[style, { paddingBottom: insets.bottom }]}
    >
      {props.children}
    </View>
  );
}
