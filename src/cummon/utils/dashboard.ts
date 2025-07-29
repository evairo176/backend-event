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
  | 'all'
  | 'prevHourly'
  | 'prevDaily'
  | 'prevWeekly'
  | 'prevMonthly'
  | 'prevYearly';

export class Dashboard {
  public async getOrderSummaryByTime(filter: TimeFilter) {
    const now = dayjs();
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    let groupFormat = 'DD MMM'; // default

    switch (filter) {
      case 'hourly':
        startDate = now.startOf('hour').toDate();
        groupFormat = 'HH:mm';
        break;

      case 'daily':
        startDate = now.startOf('day').toDate();
        groupFormat = 'HH:mm';
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
        groupFormat = 'MMM';
        break;

      case 'all':
        startDate = undefined;
        groupFormat = 'DD MMM YYYY';
        break;

      case 'prevHourly':
        startDate = now.subtract(1, 'hour').startOf('hour').toDate();
        endDate = now.subtract(1, 'hour').endOf('hour').toDate();
        groupFormat = 'HH:mm';
        break;

      case 'prevDaily':
        startDate = now.subtract(1, 'day').startOf('day').toDate();
        endDate = now.subtract(1, 'day').endOf('day').toDate();
        groupFormat = 'HH:mm';
        break;

      case 'prevWeekly':
        startDate = now.subtract(1, 'week').startOf('week').toDate();
        endDate = now.subtract(1, 'week').endOf('week').toDate();
        groupFormat = 'DD MMM';
        break;

      case 'prevMonthly':
        startDate = now.subtract(1, 'month').startOf('month').toDate();
        endDate = now.subtract(1, 'month').endOf('month').toDate();
        groupFormat = 'DD MMM';
        break;

      case 'prevYearly':
        startDate = now.subtract(1, 'year').startOf('year').toDate();
        endDate = now.subtract(1, 'year').endOf('year').toDate();
        groupFormat = 'MMM';
        break;
    }

    const orders = await db.order.findMany({
      where: {
        status: 'COMPLETED',
        ...(startDate &&
          endDate && {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
        ...(startDate &&
          !endDate && {
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
