import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NavigationService} from '../service/navigation.service';

@Component({
  selector: 'app-header',
  standalone: false,
  styleUrls: ['./header.component.css'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {

  constructor(public route: ActivatedRoute,
              public router: Router,
              public navigationService: NavigationService) {
  }

  public ngOnInit(): void {
  }

}
