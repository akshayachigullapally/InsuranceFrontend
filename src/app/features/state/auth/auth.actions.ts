import { createAction, props } from '@ngrx/store';
import { AuthUser } from '../../../core/models/auth-user.model';
import { AuthResponse } from '../../../features/dtos/auth/auth-response.dto';
import { LoginRequest } from '../../../features/dtos/auth/login-request.dto';
import { RegisterRequest } from '../../../features/dtos/auth/register-request.dto';
import { UserResponse } from '../../../features/dtos/auth/user-response.dto';

export const login = createAction('[Auth] Login', props<{ request: LoginRequest }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ auth: AuthResponse }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

export const register = createAction('[Auth] Register', props<{ request: RegisterRequest }>());
export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ auth: AuthResponse }>(),
);
export const registerFailure = createAction('[Auth] Register Failure', props<{ error: string }>());

export const loadCurrentUser = createAction('[Auth] Load Current User');
export const loadCurrentUserSuccess = createAction(
  '[Auth] Load Current User Success',
  props<{ user: UserResponse; customerId?: number }>(),
);
export const loadCurrentUserFailure = createAction(
  '[Auth] Load Current User Failure',
  props<{ error: string }>(),
);

export const refreshToken = createAction('[Auth] Refresh Token');
export const refreshTokenSuccess = createAction(
  '[Auth] Refresh Token Success',
  props<{ auth: AuthResponse }>(),
);
export const refreshTokenFailure = createAction(
  '[Auth] Refresh Token Failure',
  props<{ error: string }>(),
);

export const restoreSession = createAction('[Auth] Restore Session');
export const restoreSessionSuccess = createAction(
  '[Auth] Restore Session Success',
  props<{ user: UserResponse; customerId?: number }>(),
);
export const restoreSessionFailure = createAction(
  '[Auth] Restore Session Failure',
  props<{ error: string }>(),
);

export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');
export const clearAuthError = createAction('[Auth] Clear Error');

interface UpdateProfileRequest {
  id: number;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export const updateProfile = createAction(
  '[Auth] Update Profile',
  props<{ user: UpdateProfileRequest }>(),
);

export const updateProfileSuccess = createAction(
  '[Auth] Update Profile Success',
  props<{ user: AuthUser }>(),
);

export const updateProfileFailure = createAction(
  '[Auth] Update Profile Failure',
  props<{ error: string }>(),
);
