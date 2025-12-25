import { useField, useResource } from "./hooks";

const App = () => {
  // Inicializamos los campos separando 'reset' para el botón de limpieza
  const { reset: resetContent, ...content } = useField("text");
  const { reset: resetName, ...name } = useField("text");
  const { reset: resetNumber, ...number } = useField("text");

  // Cargamos los recursos usando el hook genérico
  const [notes, noteService] = useResource("http://localhost:3005/notes");
  const [persons, personService] = useResource("http://localhost:3005/persons");

  const handleNoteSubmit = (event) => {
    event.preventDefault();
    noteService.create({ content: content.value });
  };

  const handlePersonSubmit = (event) => {
    event.preventDefault();
    personService.create({ name: name.value, number: number.value });
    resetName(); // Limpiamos los inputs tras crear
    resetNumber();
  };

  return (
    <div>
      <h2>notes</h2>
      <form onSubmit={handleNoteSubmit}>
        {/* Usamos el spread operator sin la función reset */}
        <input {...content} />
        <button type="submit">create</button>
      </form>
      {notes.map((n) => (
        <p key={n.id}>{n.content}</p>
      ))}

      <h2>persons</h2>
      <form onSubmit={handlePersonSubmit}>
        name <input {...name} /> <br />
        number <input {...number} />
        <button type="submit">create</button>
      </form>
      {persons.map((n) => (
        <p key={n.id}>
          {n.name} {n.number}
        </p>
      ))}
    </div>
  );
};

export default App;
