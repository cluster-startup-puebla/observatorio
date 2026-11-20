export type CarouselLogo = {
  name: string;
  src: string;
  width: number;
  height: number;
};

export function logoColumns(logos: CarouselLogo[], columnCount: number) {
  const columns: CarouselLogo[][] = Array.from({ length: columnCount }, () => []);
  logos.forEach((logo, index) => {
    columns[index % columnCount].push(logo);
  });
  return columns.filter((column) => column.length > 0);
}
