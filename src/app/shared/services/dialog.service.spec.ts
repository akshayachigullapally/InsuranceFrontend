import { TestBed } from '@angular/core/testing';
import { DialogService } from './dialog.service';

describe('DialogService', () => {
  let service: DialogService;

  beforeEach(() => {
    service = TestBed.inject(DialogService);
  });

  it('resolves true when a confirm dialog is accepted', async () => {
    const result = service.confirm({ title: 'Archive?' });
    expect(service.current()?.title).toBe('Archive?');
    service.close('');
    await expect(result).resolves.toBe(true);
    expect(service.current()).toBeNull();
  });

  it('resolves false when a confirm dialog is cancelled', async () => {
    const result = service.confirm({ title: 'Archive?' });
    service.close(null);
    await expect(result).resolves.toBe(false);
  });

  it('resolves the typed text for a prompt', async () => {
    const result = service.prompt({ title: 'Why?', inputLabel: 'Reason', defaultValue: 'Bank rejected' });
    expect(service.current()?.kind).toBe('prompt');
    service.close('Account closed');
    await expect(result).resolves.toBe('Account closed');
  });

  it('cancels an open dialog when another one opens', async () => {
    const first = service.confirm({ title: 'First' });
    const second = service.confirm({ title: 'Second' });
    await expect(first).resolves.toBe(false);
    expect(service.current()?.title).toBe('Second');
    service.close('');
    await expect(second).resolves.toBe(true);
  });
});
