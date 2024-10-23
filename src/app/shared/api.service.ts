import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { companymodel } from '../Model/companymodel';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiurl = 'http://localhost:3000/company';

  constructor(private http: HttpClient) { }

  // Retrieve all companies
  GetAllCompanies(): Observable<companymodel[]> {
    return this.http.get<companymodel[]>(this.apiurl).pipe(
      catchError(error => {
        console.error('Error retrieving all companies', error);
        return of([]); // Return an empty array if there's an error
      })
    );
  }

  // Retrieve a company by its ID
  GetCompanyById(id: string): Observable<companymodel | null> {
    return this.http.get<companymodel>(`${this.apiurl}/${id}`).pipe(
      catchError(error => {
        console.error('Error retrieving company by ID', error);
        return of(null); // Return null if there's an error
      })
    );
  }

  // Remove a company by its ID
  RemoveCompanyById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiurl}/${id}`).pipe(
      catchError(error => {
        console.error('Error removing company', error);
        return of(void 0); // Returning void to indicate no data
      })
    );
  }

  // Create a new company
  CreateCompany(companyData: companymodel): Observable<companymodel | null> {
    return this.CheckUniqueId(companyData.id).pipe(
      switchMap(isUnique => {
        if (isUnique) {
          return this.http.post<companymodel>(this.apiurl, companyData).pipe(
            catchError(error => {
              console.error('Error creating company', error);
              return of(null); // Return null in case of error
            })
          );
        } else {
          console.error('ID is not unique');
          return of(null); // Return null if ID is not unique
        }
      }),
      catchError(error => {
        console.error('Error creating company', error);
        return of(null); // Return null in case of error
      })
    );
  }

  // Update an existing company
  UpdateCompany(id: string, companyData: companymodel): Observable<companymodel | null> {
    return this.CheckUniqueId(companyData.id).pipe(
      switchMap(isUnique => {
        if (isUnique || id === companyData.id) {
          return this.http.put<companymodel>(`${this.apiurl}/${id}`, companyData).pipe(
            catchError(error => {
              console.error('Error updating company', error);
              return of(null); // Return null in case of error
            })
          );
        } else {
          console.error('ID is not unique');
          return of(null); // Return null if ID is not unique
        }
      }),
      catchError(error => {
        console.error('Error updating company', error);
        return of(null); // Return null in case of error
      })
    );
  }

  // Check if the company ID is unique
  CheckUniqueId(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiurl}/check-unique-id/${id}`).pipe(
      catchError(error => {
        console.error('Error checking unique ID', error);
        return of(true); // Assume true in case of error to prevent blocking
      })
    );
  }
}
