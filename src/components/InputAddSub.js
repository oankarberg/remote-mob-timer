import PropTypes from "prop-types";
import React, { useContext } from "react";
import IosAdd from "react-ionicons/lib/IosAdd";
import IosRemove from "react-ionicons/lib/IosRemove";
import { ThemeContext } from "styled-components";
import { Button, FormControl, InputGroup } from "../ui-wrapper";

export const AddSubInput = ({
  decrementCb,
  incrementCb,
  updateInput,
  inputValue,
}) => {
  const theme = useContext(ThemeContext);
  return (
    <InputGroup size="m">
      <InputGroup.Prepend>
        <Button onClick={() => decrementCb()} variant="primary">
          <IosRemove color={theme.secondary.main} />
        </Button>
      </InputGroup.Prepend>
      <FormControl
        style={{
          backgroundColor: theme.primary.background,
          border: `1px solid${theme.secondary.main}`,
          textAlign: "center",
          backgroundClip: "unset",
          height: "auto",
          color: theme.primary.main,
          width: "50px",
        }}
        input="number"
        value={inputValue}
        pattern="[0-9]*"
        type="text"
        onChange={(ev) =>
          ev.target.validity.valid && updateInput(ev.target.value)
        }
        placeholder=""
        aria-describedby="basic-addon2"
      />
      <InputGroup.Append>
        <Button variant="primary" onClick={() => incrementCb()}>
          <IosAdd color={theme.secondary.main} />
        </Button>
      </InputGroup.Append>
    </InputGroup>
  );
};

AddSubInput.propTypes = {
  decrementCb: PropTypes.func.isRequired,
  incrementCb: PropTypes.func.isRequired,
  inputValue: PropTypes.number.isRequired,
  updateInput: PropTypes.func.isRequired,
};
