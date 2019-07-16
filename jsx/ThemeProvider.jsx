import React from 'react';
import PropTypes from 'prop-types';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import blueGrey from '@material-ui/core/colors/blueGrey';
import grey from '@material-ui/core/colors/grey';
import lightBlue from '@material-ui/core/colors/lightBlue';
import amber from '@material-ui/core/colors/amber';
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';

import CssBaseline from '@material-ui/core/CssBaseline';

import 'typeface-roboto';

const theme = createMuiTheme({
  palette: {
    primary: {main: blueGrey[900]},
    secondary: {main: blueGrey[600]},
  },
  typography: {
    useNextVariants: true,
  },
  extraColors: {
    debug: {
      main: grey[400],
      light: grey[200],
      dark: grey[500],
    },
    info: {
      main: lightBlue[200],
      light: '#ffffff',
      dark: lightBlue[400],
    },
    warning: {
      main: amber[200],
      light: amber[100],
      dark: amber[500],
    },
    error: {
      main: red[300],
      light: red[100],
      dark: red[500],
    },
    filterState: {
      on: blueGrey[700],
      off: grey[300],
    },
    normal: {
      main: grey[400],
      light: grey[200],
      dark: grey[500],
    },
    cold: {
      main: lightBlue[400],
      light: lightBlue[200],
      dark: lightBlue[500],
    },
    ok: {
      main: green[500],
      light: green[200],
      dark: green[800],
    },
    primaryVariant: {
      main: blueGrey[400],
      light: blueGrey[100],
      dark: blueGrey[600],
    },
  }
});

function ThemeProvider(props) {
  const { children } = props;
  return (
    <React.Fragment>
      <CssBaseline />
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </React.Fragment>
  );
}
ThemeProvider.propTypes = {
  children: PropTypes.array,
};

export default ThemeProvider;
