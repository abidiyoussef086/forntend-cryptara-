import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-recent-trades',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-trades.component.html',
  styleUrls: ['./recent-trades.component.scss'],
})
export class RecentTradesComponent implements OnInit, OnDestroy, OnChanges {
  @Input() symbol = 'BTCUSDT';

  trades: any[] = [];
  private sub?: Subscription;
  private MAX_TRADES = 30;

  constructor(private socketService: SocketService) {}

  ngOnInit(): void { this.subscribe(); }

  ngOnChanges(): void {
    this.trades = [];
    this.sub?.unsubscribe();
    this.subscribe();
  }

  private subscribe(): void {
    this.sub = this.socketService.onTrade(this.symbol).subscribe((trade) => {
      this.trades.unshift({ ...trade, flash: true });
      if (this.trades.length > this.MAX_TRADES) {
        this.trades = this.trades.slice(0, this.MAX_TRADES);
      }
      // Remove flash after animation
      setTimeout(() => { if (this.trades[0]) this.trades[0].flash = false; }, 400);
    });
  }

  formatTime(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour12: false });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
