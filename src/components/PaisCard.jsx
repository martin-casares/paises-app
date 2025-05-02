const PaisCard = ({ pais }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-40 bg-gray-200 flex items-center justify-center">
        {pais.flags && (
          <img
            src={pais.flags.svg}
            alt={`Bandera de ${pais.name.common}`}
            className="h-full object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{pais.name.common}</h3>
        <p className="text-gray-600 mb-1">
          <span className="font-semibold">Capital:</span>{" "}
          {pais.capital?.[0] || "N/A"}
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-semibold">Población:</span>{" "}
          {pais.population?.toLocaleString() || "N/A"}
        </p>
        <p className="text-gray-600">
          <span className="font-semibold">Región:</span> {pais.region}
        </p>
      </div>
    </div>
  );
};

export default PaisCard;
