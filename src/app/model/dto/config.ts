export class Config {
  public name: string;
  public articles: string[];

  constructor(name: string = '', articles: string[]) {
    this.name = name;
    this.articles = articles;
  }
}
