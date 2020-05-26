export const SECONDARY = {
  /* Gray */
  extraLight: "#ebebeb",
  light: "#cccccc",
  main: "#8c8c8c",
  dark: "#737373",
  background: "#1E1E1E",
  text: "#fff",
};

export const MAIN = {
  main: "#36ffe3", // "#BFD656",
  dark: "#769473",
  background: "#1E1E1E",
  text: "#fff",
};

export const BLACK_WHITE = {
  /* Black & White */
  white: "#ffffff",
  black: "#000000",
};

const theme = {
  primary: {
    ...MAIN,
  },
  secondary: {
    ...SECONDARY,
  },
};
export { theme };
