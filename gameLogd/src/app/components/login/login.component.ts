import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
    AuthService = inject(AuthService);
    fb = inject(FormBuilder);
    router = inject(Router);
    
    form = this.fb.nonNullable.group({
        email: ['', Validators.required],
        password: ['', Validators.required],
    });
    errorMessage: string | null = null;

    onSubmit(): void {
        const rawForm = this.form.getRawValue();
        this.AuthService.login(rawForm.email, rawForm.password).subscribe({next: () => {this.router.navigateByUrl('/');}, error: (err) => { this.errorMessage = err.code; }});
    }
}