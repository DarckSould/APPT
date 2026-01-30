import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

interface LoginResponse {
  user: any;
  accessToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://appt-z1np.onrender.com/api/auth';

  private currentUserSubject = new BehaviorSubject<any | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private initializing = false;

  constructor(private http: HttpClient) {}

  /**
   * 🔥 Se llama UNA sola vez al iniciar la app
   * (app.component / layout principal)
   */
  initAuth(): void {
    if (this.initializing) return;

    const token = this.getAccessToken();
    if (!token) return;

    this.initializing = true;

    this.getProfile().subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
        this.initializing = false;
      },
      error: () => {
        // ❗ NO limpiar sesión aquí
        // Si el refresh falla, el interceptor lo hará
        this.initializing = false;
      },
    });
  }

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/login`,
        { email, password },
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          localStorage.setItem('accessToken', res.accessToken);
          this.currentUserSubject.next(res.user);
        })
      );
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/profile`,
      { withCredentials: true }
    );
  }

  refreshToken(): Observable<{ accessToken: string }> {
    return this.http
      .post<{ accessToken: string }>(
        `${this.apiUrl}/refresh`,
        {},
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          localStorage.setItem('accessToken', res.accessToken);
        })
      );
  }

  logout() {
    return this.http
      .post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.clearSession();
        })
      );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  setAccessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  clearSession() {
    localStorage.removeItem('accessToken');
    this.currentUserSubject.next(null);
  }
}
