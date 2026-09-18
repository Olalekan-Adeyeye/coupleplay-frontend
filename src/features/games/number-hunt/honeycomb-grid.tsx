import { useMemo } from "react";
import { View, Pressable, Text, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GRID_COLS = 8;
const GRID_ROWS = 13;
const HEX_SIZE = Math.floor((SCREEN_WIDTH - 32) / GRID_COLS);
const HEX_GAP = 3;

interface HoneycombGridProps {
  numbers: number[];
  onCellPress?: (number: number) => void;
  foundNumbers?: number[];
  targetNumbers?: number[];
  highlightNumber?: number | null;
  disabled?: boolean;
  showAllTargets?: boolean;
}

export function HoneycombGrid({
  numbers,
  onCellPress,
  foundNumbers = [],
  targetNumbers = [],
  highlightNumber = null,
  disabled = false,
  showAllTargets = false,
}: HoneycombGridProps) {
  const grid = useMemo(() => {
    const rows: number[][] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      const start = r * GRID_COLS;
      rows.push(numbers.slice(start, start + GRID_COLS));
    }
    return rows;
  }, [numbers]);

  const getCellState = (num: number) => {
    if (showAllTargets && targetNumbers.includes(num)) return "target";
    if (foundNumbers.includes(num)) return "found";
    if (num === highlightNumber) return "highlight";
    return "default";
  };

  const getCellStyle = (state: string) => {
    switch (state) {
      case "target":
        return {
          bg: "#8B5CF6",
          border: "#7C3AED",
          text: "#FFFFFF",
        };
      case "found":
        return {
          bg: "#10B981",
          border: "#059669",
          text: "#FFFFFF",
        };
      case "highlight":
        return {
          bg: "#F59E0B",
          border: "#D97706",
          text: "#FFFFFF",
        };
      default:
        return {
          bg: "#1E1B2E",
          border: "#2D2945",
          text: "#A79DBE",
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
