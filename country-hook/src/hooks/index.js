import { useState, useEffect } from "react";
import axios from "axios";

export const useField = (type) => {
  const [value, setValue] = useState("");

  const onChange = (event) => {
    setValue(event.target.value);
  };

  return {
    type,
    value,
    onChange,
  };
};

// Hook useCountry
export const useCountry = (name) => {
  const [country, setCountry] = useState(null);

  useEffect(() => {
    if (!name) {
      setCountry(null);
      return;
    }

    const fetchCountry = async () => {
      try {
        const response = await axios.get(
          `https://studies.cs.helsinki.fi/restcountries/api/name/${name}`
        );
        // Si lo encuentra, guardamos los datos y marcamos que existe
        setCountry({ data: response.data, found: true });
      } catch (error) {
        // Si hay error (404), marcamos que no se encontró
        setCountry({ found: false });
      }
    };

    fetchCountry();
  }, [name]); // Se dispara cada vez que cambia el nombre buscado

  return country;
};
