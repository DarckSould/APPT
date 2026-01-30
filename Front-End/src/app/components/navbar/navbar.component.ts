import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnDestroy {
  menuOpen = false;
  isLoggedIn = false;
  isMobile = window.innerWidth < 768;

  private subscription!: Subscription;

  constructor(private auth: AuthService) {
    this.subscription = this.auth.currentUser$.subscribe(user => {
      console.log('Navbar user:', user);
      this.isLoggedIn = !!user;
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
