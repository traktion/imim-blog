import {LocationStrategy} from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MarkdownService} from 'ngx-markdown';
import {NgxSpinnerService} from 'ngx-spinner';
import {Subscription} from 'rxjs';
import {BlogService} from '../blog.service';
import {NavigationService} from '../service/navigation.service';

@Component({
  selector: 'app-article',
  standalone: false,
  styleUrls: ['./article.component.css'],
  templateUrl: './article.component.html',
})
export class ArticleComponent implements OnInit {
  public message: string;
  public messageSubscription: Subscription;
  public listXor: string;
  public articleXor: string;
  public articleUrl: string;
  public filePrefix: string;
  public listSuffix: string;

  constructor(private route: ActivatedRoute,
              private router: Router,
              public blogService: BlogService,
              private markdownService: MarkdownService,
              public navigationService: NavigationService,
              private locationStrategy: LocationStrategy,
              private spinner: NgxSpinnerService,
  ) {
    this.message = '';
    this.messageSubscription = new Subscription();
    this.listXor = '';
    this.articleUrl = '';
    this.filePrefix = '';
    this.listSuffix = '';
  }

  public ngOnInit(): void {
    this.spinner.show();

    this.articleUrl = this.route.snapshot.url.join('/');
    this.listXor = this.route.snapshot.paramMap.get('listXor') ?? '';
    this.articleXor = this.route.snapshot.paramMap.get('articleXor') ?? '';
    const path1 = this.route.snapshot.paramMap.get('path1') ?? '';
    const path2 = this.route.snapshot.paramMap.get('path2') ?? '';
    if (path1 !== '') {
      this.filePrefix = this.filePrefix + path1;
      this.listSuffix = this.listSuffix + '/' + path1;
    }
    if (path2 !== '') {
      this.filePrefix = this.filePrefix + '/' + path2;
      this.listSuffix = this.listSuffix + '/' + path2;
    }
    if (this.filePrefix !== '') { this.filePrefix = this.filePrefix + '/'; }
    console.log('path1: ' + path1 + ', path2: ' + path2 + ', this.listSuffix: ' + this.listSuffix
      + ', this.filePrefix: ' + this.filePrefix);

    this.markdownService.renderer.link = ({href, title, text}) => {
      if (title == null) { title = Math.floor(Math.random() * 10000).toString(); }
      console.log('render link: ' + href + ', title: ' + title);
      if (href.endsWith('.mp4')) {
        return '<video id="' + title + '" width="100%" controls preload="metadata" vjs-fluid vjs-playback-rate class="video-js">'
          + '<source src="' + href + '" type="video/mp4" />Your browser does not support the video tag.</video>';
      } else if (href.endsWith('.mp3')) {
        return '<audio controls>'
          + '<source src="'  + href + '" type="audio/mp3" />Your browser does not support the audio element.</audio>';
      } else if (href.startsWith('data:image')) {
        return '<img class="img-fluid" src="' + href + '" title="' + title + '" alt="' + text + '">';
      } else {
        return '<a href="' + href + '">' + text + '</a>';
      }
    };

    this.markdownService.renderer.image = ({href, title, text}) => {
      if (title == null) { title = Math.floor(Math.random() * 10000).toString(); }
      let origin = 'http://';
      if (window.location.pathname.startsWith('/gimim')) { origin = window.location.origin  + '/'; }
      console.log('render image: ' + this.filePrefix + href + ', title: ' + title);
      if (href.endsWith('.mp4')) {
        return '<video id="' + title + '" width="100%" controls preload="metadata" vjs-fluid vjs-playback-rate class="video-js">'
          + '<source src="' + origin + this.listXor + '/' + this.filePrefix + href + '" type="video/mp4" />Your browser does not support the video tag.</video>';
      } else if (href.endsWith('.mp3')) {
        return '<audio controls>'
          + '<source src="' + origin + this.listXor + '/' + this.filePrefix + href + '" type="audio/mp3" />Your browser does not support the audio element.</audio>';
      } else if (href.startsWith('data:image')) {
        return '<img class="img-fluid" src="' + this.filePrefix + href + '" title="' + title + '" alt="' + text + '">';
      } else {
        return '<img class="img-fluid" src="' + origin + this.listXor + '/' + this.filePrefix + href + '" title="' + title + '" ' +
          'alt="' + text + '">';
      }
    };

    this.navigationService.update(
      this.listXor + this.listSuffix,
      this.articleXor,
    );

    this.messageSubscription = this.blogService.getArticle(this.listXor + this.listSuffix, this.articleXor).subscribe((val) => {
      /*todo: handle double fragments on navigation links*/
      const url = this.locationStrategy.getBaseHref() + this.navigationService.navItems[1].url + '#article';
      this.message = this.blogService.formatMarkdownHeader1(val, url);
      this.message = this.blogService.formatMarkdownSafeUrls(this.message);
      this.spinner.hide();
    });

    setTimeout(() => {
      /** spinner ends after 5 seconds */
      this.spinner.hide();
    }, 60000);
  }

  public onReady(): void {
    console.log('article ready');
  }
}
