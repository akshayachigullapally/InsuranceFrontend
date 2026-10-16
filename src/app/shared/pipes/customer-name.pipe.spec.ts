import { firstValueFrom, of } from 'rxjs';
import { UserService } from '../../features/services/user.service';
import { CustomerNamePipe } from './customer-name.pipe';

describe('CustomerNamePipe', () => {
  it('returns the customer name from the user service', async () => {
    const userService = { getUserName: vi.fn(() => of('Ravi Kumar')) } as unknown as UserService;
    const pipe = new CustomerNamePipe(userService);

    await expect(firstValueFrom(pipe.transform(6))).resolves.toBe('Ravi Kumar');
    expect(userService.getUserName).toHaveBeenCalledWith(6);
  });

  it('returns null without calling the service when there is no id', async () => {
    const userService = { getUserName: vi.fn() } as unknown as UserService;
    const pipe = new CustomerNamePipe(userService);

    await expect(firstValueFrom(pipe.transform(null))).resolves.toBeNull();
    expect(userService.getUserName).not.toHaveBeenCalled();
  });
});
