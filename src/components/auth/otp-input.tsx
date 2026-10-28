import { useRef, useState, type ComponentRef } from 'react';
import { TextInput, View } from 'react-native';
import { usePalette } from '@/hooks/usePalette';

const CELL_COUNT = 6;

type OtpInputProps = {
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
};

export function OtpInput({ value, onChange, onComplete }: OtpInputProps) {
  const palette = usePalette();
  const inputs = useRef<(ComponentRef<typeof TextInput> | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const chars = value.padEnd(CELL_COUNT, ' ').split('').slice(0, CELL_COUNT);

  const handleChange = (text: string, index: number) => {
    const digits = text.replace(/\D/g, '');
    const next = (value.slice(0, index) + digits + value.slice(index + 1)).slice(0, CELL_COUNT);
    onChange(next);

    if (digits.length > 0 && index < CELL_COUNT - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (next.length === CELL_COUNT) {
      onComplete?.(next);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && value[index] === undefined && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="w-full flex-row justify-between gap-2">
      {chars.map((char, i) => (
        <TextInput
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          className={
            focusedIndex === i
              ? 'flex-1 aspect-square max-w-[48px] rounded-[14px] border-2 text-center font-ui-bold text-title-lg'
              : 'flex-1 aspect-square max-w-[48px] rounded-[14px] border-[1.5px] text-center font-ui-bold text-title-lg'
          }
          style={{
            backgroundColor: palette.surface,
            borderColor: focusedIndex === i ? palette.primary : palette.chip,
            color: palette.ink,
          }}
          value={char === ' ' ? '' : char}
          onChangeText={(t) => handleChange(t, i)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
          onFocus={() => setFocusedIndex(i)}
          onBlur={() => setFocusedIndex(null)}
          keyboardType="number-pad"
          maxLength={1}
          caretHidden
          textAlign="center"
        />
      ))}
    </View>
  );
}
