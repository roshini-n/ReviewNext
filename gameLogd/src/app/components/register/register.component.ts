import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, MatIconModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
    AuthService = inject(AuthService);
    fb = inject(FormBuilder);
    router = inject(Router);
    themeService = inject(ThemeService);

    form = this.fb.nonNullable.group({
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
    });
    errorMessage: string | null = null;
    currentTheme: string = 'light';
    showPassword: boolean = false;

    ngOnInit() {
        this.themeService.theme$.subscribe(theme => {
            this.currentTheme = theme;
        });
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    onSubmit(): void {
        if (this.form.valid) {
            const rawForm = this.form.getRawValue();
            this.AuthService.register(rawForm.email, rawForm.username, rawForm.password).subscribe({
                next: () => {
                    this.router.navigateByUrl('/');
                },
                error: (err) => {
                    this.errorMessage = err.code;
                }
            });
        }
    }
}