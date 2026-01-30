import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user$: Observable<any>;

  constructor(private auth: AuthService) {
    this.user$ = this.auth.currentUser$; // Observable que siempre refleja el user actual
  }

  ngOnInit(): void {
    this.auth.initAuth(); // Inicializa user desde token
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

  getInitials(name?: string): string {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.length > 1
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0][0];
  }
}
