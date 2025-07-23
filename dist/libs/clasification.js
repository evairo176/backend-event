"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.knnClassify = exports.dataTraining = void 0;
exports.dataTraining = [
    { x: 1, y: 4, label: 'Bad' },
    { x: 2, y: 6, label: 'Good' },
    { x: 3, y: 3, label: 'Good' },
    { x: 6, y: 7, label: 'Bad' },
    { x: 7, y: 3, label: 'Bad' },
    { x: 4, y: 4, label: 'Good' },
];
const euclideanDistance = (a, b) => {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};
const knnClassify = (data, point, k) => {
    // Hitung jarak semua titik ke point yang ingin diklasifikasikan
    const distances = data.map((item) => (Object.assign(Object.assign({}, item), { distance: euclideanDistance(item, point) })));
    // Urutkan berdasarkan jarak terdekat
    distances.sort((a, b) => a.distance - b.distance);
    // Ambil k tetangga terdekat
    const neighbors = distances.slice(0, k);
    // Hitung jumlah label "Bad" dan "Good"
    const count = neighbors.reduce((acc, curr) => {
        acc[curr.label]++;
        return acc;
    }, { Bad: 0, Good: 0 });
    // Tentukan hasil klasifikasi berdasarkan suara terbanyak
    return count.Good > count.Bad ? 'Good' : 'Bad';
};
exports.knnClassify = knnClassify;
