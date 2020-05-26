import "firebase/messaging";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { Normalize } from "styled-normalize";
import "./App.scss";
import { Routes } from "./routes";

const GlobalStyle = createGlobalStyle`
  body,html {
    height:100%;
    background: ${(props) => props.theme.primary.background};
    color: ${(props) => props.theme.primary.text};
  }
  #root{
    height:100%
  }
  .modal-content {
    background-color: ${(props) => props.theme.primary.background};
  }
  h1 {
    font-size: 50px;
    margin: 0px;
  }

  .themed{
    color: ${(props) => props.theme.primary.main};
  }

  
  .btn-primary:not(:disabled):not(.disabled):active{
    background-color: ${(props) => props.theme.primary.main};
    border-color: ${(props) => props.theme.primary.main};
    color: ${(props) => props.theme.secondary.main};

  }
  *[class*='btn-primary'],
  *[class*='btn-primary']:hover,
  *[class*='btn btn-primary']:active,
  *[class*='btn btn-primary']:focus{
    color: ${(props) => props.theme.secondary.main};
    background-color: ${(props) => props.theme.primary.main};
    border-color: ${(props) => props.theme.primary.main};
  }
  *[class*='outline-primary'],*[class*='outline-primary']:hover,
  *[class*='outline-primary']:active,
  *[class*='outline-primary']:focus,
  *[class*='outline-primary']:disabled,
  .btn-outline-primary:not(:disabled):not(.disabled):active
  {
    color: ${(props) => props.theme.primary.main};
    background-color: initial;
    border-color: ${(props) => props.theme.primary.main};
  }
  *[class*='outline-primary']:hover{
    background-color: ${(props) => props.theme.primary.main};
    color: ${(props) => props.theme.secondary.main};
  }
  a{
    color: ${(props) => props.theme.secondary.main};
  }

  
`;

let ThemeWithRedux = ({ theme, children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

ThemeWithRedux.propTypes = {
  theme: PropTypes.shape({
    primary: PropTypes.object,
    secondary: PropTypes.object,
  }).isRequired,
  children: PropTypes.node.isRequired,
};

ThemeWithRedux = connect((store) => ({ theme: store.theme }))(ThemeWithRedux);

// Setup react-redux so that connect HOC can be used
function App() {
  return (
    <>
      <Normalize />
      <ThemeWithRedux>
        <GlobalStyle />

        <Router>
          <Routes />
        </Router>
      </ThemeWithRedux>
    </>
  );
}

export { App };
