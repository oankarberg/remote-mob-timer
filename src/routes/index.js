import React from "react";
import { Route, Switch } from "react-router-dom";
import { Room } from "../components/Room";
import { Main } from "./Main";

export const Routes = () => (
  <Switch>
    <Route path="/:roomId">
      <Room />
    </Route>
    <Route path="/">
      <Main />
      {/* <Rooms /> */}
    </Route>
  </Switch>
);
