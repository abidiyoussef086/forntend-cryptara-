import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket;
  private connected = false;

  constructor() {
    this.socket = io(environment.wsUrl, {
      withCredentials: true,
      transports: ['websocket'],
      autoConnect: false,
    });
  }

  connect(): void {
    if (!this.connected) {
      this.socket.connect();
      this.connected = true;

      this.socket.on('connect', () => console.log('✅ Socket.IO connected'));
      this.socket.on('disconnect', () => console.log('🔌 Socket.IO disconnected'));
    }
  }

  disconnect(): void {
    this.socket.disconnect();
    this.connected = false;
  }

  subscribe(symbols: string[]): void {
    this.socket.emit('subscribe', symbols);
  }

  unsubscribe(symbols: string[]): void {
    this.socket.emit('unsubscribe', symbols);
  }

  onTicker(symbol: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('ticker', (data) => {
        if (data.symbol === symbol.toUpperCase()) observer.next(data);
      });
    });
  }

  onOrderBook(symbol: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('orderbook', (data) => {
        if (data.symbol === symbol.toUpperCase()) observer.next(data);
      });
    });
  }

  onTrade(symbol: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('trade', (data) => {
        if (data.symbol === symbol.toUpperCase()) observer.next(data);
      });
    });
  }

  // Generic listener
  on(event: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(event, (data) => observer.next(data));
    });
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
