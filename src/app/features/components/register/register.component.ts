import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { register, clearAuthError } from '../../state/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../state/auth/auth.selectors';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe, RouterLink, ErrorMessageComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit, OnDestroy {
  readonly registerForm: FormGroup;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<string | null>;
  protected readonly stats: { value: string; label: string }[] = [
    { value: '1 min', label: 'to register' },
    { value: '10+', label: 'product lines' },
    { value: '24/7', label: 'live monitoring' },
  ];
  private readonly destroy$ = new Subject<void>();
  private submittedFlag = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    });
    this.loading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearAuthError());
    this.error$.pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected get fullNameControl() {
    return this.registerForm.get('fullName');
  }

  protected get emailControl() {
    return this.registerForm.get('email');
  }

  protected get passwordControl() {
    return this.registerForm.get('password');
  }

  protected submitted(): boolean {
    return this.submittedFlag;
  }

  protected onSubmit(): void {
    this.submittedFlag = true;
    if (this.registerForm.invalid) {
      return;
    }
    this.store.dispatch(register({ request: this.registerForm.value }));
  }
}