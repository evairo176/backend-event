import { PrismaClient } from '@prisma/client';

// Helper untuk insert log dalam transaction
export async function logScanTx(
  tx: any,
  voucherId: string | null,
  scannedById: string | undefined,
  status: 'SUCCESS' | 'FAILED',
  note: string,
  location?: string,
  device?: string,
) {
  await tx.ticketScanHistory.create({
    data: {
      voucherId: voucherId as string,
      scannedById,
      status,
      note,
      location,
      device,
    },
  });
}
