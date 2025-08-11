import axios from 'axios';
import { config } from '../../config/app.config';
import { BadRequestException } from './catch-errors';

export interface Payment {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };

  credit_card?: {
    secure: boolean;
  };
  callbacks?: {
    finish: string;
  };
}

export type TypeResponseMidtrans = {
  token: string;
  redirect_url: string;
};

export class PaymentMidtrans {
  public async createLink(payload: Payment): Promise<TypeResponseMidtrans> {
    try {
      const body = {
        ...payload,
        credit_card: { secure: true },
        callbacks: {
          finish: `${config.MIDTRANS.FINISH_REDIRECT_URL}`,
          error: `${config.MIDTRANS.FINISH_REDIRECT_URL}?errorCJ=true`,
        },
        // ⬇️ Set masa bayar 1 jam
        expiry: {
          unit: 'hour', // "minute" | "hour" | "day"
          duration: 1, // 1 jam
          // start_time opsional; kalau tidak diisi -> pakai waktu charge
        },
        // (opsional) samakan masa hidup halaman Snap jadi 1 jam juga
        page_expiry: {
          unit: 'hour',
          duration: 1,
        },
      };

      const result = await axios.post<TypeResponseMidtrans>(
        `${config.MIDTRANS.TRANSACTION_URL}`,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Basic ${Buffer.from(`${config.MIDTRANS.SERVER_KEY}:`).toString('base64')}`,
          },
        },
      );

      if (result.status !== 201) {
        throw new BadRequestException('Payment failed');
      }
      return result.data;
    } catch (error: any) {
      console.log(error?.response?.data || error);
      throw new BadRequestException('Failed to create payment link');
    }
  }
}
