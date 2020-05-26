import React, { useContext, useRef, useState } from "react";
import { ThemeContext } from "styled-components";
import PropTypes from "prop-types";
import { FormControl, InputGroup } from "../ui-wrapper";

export const InputOnEnter = ({
  onEnter,
  defaultValue,
  autoFocus,
  placeholder,
  onBlur,
  border,
}) => {
  const theme = useContext(ThemeContext);
  const [inputValue, setInputValue] = useState(defaultValue || "");
  const inputRef = useRef();

  return (
    <InputGroup className="input-add-person">
      <FormControl
        style={{
          backgroundColor: theme.primary.background,
          border: border ? `1px solid${theme.secondary.main}` : "0px",
          textAlign: "left",
          backgroundClip: "unset",
          color: theme.primary.main,
          width: "50px",
        }}
        value={inputValue}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="off"
        onBlur={(e) => {
          if (onBlur) onEnter(e.target.value);
        }}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onEnter(e.target.value);
            setInputValue("");
          }
        }}
        ref={inputRef}
        type="text"
        id="add-person"
        placeholder={placeholder}
        aria-describedby="basic-addon2"
      />
    </InputGroup>
  );
};
InputOnEnter.defaultProps = {
  autoFocus: false,
  defaultValue: null,
  border: true,
  onBlur: false,
  onEnter: () => {},
  placeholder: "",
};
InputOnEnter.propTypes = {
  autoFocus: PropTypes.bool,
  defaultValue: PropTypes.string,
  border: PropTypes.bool,
  onBlur: PropTypes.bool,
  onEnter: PropTypes.func,
  placeholder: PropTypes.string,
};
