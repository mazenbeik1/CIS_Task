import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Branch, resp } from '../app.config';
import { NgFor, NgIf, CommonModule, NgTemplateOutlet, NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  standalone: true,
  imports: [NgFor, NgIf, CommonModule, NgTemplateOutlet, NgComponentOutlet],
})
export class RegistrationComponent {
  attachmentsList: any[] = []; // Unified list for both files and folders
  branches: Branch[] = [];
  selectedBranch = <Branch>{};
  formData: { name: string; email: string; phoneNumber: string } = {
    name: '',
    email: '',
    phoneNumber: '',
  };

  uploadType: 'file' | 'folder' = 'file'; // Default to file upload

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchBranches();
  }

  // Switch between file and folder upload without removing existing attachments
  toggleUploadType(type: 'file' | 'folder'): void {
    this.uploadType = type;
  }

  // Handle file preview for file upload
  previewFiles(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const files = fileInput.files;

    if (files) {
      Array.from(files).forEach(file => {
        if (!this.attachmentsList.some(f => f.name === file.name)) {
          const reader = new FileReader();
          reader.onload = () => {
            this.attachmentsList.push({ name: file.name, src: reader.result, type: 'file' });
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  // Handle folder preview for folder upload
  previewFolders(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files) {
      const fileMap = this.buildFileHierarchy(Array.from(files));
      this.attachmentsList = this.attachmentsList.concat(fileMap); // Append new folder structure to unified list
    }
  }

  // Build the file hierarchy recursively
  buildFileHierarchy(files: File[]): any[] {
    const fileMap: { [key: string]: any } = {};
    files.forEach((file) => {
      const pathParts = file.webkitRelativePath.split('/');
      let currentDir = fileMap;

      pathParts.forEach((part, index) => {
        if (index === pathParts.length - 1) {
          currentDir[part] = { name: file.name, file, isImage: this.isImage(file), type: 'file', isOpen: false };
        } else {
          if (!currentDir[part]) {
            currentDir[part] = { name: part, children: [], type: 'folder', isOpen: false };
          }
          currentDir = currentDir[part].children;
        }
      });
    });
    return this.convertFileMapToArray(fileMap);
  }

  // Convert file map to array structure for display
  convertFileMapToArray(fileMap: { [key: string]: any }): any[] {
    return Object.keys(fileMap).map((key) => {
      const value = fileMap[key];
      if (value.file) {
        return { name: value.name, file: value.file, isImage: value.isImage, previewSrc: this.isImage(value.file) ? this.getImagePreview(value.file) : null, type: 'file' };
      } else {
        return { name: key, children: this.convertFileMapToArray(value.children), type: 'folder', isOpen: value.isOpen };
      }
    });
  }

  // Determine if the file is an image
  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  // Read the image file and return its data URL for preview
  getImagePreview(file: File): string | null {
    const reader = new FileReader();
    let previewSrc: string | null = null;

    reader.onload = (event) => {
      previewSrc = event.target?.result as string;
    };

    reader.readAsDataURL(file);
    return previewSrc;
  }

  // Fetch branches from the API
  fetchBranches(): void {
    const apiUrl = 'http://81.29.111.142:8085/CVM/CVMMobileAPIs/api/getBranches';
    this.http.get<resp>(apiUrl).subscribe({
      next: (response: resp) => {
        this.branches = response.result.sort((a, b) =>
          a.branchcode > b.branchcode ? 1 : -1
        );
      },
      error: (error) => {
        console.error('Error fetching branches:', error);
      },
    });
  }

  // Handle form submission
  onSubmit(): void {
    console.log('Form Submitted', this.formData);
  }

  // Handle language change
  changeLanguage(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedLanguage = select.value;
    console.log('Selected Language:', selectedLanguage);
  }

  // Open the branch location in Google Maps
  openLocation(): void {
    if (this.selectedBranch && this.selectedBranch.branchcode) {
      const branchLocationUrl = `https://www.google.com/maps?q=${this.selectedBranch.branchname}`;
      window.open(branchLocationUrl, '_blank');
    }
  }

  // Add 'filled' class when input is focused
  onInputFocus(event: FocusEvent): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.classList.add('filled');
  }

  // Remove 'filled' class if input is empty on blur
  onInputBlur(event: FocusEvent): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.value === '') {
      inputElement.classList.remove('filled');
    }
  }

  // Toggle folder open/close state for accordion functionality
  toggleFolder(item: any): void {
    item.isOpen = !item.isOpen;
  }

  setBranch(event: Event): void {
    const selectedElement = event.target as HTMLSelectElement;
    const branch = this.getBranchByID(selectedElement.value);
    this.selectedBranch = branch;
    console.log(this.selectedBranch.branchcode);
  }

  getBranchByID(id: string): Branch {
    return this.branches.find(branch => branch.branchcode === id) || <Branch>{};
  }
}
