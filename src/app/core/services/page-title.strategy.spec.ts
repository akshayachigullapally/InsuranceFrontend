import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot } from '@angular/router';
import { PageTitleStrategy } from './page-title.strategy';

describe('PageTitleStrategy', () => {
  let strategy: PageTitleStrategy;
  let title: Title;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PageTitleStrategy] });
    strategy = TestBed.inject(PageTitleStrategy);
    title = TestBed.inject(Title);
  });

  it('appends the app name to the page title', () => {
    vi.spyOn(strategy, 'buildTitle').mockReturnValue('My claims');
    strategy.updateTitle({} as RouterStateSnapshot);
    expect(title.getTitle()).toBe('My claims · ClimateSure');
  });

  it('falls back to the app name when the route has no title', () => {
    vi.spyOn(strategy, 'buildTitle').mockReturnValue(undefined);
    strategy.updateTitle({} as RouterStateSnapshot);
    expect(title.getTitle()).toBe('ClimateSure');
  });
});
