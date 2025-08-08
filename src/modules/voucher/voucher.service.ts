import { ErrorCode } from '../../cummon/enums/error-code.enum';
import { IScanVoucher } from '../../cummon/interface/voucher.interface';
import { BadRequestException } from '../../cummon/utils/catch-errors';
import { logScanTx } from '../../cummon/utils/log-scan-voucher';
import { db } from '../../database/database';

export class VoucherService {
  public async scanVoucher({
    code,
    scannedById,
    device,
    location,
  }: IScanVoucher) {
    return db.$transaction(async (tx) => {
      // Cari voucher
      const voucher = await tx.voucherTicket.findUnique({
        where: { code: code },
        include: { ticket: true },
      });

      if (!voucher) {
        await logScanTx(
          tx,
          null,
          scannedById,
          'FAILED',
          'Voucher tidak ditemukan',
          location,
          device,
        );
        throw new BadRequestException(
          'Voucher not exists',
          ErrorCode.RESOURCE_NOT_FOUND,
        );
      }

      if (voucher.isUsed) {
        await logScanTx(
          tx,
          voucher.id,
          scannedById,
          'FAILED',
          'Voucher sudah digunakan',
          location,
          device,
        );
        throw new BadRequestException(
          'Voucher sudah digunakan',
          ErrorCode.VERIFICATION_ERROR,
        );
      }

      // Tandai voucher sebagai digunakan
      await tx.voucherTicket.update({
        where: { id: voucher.id },
        data: { isUsed: true },
      });

      // Simpan riwayat scan sukses
      await logScanTx(
        tx,
        voucher.id,
        scannedById,
        'SUCCESS',
        'Voucher valid',
        location,
        device,
      );

      return {
        message: `Voucher valid untuk tiket: ${voucher.ticket?.name}`,
      };
    });
  }

  public async findOneByCode(code: string) {
    const voucher = await db.voucherTicket.findFirst({
      where: {
        code,
      },
      include: {
        ticket: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!voucher) {
      return {
        success: false,
        message: 'Voucher tidak ditemukan',
        data: null,
      };
    }

    if (voucher.isUsed) {
      return {
        success: false,
        message: 'Voucher sudah digunakan',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Voucher valid',
      data: voucher,
    };
  }
}
