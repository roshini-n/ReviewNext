import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})

export class ResetPasswordComponent {
    AuthService = inject(AuthService);
    fb = inject(FormBuilder);
    router = inject(Router);
    
    form = this.fb.nonNullable.group({
        email: ['', Validators.required]
    });
    errorMessage: string | null = null;
    formComplete: string | null = null;

    onSubmit(): void {
        const rawForm = this.form.getRawValue();
        this.AuthService.resetPassword(rawForm.email).subscribe({next : () => { this.formComplete = "Validation Email Sent", this.errorMessage = null }, error: (err) => {this.errorMessage = err.code; }});
    }
}