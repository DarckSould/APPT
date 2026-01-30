import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: any;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.getProfile().subscribe({
      next: (data) => (this.user = data),
      error: (err) => {
        console.error(err);
        if (err.status === 401) {
          this.auth.clearSession();
          window.location.href = '/login';
        }
      },
    });
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => (window.location.href = '/login'),
      error: () => {
        this.auth.clearSession();
        window.location.href = '/login';
      },
    });
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.length > 1
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0][0];
  }
}
