import React from "react";
import logo from "./logo.svg";

import { Client as Styletron } from "styletron-engine-atomic";
import { Provider as StyletronProvider } from "styletron-react";
import { LightTheme, BaseProvider, styled } from "baseui";
import { GarbageCollection } from "./garbage-collection/garbage-collection.component";

const engine = new Styletron();

export const App: React.FC = () => {
  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>
        <GarbageCollection />
      </BaseProvider>
    </StyletronProvider>
  );
};
