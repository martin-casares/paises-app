import Header from "./components/Header";
import Continentes from "./components/Continentes";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="py-8">
        <Continentes />
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>Aplicación de países © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
