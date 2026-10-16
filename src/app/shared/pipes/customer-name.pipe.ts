import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserService } from '../../features/services/user.service';

/** Looks up a customer's full name by id: `{{ customerId | customerName | async }}`. */
@Pipe({ name: 'customerName' })
export class CustomerNamePipe implements PipeTransform {
  constructor(private readonly userService: UserService) {}

  transform(customerId: number | null | undefined): Observable<string | null> {
    return customerId ? this.userService.getUserName(customerId) : of(null);
  }
}
