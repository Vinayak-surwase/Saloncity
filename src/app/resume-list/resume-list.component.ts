import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResumeService, Resume } from '../service/resume-service';

@Component({
  selector: 'app-resume-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './resume-list.component.html',
  styleUrls: ['./resume-list.component.css']
})
export class ResumeListComponent implements OnInit {
  resumes: Resume[] = [];
  loading = true;
  error = '';

  constructor(private resumeService: ResumeService) {}

  ngOnInit(): void {
    this.resumeService.getAllResumes().subscribe({
      next: (data) => {
        this.resumes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load resumes.';
        this.loading = false;
      }
    });
  }

  getRoleDisplayName(role: string): string {
    const map: Record<string, string> = {
      frontend: 'Frontend Developer', backend: 'Backend Developer', fullstack: 'Full Stack Developer',
      'data-analyst': 'Data Analyst', 'data-scientist': 'Data Scientist', 'software-developer': 'Software Developer',
      'software-tester': 'Software Tester', 'product-manager': 'Product Manager', 'project-manager': 'Project Manager',
      'ux-designer': 'UX/UI Designer', devops: 'DevOps Engineer', 'cloud-engineer': 'Cloud Engineer'
    };
    return map[role] || role;
  }
}