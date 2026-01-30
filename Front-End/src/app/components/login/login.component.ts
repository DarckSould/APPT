import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,          
    ReactiveFormsModule    
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup;
  errorMessage: string | null = null; // <-- agregar aquí

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
login() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      this.auth.login(email, password).subscribe({
        next: () => {
          this.errorMessage = null; // limpiar error
          this.router.navigate(['/dashboard']); // redirigir al dashboard
        },
        error: err => {
          this.errorMessage = err.error?.message || err.message; // guardar el mensaje de error
        }
      });
    }
  }
}