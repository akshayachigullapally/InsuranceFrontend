import {
  CustomerSegment,
  UserResponse,
  UserStatus,
} from '../../dtos/auth/user-response.dto';

export interface UsersState {
  users: UserResponse[];
  selectedUser: UserResponse | null;
  selectedStatus: UserStatus | null;
  selectedSegment: CustomerSegment | null;
  search: string;
  isLoading: boolean;
  isSaving: boolean;
  updatingUserId: number | null;
  error: string | null;
}

export const initialUsersState: UsersState = {
  users: [],
  selectedUser: null,
  selectedStatus: null,
  selectedSegment: null,
  search: '',
  isLoading: false,
  isSaving: false,
  updatingUserId: null,
  error: null,
};