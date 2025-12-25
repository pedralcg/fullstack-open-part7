import { useState, useEffect } from "react";
import axios from "axios";

//? Hook para manejar el estado de cada input
export const useField = (type) => {
  const [value, setValue] = useState("");

  const onChange = (event) => {
    setValue(event.target.value);
  };

  const reset = () => {
    setValue("");
  };

  return {
    type,
    value,
    onChange,
    reset,
  };
};

//? Hook para buscar países
export const useCountry = (name) => {
  const [country, setCountry] = useState(null);

  useEffect(() => {
    if (!name) {
      setCountry(null);
      return;
    }

    axios
      .get(`https://studies.cs.helsinki.fi/restcountries/api/name/${name}`)
      .then((response) => {
        setCountry({ data: response.data, found: true });
      })
      .catch(() => {
        setCountry({ found: false });
      });
  }, [name]);

  return country;
};

//? Hook genérico para recursos API
export const useResource = (baseUrl) => {
  const [resources, setResources] = useState([]);

  // Carga inicial de datos desde la URL proporcionada
  useEffect(() => {
    axios
      .get(baseUrl)
      .then((response) => {
        setResources(response.data);
      })
      .catch((error) => console.error("Error al cargar recursos:", error));
  }, [baseUrl]);

  // Método para crear un nuevo recurso y actualizar el estado local
  const create = async (newObject) => {
    const response = await axios.post(baseUrl, newObject);
    setResources(resources.concat(response.data));
    return response.data;
  };

  const service = {
    create,
  };

  return [resources, service];
};
