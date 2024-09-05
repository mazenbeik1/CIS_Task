// import { Branch } from './../app.config';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // HttpClient to make requests
import { provideHttpClient } from '@angular/common/http'; // New provideHttpClient
import { Branch, resp } from '../app.config';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  standalone: true,
  imports: [CommonModule],
})



export class RegistrationComponent {
  
  
  
  filesPreview: Array<{ name: string, src: string | ArrayBuffer | null }> = [];

  constructor(private http: HttpClient) {} // Inject HttpClient

  ngOnInit(): void {
    this.fetchBranches(); // Fetch branches on component load
  }

  

  // List of branches
  branches: Branch[] = [];
  selectedBranch= <Branch>{};

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
    if (this.selectedBranch === <Branch>{}) {
      alert('Please select a preferred branch.');
    } else {
      // Handle form submission
      console.log('Selected Branch:', this.selectedBranch);
    }
  }

  changeLanguage(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedLanguage = selectElement.value;
  }

  setBranch(event: Event): void{
    const selectedElement = event.target as HTMLSelectElement;
    const branch = this.getBranchByID(selectedElement.value);
    this.selectedBranch = branch;
    console.log(this.selectedBranch)
  }

  getBranchByID(id: string): Branch{
    
    var result = <Branch>{}
    result = this.branches.find(i=> i.branchcode == id) || <Branch>{}
    
    return result
  }


  fetchBranches(): void {
    const apiUrl = 'http://81.29.111.142:8085/CVM/CVMMobileAPIs/api/getBranches';
    this.http.get<resp>(apiUrl).subscribe({
      next: (response: resp) => {
        this.branches = response.result.sort((a, b) => (a.branchcode > b.branchcode) ? 1 : -1); // Assign response to branches array
        console.log(response)
        console.log('Branches loaded:', this.branches);
      },
      error: (error) => {
        console.error('Error fetching branches:', error);
      }
    });
  }

  openLocation(): void {
    const lat = this.selectedBranch.branchlat;
    const lng = this.selectedBranch.branchlng;
    if(lat == undefined || lng == undefined){
      console.log(this.selectedBranch)
      return
    }
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(googleMapsUrl, '_blank');
  }


}
