// lib/errorCleaner.ts
import cron from 'node-cron';
import { db } from '../database/database';

export function scheduleErrorLogCleanup() {
  // setiap 1 jam scheduler akan berjalan
  cron.schedule('0 * * * *', async () => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 hari lalu

    try {
      const result = await db.errorLog.deleteMany({
        where: {
          createdAt: {
            lt: oneWeekAgo, // hanya hapus yang lebih lama dari 7 hari
          },
        },
      });

      console.log(`🧹 ErrorLog cleanup: ${result.count} records deleted.`);
    } catch (error) {
      console.error('❌ Gagal menghapus ErrorLog:', error);
    }
  });

  console.log(
    '⏱️ Cron job ErrorLog cleanup aktif (hapus data lebih dari 7 hari setiap 1 jam)',
  );
}
