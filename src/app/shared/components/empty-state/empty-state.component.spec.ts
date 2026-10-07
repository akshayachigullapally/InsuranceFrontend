import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';


describe('EmptyStateComponent', () => {
  it('shows the default title when no inputs are set', async () => {
    await TestBed.configureTestingModule({ imports: [EmptyStateComponent] }).compileComponents();
    const fixture: ComponentFixture<EmptyStateComponent> = TestBed.createComponent(EmptyStateComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('No records found');
    expect(text).toContain('📋');
  });
});
