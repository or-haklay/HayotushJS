import React, { createContext, useContext, useState } from "react";

const PetCreationContext = createContext();

export const PetCreationProvider = ({ children }) => {
  const [petData, setPetData] = useState({
    name: "",
    type: "",
    breed: "",
    birthDate: null,
    sex: "",
    weight: "",
    chipNumber: "",
    image: null,
    vaccineBookImage: null,
    vaccineBookMime: null, // הוספת MIME type לפנקס חיסונים
    personalities: [],
    favoriteFood: "",
    notes: "",
    createdPetId: null,
  });

  return (
    <PetCreationContext.Provider value={{ petData, setPetData }}>
      {children}
    </PetCreationContext.Provider>
  );
};

export const usePetCreation = () => useContext(PetCreationContext);
