import { useCallback, useState } from "react";
import type { ConfirmModalVariant } from "@/components/ui/ConfirmModal";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmModalVariant;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
};

type ModalState = ConfirmOptions & { visible: boolean };

/**
 * Imperative hook for showing a ConfirmModal.
 *
 * Usage:
 * ```tsx
 * const { props, confirm, cancel } = useConfirmModal();
 *
 * // Show the modal:
 * confirm({
 *   title: "Leave game?",
 *   message: "The game room will be closed.",
 *   confirmLabel: "Leave",
 *   variant: "danger",
 *   onConfirm: () => { doSomething(); },
 * });
 *
 * // In JSX:
 * <ConfirmModal {...props} onCancel={cancel} />
 * ```
 */
export function useConfirmModal() {
  const [state, setState] = useState<ModalState>({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const confirm = useCallback((opts: ConfirmOptions) => {
    setState({
      visible: true,
      ...opts,
    });
  }, []);

  const cancel = useCallback(() => {
    setState((s) => ({ ...s, visible: false }));
  }, []);

  const props = {
    visible: state.visible,
    title: state.title,
    message: state.message,
    confirmLabel: state.confirmLabel,
    cancelLabel: state.cancelLabel,
    variant: state.variant,
    loading: state.loading,
    onConfirm: async () => {
      await state.onConfirm();
      setState((s) => ({ ...s, visible: false }));
    },
  };

  return { props, confirm, cancel };
}
