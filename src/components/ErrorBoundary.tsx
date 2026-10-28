import React, { Component, ErrorInfo, ReactNode } from "react";
import { Appearance, Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  resetCount: number;
}

const THEMES = {
  light: {
    background: "#FAF8FD",
    title: "#221E33",
    message: "#6F6690",
    button: "#7C54E8",
  },
  dark: {
    background: "#1B1826",
    title: "#F4F1FA",
    message: "#9B8EC4",
    button: "#946BFF",
  },
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, resetCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    // Bump the key so the crashed subtree remounts from scratch — a plain
    // state reset would re-render the exact stale tree that just crashed.
    this.setState((s) => ({
      hasError: false,
      error: null,
      resetCount: s.resetCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      const theme =
        Appearance.getColorScheme() === "dark" ? THEMES.dark : THEMES.light;
      return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <Text style={styles.emoji}>💥</Text>
          <Text style={[styles.title, { color: theme.title }]}>
            Something went wrong
          </Text>
          <Text style={[styles.message, { color: theme.message }]}>
            {this.state.error?.message ?? "An unexpected error occurred."}
          </Text>
          <Pressable
            style={[styles.button, { backgroundColor: theme.button }]}
            onPress={this.handleReset}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }
    return <React.Fragment key={this.state.resetCount}>{this.props.children}</React.Fragment>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: "Urbanist_700Bold",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: "Urbanist_400Regular",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Urbanist_600SemiBold",
    color: "#fff",
  },
});
