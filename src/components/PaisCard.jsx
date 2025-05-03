const PaisCard = ({ pais }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex items-center p-3 h-full lg:min-h-[80px] lg:my-4">
      <div className="flex-shrink-0 mr-3">
        <img
          src={pais.flags.svg}
          alt={`Bandera de ${pais.name.common}`}
          className="w-12 h-8 object-cover border border-gray-200"
        />
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="font-medium text-sm truncate">{pais.name.common}</h3>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-600 mt-1">
          <div>
            <span className="font-semibold">Capital:</span>{" "}
            {pais.capital?.[0] || "N/A"}
          </div>
          <div>
            <span className="font-semibold">Población:</span>{" "}
            {pais.population?.toLocaleString() || "N/A"}
          </div>
          <div>
            <span className="font-semibold">Región:</span> {pais.region}
          </div>
          <div>
            <span className="font-semibold">Código:</span> {pais.cca3}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaisCard;
