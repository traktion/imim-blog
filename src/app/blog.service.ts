import {LocationStrategy} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ArticleStatus} from './model/api/article_status';
import {Command} from './model/api/command';
import {Listing} from './model/api/listing';
import {Pointer} from './model/api/pointer';
import {Register} from './model/api/register';

@Injectable({
  providedIn: 'root',
})
export class BlogService {

  constructor(
    private http: HttpClient,
    private locationStrategy: LocationStrategy,
  ) {}

  public getDirectoryListing(listXor: string): Observable<Listing[]> {
    let origin = window.location.protocol + '//';
    if (window.location.pathname.startsWith('/gimim')) { origin = window.location.origin  + '/'; }
    return this.http.get<Listing[]>(origin + listXor + '/', { responseType: 'json'})
      .pipe(
        map(
          (items: Listing[]) => items.sort((a: Listing, b: Listing) => {
            if (new Date(a.mtime).getTime() < new Date(b.mtime).getTime()) {
              return 1;
            } else {
              return -1;
            }
          }),
        ),
      );
  }

  public getArticle(listXor: string, filePath: string): Observable<string> {
    let origin = window.location.protocol + '//';
    if (window.location.pathname.startsWith('/gimim')) { origin = window.location.origin  + '/'; }
    return this.http.get(origin + listXor + '/' + filePath, { responseType: 'text'});
  }

  public formatMarkdownHeader1(document: string, articleUrl: string): string {
    return document.replace(/(# )(.*?)([#]*)[\n]+/, '# [$2](' + articleUrl + ')\n');
  }

  public formatMarkdownSafeUrls(document: string): string {
    // todo: change URL depending on imim / gimim path
    const url = this.locationStrategy.getBaseHref() + '$1$2';
    return document.replace(/anttp?:\/\/([-a-zA-Z0-9@:%._\\+~#=]{1,256})\b([-a-zA-Z0-9@:%_\\+.~#?&\/=]*)/g, url);
  }

  public createArticleForNewBlog(contents: string, name: string): Observable<ArticleStatus> {
    const formData = new FormData();
    const file = new File([contents], this.getArticleFilename(name), {});
    formData.append('files', file);
    return this.http.post<ArticleStatus>('/anttp-0/multipart/public_archive', formData, { responseType: 'json'});
  }

  public createArticleForExistingBlog(listXor: string, contents: string, name: string): Observable<ArticleStatus> {
    const formData = new FormData();
    const file = new File([contents], this.getArticleFilename(name), {});
    formData.append('files', file);
    return this.http.put<ArticleStatus>('/anttp-0/multipart/public_archive/' + listXor, formData, { responseType: 'json'});
  }

  public getArticleFilename(name: string): string {
    return name.replace(/ /g, '-')
      .replace(/[^0-9a-z\-]/gi, '')
      .toLowerCase() + '.md';
  }

  public getArticleStatus(id: string): Observable<ArticleStatus> {
    return this.http.get<ArticleStatus>('/anttp-0/public_archive/status/' + id, { responseType: 'json'});
  }

  public isImmutable(address: string): boolean {
    return address.length === 64 && /^[a-zA-Z0-9]+$/.test(address);
  }

  public getPointer(address: string): Observable<Pointer> {
    return this.http.get<Pointer>('/anttp-0/pointer/' + address, { responseType: 'json'});
  }

  public setPointer(address: string, name: string, content: string): Observable<Pointer> {
    const pointer = new Pointer(name, content, address);
    return this.http.put<Pointer>('/anttp-0/pointer/' + address, pointer, { responseType: 'json'});
  }

  public createPointer(name: string, content: string): Observable<Pointer> {
    const pointer = new Pointer(name, content);
    return this.http.post<Pointer>('/anttp-0/pointer', pointer, { responseType: 'json'});
  }

  public getRegister(address: string): Observable<Register> {
    return this.http.get<Register>('/anttp-0/register/' + address, { responseType: 'json'});
  }

  public setRegister(address: string, name: string, content: string): Observable<Register> {
    const register = new Register(name, content, address);
    return this.http.put<Register>('/anttp-0/register/' + address, register, { responseType: 'json'});
  }

  public getCommands(): Observable<Command[]> {
    return this.http.get<Command[]>('/anttp-0/command', { responseType: 'json'})
    .pipe(
      map(
        (items: Command[]) => items.filter((command) =>
          command.state !== 'ABORTED', /*&& command.name != 'GetPointerCommand'*/
        ),
      ),
    );
  }
}
