import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { peepsOfGender, type PeepGender, type PeepId } from "./peeps";

type PeepPickerProps = {
  value: PeepId | null;
  onChange: (id: PeepId) => void;
  cellSize?: number;
};

function Section({
  gender,
  value,
  onChange,
  cellSize,
}: {
  gender: PeepGender;
  value: PeepId | null;
  onChange: (id: PeepId) => void;
  cellSize: number;
}) {
  const presets = peepsOfGender(gender);
  return (
    <View>
      <Text
        style={{
          fontSize: 11,
          letterSpacing: 1.2,
          fontWeight: "700",
          color: "#B3A8C9",
          marginBottom: 10,
        }}
      >
        {gender === "male" ? "MALE · 5" : "FEMALE · 5"}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {presets.map((p) => {
          const selected = value === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => onChange(p.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${p.label} peep`}
              hitSlop={6}
              style={{
                width: cellSize,
                alignItems: "center",
                gap: 6,
              }}
            >
              <View
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: cellSize / 2,
                  backgroundColor: selected ? "#EFEAFF" : "#1B1826",
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? "#946BFF" : "#2B2539",
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                <Image
                  source={p.source}
                  style={{ width: cellSize * 1.02, height: cellSize * 1.02 }}
                  contentFit="cover"
                />
              </View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: selected ? "700" : "500",
                  color: selected ? "#946BFF" : "#B3A8C9",
                }}
              >
                {p.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Fixed 10-preset picker (5 male / 5 female). Selecting a peep implicitly
 * sets gender — no separate gender control anywhere.
 */
export function PeepPicker({ value, onChange, cellSize = 88 }: PeepPickerProps) {
  return (
    <View style={{ gap: 20 }}>
      <Section gender="male" value={value} onChange={onChange} cellSize={cellSize} />
      <Section gender="female" value={value} onChange={onChange} cellSize={cellSize} />
    </View>
  );
}
