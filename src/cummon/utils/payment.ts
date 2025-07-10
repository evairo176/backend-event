import axios from 'axios';
import { config } from '../../config/app.config';
import { BadRequestException } from './catch-errors';

export interface Payment {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
}

export type TypeResponseMidtrans = {
  token: string;
  rediredUrl: string;
};

export default {
  async createLink(payload: Payment): Promise<TypeResponseMidtrans> {
    const result = await axios.post<TypeResponseMidtrans>(
      `${config.MIDTRANS.TRANSACTION_URL}`,
      payload,
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
  },
};
