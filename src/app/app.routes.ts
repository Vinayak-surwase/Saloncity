import { Routes } from '@angular/router';
import { UploadResumeComponent } from './upload-resume/upload-resume.component';
import { ResumeListComponent } from './resume-list/resume-list.component';

export const routes: Routes = [
  { path: '', component: UploadResumeComponent },
  { path: 'list', component: ResumeListComponent },
  { path: '**', redirectTo: '' }
];