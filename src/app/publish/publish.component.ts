import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import Quill from 'quill';
import Block from 'quill/blots/block';
import {Observable, of} from 'rxjs';
import TurndownService from 'turndown';
import {BlogService} from '../blog.service';
import {NavigationService} from '../service/navigation.service';

Block.tagName = 'DIV';
Quill.register(Block, true);

@Component({
  selector: 'app-publish',
  standalone: false,
  styleUrls: ['./publish.component.css'],
  templateUrl: './publish.component.html',
})
export class PublishComponent implements OnInit {
  public placeholder: string;
  public content: string;
  public saveControl = new FormControl('Publish');
  public targetBlogControl = new FormControl('');
  public blogNameControl = new FormControl('');
  public articleNameControl = new FormControl('');
  public articleForm = new FormGroup({
    articleName: this.articleNameControl,
    blogName: this.blogNameControl,
    html: new FormControl('<h1>Replace With Article Heading</h1><br/><p>Replace with article content.</p>'),
    save: this.saveControl,
    targetBlog: this.targetBlogControl,
  });
  public status$!: Observable<string>;
  public listXor: string;
  public articleMarkdown: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navigationService: NavigationService,
    private blogService: BlogService,
  ) {
    this.placeholder = 'placeholder';
    this.content = 'content';
  }

  public ngOnInit(): void {
    this.navigationService.update(
      this.route.snapshot.paramMap.get('listXor') ?? '',
      this.route.snapshot.paramMap.get('articleXor') ?? '',
    );

    this.listXor = this.route.snapshot.paramMap.get('listXor') ?? '';
  }

  public onSubmit(): void {
    console.warn('form submit: ' + this.articleForm.get('html').value);
    this.articleMarkdown = new TurndownService({ headingStyle: 'atx' })
      .turndown(this.articleForm.get('html').value.replace('&nbsp;', ' '))
      .normalize('NFKD');
    console.warn('form markdown: ' + this.articleMarkdown);

    const targetBlog = this.articleForm.get('targetBlog').value;
    const blogName = this.articleForm.get('blogName').value;
    const articleName = this.articleForm.get('articleName').value;
    const sourceAddress = this.listXor;

    try {
      if (targetBlog === 'existing' && this.listXor !== 'unknown') {
        if (this.blogService.isImmutable(this.listXor)) {
          this.createArticleForExistingBlog(blogName, articleName, this.articleMarkdown, this.listXor, 'immutable', sourceAddress);
        } else {
          this.blogService.getPointer(this.listXor).subscribe((pointer) => {
            console.log('pointer: ' + pointer.content);
            if (pointer.content) {
              this.createArticleForExistingBlog(blogName, articleName, this.articleMarkdown, pointer.content, 'pointer', sourceAddress);
            } else {
              this.blogService.getRegister(this.listXor).subscribe((register) => {
                console.log('register: ' + register.content);
                if (!register.content) {
                  this.createArticleForExistingBlog(
                    blogName, articleName, this.articleMarkdown, register.content, 'register', sourceAddress);
                }
              });
            }
          });
        }
      } else {
        this.createArticleForNewBlog(blogName, articleName, this.articleMarkdown);
      }
    } catch (e) {
      console.log('failed to create article');
      this.status$ = of('Error: ' + e);
    }
  }

  public createArticleForExistingBlog(blogName: string, articleName: string, articleMarkdown: string, blogAddress: string,
                                      blogAddressType: string, sourceAddress: string): void {
    console.log('createArticleForExistingBlog: ' + blogName);
    this.blogService.createArticleForExistingBlog(blogAddress, articleMarkdown, articleName).subscribe((articleStatus) => {
      console.log('articleStatus address: [' + articleStatus.address + ']');

      if (blogAddressType === 'pointer') {
        // set pointer to new address
        console.log('upload succeeded - updating pointer blog name [' + blogName + '], address [' + articleStatus.address + ']');
        this.blogService.setPointer(sourceAddress, blogName, articleStatus.address).subscribe((pointer) => {
          this.router.navigate([this.navigationService.getArticleUrl(pointer.address, this.blogService.getArticleName(articleName))]);
        });
      } else if (blogAddressType === 'register') {
        // set register to new address
        console.log('upload succeeded - updating register blog name [' + blogName + '], address [' + articleStatus.address + ']');
        this.blogService.setRegister(sourceAddress, blogName, articleStatus.address).subscribe((register) => {
          this.router.navigate([this.navigationService.getArticleUrl(register.address, this.blogService.getArticleName(articleName))]);
        });
      } else {
        console.log('upload succeeded - creating pointer blog name [' + blogName + '], address [' + articleStatus.address + ']');
        this.blogService.createPointer(blogName, articleStatus.address).subscribe((pointer) => {
          this.router.navigate([this.navigationService.getArticleUrl(pointer.address, this.blogService.getArticleName(articleName))]);
        });
      }
    });
  }

  public createArticleForNewBlog(blogName: string, articleName: string, articleMarkdown: string): void {
    console.log('createArticleForNewBlog: ' + blogName);
    this.blogService.createArticleForNewBlog(articleMarkdown, articleName).subscribe((articleStatus) => {
      console.log('articleStatus address: [' + articleStatus.address + ']');

      console.log('upload succeeded - creating pointer blog name [' + blogName + '], address [' + articleStatus.address + ']');
      this.blogService.createPointer(blogName, articleStatus.address).subscribe((pointer) => {
        this.router.navigate([this.navigationService.getArticleUrl(pointer.address, this.blogService.getArticleName(articleName))]);
      });
    });
  }
}
