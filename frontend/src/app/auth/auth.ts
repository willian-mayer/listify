import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { UserLogin, UserRegister } from '../models/user.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent {
  isLoginMode = true;
  loading = false;
  error = '';

  loginData: UserLogin = { email: '', password: '' };
  registerData: UserRegister = { name: '', email: '', password: '' };

  constructor(private authService: AuthService) {}

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.error = '';
  }

  onLogin(): void {
    this.loading = true;
    this.error = '';

    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Error al iniciar sesión';
      }
    });
  }

  onRegister(): void {
    this.loading = true;
    this.error = '';

    this.authService.register(this.registerData).subscribe({
      next: () => {
        // Después de registrar, hacer login automático
        this.authService.login({
          email: this.registerData.email,
          password: this.registerData.password
        }).subscribe({
          next: () => this.loading = false,
          error: (err) => {
            this.loading = false;
            this.error = 'Registro exitoso. Por favor inicia sesión.';
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Error al registrar usuario';
      }
    });
  }
}