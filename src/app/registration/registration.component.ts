import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService, TranslateModule } from '@ngx-translate/core'; // Import TranslateModule here
import { Branch, resp } from '../app.config';
import { NgFor, NgIf, CommonModule, NgTemplateOutlet, NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NgTemplateOutlet,
    NgComponentOutlet,
    TranslateModule, // Import TranslateModule here to enable the translate pipe
  ],
})
export class RegistrationComponent {
  // Injecting necessary services
  private http = inject(HttpClient);
  private translate = inject(TranslateService);

  attachmentsList: any[] = []; // Unified list for both files and folders
  branches: Branch[] = [];
  selectedBranch = <Branch>{};
  formData = {
    name: '',
    email: '',
    phoneNumber: '',
  };
  selectedLanguage: string = 'en'; // Default language
  uploadType: 'file' | 'folder' = 'folder'; // Default to file upload

  constructor() {
    this.translate.setDefaultLang('en'); // Set default language to English
    this.translate.use('en'); // Start with English as default language
  }

  ngOnInit(): void {
    this.fetchBranches();
  }

  // Function to switch between languages with proper type assertion
  changeLanguage(event: Event): void {
    const target = event.target as HTMLSelectElement; // Assert that event.target is an HTMLSelectElement
    if (target && target.value) {
      const selectedLanguage = target.value;
      this.translate.use(selectedLanguage); // Change the language
      this.selectedLanguage = selectedLanguage;
    }
  }

  // Open file in a new tab
  openFileInNewTab(file: any): void {
    console.log("opening: "+ JSON.stringify(file))
    if (file) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(
          `<iframe src="${file}" frameborder="0" style="width:100%; height:100%"></iframe>`
        );
      }
    } 
  }

  // Switch between file and folder upload without removing existing attachments
  toggleUploadType(type: 'file' | 'folder'): void {
    this.uploadType = type;
  }

  // Handle file preview for file upload
  uploadFiles(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const files = fileInput.files;

    if (files) {
      Array.from(files).forEach((file) => {
        if (!this.attachmentsList.some((f) => f.name === file.name)) {
          const reader = new FileReader();
          reader.onload = () => {
            this.attachmentsList.push({ name: file.name, previewSrc: reader.result, type: 'file', file: file });
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  // Handle folder preview for folder upload
  async uploadFolders(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files) {
      const fileMap = await this.buildFileHierarchy(Array.from(files));
      this.attachmentsList = this.attachmentsList.concat(fileMap); // Append new folder structure to unified list
    }
  }

  // Build the file hierarchy recursively
  async buildFileHierarchy(files: File[]): Promise<any[]> {
    const fileMap: { [key: string]: any } = {};
    for (const file of files) {
      // Ignore `desktop.ini`
      if (file.name === 'desktop.ini') continue;

      const pathParts = file.webkitRelativePath.split('/');
      let currentDir = fileMap;

      for (let index = 0; index < pathParts.length; index++) {
        const part = pathParts[index];
        if (index === pathParts.length - 1) { //If reached the filel object
          currentDir[part] = {
            name: file.name,
            file: file,
            isImage: this.isImage(file),
            previewSrc: await this.getImagePreview(file), // Check and add preview for images
            type: 'file',
            isOpen: false,
          };
        } else {
          if (!currentDir[part]) { //If not recorded yet
            currentDir[part] = { name: part, children: [], type: 'folder', isOpen: false };
          }
          currentDir = currentDir[part].children;
        }
      }
    }
    return this.convertFileMapToArray(fileMap);
  }

  // Convert file map to array structure for display
  convertFileMapToArray(fileMap: { [key: string]: any }): any[] {
    return Object.keys(fileMap).map((key) => {
      const value = fileMap[key];
      if (value.file) {
        return {
          name: value.name,
          file: value.file,
          isImage: value.isImage,
          previewSrc: value.previewSrc, // Image preview if available
          type: 'file',
        };
      } else {
        return {
          name: key,
          children: this.convertFileMapToArray(value.children),
          type: 'folder',
          isOpen: value.isOpen,
        };
      }
    });
  }

  // Determine if the file is an image
  isImage(file: File): boolean {
    const allowedTypes = ['jpg', 'jpeg', 'png', 'jfif'];
    return allowedTypes.includes(file.name.split('.').pop() || '') || file.type.startsWith('image/');
  }

  // Read the image file and return its data URL for preview
  getImagePreview(file: File): Promise<string | null> {
    return new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  // Fetch branches from the API
  fetchBranches(): void {
    const apiUrl = 'http://81.29.111.142:8085/CVM/CVMMobileAPIs/api/getBranches';
    this.http.get<resp>(apiUrl).subscribe({
      next: (response: resp) => {
        this.branches = response.result.sort((a, b) => (a.branchcode > b.branchcode ? 1 : -1));
      },
      error: (error) => {
        console.error('Error fetching branches:', error);
      },
    });
  }

  // Handle form submission
  // Handle form submission with validation
onSubmit(): void {
  // Reset any previous errors
  let isValid = true;

  // Validate name
  if (!this.formData.name.trim()) {
    isValid = false;
    console.error('Name is required.');
  }

  // Validate email using a basic regex pattern
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!this.formData.email.trim() || !emailPattern.test(this.formData.email)) {
    isValid = false;
    console.error('Invalid email address.');
  }

  // Validate phone number (you can adjust the validation as needed)
  const phonePattern = /^[0-9]{10}$/; // Simple 10-digit phone number validation
  if (!this.formData.phoneNumber.trim() || !phonePattern.test(this.formData.phoneNumber)) {
    isValid = false;
    console.error('Invalid phone number. Must be 10 digits.');
  }

  if (isValid) {
    // If all validations pass, submit the form
    console.log('Form Submitted:', this.formData);
    // You can now proceed to send the form data to the server or perform further actions
  } else {
    console.log('Form has errors. Please correct them.');
  }
}


  // Open the branch location in Google Maps
  openLocation(): void {
    if (this.selectedBranch && this.selectedBranch.branchlat && this.selectedBranch.branchlng) {
      const lat = this.selectedBranch.branchlat;
      const lng = this.selectedBranch.branchlng;
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(googleMapsUrl, '_blank');
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
    return this.branches.find((branch) => branch.branchcode === id) || <Branch>{};
  }

  

}
