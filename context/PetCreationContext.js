import React, { createContext, useContext, useState } from "react";

const PetCreationContext = createContext();

export const PetCreationProvider = ({ children }) => {
  const [petData, setPetData] = useState({
    name: "",
    type: "",
    breed: "",
    birthDate: "",
    weight: "",
    chipNumber: "",
    image: null,
    personality: "",
    favoriteFood: "",
    notes: "",
  });

  return (
    <PetCreationContext.Provider value={{ petData, setPetData }}>
      {children}
    </PetCreationContext.Provider>
  );
};

export const usePetCreation = () => useContext(PetCreationContext);
