export class Pointer {
  name: string;
  content: string;
  address: string;
  cost: number;
  counter: number;

  constructor(name: string = '', content: string = '', address: string = '', cost: number = 0, counter: number = 0) {
    this.name = name;
    this.content = content;
    this.address = address;
    this.cost = cost;
    this.counter = counter;
  }
}
