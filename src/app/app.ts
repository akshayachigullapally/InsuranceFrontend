import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { restoreSession } from './features/state/auth/auth.actions';
import { TokenStorageService } from './core/services/token-storage.service';
import { ToastHostComponent } from './shared/components/toast/toast-host.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHostComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  constructor(
    private readonly store: Store,
    private readonly tokenStorage: TokenStorageService,
  ) {}

  ngOnInit(): void {
    if (this.tokenStorage.hasTokens()) {
      this.store.dispatch(restoreSession());
    }
  }
}