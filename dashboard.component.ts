import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar.component';
import { WatchlistComponent } from '../watchlist/watchlist.component';
import { OrderBookComponent } from '../order-book/order-book.component';
import { RecentTradesComponent } from '../recent-trades/recent-trades.component';
import { PortfolioComponent } from '../portfolio/portfolio.component';
import { SocketService } from '../../services/socket.service';
import { TradingService } from '../../services/trading.service';
import { AuthService } from '../../services/auth.service';

const SYMBOLS = ['btcusdt','ethusdt','solusdt','bnbusdt','xrpusdt','adausdt'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavbarComponent,
    WatchlistComponent,
    OrderBookComponent,
    RecentTradesComponent,
    PortfolioComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  selectedSymbol = 'BTCUSDT';
  ticker: any = null;
  orderForm: FormGroup;
  orderSide: 'buy' | 'sell' = 'buy';
  orderType: 'market' | 'limit' = 'market';
  orderLoading = false;
  orderSuccess = '';
  orderError = '';
  activeTab: 'orders' | 'portfolio' = 'portfolio';
  openOrders: any[] = [];

  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private socketService: SocketService,
    private tradingService: TradingService,
    private authService: AuthService
  ) {
    this.orderForm = this.fb.group({
      quantity: ['', [Validators.required, Validators.min(0.0001)]],
      price: [''],
    });
  }

  ngOnInit(): void {
    this.socketService.connect();
    this.socketService.subscribe(SYMBOLS);

    // Subscribe to ticker for selected symbol
    this.subscribeTicker();

    // Load open orders
    this.loadOrders();
  }

  private subscribeTicker(): void {
    const sub = this.socketService.onTicker(this.selectedSymbol).subscribe((data) => {
      this.ticker = data;
    });
    this.subs.push(sub);
  }

  onSymbolSelected(symbol: string): void {
    this.selectedSymbol = symbol;
    this.ticker = null;
    this.orderForm.reset();
    this.orderSuccess = '';
    this.orderError = '';
    // Re-subscribe ticker for new symbol
    this.subs.forEach((s) => s.unsubscribe());
    this.subs = [];
    this.subscribeTicker();
  }

  setSide(side: 'buy' | 'sell'): void {
    this.orderSide = side;
    this.orderSuccess = '';
    this.orderError = '';
  }

  setType(type: 'market' | 'limit'): void {
    this.orderType = type;
    if (type === 'market') {
      this.orderForm.get('price')?.clearValidators();
    } else {
      this.orderForm.get('price')?.setValidators([Validators.required, Validators.min(0)]);
    }
    this.orderForm.get('price')?.updateValueAndValidity();
  }

  get estimatedTotal(): number {
    const qty = parseFloat(this.orderForm.get('quantity')?.value || '0');
    const price = this.orderType === 'market'
      ? parseFloat(this.ticker?.price || '0')
      : parseFloat(this.orderForm.get('price')?.value || '0');
    return qty * price;
  }

  placeOrder(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    this.orderLoading = true;
    this.orderSuccess = '';
    this.orderError = '';

    const payload: any = {
      symbol: this.selectedSymbol,
      type: this.orderType,
      side: this.orderSide,
      quantity: parseFloat(this.orderForm.get('quantity')!.value),
    };

    if (this.orderType === 'limit') {
      payload.price = parseFloat(this.orderForm.get('price')!.value);
    }

    this.tradingService.placeOrder(payload).subscribe({
      next: () => {
        this.orderSuccess = `${this.orderSide.toUpperCase()} order placed successfully!`;
        this.orderForm.reset();
        this.orderLoading = false;
        this.loadOrders();
      },
      error: (err) => {
        this.orderError = err.error?.message || 'Order failed. Try again.';
        this.orderLoading = false;
      },
    });
  }

  loadOrders(): void {
    this.tradingService.getOrders({ status: 'open' }).subscribe((res: any) => {
      this.openOrders = res.orders;
    });
  }

  cancelOrder(id: string): void {
    this.tradingService.cancelOrder(id).subscribe(() => this.loadOrders());
  }

  isPositive(val: string | number): boolean {
    return parseFloat(String(val)) >= 0;
  }

  get baseCurrency(): string {
    return this.selectedSymbol.replace('USDT', '');
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
    this.subs.forEach((s) => s.unsubscribe());
  }
}
