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
  // Array to hold the file previews (file name and src for image preview)
  filesHierarchy: any[] = [];
  filesPreview: Array<{ name: string; src: string | ArrayBuffer | null }> = [];
  branches: Branch[] = [];
  selectedBranch = <Branch>{};
  formData: { name: string; email: string; phoneNumber: string } = {
    name: '',
    email: '',
    phoneNumber: '',
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchBranches();
  }

  previewFolders(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      const fileMap = this.buildFileHierarchy(Array.from(files));
      this.filesHierarchy = fileMap;
      this.filesPreview = this.generateImagePreviews(Array.from(files));
      console.log('File Hierarchy:', this.filesHierarchy);
    }
  }
  
  // Generate image previews if the file is an image
  generateImagePreviews(files: File[]): Array<{ name: string; src: string | ArrayBuffer | null }> {
    const previews: Array<{ name: string; src: string | ArrayBuffer | null }> = [];
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) { // Check if the file is an image
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result; // Get the result from the event
          if (result !== undefined) { // Ensure the result is not undefined
            previews.push({ name: file.name, src: result });
          } else {
            previews.push({ name: file.name, src: null }); // Handle the undefined case by setting src to null
          }
        };
        reader.readAsDataURL(file);
      }
    });
  
    return previews;
  }

  buildFileHierarchy(files: File[]): any[] {
    const fileMap: { [key: string]: any } = {};
    files.forEach((file) => {
      const pathParts = file.webkitRelativePath.split('/');
      let currentDir = fileMap;
      pathParts.forEach((part, index) => {
        if (index === pathParts.length - 1) {
          currentDir[part] = file;
        } else {
          if (!currentDir[part]) {
            currentDir[part] = {};
          }
          currentDir = currentDir[part];
        }
      });
    });
    return this.convertFileMapToArray(fileMap);
  }

  convertFileMapToArray(fileMap: { [key: string]: any }): any[] {
    return Object.keys(fileMap).map((key) => {
      const value = fileMap[key];
      if (value instanceof File) {
        return { name: key, file: value };
      } else {
        return { name: key, children: this.convertFileMapToArray(value) };
      }
    });
  }

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

  onSubmit(): void {
    console.log('Form Submitted', this.formData);
  }

  changeLanguage(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedLanguage = select.value;
    console.log('Selected Language:', selectedLanguage);
  }

  openLocation(): void {
    if (this.selectedBranch && this.selectedBranch.branchcode) {
      const branchLocationUrl = `https://www.google.com/maps?q=${this.selectedBranch.branchname}`;
      window.open(branchLocationUrl, '_blank');
    }
  }

  // When input is focused, add 'filled' class
  onInputFocus(event: FocusEvent): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.classList.add('filled');
  }

  // When input loses focus, remove 'filled' class if input is empty
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

  toggleFile(file: any): void {
    file.open = !file.open; // Toggle the open state
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

  getImagePreview(file: File): string | null {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    let previewSrc: string | null = null;
    reader.onload = (event) => {
      previewSrc = event.target?.result as string;
    };
    return previewSrc;
  }
  

}
