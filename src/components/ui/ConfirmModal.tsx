import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { AppModal } from "./AppModal";

export type ConfirmModalVariant = "danger" | "info" | "error";

export type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmModalVariant;
  onConfirm?: () => void;
  onCancel?: () => void;
  loading?: boolean;
};

const VARIANT_STYLES: Record<
  ConfirmModalVariant,
  { confirmBg: string; confirmText: string; icon: string }
> = {
  danger: {
    confirmBg: "#DC2626",
    confirmText: "#FFFFFF",
    icon: "alert-circle",
  },
  error: { confirmBg: "#DC2626", confirmText: "#FFFFFF", icon: "alert" },
  info: { confirmBg: "#946BFF", confirmText: "#FFFFFF", icon: "information" },
};

/**
 * A beautiful bottom-sheet confirm modal that replaces native Alert.alert.
 *
 * - Slide-up animation with spring physics
 * - Semi-transparent backdrop (press to cancel)
 * - Theme-aware via Tailwind classes (bg-surface, text-ink, etc.)
 * - Three variants: danger (red), info (purple), error (red)
 */
export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  const style = VARIANT_STYLES[variant];

  return (
    <AppModal visible={visible} onClose={onCancel} dismissible>
      <View className="px-6 py-6">
        <Text className="text-center font-display-bold text-[20px] text-ink">
          {title}
        </Text>
        <Text className="mt-2.5 text-center font-ui-medium text-[15px] leading-[22px] text-ink-secondary">
          {message}
        </Text>

        <View className="mt-7 gap-2.5">
          <Pressable
            onPress={onConfirm}
            disabled={loading}
            className="items-center justify-center rounded-2xl py-4 active:opacity-80"
            style={{
              backgroundColor: style.confirmBg,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color={style.confirmText} size="small" />
            ) : (
              <Text
                className="font-ui-bold text-[15px]"
                style={{ color: style.confirmText }}
              >
                {confirmLabel}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={onCancel}
            disabled={loading}
            className="items-center justify-center rounded-2xl border border-hairline bg-surface-soft py-4 active:opacity-80"
          >
            <Text className="font-ui-semibold text-[15px] text-ink-secondary">
              {cancelLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </AppModal>
  );
}

/**
 * Minimal info modal with a single "OK" button.
 */
export function InfoModal({
  visible,
  title,
  message,
  buttonLabel = "OK",
  onDismiss,
}: {
  visible: boolean;
  title: string;
  message: string;
  buttonLabel?: string;
  onDismiss?: () => void;
}) {
  return (
    <AppModal visible={visible} onClose={onDismiss} dismissible>
      <View className="px-6 pt-7 pb-6">
        <Text className="text-center font-display-bold text-[20px] text-ink">
          {title}
        </Text>
        <Text className="mt-2.5 text-center font-ui-medium text-[15px] leading-[22px] text-ink-secondary">
          {message}
        </Text>

        <Pressable
          onPress={onDismiss}
          className="mt-7 items-center justify-center rounded-2xl bg-primary py-4 active:opacity-80"
        >
          <Text className="font-ui-bold text-[15px] text-white">
            {buttonLabel}
          </Text>
        </Pressable>
      </View>
    </AppModal>
  );
}
