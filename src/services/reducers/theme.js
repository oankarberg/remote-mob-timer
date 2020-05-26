import { theme } from "../../ui-wrapper/theme";

const initialThemes = { ...theme };

const themesReducer = (state = initialThemes, action) => {
  switch (action.type) {
    case "CHANGE_THEME_PRIMARY":
      return { ...state, primary: action.value };
    case "CHANGE_THEME_SECONDARY":
      return { ...state, secondary: action.value };
    default:
      return state;
  }
};

export { themesReducer };
