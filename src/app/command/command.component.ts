import {NgForOf} from '@angular/common';
import { Component } from '@angular/core';
import {BlogService} from '../blog.service';
import {Command} from '../model/api/command';

@Component({
  imports: [
    NgForOf,
  ],
  selector: 'app-command',
  styleUrl: './command.component.css',
  templateUrl: './command.component.html',
})
export class CommandComponent {
  public commands: Command[];

  constructor(public blogService: BlogService,
  ) {
  }

  public ngOnInit(): void {
    this.blogService.getCommands().subscribe((commands) => {
      this.commands = commands;
    });
  }
}
