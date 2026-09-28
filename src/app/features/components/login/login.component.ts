import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { login, clearAuthError } from '../../state/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../state/auth/auth.selectors';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe, RouterLink, ErrorMessageComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, OnDestroy {
  readonly loginForm: FormGroup;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<string | null>;
  private readonly destroy$ = new Subject<void>();
  private submittedFlag = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
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

  protected get emailControl() {
    return this.loginForm.get('email');
  }

  protected get passwordControl() {
    return this.loginForm.get('password');
  }

  protected submitted(): boolean {
    return this.submittedFlag;
  }

  protected onSubmit(): void {
    this.submittedFlag = true;
    if (this.loginForm.invalid) {
      return;
    }
    this.store.dispatch(login({ request: this.loginForm.value }));
  }
}
