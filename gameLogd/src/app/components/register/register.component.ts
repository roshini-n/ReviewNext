import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
    AuthService = inject(AuthService);
    fb = inject(FormBuilder);
    router = inject(Router);

    form = this.fb.nonNullable.group({
        username: ['', Validators.required],
        email: ['', Validators.required],
        password: ['', Validators.required],
    });
    errorMessage: string | null = null;

    onSubmit(): void {
        const rawForm = this.form.getRawValue();
        this.AuthService.register(rawForm.email, rawForm.username, rawForm.password).subscribe({next: () => {this.router.navigateByUrl('/');}, error: (err) => { this.errorMessage = err.code; }});
    }
}