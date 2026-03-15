import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TradingService } from '../../../services/trading.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  user: any = null;
  balance: number = 0;

  constructor(
    private authService: AuthService,
    private tradingService: TradingService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((u) => {
      this.user = u;
      this.balance = u?.balance ?? 0;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
