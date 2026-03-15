import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradingService } from '../../../services/trading.service';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
})
export class PortfolioComponent implements OnInit {
  portfolio: any = null;
  loading = true;

  constructor(private tradingService: TradingService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.tradingService.getPortfolio().subscribe({
      next: (res: any) => {
        this.portfolio = res.portfolio;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  isPositive(val: number): boolean { return val >= 0; }
}
