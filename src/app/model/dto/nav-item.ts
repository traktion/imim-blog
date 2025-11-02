export class NavItem {
  public title: string;
  public fragment: string;
  public url: string;

  constructor(title: string = '', fragment: string = '', url: string = '') {
    this.title = title;
    this.fragment = fragment;
    this.url = url;
  }
}
