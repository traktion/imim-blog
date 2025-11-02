import { Injectable } from '@angular/core';
import {NavItem} from '../model/dto/nav-item';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {

  public navItems: NavItem[];

  constructor() {
    this.navItems = [
      new NavItem('Home', 'home', '/blog/unknown'),
      new NavItem('Article', 'article', '/blog/unknown/article/unknown'),
      new NavItem('Publish', 'publish', '/blog/unknown/publish'),
      new NavItem('Status', 'status', '/blog/unknown/status/'),
    ];
  }

  public update(listXor: string, articlePath?: string): void {
    this.navItems[0].url = this.getListUrl(listXor);
    if (articlePath) {
      this.navItems[1].url = this.getArticleUrl(listXor, articlePath);
    } else {
      this.navItems[1].url = this.navItems[0].url;
    }
    this.navItems[2].url = this.getPublishUrl(listXor);
    this.navItems[3].url = this.getStatusUrl(listXor);
  }

  public getListUrl(listXor: string): string {
    return 'blog/' + listXor;
  }

  public getArticleUrl(listXor: string, articlePath: string): string {
    return 'blog/' + listXor + '/article/' + articlePath;
  }

  public getPublishUrl(listXor: string): string {
    return 'blog/' + listXor + '/publish';
  }

  public getStatusUrl(listXor: string): string {
    return 'blog/' + listXor + '/status';
  }
}
