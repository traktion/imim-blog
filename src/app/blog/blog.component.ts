import { Component, OnInit } from '@angular/core';
import {Subscription} from 'rxjs';
import {Message} from '../message';
import {ActivatedRoute, Router} from '@angular/router';
import {BlogService} from '../blog.service';
import {MarkdownService} from 'ngx-markdown';
import {NavigationService} from '../navigation.service';
import {LocationStrategy} from '@angular/common';
import {Listing} from '../listing';
import {SnConfig} from '../sn-config';
import {NgxSpinnerService} from "ngx-spinner";

@Component({
    selector: 'app-blog',
    templateUrl: './blog.component.html',
    styleUrls: ['./blog.component.css'],
    standalone: false
})
export class BlogComponent implements OnInit {

  blogName: string;
  articleUrls: Listing[];
  blogSubscription: Subscription;
  articleSubscription: Subscription;
  listXor: string;
  articles: Message[];

  constructor(private route: ActivatedRoute,
              private router: Router,
              public blogService: BlogService,
              private markdownService: MarkdownService,
              private navigationService: NavigationService,
              private locationStrategy: LocationStrategy,
              private spinner: NgxSpinnerService) {
    this.blogName = 'IMIM';
    this.articleUrls = [];
    this.blogSubscription = new Subscription();
    this.articleSubscription = new Subscription();
    this.listXor = '';
    this.articles = [];
  }

  ngOnInit(): void {
    this.spinner.show();

    this.listXor = this.route.snapshot.paramMap.get('listXor') ?? '';

    this.markdownService.renderer.link = ({href, title, text}) => {
          console.log("render href: " + href);
          if (href.endsWith(".mp4")) {
            return '<video id="' + title + '" width="500" height="380" controls preload="none">'
              + '<source src="' + href + '" type="video/mp4">Your browser does not support the video tag.</video>';
          } else if (href.endsWith(".mp3")) {
            return '<audio controls>'
              + '<source src="'  + href + '" type="audio/mp3">Your browser does not support the audio element.</audio>';
          } else if (href.startsWith("data:image")) {
            return '<img class="img-fluid" src="' + href + '" title="' + title + '" alt="' + text + '">';
          } else {
            return '<a href="' + href + '">' + text + '</a>';
          }
        };

    this.markdownService.renderer.image = ({href, title, text}) => {
      console.log("render link: " + href);
      if (href.endsWith(".mp4")) {
        return '<video id="' + title + '" width="500" height="380" controls preload="none">'
          + '<source src="http://' + this.listXor + '/' + href + '" type="video/mp4">Your browser does not support the video tag.</video>';
      } else if (href.endsWith(".mp3")) {
        return '<audio controls>'
          + '<source src="http://' + this.listXor + '/' + href + '" type="audio/mp3">Your browser does not support the audio element.</audio>';
      } else if (href.startsWith("data:image")) {
        return '<img class="img-fluid" src="' + href + '" title="' + title + '" alt="' + text + '">';
      } else {
        return '<img class="img-fluid" src="http://' + this.listXor + '/' + href + '" title="' + title + '" alt="' + text + '">';
      }
    };

    this.navigationService.update(this.route.snapshot.paramMap.get('listXor') ?? '');

    this.blogSubscription = this.blogService.getSnConfig(this.listXor)
    .subscribe(config => {
      this.articleUrls = config;

      for (const articleXor of this.articleUrls ) {
        if (this.isMarkdown(articleXor)) {
          this.articleSubscription = this.blogService.getArticle(this.listXor, articleXor.name).subscribe(articleContent => {
            const articleUrl = this.navigationService.getArticleUrl(this.listXor, articleXor.name.substring(articleXor.name.lastIndexOf('/') + 1));
            const navArticleUrl = '/' + articleUrl;
            const markdownArticleUrl = this.locationStrategy.getBaseHref() + articleUrl + '#article';
            articleContent = this.blogService.formatMarkdownHeader1(
              articleContent,
              markdownArticleUrl
            );
            articleContent = this.blogService.formatMarkdownSafeUrls(articleContent);
            this.articles.push(new Message(navArticleUrl, articleContent));
          });
        }
      }
      this.spinner.hide();
    });

    setTimeout(() => {
      /** spinner ends after 5 seconds */
      this.spinner.hide();
    }, 60000);
  }

  isMarkdown(listing: Listing): boolean {
    return listing.name.endsWith(".md")
  }

  onReady(): void {
    console.log('blog ready');
    this.spinner.hide();
  }

}
