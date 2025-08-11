import { ErrorCode } from '../../cummon/enums/error-code.enum';
import {
  IPaginationQuery,
  IScanVoucher,
} from '../../cummon/interface/voucher.interface';
import { BadRequestException } from '../../cummon/utils/catch-errors';
import { logScanTx } from '../../cummon/utils/log-scan-voucher';
import { maskCode } from '../../cummon/utils/mask-code';
import { db } from '../../database/database';

export class VoucherService {
  public async scanVoucher({
    code,
    scannedById,
    device,
    location,
    companyId,
  }: IScanVoucher) {
    return db.$transaction(async (tx) => {
      // Cari voucher
      const voucher = await tx.voucherTicket.findUnique({
        where: { code: code },
        include: {
          ticket: {
            include: {
              event: {
                include: {
                  createdBy: true,
                },
              },
            },
          },
        },
      });

      if (!voucher) {
        await logScanTx(
          db,
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

      if (voucher?.ticket?.event?.createdBy?.companyId !== companyId) {
        await logScanTx(
          db,
          voucher.id,
          scannedById,
          'FAILED',
          'Voucher ini tidak termasuk di dalam event anda',
          location,
          device,
        );
        throw new BadRequestException(
          'Voucher ini tidak termasuk di dalam event anda',
          ErrorCode.VERIFICATION_ERROR,
        );
      }

      if (voucher.isUsed) {
        await logScanTx(
          db,
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
        db,
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

  public async findOneByCode(code: string, scannedById: string) {
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
      await logScanTx(
        db,
        null,
        scannedById,
        'FAILED',
        'Voucher tidak ditemukan',
        '',
        '',
      );
      return {
        success: false,
        message: 'Voucher tidak ditemukan',
        data: null,
      };
    }

    if (voucher.isUsed) {
      await logScanTx(
        db,
        voucher.id,
        scannedById,
        'FAILED',
        'Voucher sudah digunakan',
        '',
        '',
      );
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

  public async findAllByUserId({
    page = 1,
    limit = 10,
    search,
    userId,
  }: IPaginationQuery) {
    const query: any = {
      scannedById: userId,
    };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    if (search) {
      query.OR = [
        // {
        //   name: {
        //     contains: search,
        //     mode: 'insensitive',
        //   },
        // },
      ];
    }

    const [scanHistories, total] = await Promise.all([
      db.ticketScanHistory.findMany({
        where: query,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          voucher: {
            include: {
              ticket: {
                include: {
                  event: true,
                },
              },
            },
          },
        },
      }),
      db.ticketScanHistory.count({
        where: query,
      }),
    ]);

    // bikin field baru `codeMasked` (biar code asli tetap ada)
    const result = scanHistories.map((r) => ({
      ...r,
      voucher: r.voucher
        ? { ...r.voucher, code: maskCode(r.voucher.code) }
        : null,
    }));

    return {
      scanHistories: result,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    };
  }
}
