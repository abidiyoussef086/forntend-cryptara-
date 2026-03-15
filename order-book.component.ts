import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-order-book',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-book.component.html',
  styleUrls: ['./order-book.component.scss'],
})
export class OrderBookComponent implements OnInit, OnDestroy, OnChanges {
  @Input() symbol = 'BTCUSDT';

  asks: { price: string; qty: string; total?: number }[] = [];
  bids: { price: string; qty: string; total?: number }[] = [];
  spread = '0.00';
  private sub?: Subscription;

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.subscribe();
  }

  ngOnChanges(): void {
    this.asks = [];
    this.bids = [];
    if (this.sub) this.sub.unsubscribe();
    this.subscribe();
  }

  private subscribe(): void {
    this.sub = this.socketService.onOrderBook(this.symbol).subscribe((data) => {
      this.asks = data.asks.slice(0, 12).reverse();
      this.bids = data.bids.slice(0, 12);
      this.calcSpread();
      this.calcDepth();
    });
  }

  private calcSpread(): void {
    if (this.asks.length && this.bids.length) {
      const bestAsk = parseFloat(this.asks[this.asks.length - 1].price);
      const bestBid = parseFloat(this.bids[0].price);
      this.spread = (bestAsk - bestBid).toFixed(2);
    }
  }

  private calcDepth(): void {
    // Calculate running totals for depth bar widths
    let askTotal = 0;
    this.asks.forEach((a) => { askTotal += parseFloat(a.qty); a.total = askTotal; });

    let bidTotal = 0;
    this.bids.forEach((b) => { bidTotal += parseFloat(b.qty); b.total = bidTotal; });

    const maxTotal = Math.max(askTotal, bidTotal);
    this.asks.forEach((a) => { (a as any).pct = ((a.total! / maxTotal) * 100).toFixed(1); });
    this.bids.forEach((b) => { (b as any).pct = ((b.total! / maxTotal) * 100).toFixed(1); });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
