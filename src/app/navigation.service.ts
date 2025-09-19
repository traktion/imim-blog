import { Injectable } from '@angular/core';
import {NavItem} from './nav-item';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  navItems: NavItem[];

  constructor() {
    this.navItems = [
      new NavItem('Home', 'home', '/blog/unknown'),
      new NavItem('Article', 'article', '/blog/unknown/article/unknown'),
      new NavItem('Publish', 'publish', '/blog/unknown/publish'),
    ];
  }

  update(listXor: string, articlePath?: string): void {
    this.navItems[0].url = this.getListUrl(listXor);
    if (articlePath) {
      this.navItems[1].url = this.getArticleUrl(listXor, articlePath);
    } else {
      this.navItems[1].url = this.navItems[0].url;
    }
    this.navItems[2].url = this.getPublishUrl(listXor);
  }

  getListUrl(listXor: string): string {
    return 'blog/' + listXor;
  }

  getArticleUrl(listXor: string, articlePath: string): string {
    return 'blog/' + listXor + '/article/' + articlePath;
  }

  getPublishUrl(listXor: string): string {
    return 'blog/' + listXor + '/publish';
  }
}
