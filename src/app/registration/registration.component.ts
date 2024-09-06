import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Branch, resp } from '../app.config';
import { NgFor, NgIf, CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  standalone: true,
  imports: [NgFor, NgIf],
})
export class RegistrationComponent {
  // Array to hold the file previews (file name and src for image preview)
  filesPreview: Array<{ name: string, src: string | ArrayBuffer | null }> = [];

  // List of branches (to be populated from the API)
  branches: Branch[] = [];

  // Object to hold the selected branch details
  selectedBranch = <Branch>{};

  constructor(private http: HttpClient) {}

  // Fetch the branches from the server on component load
  ngOnInit(): void {
    this.fetchBranches();
  }

  // Handles file and folder uploads, previews images
  previewFolders(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const files = fileInput.files;
    if (files) {
      Array.from(files).forEach(file => {
        if (!this.filesPreview.some(f => f.name === file.name)) {
          const reader = new FileReader();
          // If the file is an image, we preview it
          if (file.type.startsWith('image/')) {
            reader.onload = () => {
              this.filesPreview.push({ name: file.name, src: reader.result });
            };
            reader.readAsDataURL(file); // Convert image file to base64 for preview
          } else {
            // Non-image files will be listed without preview
            this.filesPreview.push({ name: file.name, src: null });
          }
        }
      });
    }
  }

  previewFiles(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const files = fileInput.files;
    if (files) {
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

  // Removes a file from the preview list
  removeFile(index: number): void {
    this.filesPreview.splice(index, 1);
  }

  // Handle form submission
  onSubmit(): void {
    if (this.selectedBranch === <Branch>{}) {
      alert('Please select a preferred branch.');
    } else {
      // Handle form submission logic here
      console.log('Selected Branch:', this.selectedBranch);
      // Further form submission logic can be added here (e.g., POST request)
    }
  }

  // Handle language change from the dropdown
  changeLanguage(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedLanguage = selectElement.value;
    // Add logic here to switch the app language using a translation service
    console.log('Selected Language:', selectedLanguage);
  }

  // Sets the selected branch based on the dropdown selection
  setBranch(event: Event): void {
    const selectedElement = event.target as HTMLSelectElement;
    const branch = this.getBranchByID(selectedElement.value);
    this.selectedBranch = branch;
    console.log(this.selectedBranch.branchcode);
  }

  // Finds a branch by its branchcode
  getBranchByID(id: string): Branch {
    return this.branches.find(branch => branch.branchcode === id) || <Branch>{};
  }

  // Fetches the list of branches from an external API
  fetchBranches(): void {
    const apiUrl = 'http://81.29.111.142:8085/CVM/CVMMobileAPIs/api/getBranches';
    this.http.get<resp>(apiUrl).subscribe({
      next: (response: resp) => {
        // Sorting branches alphabetically by branchcode
        this.branches = response.result.sort((a, b) =>
          a.branchcode > b.branchcode ? 1 : -1
        );
        console.log('Branches loaded:', this.branches);
      },
      error: (error) => {
        console.error('Error fetching branches:', error);
      },
    });
  }

  // Opens the selected branch location in Google Maps
  openLocation(): void {
    const lat = this.selectedBranch.branchlat;
    const lng = this.selectedBranch.branchlng;
    if (lat === undefined || lng === undefined) {
      console.log(this.selectedBranch);
      return;
    }
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(googleMapsUrl, '_blank');
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
}
