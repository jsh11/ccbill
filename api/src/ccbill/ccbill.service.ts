import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CcBillService {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('CCBILL_API_BASE') || 'https://api.ccbill.com';
  }

  private async getOAuthToken(clientId: string, clientSecret: string): Promise<string> {
    const url = `${this.baseUrl}/ccbill-auth/oauth/token`;
    const payload = new URLSearchParams({ grant_type: 'client_credentials' });
    const { data } = await this.http.axiosRef.post(url, payload.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      auth: { username: clientId, password: clientSecret },
    });
    return data.access_token;
  }

  async getFrontendToken(): Promise<string> {
    const id = this.config.get<string>('CCBILL_FE_CLIENT_ID');
    const secret = this.config.get<string>('CCBILL_FE_CLIENT_SECRET');
    return this.getOAuthToken(id, secret);
  }

  async getBackendToken(): Promise<string> {
    const id = this.config.get<string>('CCBILL_BE_CLIENT_ID');
    const secret = this.config.get<string>('CCBILL_BE_CLIENT_SECRET');
    return this.getOAuthToken(id, secret);
  }

  async createPaymentToken(payload: any): Promise<any> {
    const token = await this.getFrontendToken();
    const url = `${this.baseUrl}/payment-tokens/merchant-only`;
    const { data } = await this.http.axiosRef.post(url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }

  async chargePaymentToken(paymentToken: string, payload: any): Promise<any> {
    const token = await this.getBackendToken();
    const url = `${this.baseUrl}/transactions/payment-tokens/${paymentToken}`;
    const { data } = await this.http.axiosRef.post(url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }

  async chargeByPreviousTransactionId(transactionId: string, payload: any): Promise<any> {
    const token = await this.getBackendToken();
    const url = `${this.baseUrl}/transactions/previous/${transactionId}`;
    const { data } = await this.http.axiosRef.post(url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }
}
