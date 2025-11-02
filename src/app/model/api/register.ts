export class Register {
  public name: string;
  public content: string;
  public address: string;
  public cost: number;

  constructor(name: string = '', content: string = '', address: string = '', cost: number = 0) {
    this.name = name;
    this.content =  content;
    this.address = address;
    this.cost = cost;
  }
}
