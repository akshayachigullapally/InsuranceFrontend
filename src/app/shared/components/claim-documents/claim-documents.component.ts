import { DatePipe } from '@angular/common';
import { Component, OnChanges, OnDestroy, SimpleChanges, inject, input, signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  CLAIM_DOCUMENT_TYPES,
  ClaimDocumentResponse,
  MAX_CLAIM_DOCUMENTS,
  MAX_CLAIM_DOCUMENT_BYTES,
} from '../../../features/dtos/claims/claim-response.dto';
import { ClaimService } from '../../../features/services/claim.service';
import { blobErrorMessage } from '../../../features/utils/file-download.util';

/**
 * Evidence files on a claim (damage photos / a supporting PDF).
 * Customers can add files while the claim is open; claims officers and
 * admins ("review" mode) can view them.
 */
@Component({
  selector: 'app-claim-documents',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">Evidence files</h2>
          <p class="text-sm text-gray-500">
            @if (mode() === 'customer') {
              Photos of the damage or a supporting document (JPG, PNG, WEBP or PDF, up to 5 MB each, max {{ max }} files).
            } @else {
              Photos and documents the customer attached to this claim.
            }
          </p>
        </div>

        @if (mode() === 'customer' && canUpload() && remaining() > 0) {
          <label class="btn-outline cursor-pointer" [class.opacity-50]="uploading()">
            {{ uploading() ? 'Uploading...' : '+ Add files' }}
            <input
              type="file"
              class="sr-only"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
              [disabled]="uploading()"
              (change)="onFilesSelected($event)"
            />
          </label>
        }
      </div>

      @if (error(); as message) {
        <p class="mt-3 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700">{{ message }}</p>
      }

      @if (loading()) {
        <p class="mt-4 text-sm text-gray-500">Loading files...</p>
      } @else if (documents().length === 0) {
        <p class="mt-4 rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
          No files attached{{ mode() === 'customer' && canUpload() ? ' yet' : '' }}.
        </p>
      } @else {
        <ul class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          @for (document of documents(); track document.id) {
            <li class="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <button
                type="button"
                class="block w-full text-left"
                (click)="open(document)"
                [attr.aria-label]="'Open ' + document.fileName"
              >
                @if (previews()[document.id]; as url) {
                  <img [src]="url" [alt]="document.fileName" class="h-36 w-full object-cover" />
                } @else {
                  <div class="flex h-36 w-full items-center justify-center bg-gray-50 text-4xl">
                    {{ isImage(document) ? '🖼️' : '📄' }}
                  </div>
                }
                <div class="px-3 py-2">
                  <p class="truncate text-sm font-medium text-gray-900">{{ document.fileName }}</p>
                  <p class="text-xs text-gray-500">
                    {{ formatSize(document.sizeBytes) }} · {{ document.uploadedAt | date: 'mediumDate' }}
                  </p>
                </div>
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class ClaimDocumentsComponent implements OnChanges, OnDestroy {
  readonly claimId = input.required<number>();
  readonly mode = input<'customer' | 'review'>('customer');
  readonly canUpload = input(false);

  protected readonly max = MAX_CLAIM_DOCUMENTS;
  protected readonly documents = signal<ClaimDocumentResponse[]>([]);
  protected readonly previews = signal<Record<number, string>>({});
  protected readonly loading = signal(false);
  protected readonly uploading = signal(false);
  protected readonly error = signal<string | null>(null);

  private readonly claimService = inject(ClaimService);
  private readonly subscriptions = new Subscription();
  private objectUrls: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['claimId'] || changes['mode']) {
      this.load();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.revokePreviews();
  }

  protected remaining(): number {
    return Math.max(0, MAX_CLAIM_DOCUMENTS - this.documents().length);
  }

  protected isImage(document: ClaimDocumentResponse): boolean {
    return document.contentType.startsWith('image/');
  }

  protected formatSize(bytes: number): string {
    return bytes >= 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  protected onFilesSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const files = Array.from(inputElement.files ?? []);
    inputElement.value = '';
    if (files.length === 0) {
      return;
    }

    const problem = validateClaimFiles(files, this.remaining());
    if (problem) {
      this.error.set(problem);
      return;
    }

    this.error.set(null);
    this.uploading.set(true);
    this.subscriptions.add(
      this.claimService.uploadDocuments(this.claimId(), files).subscribe({
        next: () => {
          this.uploading.set(false);
          this.load();
        },
        error: (err: unknown) => {
          this.uploading.set(false);
          this.error.set(
            (err as { error?: { message?: string } })?.error?.message ?? 'Upload failed. Please try again.',
          );
        },
      }),
    );
  }

  protected open(document: ClaimDocumentResponse): void {
    const preview = this.previews()[document.id];
    if (preview) {
      window.open(preview, '_blank', 'noopener');
      return;
    }
    // Open a blank tab synchronously (keeps the popup allowed), then load the file into it.
    const tab = window.open('', '_blank');
    this.subscriptions.add(
      this.download(document).subscribe({
        next: blob => {
          const url = this.track(URL.createObjectURL(blob));
          if (tab) {
            tab.location.href = url;
          } else {
            window.location.href = url;
          }
        },
        error: async (err: unknown) => {
          tab?.close();
          this.error.set(await blobErrorMessage(err, 'Could not open the file.'));
        },
      }),
    );
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.revokePreviews();

    const source = this.mode() === 'review'
      ? this.claimService.getReviewDocuments(this.claimId())
      : this.claimService.getMyDocuments(this.claimId());

    this.subscriptions.add(
      source.subscribe({
        next: documents => {
          this.documents.set(documents);
          this.loading.set(false);
          documents.filter(document => this.isImage(document)).forEach(document => this.loadPreview(document));
        },
        error: () => {
          this.documents.set([]);
          this.loading.set(false);
          this.error.set('Could not load the attached files.');
        },
      }),
    );
  }

  private loadPreview(document: ClaimDocumentResponse): void {
    this.subscriptions.add(
      this.download(document).subscribe({
        next: blob => {
          const url = this.track(URL.createObjectURL(blob));
          this.previews.update(current => ({ ...current, [document.id]: url }));
        },
        error: () => undefined,
      }),
    );
  }

  private download(document: ClaimDocumentResponse): Observable<Blob> {
    return this.mode() === 'review'
      ? this.claimService.downloadReviewDocument(this.claimId(), document.id)
      : this.claimService.downloadMyDocument(this.claimId(), document.id);
  }

  private track(url: string): string {
    this.objectUrls.push(url);
    return url;
  }

  private revokePreviews(): void {
    this.objectUrls.forEach(url => URL.revokeObjectURL(url));
    this.objectUrls = [];
    this.previews.set({});
  }
}

/** Client-side checks mirroring the server rules; returns a message or null. */
export function validateClaimFiles(files: File[], remaining: number): string | null {
  if (files.length > remaining) {
    return remaining === 0
      ? `This claim already has ${MAX_CLAIM_DOCUMENTS} files.`
      : `You can add ${remaining} more file${remaining === 1 ? '' : 's'} (max ${MAX_CLAIM_DOCUMENTS}).`;
  }
  for (const file of files) {
    if (file.size > MAX_CLAIM_DOCUMENT_BYTES) {
      return `${file.name} is larger than 5 MB.`;
    }
    if (file.type && !CLAIM_DOCUMENT_TYPES.includes(file.type)) {
      return `${file.name} is not a JPG, PNG, WEBP or PDF file.`;
    }
  }
  return null;
}
