import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ResumeService, Resume } from '../service/resume-service';

@Component({
  selector: 'app-upload-resume',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-resume.component.html',
  styleUrls: ['./upload-resume.component.css']
})
export class UploadResumeComponent {
  currentStep = 1;
  selectedProfession = '';
  selectedFile: File | null = null;
  analysisResult: Resume | null = null;
  loading = false;
  fileStatus = 'No file uploaded.';
  professionError = false;

  roles = [
    'frontend', 'backend', 'fullstack', 'data-analyst', 'data-scientist',
    'software-developer', 'software-tester', 'product-manager', 'project-manager',
    'ux-designer', 'devops', 'cloud-engineer'
  ];

  roleDescriptions: Record<string, string> = {
    frontend: 'Expert in React, TypeScript, and modern UI frameworks',
    backend: 'Specialist in server-side development, APIs, and databases',
    fullstack: 'Expert in both frontend and backend development',
    'data-analyst': 'Expert in data analysis, visualization, and statistical modeling',
    'data-scientist': 'Expert in machine learning, statistical modeling, and data mining',
    'software-developer': 'General software development across multiple domains',
    'software-tester': 'Expert in testing methodologies and quality assurance',
    'product-manager': 'Product strategy, roadmap planning, and cross-functional leadership',
    'project-manager': 'Project planning, execution, and team coordination',
    'ux-designer': 'User experience design, interface design, and user research',
    devops: 'Infrastructure, CI/CD, and cloud platform management',
    'cloud-engineer': 'Cloud infrastructure, architecture, and deployment'
  };

  constructor(private resumeService: ResumeService) {}

  getRoleDisplayName(role: string): string {
    const map: Record<string, string> = {
      frontend: 'Frontend Developer', backend: 'Backend Developer', fullstack: 'Full Stack Developer',
      'data-analyst': 'Data Analyst', 'data-scientist': 'Data Scientist', 'software-developer': 'Software Developer',
      'software-tester': 'Software Tester', 'product-manager': 'Product Manager', 'project-manager': 'Project Manager',
      'ux-designer': 'UX/UI Designer', devops: 'DevOps Engineer', 'cloud-engineer': 'Cloud Engineer'
    };
    return map[role] || role;
  }

  getRoleDescription(role: string): string {
    return this.roleDescriptions[role] || 'Professional analysis based on your resume';
  }

  nextStep(step: number): void {
    if (step === 2 && !this.selectedProfession) {
      this.professionError = true;
      return;
    }
    this.professionError = false;
    this.currentStep = step;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedFile = file;
    this.fileStatus = `✅ ${file.name} selected (ready)`;
  }

  async analyzeResume() {
    if (!this.selectedFile || !this.selectedProfession) {
      alert('Please select a profession and a resume file.');
      return;
    }

    this.loading = true;
    this.currentStep = 3;

    try {
      const result = await firstValueFrom(this.resumeService.uploadResume(
        'User',
        this.selectedProfession,
        'user@example.com',
        '',
        this.selectedFile
      ));
      this.analysisResult = result;
    } catch (err) {
      console.warn('Backend failed, using local analysis', err);
      const resumeText = await this.extractTextFromFile(this.selectedFile);
      this.analysisResult = this.analyzeLocally(resumeText, this.selectedProfession);
    } finally {
      this.loading = false;
    }
  }

