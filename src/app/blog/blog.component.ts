import {LocationStrategy} from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MarkdownService} from 'ngx-markdown';
import {NgxSpinnerService} from 'ngx-spinner';
import {Subscription} from 'rxjs';
import {BlogService} from '../blog.service';
import {Listing} from '../model/api/listing';
import {Message} from '../model/dto/message';
import {NavigationService} from '../service/navigation.service';

@Component({
  selector: 'app-blog',
  standalone: false,
  styleUrls: ['./blog.component.css'],
  templateUrl: './blog.component.html',
})
export class BlogComponent implements OnInit {

  public blogName: string;
  public blogSubscription: Subscription;
  public articleSubscription: Subscription;
  public listXor: string;
  public articles: Message[];
  public filePrefix: string;
  public listSuffix: string;

  constructor(private route: ActivatedRoute,
              public blogService: BlogService,
              private markdownService: MarkdownService,
              private navigationService: NavigationService,
              private locationStrategy: LocationStrategy,
              private spinner: NgxSpinnerService) {
    this.blogName = 'IMIM';
    this.blogSubscription = new Subscription();
    this.articleSubscription = new Subscription();
    this.listXor = '';
    this.articles = [];
    this.filePrefix = '';
    this.listSuffix = '';
  }

  public ngOnInit(): void {
    this.spinner.show();

    this.listXor = this.route.snapshot.paramMap.get('listXor') ?? '';
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

    this.markdownService.renderer.link = ({href, title, text}) => {
      if (title == null) { title = Math.floor(Math.random() * 10000).toString(); }
      console.log('render link: ' + href + ', title: ' + title);
      if (href.endsWith('.mp4')) {
        return '<video id="' + title + '" width="100%" controls preload="none" vjs-fluid vjs-playback-rate class="video-js">'
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
      console.log('render image: ' + href + ', title: ' + title);
      if (href.endsWith('.mp4')) {
        return '<video id="' + title + '" width="100%" controls preload="none" vjs-fluid vjs-playback-rate class="video-js">'
          + '<source src="' + origin + this.listXor + '/' + this.filePrefix + href + '" type="video/mp4" />Your browser does not support the video tag.</video>';
      } else if (href.endsWith('.mp3')) {
        return '<audio controls>'
          + '<source src="' + origin + this.listXor + '/' + this.filePrefix + href + '" type="audio/mp3" />Your browser does not support the audio element.</audio>';
      } else if (href.startsWith('data:image')) {
        return '<img class="img-fluid" src="' + this.filePrefix + href + '" title="' + title + '" alt="' + text + '">';
      } else {
        return '<img class="img-fluid" ' +
          'src="' + origin + this.listXor + '/' + this.filePrefix + href + '" title="' + title + '" alt="' + text + '">';
      }
    };

    this.navigationService.update(this.listXor + this.listSuffix);

    this.blogSubscription = this.blogService.getDirectoryListing(this.listXor + this.listSuffix)
    .subscribe((files) => {
      for (const file of files) {
        if (this.isMarkdown(file)) {
          // note: file.name is the full file.path
          const message = new Message('', 'Loading...');
          this.articles.push(message);
          this.articleSubscription = this.blogService.getArticle(this.listXor + this.listSuffix, file.name).subscribe((articleContent) => {
            const articleUrl = this.navigationService.getArticleUrl(
              this.listXor + this.listSuffix, file.name.substring(file.name.lastIndexOf('/') + 1));
            const navArticleUrl = '/' + articleUrl;
            const markdownArticleUrl = this.locationStrategy.getBaseHref() + articleUrl + '#article';
            articleContent = this.blogService.formatMarkdownHeader1(
              articleContent,
              markdownArticleUrl,
            );
            articleContent = this.blogService.formatMarkdownSafeUrls(articleContent);
            message.url = navArticleUrl;
            message.content = articleContent;
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

  public isMarkdown(listing: Listing): boolean {
    return listing.name.endsWith('.md');
  }

  public onReady(): void {
    console.log('blog ready');
    this.spinner.hide();
  }

}
