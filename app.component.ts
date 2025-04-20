import { Component, OnInit } from '@angular/core';
import { AppService } from './app.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

interface JobDescription {
  key: string;
  title: string;
}

interface ResumeResult {
  [key: string]: any;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  jobDescriptions: JobDescription[] = [];
  selectedJd: string = '';
  uploadedFiles: File[] = [];
  oversizedFiles: string[] = [];
  maxFileSizeMb: number = 10; // Match processing_config['max_file_size_mb']
  displayFilesLimit: number = 3;
  showAllFiles: boolean = false;
  apiStatus: boolean | null = null;
  processingStatus: string | null = null;
  filesToProcess: number = 0;
  filesProcessed: number = 0;
  estimatedTime: number = 0;
  progressPercentage: number = 0;
  results: ResumeResult[] = [];
  filteredResults: ResumeResult[] = [];
  columns: string[] = [
    'Candidate Name',
    'Years of Experience',
    'JD Analyzed Against',
    'Most Recent Role',
    'Fitment Score',
    'Relevant Skills Matching JD',
    'Strengths',
    'Gaps/Weaknesses',
    'Education Level',
    'File Name'
  ];
  filterScore: number = 0;
  minScore: number = 0;
  maxScore: number = 100;
  filterExperience: number = 0;
  minExperience: number = 0;
  maxExperience: number = 20;
  sortColumn: string = 'Fitment Score';
  errorMessage: string = '';

  constructor(private appService: AppService) {}

  ngOnInit() {
    this.loadJobDescriptions();
    this.checkApiStatus();
  }

  loadJobDescriptions() {
    this.appService.getJobDescriptions().subscribe({
      next: (data) => {
        this.jobDescriptions = data;
        if (data.length > 0) {
          this.selectedJd = data[0].key;
        }
      },
      error: (err) => console.error('Error loading job descriptions:', err)
    });
  }

  checkApiStatus() {
    this.apiStatus = null;
    this.appService.checkApiStatus().subscribe({
      next: (status) => this.apiStatus = status,
      error: () => this.apiStatus = false
    });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.uploadedFiles = Array.from(input.files);
      this.oversizedFiles = this.uploadedFiles
        .filter(file => file.size > this.maxFileSizeMb * 1024 * 1024)
        .map(file => file.name);
    }
  }

  toggleFileList() {
    this.showAllFiles = !this.showAllFiles;
    this.displayFilesLimit = this.showAllFiles ? this.uploadedFiles.length : 3;
  }

  analyzeResumes() {
    if (!this.uploadedFiles.length || !this.selectedJd) return;

    this.processingStatus = 'running';
    this.filesToProcess = this.uploadedFiles.length;
    this.filesProcessed = 0;
    this.progressPercentage = 0;
    this.estimatedTime = this.filesToProcess * 5; // Rough estimate (request_delay + buffer)

    const formData = new FormData();
    formData.append('selected_jd', this.selectedJd);
    this.uploadedFiles.forEach(file => formData.append('files', file));

    this.appService.analyzeResumes(formData).subscribe({
      next: (results) => {
        this.results = results;
        this.processResults();
        this.processingStatus = 'complete';
        this.progressPercentage = 100;
      },
      error: (err) => {
        this.processingStatus = 'failed';
        this.errorMessage = err.error?.error || 'An error occurred during analysis';
        this.progressPercentage = 0;
      }
    });
  }

  processResults() {
    // Add numeric fields for filtering
    this.results.forEach(result => {
      result['Score_Numeric'] = parseFloat(result['Fitment Score']?.match(/\d+/)?.[0] || '0');
      result['Experience_Years'] = parseFloat(result['Years of Experience']?.match(/\d+/)?.[0] || '0');
    });

    // Calculate min/max for filters
    this.minScore = Math.min(...this.results.map(r => r['Score_Numeric'] || 0));
    this.maxScore = Math.max(...this.results.map(r => r['Score_Numeric'] || 100));
    this.minExperience = Math.min(...this.results.map(r => r['Experience_Years'] || 0));
    this.maxExperience = Math.max(...this.results.map(r => r['Experience_Years'] || 20));

    this.filterResults();
  }

  filterResults() {
    this.filteredResults = this.results.filter(result =>
      result['Score_Numeric'] >= this.filterScore &&
      result['Experience_Years'] >= this.filterExperience
    );
    this.sortResults();
  }

  sortResults() {
    this.filteredResults.sort((a, b) => {
      if (this.sortColumn === 'Fitment Score') {
        return b['Score_Numeric'] - a['Score_Numeric'];
      } else if (this.sortColumn === 'Years of Experience') {
        return b['Experience_Years'] - a['Experience_Years'];
      } else {
        return a[this.sortColumn]?.localeCompare(b[this.sortColumn]) || 0;
      }
    });
  }

  downloadExcel() {
    const ws = XLSX.utils.json_to_sheet(this.filteredResults, { header: this.columns });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resume Analysis');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, 'resume_analysis.xlsx');
  }

  downloadCsv() {
    const csv = this.convertToCsv(this.filteredResults, this.columns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    FileSaver.saveAs(blob, 'resume_analysis.csv');
  }

  convertToCsv(data: any[], columns: string[]): string {
    const header = columns.join(',');
    const rows = data.map(row =>
      columns.map(col => `"${(row[col] || '').toString().replace(/"/g, '""')}"`).join(',')
    );
    return `${header}\n${rows.join('\n')}`;
  }
}