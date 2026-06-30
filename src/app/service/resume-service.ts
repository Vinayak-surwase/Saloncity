import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resume } from '../models/resume.model';

export { Resume }; // 👈 re-export the interface

@Injectable({ providedIn: 'root' })
export class ResumeService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  uploadResume(
    studentName: string,
    role: string,
    email: string,
    jobDescription: string,
    file: File
  ): Observable<Resume> {
    const formData = new FormData();
    formData.append('studentName', studentName);
    formData.append('role', role);
    formData.append('email', email);
    formData.append('jobDescription', jobDescription);
    formData.append('file', file);
    return this.http.post<Resume>(`${this.apiUrl}/resume/upload`, formData);
  }

  getAllResumes(): Observable<Resume[]> {
    return this.http.get<Resume[]>(`${this.apiUrl}/resume/all`);
  }
}