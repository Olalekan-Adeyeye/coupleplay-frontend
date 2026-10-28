import { useMemo } from "react";
import { View, Pressable, Text, Dimensions } from "react-native";
import { usePalette } from "@/hooks/usePalette";

const SCREEN_WIDTH = Dimensions.get("window").width;
const MAX_COLS = 8;
const HEX_SIZE = Math.floor((SCREEN_WIDTH - 32) / MAX_COLS);
const HEX_GAP = 3;

interface HoneycombGridProps {
  numbers: number[];
  onCellPress?: (number: number) => void;
  foundNumbers?: number[];
  targetNumbers?: number[];
  disabled?: boolean;
  showAllTargets?: boolean;
}

export function HoneycombGrid({
  numbers,
  onCellPress,
  foundNumbers = [],
  targetNumbers = [],
  disabled = false,
  showAllTargets = false,
}: HoneycombGridProps) {
  const palette = usePalette();
  const grid = useMemo(() => {
    // Alternating 8/7-wide rows give the staggered honeycomb shape.
    const rows: number[][] = [];
    let start = 0;
    while (start < numbers.length) {
      const cols = rows.length % 2 === 1 ? MAX_COLS - 1 : MAX_COLS;
      rows.push(numbers.slice(start, start + cols));
      start += cols;
    }
    return rows;
  }, [numbers]);

  const getCellState = (num: number) => {
    if (showAllTargets && targetNumbers.includes(num)) return "target";
    if (foundNumbers.includes(num)) return "found";
    return "default";
  };

  const getCellStyle = (state: string) => {
    switch (state) {
      case "target":
        return {
          bg: palette.primary,
          border: "#482AC4",
          text: "#FFFFFF",
        };
      case "found":
        return {
          bg: "#10B981",
          border: "#059669",
          text: "#FFFFFF",
        };
      default:
        return {
          bg: palette.surface,
          border: palette.hairline,
          text: palette.inkTertiary,
        };
    }
  };

  return (
    <View style={{ alignItems: "center" }}>
      {grid.map((row, rowIdx) => (
        <View
          key={rowIdx}
          style={{
            flexDirection: "row",
            marginLeft: rowIdx % 2 === 1 ? HEX_SIZE / 2 : 0,
          }}
        >
          {row.map((num) => {
            if (num == null) return <View key={num} style={{ width: HEX_SIZE, height: HEX_SIZE }} />;
            const state = getCellState(num);
            const style = getCellStyle(state);
            return (
              <Pressable
                key={num}
                onPress={() => !disabled && onCellPress?.(num)}
                disabled={disabled}
                style={{
                  width: HEX_SIZE - HEX_GAP,
                  height: HEX_SIZE - HEX_GAP,
                  margin: HEX_GAP / 2,
                  borderRadius: 100,
                  backgroundColor: style.bg,
                  borderWidth: 1.5,
                  borderColor: style.border,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: disabled && state === "default" ? 0.5 : 1,
                }}
              >
                <Text
                  style={{
                    color: style.text,
                    fontSize: 15,
                    fontWeight: "700",
                  }}
                >
                  {num}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
