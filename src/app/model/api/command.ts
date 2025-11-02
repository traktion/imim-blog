import {CommandProperties} from './command-properties';

export class Command {
  public id: string;
  public name: string;
  public properties: CommandProperties[];
  public state: string;
  public waiting_at: number;
  public running_at: number;
  public terminated_at: number;
}
