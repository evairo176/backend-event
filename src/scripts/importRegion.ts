import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { db } from '../database/database';

async function importCSV<T>(filePath: string): Promise<T[]> {
  const results: T[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser({ headers: false }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function main() {
  // ✅ Urutan yang benar
  await db.village.deleteMany({});
  await db.district.deleteMany({});
  await db.regency.deleteMany({});
  await db.province.deleteMany({});
  // === Import Provinces (Bulk) ===
  const provinces = await importCSV<[string, string]>(
    path.join(__dirname, '../data/provinces.csv'),
  );
  await db.province.createMany({
    data: provinces.map((row) => {
      const [code, name] = Object.values(row);
      return { code, name };
    }),
  });

  // === Import Regencies (Bulk) ===
  const regenciesRaw = await importCSV<[string, string, string]>(
    path.join(__dirname, '../data/regencies.csv'),
  );

  const provincesInDb = await db.province.findMany({
    select: { id: true, code: true },
  });
  const provinceMap = new Map(provincesInDb.map((p) => [p.code, p.id]));

  const regenciesData: any = regenciesRaw.map((row) => {
    const [code, provinceCode, name] = Object.values(row);
    return {
      code,
      name,
      provinceId: provinceMap.get(provinceCode),
    };
  });

  await db.regency.createMany({
    data: regenciesData,
  });

  // === Import Districts (Bulk) ===
  const districtsRaw = await importCSV<[string, string, string]>(
    path.join(__dirname, '../data/districts.csv'),
  );

  const regenciesInDb = await db.regency.findMany({
    select: { id: true, code: true },
  });
  const regencyMap = new Map(regenciesInDb.map((r) => [r.code, r.id]));

  const districtsData: any = districtsRaw
    .map((row) => {
      const [code, regencyCode, name] = Object.values(row);
      return {
        code,
        name,
        regencyId: regencyMap.get(regencyCode),
      };
    })
    .filter((d) => d.regencyId);

  await db.district.createMany({
    data: districtsData,
  });

  // === Import Villages (Bulk) ===
  const villagesRaw = await importCSV<[string, string, string]>(
    path.join(__dirname, '../data/villages.csv'),
  );

  const districtsInDb = await db.district.findMany({
    select: { id: true, code: true },
  });
  const districtMap = new Map(districtsInDb.map((d) => [d.code, d.id]));
  const villagesData: any = villagesRaw
    .map((row) => {
      const [code, districtCode, name] = Object.values(row);
      return {
        code,
        name,
        districtId: districtMap.get(districtCode),
      };
    })
    .filter((v) => v.districtId);

  await db.village.createMany({
    data: villagesData,
  });

  console.log('✅ Import selesai dengan createMany!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
  })
  .finally(() => db.$disconnect());
