export class Message {
  public url: string;
  public content: string;

  constructor(url: string = '', content: string = '') {
    this.url = url;
    this.content = content;
  }

  getSummary(): string {
    return this.content.substr(0, 1000).trim() + '...';
  }
}
