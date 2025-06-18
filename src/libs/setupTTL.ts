import { MongoClient } from 'mongodb';
import { config } from '../config/app.config';

const uri = config.DATABASE_URL!;

export async function setupTTLIndex() {
  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(); // otomatis pakai DB dari URI
  const collection = db.collection('ErrorLog');

  // Cek apakah TTL index sudah ada
  const indexes = await collection.indexes();
  const hasTTL = indexes.some(
    (i) =>
      i.name === 'createdAt_1' && i.expireAfterSeconds === 60 * 60 * 24 * 7,
  );

  if (!hasTTL) {
    await collection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 60 * 60 * 24 * 7 },
    );
    console.log('✅ TTL index for ErrorLog.createdAt dibuat');
  } else {
    console.log('ℹ️ TTL index untuk ErrorLog sudah ada');
  }

  await client.close();
}
