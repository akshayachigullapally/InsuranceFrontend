import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ClaimService } from '../../../features/services/claim.service';
import { ClaimDocumentsComponent, validateClaimFiles } from './claim-documents.component';

function file(name: string, type: string, size = 1000): File {
  const blob = new File([new Uint8Array(size)], name, { type });
  return blob;
}

describe('validateClaimFiles', () => {
  it('accepts up to the remaining number of supported files', () => {
    expect(validateClaimFiles([file('a.jpg', 'image/jpeg'), file('b.pdf', 'application/pdf')], 3)).toBeNull();
  });
});

describe('ClaimDocumentsComponent', () => {
  it('loads the customer documents for the claim', async () => {
    const claimService = {
      getMyDocuments: vi.fn().mockReturnValue(of([
        { id: 1, claimId: 5, fileName: 'report.pdf', contentType: 'application/pdf', sizeBytes: 2048, uploadedAt: '2026-09-20T10:00:00' },
      ])),
      getReviewDocuments: vi.fn(),
      downloadMyDocument: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [ClaimDocumentsComponent],
      providers: [{ provide: ClaimService, useValue: claimService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ClaimDocumentsComponent);
    fixture.componentRef.setInput('claimId', 5);
    fixture.componentRef.setInput('canUpload', true);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(claimService.getMyDocuments).toHaveBeenCalledWith(5);
    expect(claimService.getReviewDocuments).not.toHaveBeenCalled();
    expect(text).toContain('report.pdf');
    expect(text).toContain('Add files');
  });
});
