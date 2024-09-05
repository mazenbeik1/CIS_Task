import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export interface Branch {
  branchcity: string;
  branchcode: string;
  branchlat: number;
  branchlng: number;
  branchname: string;
  branchnamear: string;
  id: string;
}

export interface resp {
  success: boolean;
  result: Branch[];
  message: null
}

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),provideHttpClient()]
};
