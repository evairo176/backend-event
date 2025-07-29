import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { db } from '../../database/database';

dayjs.extend(isoWeek);

export type TimeFilter =
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'all';

export class Dashboard {
  public async getOrderSummaryByTime(filter: TimeFilter) {
    const now = dayjs();
    let startDate: Date | undefined;
    let groupFormat = 'DD MMM'; // default

    switch (filter) {
      case 'hourly':
        startDate = now.startOf('hour').toDate(); // hanya jam ini saja
        groupFormat = 'HH:mm';
        break;
      case 'daily':
        startDate = now.startOf('day').toDate(); // hari ini
        groupFormat = 'HH:mm'; // tampilkan per jam
        break;
      case 'weekly':
        startDate = now.startOf('week').toDate();
        groupFormat = 'DD MMM';
        break;
      case 'monthly':
        startDate = now.startOf('month').toDate();
        groupFormat = 'DD MMM';
        break;
      case 'yearly':
        startDate = now.startOf('year').toDate();
        groupFormat = 'MMM'; // Per bulan (nama bulan)
        break;
      case 'all':
        // Jangan batasi startDate, tapi group per bulan-tahun
        startDate = undefined;
        groupFormat = 'DD MMM YYYY';
        break;
    }

    const orders = await db.order.findMany({
      where: {
        status: 'COMPLETED',
        ...(startDate && {
          createdAt: {
            gte: startDate,
          },
        }),
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const result: Record<string, { total: number; count: number }> = {};

    for (const order of orders) {
      const key = dayjs(order.createdAt).format(groupFormat);

      if (!result[key]) {
        result[key] = { total: 0, count: 0 };
      }

      result[key].total += order.total;
      result[key].count += 1;
    }

    const formatted = Object.entries(result).map(
      ([date, { total, count }]) => ({
        date,
        total,
        count,
      }),
    );

    formatted.sort(
      (a, b) =>
        dayjs(a.date, groupFormat).valueOf() -
        dayjs(b.date, groupFormat).valueOf(),
    );

    return formatted;
  }
}
