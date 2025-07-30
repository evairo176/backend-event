import axios from 'axios';
import { config } from '../../config/app.config';
import { BadRequestException } from './catch-errors';
import dayjs from 'dayjs';

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
      const startTime = dayjs().format('YYYY-MM-DD HH:mm:ss') + ' +0700';
      const result = await axios.post<TypeResponseMidtrans>(
        `${config.MIDTRANS.TRANSACTION_URL}`,
        {
          ...payload,
          credit_card: {
            secure: true,
          },
          callbacks: {
            finish: `${config.MIDTRANS.FINISH_REDIRECT_URL}`,
            error: `${config.MIDTRANS.FINISH_REDIRECT_URL}?errorCJ=true`,
          },
          is_custom_expiry: true,
          expiry: {
            start_time: startTime, // waktu mulai sekarang
            unit: 'minute',
            duration: 2, // expired dalam 2 menit
          },
        },
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

      return result?.data;
    } catch (error: any) {
      console.log(error?.response?.data || error);
      throw new BadRequestException('Failed to create payment link');
    }
  }
}
