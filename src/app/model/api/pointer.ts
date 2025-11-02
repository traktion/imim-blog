export class Pointer {
  public name: string;
  public content: string;
  public address: string;
  public cost: number;
  public counter: number;

  constructor(name: string = '', content: string = '', address: string = '', cost: number = null, counter: number = null) {
    this.name = name;
    this.content = content;
    this.address = address;
    this.cost = cost;
    this.counter = counter;
  }
}
