import { Component } from '@angular/core';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  filesPreview: Array<{ name: string, src: string | ArrayBuffer | null }> = [];

  // List of branches
  branches: string[] = ['Branch A', 'Branch B', 'Branch C', 'Branch D'];
  selectedBranch: string = 'Preferred Branch';

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
      this.filesPreview = [];
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            this.filesPreview.push({ name: file.name, src: reader.result });
          };
          reader.readAsDataURL(file);
        } else {
          this.filesPreview.push({ name: file.name, src: null });
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

  setBranch(event: Event): void{
    const selectedElement = event.target as HTMLSelectElement;
    const branch = selectedElement.value;
    this.selectedBranch = branch;
  }

  openLocation(): void {
    // const lat = this.selectedBranch.branchlat;
    // const lng = this.selectedBranch.branchlng;
    // const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
    // window.open(googleMapsUrl, '_blank');
    console.log(this.selectedBranch)
  }
}
