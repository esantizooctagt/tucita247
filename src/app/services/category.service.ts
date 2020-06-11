import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Category } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  readonly apiURL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getCategories(language): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiURL + '/categories/'+language)
                    .pipe(catchError(this.errorHandler));
  }

  getCategory(categoryId): Observable<Category> {
    return this.http.get<Category>(this.apiURL + '/category/' + categoryId)
                    .pipe(catchError(this.errorHandler));
  }

  postCategory(formData) {
    return this.http.post(this.apiURL + '/category', formData)
                    .pipe(catchError(this.errorHandler));
  }

  updateCategory(categoryId, formData) {
    return this.http.patch(this.apiURL + '/category/'  + categoryId, formData)
                    .pipe(catchError(this.errorHandler));
  }

  deleteCategory(categoryId) {
    return this.http.delete(this.apiURL + '/category/' + categoryId)
                    .pipe(catchError(this.errorHandler));
  }

  errorHandler(error) {
    return throwError(error || 'Server Error');
  }

}
