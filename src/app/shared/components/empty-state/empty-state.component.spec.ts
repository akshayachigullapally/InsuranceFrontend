import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

@Component({
  standalone: true,
  imports: [EmptyStateComponent],
  template: `
    <app-empty-state title="No claims" message="Try another filter" icon="🌧️">
      <button type="button">Submit a claim</button>
    </app-empty-state>
  `,
})
class HostComponent {}

describe('EmptyStateComponent', () => {
  it('shows the default title when no inputs are set', async () => {
    await TestBed.configureTestingModule({ imports: [EmptyStateComponent] }).compileComponents();
    const fixture: ComponentFixture<EmptyStateComponent> = TestBed.createComponent(EmptyStateComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('No records found');
    expect(text).toContain('📋');
  });

  it('renders custom inputs and projected content', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('No claims');
    expect(element.textContent).toContain('Try another filter');
    expect(element.textContent).toContain('🌧️');
    expect(element.querySelector('button')?.textContent).toContain('Submit a claim');
  });
});