  private async extractTextFromFile(file: File): Promise<string> {
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      return await file.text();
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) throw new Error('PDF.js not loaded');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return fullText;
    }
    throw new Error('Unsupported file type');
  }

  // Local analysis – used only if backend fails
  private analyzeLocally(resumeText: string, role: string): Resume {
    const lowerText = resumeText.toLowerCase();
    const roleKeywords: Record<string, string[]> = {
      frontend: ['react','angular','vue','javascript','typescript','html','css','responsive','ui','ux'],
      backend: ['java','spring','node.js','python','rest','api','database','sql','microservices','docker'],
      fullstack: ['react','node.js','mongodb','express','javascript','html','css','api','database','git'],
      'data-analyst': ['sql','excel','python','tableau','power bi','statistics','data cleaning','visualization'],
      'data-scientist': ['python','machine learning','tensorflow','pytorch','sql','statistics','nlp','pandas'],
      devops: ['docker','kubernetes','jenkins','aws','ci/cd','terraform','linux','ansible'],
      'cloud-engineer': ['aws','azure','gcp','terraform','kubernetes','networking','iam','cloudformation'],
      'software-developer': ['java','python','c++','algorithms','data structures','git','agile','debugging'],
      'software-tester': ['testing','selenium','junit','test cases','automation','bug tracking','cypress','manual testing'],
      'product-manager': ['roadmap','agile','scrum','user stories','market research','stakeholder','kpis','product strategy'],
      'project-manager': ['project plan','risk management','budget','timeline','jira','confluence','leadership','scrum'],
      'ux-designer': ['figma','adobe xd','wireframes','prototyping','user research','usability','design system','user journey']
    };
    const keywords = roleKeywords[role] || roleKeywords['frontend'];
    const foundKeywords = keywords.filter(kw => lowerText.includes(kw));
    const missingKeywords = keywords.filter(kw => !lowerText.includes(kw));
    const keywordScore = Math.round((foundKeywords.length / keywords.length) * 100);
    const hasMetrics = /\d+%|\$\d+|\d+\s*(?:increase|reduce|improve|save|grow)/i.test(resumeText);
    const metricsScore = hasMetrics ? 80 : 40;
    const actionVerbs = ['led','managed','developed','created','implemented','achieved','increased','reduced','improved','optimized','designed','built','launched','spearheaded'];
    const foundVerbs = actionVerbs.filter(v => lowerText.includes(v));
    const verbScore = Math.min(100, Math.round((foundVerbs.length / 8) * 100));
    const overall = Math.round((keywordScore + metricsScore + verbScore) / 3);

    const strengths = [];
    if (foundKeywords.length > 3) strengths.push(`Good keyword match: ${foundKeywords.slice(0, 3).join(', ')}`);
    if (hasMetrics) strengths.push('Includes quantifiable achievements (good for ATS)');
    if (foundVerbs.length > 4) strengths.push('Uses strong action verbs');
    if (strengths.length === 0) strengths.push('Resume uploaded – we can help optimize it');

    const weaknesses = [];
    if (missingKeywords.length > 0) weaknesses.push(`Missing key terms: ${missingKeywords.slice(0, 4).join(', ')}`);
    if (!hasMetrics) weaknesses.push('Add numbers/percentages to quantify achievements');
    if (foundVerbs.length < 4) weaknesses.push('Use more powerful action verbs');
    if (weaknesses.length === 0) weaknesses.push('Minor improvements possible – check formatting');

    return {
      id: 0,
      studentName: 'User',
      role: role,
      email: 'user@example.com',
      score: overall,
      atsScore: keywordScore,
      keywordScore: keywordScore,
      formatScore: verbScore,
      experienceScore: metricsScore,
      jdMatchScore: Math.min(100, Math.round((foundKeywords.length / (keywords.length / 2)) * 100)),
      fileName: this.selectedFile?.name || '',
      fileContentType: this.selectedFile?.type || '',
      uploadTime: new Date(),
      feedback: '',
      skills: foundKeywords.join(', '),
      verdict: overall > 70 ? 'Strong Candidate' : overall > 50 ? 'Good Potential' : 'Needs Improvement',
      strengths: strengths.join('||'),
      weaknesses: weaknesses.join('||'),
      missingKeywords: missingKeywords.slice(0, 8).join('||'),
      foundKeywords: foundKeywords.slice(0, 8).join('||'),
      sectionsJson: '{}',
      rewriteSuggestions: '[]',
      immediateActions: weaknesses.slice(0, 3).join('||'),
      strategicActions: 'Get certified||Build portfolio||Network on LinkedIn',
      atsIssues: missingKeywords.length > 4 ? `Missing ATS keywords: ${missingKeywords.slice(0, 5).join(', ')}` : '',
      redFlags: '',
      summary: `Your resume contains ${foundKeywords.length} out of ${keywords.length} key terms for ${this.getRoleDisplayName(role)}. ${hasMetrics ? 'Good use of metrics.' : 'Add numbers to improve impact.'} Focus on ${missingKeywords.slice(0, 2).join(' and ')}.`
    };
  }

  resetAnalysis(): void {
    this.currentStep = 1;
    this.selectedProfession = '';
    this.selectedFile = null;
    this.analysisResult = null;
    this.fileStatus = 'No file uploaded.';
    this.professionError = false;
  }

  splitPipeString(str: string | undefined): string[] {
    return str ? str.split('||').filter(s => s.trim().length > 0) : [];
  }
}