import { format } from 'date-fns';
import { db } from '../../database/database';
import { customAlphabet, nanoid } from 'nanoid';

export async function generateOrderId(prefixValue?: string): Promise<string> {
  const code = prefixValue ?? 'ORD';
  const now = new Date();
  // Allowed characters: a-z and 1-9 + 0 (no special characters or uppercase)
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

  // Generate function with desired length, e.g. 10 characters
  const nanoid = customAlphabet(alphabet, 8);

  // Generate a new ID
  const id = nanoid();

  const dateCode = format(now, 'yyMMdd');
  const prefix = `${code}-${dateCode}`; // contoh: ORD-250710

  // const lastOrder = await db.order.findFirst({
  //   where: {
  //     orderId: {
  //       startsWith: prefix,
  //     },
  //   },
  //   orderBy: {
  //     createdAt: 'desc', // atau orderId: 'desc' jika format bisa di-sort
  //   },
  //   select: {
  //     orderId: true,
  //   },
  // });

  // let lastNumber = 0;

  // if (lastOrder?.orderId) {
  //   const parts = lastOrder.orderId.split('-'); // contoh: ['ORD', '250710', '00017']
  //   const lastPart = parts[2];
  //   if (lastPart && /^\d+$/.test(lastPart)) {
  //     lastNumber = parseInt(lastPart, 10);
  //   }
  // }

  // const newNumber = lastNumber + 1;
  // const uniqId = String(newNumber).padStart(5, '0'); // hasil: 00018
  const orderId = `${prefix}-${id}`;

  return orderId;
}
