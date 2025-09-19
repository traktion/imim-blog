export class Pointer {
  name: string;
  content: string;
  address: string;
  cost: number;
  counter: number;

  constructor(name: string = '', content: string = '', address: string = '', cost: number = null, counter: number = null) {
    this.name = name;
    this.content = content;
    this.address = address;
    this.cost = cost;
    this.counter = counter;
  }
}
