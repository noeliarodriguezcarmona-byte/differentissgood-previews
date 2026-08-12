/* =========================================================
   Differentissgood · Bodas — datos del portfolio
   Una foto por línea: archivo + categoría real de su contenido.
   Añadir una foto nueva: súbela a media/fotos/ y añade una línea aquí.
   ========================================================= */

const CATEGORIAS = {
  parejas: 'Parejas',
  familia: 'Familia',
  grupo: 'Fotos de grupo',
  detalles: 'Detalles',
  flores: 'Flores',
  anillos: 'Anillos',
  paisajes: 'Paisajes',
  mascotas: 'Mascotas',
  momentos: 'Momentos especiales',
  celebracion: 'Celebración y fiesta',
};

const PORTFOLIO = [
  { archivo: 'boda-01.jpg', categoria: 'momentos' },
  { archivo: 'boda-02.jpg', categoria: 'parejas' },
  { archivo: 'boda-03.jpg', categoria: 'detalles' },
  { archivo: 'boda-04.jpg', categoria: 'celebracion' },
  { archivo: 'boda-05.jpg', categoria: 'grupo' },
  { archivo: 'boda-06.jpg', categoria: 'detalles' },
  { archivo: 'boda-07.jpg', categoria: 'detalles' },
  { archivo: 'boda-08.jpg', categoria: 'flores' },
  { archivo: 'boda-09.jpg', categoria: 'familia' },
  { archivo: 'boda-10.jpg', categoria: 'grupo' },
  { archivo: 'boda-11.jpg', categoria: 'grupo' },
  { archivo: 'boda-12.jpg', categoria: 'parejas' },
  { archivo: 'boda-13.jpg', categoria: 'parejas' },
  { archivo: 'boda-14.jpg', categoria: 'detalles' },
  { archivo: 'boda-15.jpg', categoria: 'flores' },
  { archivo: 'boda-16.jpg', categoria: 'parejas' },
  { archivo: 'boda-17.jpg', categoria: 'parejas' },
  { archivo: 'boda-18.jpg', categoria: 'momentos' },
  { archivo: 'boda-19.jpg', categoria: 'parejas' },
  { archivo: 'boda-20.jpg', categoria: 'parejas' },
  { archivo: 'boda-21.jpg', categoria: 'detalles' },
  { archivo: 'boda-22.jpg', categoria: 'flores' },
  { archivo: 'boda-23.jpg', categoria: 'detalles' },
  { archivo: 'boda-24.jpg', categoria: 'detalles' },
  { archivo: 'boda-25.jpg', categoria: 'flores' },
  { archivo: 'boda-26.jpg', categoria: 'parejas' },
  { archivo: 'boda-27.jpg', categoria: 'grupo' },
  { archivo: 'boda-28.jpg', categoria: 'familia' },
  { archivo: 'boda-29.jpg', categoria: 'parejas' },
  { archivo: 'boda-30.jpg', categoria: 'parejas' },
  { archivo: 'boda-31.jpg', categoria: 'anillos' },
  { archivo: 'boda-32.jpg', categoria: 'anillos' },
  { archivo: 'boda-33.jpg', categoria: 'mascotas' },
  { archivo: 'boda-34.jpg', categoria: 'grupo' },
  { archivo: 'boda-35.jpg', categoria: 'grupo' },
  { archivo: 'boda-36.jpg', categoria: 'momentos' },
  { archivo: 'boda-37.jpg', categoria: 'grupo' },
  { archivo: 'boda-38.jpg', categoria: 'celebracion' },
  { archivo: 'boda-39.jpg', categoria: 'parejas' },
  { archivo: 'boda-40.jpg', categoria: 'parejas' },
  { archivo: 'boda-41.jpg', categoria: 'grupo' },
  { archivo: 'boda-42.jpg', categoria: 'grupo' },
  { archivo: 'boda-43.jpg', categoria: 'celebracion' },
  { archivo: 'boda-44.jpg', categoria: 'grupo' },
  { archivo: 'boda-45.jpg', categoria: 'celebracion' },
  { archivo: 'boda-46.jpg', categoria: 'celebracion' },
  { archivo: 'boda-47.jpg', categoria: 'paisajes' },
  { archivo: 'boda-48.jpg', categoria: 'paisajes' },
  { archivo: 'boda-49.jpg', categoria: 'celebracion' },
  { archivo: 'boda-50.jpg', categoria: 'celebracion' },
  { archivo: 'boda-51.jpg', categoria: 'celebracion' },
  { archivo: 'boda-52.jpg', categoria: 'celebracion' },
  { archivo: 'boda-53.jpg', categoria: 'anillos' },
  { archivo: 'boda-54.jpg', categoria: 'celebracion' },
  { archivo: 'boda-55.jpg', categoria: 'celebracion' },
  { archivo: 'boda-56.jpg', categoria: 'celebracion' },
  { archivo: 'boda-57.jpg', categoria: 'momentos' },
  { archivo: 'boda-58.jpg', categoria: 'anillos' },
  { archivo: 'boda-59.jpg', categoria: 'anillos' },
];

// Selección curada para la portada del portfolio (vista previa, no todas).
const PORTFOLIO_DESTACADO = [
  'boda-13.jpg', 'boda-32.jpg', 'boda-08.jpg', 'boda-37.jpg',
  'boda-47.jpg', 'boda-02.jpg', 'boda-58.jpg', 'boda-33.jpg',
  'boda-09.jpg', 'boda-45.jpg', 'boda-06.jpg', 'boda-40.jpg',
];

// Las 4 imágenes de la portada, en este orden exacto.
const FOTOS_HERO = ['boda-06.jpg', 'boda-32.jpg', 'boda-58.jpg', 'boda-13.jpg'];
