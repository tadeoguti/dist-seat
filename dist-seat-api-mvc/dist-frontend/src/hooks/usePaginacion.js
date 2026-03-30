import { useState, useMemo } from "react";

export function usePaginacion(datos, itemsPorPagina = 10) {
  const [paginaActual, setPaginaActual] = useState(1);

  const totalItems = datos.length;
  const totalPaginas = Math.ceil(totalItems / itemsPorPagina);

  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return datos.slice(inicio, fin);
  }, [datos, paginaActual, itemsPorPagina]);

  const irPaginaAnterior = () => setPaginaActual((p) => Math.max(p - 1, 1));
  const irPaginaSiguiente = () =>
    setPaginaActual((p) => (p < totalPaginas ? p + 1 : p));

  return {
    paginaActual,
    totalPaginas,
    datosPaginados,
    irPaginaAnterior,
    irPaginaSiguiente,
    setPaginaActual,
  };
}
