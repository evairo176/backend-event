type DataPoint = {
  x: number;
  y: number;
  label: 'Bad' | 'Good';
};

export const dataTraining: DataPoint[] = [
  { x: 1, y: 4, label: 'Bad' },
  { x: 2, y: 6, label: 'Good' },
  { x: 3, y: 3, label: 'Good' },
  { x: 6, y: 7, label: 'Bad' },
  { x: 7, y: 3, label: 'Bad' },
  { x: 4, y: 4, label: 'Good' },
];

const euclideanDistance = (
  a: { x: number; y: number },
  b: { x: number; y: number },
): number => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};

export const knnClassify = (
  data: DataPoint[],
  point: { x: number; y: number },
  k: number,
): 'Bad' | 'Good' => {
  // Hitung jarak semua titik ke point yang ingin diklasifikasikan
  const distances = data.map((item) => ({
    ...item,
    distance: euclideanDistance(item, point),
  }));

  // Urutkan berdasarkan jarak terdekat
  distances.sort((a, b) => a.distance - b.distance);

  // Ambil k tetangga terdekat
  const neighbors = distances.slice(0, k);

  // Hitung jumlah label "Bad" dan "Good"
  const count = neighbors.reduce(
    (acc, curr) => {
      acc[curr.label]++;
      return acc;
    },
    { Bad: 0, Good: 0 },
  );

  // Tentukan hasil klasifikasi berdasarkan suara terbanyak
  return count.Good > count.Bad ? 'Good' : 'Bad';
};
