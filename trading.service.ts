import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrderPayload {
  symbol: string;
  type: 'market' | 'limit';
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;
}

@Injectable({ providedIn: 'root' })
export class TradingService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Market ──────────────────────────────────────────────────
  getTickers(): Observable<any> {
    return this.http.get(`${this.api}/market/tickers`);
  }

  getTicker(symbol: string): Observable<any> {
    return this.http.get(`${this.api}/market/ticker/${symbol}`);
  }

  // ── Orders ──────────────────────────────────────────────────
  getOrders(params?: any): Observable<any> {
    return this.http.get(`${this.api}/orders`, { params });
  }

  placeOrder(payload: OrderPayload): Observable<any> {
    return this.http.post(`${this.api}/orders`, payload);
  }

  cancelOrder(orderId: string): Observable<any> {
    return this.http.delete(`${this.api}/orders/${orderId}`);
  }

  // ── Portfolio ───────────────────────────────────────────────
  getPortfolio(): Observable<any> {
    return this.http.get(`${this.api}/portfolio`);
  }

  // ── User ────────────────────────────────────────────────────
  getProfile(): Observable<any> {
    return this.http.get(`${this.api}/user/profile`);
  }

  getTransactions(params?: any): Observable<any> {
    return this.http.get(`${this.api}/user/transactions`, { params });
  }
}
