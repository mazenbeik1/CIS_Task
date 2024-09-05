import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class RegistrationComponent {
  filesPreview: Array<{ name: string, src: string | ArrayBuffer | null }> = [];

  onInputFocus(event: FocusEvent): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.classList.add('filled');
  }

  onInputBlur(event: FocusEvent): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.value === '') {
      inputElement.classList.remove('filled');
    }
  }

  previewFiles(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const files = fileInput.files;
    if (files) {
      // Instead of resetting filesPreview, we append new files to the existing array
      Array.from(files).forEach(file => {
        if (!this.filesPreview.some(f => f.name === file.name)) {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
              this.filesPreview.push({ name: file.name, src: reader.result });
            };
            reader.readAsDataURL(file);
          } else {
            this.filesPreview.push({ name: file.name, src: null });
          }
        }
      });
    }
  }

  removeFile(index: number): void {
    this.filesPreview.splice(index, 1);
  }

  onSubmit(): void {
    // Handle form submission
  }

  changeLanguage(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedLanguage = selectElement.value;
    // Handle language change
  }
}
