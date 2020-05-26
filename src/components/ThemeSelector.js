import PropTypes from "prop-types";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { ChromePicker } from "react-color";
import IosClose from "react-ionicons/lib/IosClose";
import IosCreateOutline from "react-ionicons/lib/IosCreateOutline";
import { connect } from "react-redux";
import { useFirebase } from "react-redux-firebase";
import { useParams } from "react-router-dom";
import { ThemeContext } from "styled-components";
import { Col, Modal, Row } from "../ui-wrapper";
import { theme as defaultTheme } from "../ui-wrapper/theme";

function padZero(str, len) {
  const hexLen = len || 2;
  const zeros = new Array(hexLen).join("0");
  return (zeros + str).slice(-hexLen);
}

const buttonStyle = {
  borderRadius: "2px",
  padding: "2px 10px",
  fontSize: "0.7875rem",
  cursor: "pointer",
  width: "100%",
};
function invertHex(hex) {
  let _hex = hex;
  if (_hex.indexOf("#") === 0) {
    _hex = _hex.slice(1);
  }
  // convert 3-digit _hex to 6-digits.
  if (_hex.length === 3) {
    _hex = _hex[0] + _hex[0] + _hex[1] + _hex[1] + _hex[2] + _hex[2];
  }
  if (_hex.length !== 6) {
    throw new Error("Invalid HEX color.");
  }
  // invert color components
  const r = (255 - parseInt(_hex.slice(0, 2), 16)).toString(16);
  const g = (255 - parseInt(_hex.slice(2, 4), 16)).toString(16);
  const b = (255 - parseInt(_hex.slice(4, 6), 16)).toString(16);
  // pad each with zeros and return
  return `#${padZero(r)}${padZero(g)}${padZero(b)}`;
}

const ThemeSelector = ({ changePrimaryTheme, changeSecondaryTheme }) => {
  const firebase = useFirebase();
  let { roomId } = useParams();
  const theme = useContext(ThemeContext);
  roomId = `-${roomId}`;
  const roomThemePath = `rooms/${roomId}/mob/settings/theme`;
  useEffect(() => {
    const query = firebase.database().ref().child(roomThemePath);
    const onValue = (snap) => {
      const _theme = snap.val();
      if (_theme !== null && theme.primary) {
        changePrimaryTheme({ ...theme.primary, ..._theme.primary });
      }
      if (_theme !== null && theme.secondary) {
        changeSecondaryTheme({ ...theme.secondary, ..._theme.secondary });
      }
    };
    query.on("value", onValue);
    return () => {
      query.off("value", onValue);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [modalProps, setModalProps] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedColor, setSelectedColor] = useState();
  const onChangePrimary = (color) => {
    firebase.update(`${roomThemePath}/primary`, {
      main: color.hex,
    });
    setSelectedColor(color.hex);
  };
  const onChangeBackground = (color) => {
    firebase.update(`${roomThemePath}/primary`, {
      background: color.hex,
    });
    setSelectedColor(color.hex);
  };

  const onChangeSecondary = (color) => {
    firebase.update(`${roomThemePath}/secondary`, {
      main: color.hex,
    });
    setSelectedColor(color.hex);
  };

  const onChangeText = (color) => {
    firebase.update(`${roomThemePath}/primary`, {
      text: color.hex,
    });
    setSelectedColor(color.hex);
  };

  const setActiveModal = (title, cb, color) => {
    setSelectedColor(color);
    setModalProps({ title, cb });
  };
  const resetTheme = () => {
    firebase.update(roomThemePath, {
      ...defaultTheme,
    });
  };
  const onHide = useCallback(() => {
    setModalProps({});
  }, []);

  return (
    <>
      <Row
        className="mx-1 my-1 align-items-center text-center"
        style={{ minHeight: "30px" }}
      >
        <Col md="auto">
          <IosCreateOutline
            onClick={() => {
              setIsEditing(!isEditing);
            }}
            color={theme.primary.text}
          />
        </Col>
        {isEditing && (
          <>
            <Col md={2}>
              <button
                type="button"
                style={{
                  ...buttonStyle,
                  backgroundColor: theme.primary.main,
                  border: `1px solid ${theme.primary.main}`,
                  color: invertHex(theme.primary.main),
                }}
                onClick={() =>
                  setActiveModal("Primary", onChangePrimary, theme.primary.main)
                }
              >
                Primary
              </button>
            </Col>
            <Col md={2}>
              <button
                type="button"
                style={{
                  ...buttonStyle,
                  backgroundColor: theme.secondary.main,
                  border: `1px solid ${theme.secondary.main}`,
                  color: invertHex(theme.secondary.main),
                }}
                onClick={() =>
                  setActiveModal(
                    "Sedondary",
                    onChangeSecondary,
                    theme.secondary.main
                  )
                }
              >
                Secondary
              </button>
            </Col>

            <Col md={2}>
              <button
                type="button"
                style={{
                  ...buttonStyle,
                  border: `1px solid ${theme.primary.text}`,
                  backgroundColor: theme.primary.text,
                  color: invertHex(theme.primary.text),
                }}
                onClick={() =>
                  setActiveModal("Text", onChangeText, theme.primary.text)
                }
              >
                Text
              </button>
            </Col>

            <Col md={2}>
              <button
                type="button"
                style={{
                  ...buttonStyle,
                  backgroundColor: theme.primary.background,
                  border: `1px solid ${invertHex(theme.primary.background)}`,
                  color: invertHex(theme.primary.background),
                }}
                onClick={() =>
                  setActiveModal(
                    "Background",
                    onChangeBackground,
                    theme.primary.background
                  )
                }
              >
                Background
              </button>
            </Col>
            <Col md={2}>
              <button
                type="button"
                style={{
                  ...buttonStyle,
                  backgroundColor: theme.primary.background,
                  border: `1px solid ${invertHex(theme.primary.background)}`,
                  color: invertHex(theme.primary.background),
                }}
                onClick={() => {
                  resetTheme();
                }}
              >
                Reset Colors
              </button>
            </Col>
            <Col
              className="text-center"
              onClick={() => setIsEditing(false)}
              style={{ cursor: "pointer" }}
            >
              <IosClose color={invertHex(theme.primary.background)} />
            </Col>
          </>
        )}
      </Row>
      {isEditing && (
        <Modal onHide={onHide} show={!!modalProps.title}>
          <div style={{ textAlign: "center" }}>{modalProps.title}</div>
          <ChromePicker
            styles={{ default: { picker: { width: "100%" } } }}
            color={selectedColor}
            onChangeComplete={modalProps.cb}
          />
        </Modal>
      )}
    </>
  );
};

ThemeSelector.propTypes = {
  changePrimaryTheme: PropTypes.func.isRequired,
  changeSecondaryTheme: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  // dispatching plain actions
  changePrimaryTheme: (theme) =>
    dispatch({ type: "CHANGE_THEME_PRIMARY", value: theme }),
  changeSecondaryTheme: (theme) =>
    dispatch({ type: "CHANGE_THEME_SECONDARY", value: theme }),
});

const ThemeSelectorWithRedux = connect(
  (state) => ({ theme: state.theme }),
  mapDispatchToProps
)(ThemeSelector);

export { ThemeSelectorWithRedux as ThemeSelector };
