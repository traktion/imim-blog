import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Listing} from './listing';
import {ArticleStatus} from './article_status';
import {Pointer} from './pointer';
import {Register} from './register';
import {LocationStrategy} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  constructor(
    private http: HttpClient,
    private locationStrategy: LocationStrategy
  ) {}

  getSnConfig(listXor: string): Observable<Listing[]> {
    var origin = "http://";
    if (window.location.pathname.startsWith("/pimim")) origin = window.location.origin  + "/";
    return this.http.get<Listing[]>(origin + listXor + "/", { responseType: 'json'})
      .pipe(
        map((items:Listing[]) => items.sort((a: Listing, b: Listing) => {
          if (a.mtime > b.mtime) {
            return 1;
          } else if (a.mtime > b.mtime) {
            return -1;
          }
          return 0
        }))
      );
  }

  getArticle(listXor: string, articleXor: string): Observable<string> {
    return this.http.get(window.location.origin + "/" + listXor + "/" + articleXor, { responseType: 'text'});
  }

  formatMarkdownHeader1(document: string, articleUrl: string): string {
    return document.replace(/(# )(.*?)([#]*)[\n]+/, "# [$2](" + articleUrl + ")\n");
  }

  formatMarkdownSafeUrls(document: string): string {
    const url = this.locationStrategy.getBaseHref() + '$1$2';
    return document.replace(/ant?:\/\/([-a-zA-Z0-9@:%._\\+~#=]{1,256})\b([-a-zA-Z0-9@:%_\\+.~#?&\/=]*)/g, url);
  }

  createArticleForNewBlog(contents: string, name: string): Observable<ArticleStatus> {
    const formData = new FormData();
    const file = new File([contents], name.replace(/ /g, "-").replace(/[^0-9a-z\-]/gi, '').toLowerCase() + ".md", {});
    formData.append("filename", file);
    return this.http.post<ArticleStatus>('/anttp-0/multipart/public_archive', formData, { responseType: 'json'});
  }

  createArticleForExistingBlog(listXor: string, contents: string, name: string): Observable<ArticleStatus> {
    const formData = new FormData();
    const file = new File([contents], name.replace(/ /g, "-").replace(/[^0-9a-z\-]/gi, '').toLowerCase() + ".md", {});
    formData.append("filename", file);
    return this.http.put<ArticleStatus>('/anttp-0/multipart/public_archive/' + listXor, formData, { responseType: 'json'});
  }

  getArticleStatus(id: string): Observable<ArticleStatus> {
    return this.http.get<ArticleStatus>('/anttp-0/public_archive/status/' + id, { responseType: 'json'});
  }

  isImmutable(address: string): boolean {
    return address.length == 64 && /^[a-zA-Z0-9]+$/.test(address);
  }

  getPointer(address: string): Observable<Pointer> {
    return this.http.get<Pointer>('/anttp-0/pointer/' + address, { responseType: 'json'});
  }

  setPointer(address: string, name: string, content: string): Observable<Pointer> {
    let pointer = new Pointer(name, content, address);
    return this.http.put<Pointer>('/anttp-0/pointer/' + address, pointer, { responseType: 'json'});
  }

  createPointer(name: string, content: string): Observable<Pointer> {
    let pointer = new Pointer(name, content);
    return this.http.post<Pointer>('/anttp-0/pointer', pointer, { responseType: 'json'});
  }

  getRegister(address: string): Observable<Register> {
    return this.http.get<Register>('/anttp-0/register/' + address, { responseType: 'json'});
  }

  setRegister(address: string, name: string, content: string): Observable<Register> {
    let register = new Register(name, content, address);
    return this.http.put<Register>('/anttp-0/register/' + address, register, { responseType: 'json'});
  }
}
