import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getJobDescriptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/job-descriptions`);
  }

  checkApiStatus(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}/job-descriptions`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  analyzeResumes(formData: FormData): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/analyze-resumes`, formData);
  }
}