export class Message {
  public url: string;
  public content: string;

  constructor(url: string = '', content: string = '') {
    this.url = url;
    this.content = content;
  }
}
