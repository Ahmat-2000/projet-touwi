"use client"
import { createContext, useState, useContext } from 'react';

const VariablesContext = createContext();

export function VariablesProvider({ children }) {
  const [variablesContext, setVariablesContext] = useState(null);

  return (
    <VariablesContext.Provider value={{ variablesContext, setVariablesContext }}>
      {children}
    </VariablesContext.Provider>
  );
}

export function useVariablesContext() {
  return useContext(VariablesContext);
}