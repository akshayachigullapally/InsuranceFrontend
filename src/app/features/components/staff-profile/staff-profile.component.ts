import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserResponse } from '../../dtos/auth/user-response.dto';

/** Read-only account page for admins, underwriters and claims officers. */
@Component({
  selector: 'app-staff-profile',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './staff-profile.component.html',
})
export class StaffProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);

  protected readonly user = signal<UserResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Your profile could not be loaded. Please try again.');
        this.loading.set(false);
      },
    });
  }

  protected roleLabel(role: string): string {
    return role.replace(/^ROLE_/, '').replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  protected initials(name: string): string {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');
  }

  protected dashboardPath(role: string): string {
    if (role === 'ROLE_UNDERWRITER') return '/underwriter/dashboard';
    if (role === 'ROLE_CLAIMS_OFFICER') return '/claims-officer/dashboard';
    return '/admin/dashboard';
  }
}
