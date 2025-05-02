import { useEffect, useState, useRef } from "react";
import PaisCard from "./PaisCard";

const ITEMS_POR_PAGINA = 12;

const traducirRegion = (region) => {
  const traducciones = {
    Africa: { traduccion: "África", original: "Africa" },
    Americas: { traduccion: "Américas", original: "Americas" },
    Asia: { traduccion: "Asia", original: "Asia" },
    Europe: { traduccion: "Europa", original: "Europe" },
    Oceania: { traduccion: "Oceanía", original: "Oceania" },
  };

  return traducciones[region] || { traduccion: region, original: region };
};

const Continentes = () => {
  // Estados
  const [paises, setPaises] = useState([]);
  const [paisesOriginales, setPaisesOriginales] = useState([]);
  const [continenteSeleccionado, setContinenteSeleccionado] = useState("all");
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [sugerenciaActiva, setSugerenciaActiva] = useState(-1);
  const [paginaActual, setPaginaActual] = useState(1);

  // Refs
  const inputRef = useRef(null);
  const sugerenciasRef = useRef(null);

  // Fetch de países
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setCargando(true);
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,capital,region,flags,translations,cca3,population",
        );
        if (!response.ok) throw new Error("Error al cargar países");
        const data = await response.json();

        // Guarda una copia con los datos originales para filtrado
        setPaisesOriginales(data);

        // Creamos versión traducida para mostrar
        const paisesFormateados = data.map((pais) => ({
          ...pais,
          name: {
            ...pais.name,
            common: pais.translations?.spa?.common || pais.name.common,
          },
          capital: pais.capital || ["Sin capital"],
          region: traducirRegion(pais.region).traduccion,
          regionOriginal: pais.region, // Mantenemos el original
          population: pais.population || 0,
        }));

        setPaises(paisesFormateados);
      } catch (error) {
        console.error("Error:", error);
        // Datos de prueba si falla la API
        const datosPrueba = [
          {
            cca3: "col",
            name: { common: "Colombia" },
            capital: ["Bogotá"],
            region: "Américas",
            regionOriginal: "Americas",
            flags: { svg: "https://flagcdn.com/co.svg" },
            population: 50339443,
          },
        ];
        setPaises(datosPrueba);
        setPaisesOriginales(datosPrueba);
      } finally {
        setCargando(false);
      }
    };

    fetchCountries();
  }, []);

  // Filtrado corregido (usa regionOriginal)
  const paisesFiltrados = paises.filter((pais) => {
    const pasaContinente =
      continenteSeleccionado === "all" ||
      paisesOriginales.find((p) => p.cca3 === pais.cca3)?.region ===
        continenteSeleccionado;

    if (!busqueda) return pasaContinente;

    const termino = busqueda.toLowerCase();
    const nombre = pais.name.common.toLowerCase();
    const capital = pais.capital?.[0]?.toLowerCase() || "";

    return (
      pasaContinente && (nombre.includes(termino) || capital.includes(termino))
    );
  });

  // Continentes disponibles (usamos los nombres originales para los botones)
  const continentes = ["Africa", "Americas", "Asia", "Europe", "Oceania"];

  // Calcular paginación cuando cambian los países filtrados
  useEffect(() => {
    setPaginaActual(1); // Resetear a primera página cuando cambian los filtros
  }, [continenteSeleccionado, busqueda]);

  // Generar sugerencias con debounce
  useEffect(() => {
    if (busqueda.length < 2) {
      setSugerencias([]);
      return;
    }

    const timer = setTimeout(() => {
      const termino = busqueda.toLowerCase();
      const resultados = paises
        .filter((pais) => {
          const nombre = pais.name.common.toLowerCase();
          const capital = pais.capital?.[0]?.toLowerCase() || "";
          return nombre.includes(termino) || capital.includes(termino);
        })
        .slice(0, 5);

      setSugerencias(resultados);
      setSugerenciaActiva(-1); // Resetear selección al actualizar sugerencias
    }, 300);

    return () => clearTimeout(timer);
  }, [busqueda, paises]);

  // Manejar teclado
  const handleKeyDown = (e) => {
    if (!mostrarSugerencias || sugerencias.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSugerenciaActiva((prev) => Math.min(prev + 1, sugerencias.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSugerenciaActiva((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && sugerenciaActiva >= 0) {
      e.preventDefault();
      handleSeleccionSugerencia(sugerencias[sugerenciaActiva]);
    }
  };

  // Seleccionar sugerencia
  const handleSeleccionSugerencia = (pais) => {
    setBusqueda(pais.name.common);
    setSugerencias([]);
    setMostrarSugerencias(false);
    inputRef.current.focus();
  };

  // Resaltar coincidencias
  const resaltarTexto = (texto) => {
    if (!busqueda || !texto) return texto;
    const termino = busqueda.toLowerCase();
    const index = texto.toLowerCase().indexOf(termino);

    if (index === -1) return texto;

    return (
      <>
        {texto.substring(0, index)}
        <span className="bg-yellow-200 font-semibold">
          {texto.substring(index, index + termino.length)}
        </span>
        {texto.substring(index + termino.length)}
      </>
    );
  };
  // Resetear a primera página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [continenteSeleccionado, busqueda]);

  // Calcular paginación
  const indiceInicial = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const indiceFinal = indiceInicial + ITEMS_POR_PAGINA;
  const paisesPagina = paisesFiltrados.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(paisesFiltrados.length / ITEMS_POR_PAGINA);

  // Generar array de páginas para los botones
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  // Cambiar de página
  const cambiarPagina = (pagina) => {
    setPaginaActual(pagina);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto p-4">
      {/* Filtros */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Filtrar por continente</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setContinenteSeleccionado("all")}
            className={`px-4 py-2 rounded-md ${
              continenteSeleccionado === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Todos
          </button>
          {continentes.map((continente) => {
            const traduccion = traducirRegion(continente).traduccion;
            return (
              <button
                key={continente}
                onClick={() => setContinenteSeleccionado(continente)}
                className={`px-4 py-2 rounded-md ${
                  continenteSeleccionado === continente
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
                title={traduccion} // Tooltip con la traducción
              >
                {traduccion}
              </button>
            );
          })}
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar país o capital..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onFocus={() => setMostrarSugerencias(true)}
            onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
            onKeyDown={handleKeyDown}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />

          {/* Sugerencias */}
          {mostrarSugerencias && sugerencias.length > 0 && (
            <div
              ref={sugerenciasRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
            >
              {sugerencias.map((pais, index) => (
                <div
                  key={pais.cca3}
                  className={`p-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 ${
                    index === sugerenciaActiva ? "bg-blue-100" : ""
                  }`}
                  onClick={() => handleSeleccionSugerencia(pais)}
                  onMouseEnter={() => setSugerenciaActiva(index)}
                >
                  <img
                    src={pais.flags.svg}
                    alt={`Bandera de ${pais.name.common}`}
                    className="w-8 h-6 object-cover border border-gray-200"
                  />
                  <div>
                    <div className="font-medium">
                      {resaltarTexto(pais.name.common)}
                    </div>
                    {pais.capital && (
                      <div className="text-sm text-gray-600">
                        Capital: {resaltarTexto(pais.capital[0])}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resultados */}
      {cargando ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Cargando países...</p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {continenteSeleccionado === "all"
              ? "Todos los países"
              : `Países de ${continenteSeleccionado}`}
            <span className="text-sm text-gray-500 ml-2">
              ({paisesFiltrados.length} países)
            </span>
          </h2>

          {paisesFiltrados.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No se encontraron países</p>
              <button
                onClick={() => {
                  setBusqueda("");
                  setContinenteSeleccionado("all");
                }}
                className="mt-2 text-blue-600 hover:underline"
              >
                Reiniciar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {paisesPagina.map((pais) => (
                  <PaisCard key={pais.cca3} pais={pais} />
                ))}
              </div>

              {totalPaginas > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center gap-1">
                    {/* Botón Anterior */}
                    <button
                      onClick={() => cambiarPagina(paginaActual - 1)}
                      disabled={paginaActual === 1}
                      className="px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      &lt;
                    </button>

                    {/* Primera página */}
                    {paginaActual > 3 && (
                      <>
                        <button
                          onClick={() => cambiarPagina(1)}
                          className="px-3 py-1 rounded-md hover:bg-gray-200"
                        >
                          1
                        </button>
                        {paginaActual > 4 && <span className="px-2">...</span>}
                      </>
                    )}

                    {/* Páginas cercanas */}
                    {Array.from(
                      { length: Math.min(5, totalPaginas) },
                      (_, i) => {
                        let pagina;
                        if (paginaActual <= 3) {
                          pagina = i + 1;
                        } else if (paginaActual >= totalPaginas - 2) {
                          pagina = totalPaginas - 4 + i;
                        } else {
                          pagina = paginaActual - 2 + i;
                        }

                        if (pagina < 1 || pagina > totalPaginas) return null;

                        return (
                          <button
                            key={pagina}
                            onClick={() => cambiarPagina(pagina)}
                            className={`px-3 py-1 rounded-md ${
                              pagina === paginaActual
                                ? "bg-blue-600 text-white"
                                : "hover:bg-gray-200"
                            }`}
                          >
                            {pagina}
                          </button>
                        );
                      },
                    )}

                    {/* Última página */}
                    {paginaActual < totalPaginas - 2 && (
                      <>
                        {paginaActual < totalPaginas - 3 && (
                          <span className="px-2">...</span>
                        )}
                        <button
                          onClick={() => cambiarPagina(totalPaginas)}
                          className="px-3 py-1 rounded-md hover:bg-gray-200"
                        >
                          {totalPaginas}
                        </button>
                      </>
                    )}

                    {/* Botón Siguiente */}
                    <button
                      onClick={() => cambiarPagina(paginaActual + 1)}
                      disabled={paginaActual === totalPaginas}
                      className="px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      &gt;
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Continentes;
