/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#8A4BE0',
        'primary-light': '#8C78FF',
        'primary-dark': '#482AC4',
        'primary-soft': '#EFEAFF',
        accent: '#FF69B4',
        'accent-soft': '#FFE4F1',
        ink: '#201A33',
        'ink-secondary': '#7A748C',
        'ink-tertiary': '#B0A9C2',
        lavender: '#F7F6FF',
        blush: '#FFF0F5',
        'background-alt': '#F7F6FF',
        'surface-border': '#EDEAF7',
        'error-soft': '#FDEAEE',
      },
      fontFamily: {
        display: ['NunitoSans_700Bold'],
        'display-bold': ['NunitoSans_800ExtraBold'],
        'display-semi': ['NunitoSans_600SemiBold'],
        ui: ['NunitoSans_400Regular'],
        'ui-medium': ['NunitoSans_500Medium'],
        'ui-semibold': ['NunitoSans_600SemiBold'],
        'ui-bold': ['NunitoSans_700Bold'],
      },
    },
  },
  plugins: [],
};
