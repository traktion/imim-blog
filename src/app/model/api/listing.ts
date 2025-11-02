export class Listing {
  public name: string;
  public type: string;
  public mtime: string;
  public size: number;

  constructor(name: string = '', type: string = '', mtime: string = '', size: number = 0) {
    this.name = name;
    this.type = type;
    this.mtime = mtime;
    this.size = size;
  }
}
