import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MarkdownService } from 'ngx-markdown';
import { NavigationService } from '../navigation.service';
import { LocationStrategy } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EditorChangeContent, EditorChangeSelection, QuillEditorComponent } from 'ngx-quill'
import Quill from 'quill'
import Block from 'quill/blots/block';
import TurndownService from 'turndown';
import {BlogService} from '../blog.service';
import {ArticleStatus} from '../article_status';
import {interval, Observable, takeUntil, timer, repeat, filter, take, takeWhile, of} from 'rxjs';
import {flatMap, concatMap} from 'rxjs/operators';

Block.tagName = "DIV";
Quill.register(Block, true);

@Component({
    selector: 'app-publish',
    templateUrl: './publish.component.html',
    styleUrls: ['./publish.component.css'],
    standalone: false
})
export class PublishComponent implements OnInit {
  placeholder: string;
  content: string;
  saveControl = new FormControl('Publish');
  targetBlogControl = new FormControl('');
  blogNameControl = new FormControl('');
  articleNameControl = new FormControl('');
  articleForm = new FormGroup({
    save: this.saveControl,
    html: new FormControl('<h1>Replace With Article Heading</h1><br/><p>Replace with article content.</p>'),
    targetBlog: this.targetBlogControl,
    blogName: this.blogNameControl,
    articleName: this.articleNameControl
  });
  status$!: Observable<string>;
  pointerAddress: string;
  registerAddress: string;
  listXor: string;
  isSubmitting: boolean;

  articleMarkdown: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navigationService: NavigationService,
    private blogService: BlogService,
  ) {
    this.placeholder = "placeholder";
    this.content = "content";
  }

  ngOnInit(): void {
    this.navigationService.update(
      this.route.snapshot.paramMap.get('listXor') ?? '',
      this.route.snapshot.paramMap.get('articleXor') ?? ''
    );

    this.listXor = this.route.snapshot.paramMap.get('listXor') ?? '';
  };

  onSubmit() {
    console.warn("form submit: " + this.articleForm.get('html').value);
    //if (this.isSubmitting) {return; }
    this.isSubmitting = true;
    this.articleMarkdown = new TurndownService({ headingStyle: 'atx' })
      .turndown(this.articleForm.get('html').value.replace("&nbsp;", " "))
      .normalize("NFKD");
    console.warn("form markdown: " + this.articleMarkdown);

    const targetBlog = this.articleForm.get('targetBlog').value
    const blogName = this.articleForm.get('blogName').value;
    const articleName = this.articleForm.get('articleName').value;
    const sourceAddress = this.listXor;

    try {
      if (targetBlog == "existing" && this.listXor != "unknown") {
        if (this.blogService.isImmutable(this.listXor)) {
          this.createArticleForExistingBlog(blogName, articleName, this.articleMarkdown, this.listXor, 'immutable', sourceAddress);
        } else {
          this.blogService.getPointer(this.listXor).subscribe(pointer => {
            console.log("pointer: " + pointer.content);
            if (pointer.content) {
              this.createArticleForExistingBlog(blogName, articleName, this.articleMarkdown, pointer.content, 'pointer', sourceAddress);
            } else {
              this.blogService.getRegister(this.listXor).subscribe(register => {
                console.log("register: " + register.content);
                if (!register.content) {
                  this.createArticleForExistingBlog(blogName, articleName, this.articleMarkdown, register.content, 'register', sourceAddress);
                }
              });
            }
          });
        }
      } else {
        this.createArticleForNewBlog(blogName, articleName, this.articleMarkdown);
      }
    } catch(e) {
      console.log("failed to create article");
      this.status$ = of("Error: " + e);
    }
  }

  createArticleForExistingBlog(blogName: string, articleName: string, articleMarkdown: string, blogAddress: string, blogAddressType: string, sourceAddress: string) {
    console.log("createArticleForExistingBlog: " + blogName);
    this.blogService.createArticleForExistingBlog(blogAddress, articleMarkdown, articleName).subscribe(articleStatus => {
      console.log("articleStatus address: [" + articleStatus.address + "]");

      if (blogAddressType == 'pointer') {
        // set pointer to new address
        console.log("upload succeeded - updating pointer [" + sourceAddress + "], blog name [" + blogName + "], address [" + articleStatus.address + "]");
        this.blogService.setPointer(sourceAddress, blogName, articleStatus.address).subscribe(pointer => {
          this.pointerAddress = pointer.address;
          this.router.navigate([this.navigationService.getArticleUrl(pointer.address, this.blogService.getArticleName(articleName))]);
        });
      } else if (blogAddressType == 'register') {
        // set register to new address
        console.log("upload succeeded - updating register [" + sourceAddress + "], blog name [" + blogName + "], address [" + articleStatus.address + "]");
        this.blogService.setRegister(sourceAddress, blogName, articleStatus.address).subscribe(register => {
          this.router.navigate([this.navigationService.getArticleUrl(register.address, this.blogService.getArticleName(articleName))]);
        });;
      } else {
        console.log("upload succeeded - creating pointer blog name [" + blogName + "], address [" + articleStatus.address + "]");
        this.blogService.createPointer(blogName, articleStatus.address).subscribe(pointer => {
          this.router.navigate([this.navigationService.getArticleUrl(pointer.address, this.blogService.getArticleName(articleName))]);
        });
      }
    });
  }

  createArticleForNewBlog(blogName: string, articleName: string, articleMarkdown: string) {
    console.log("createArticleForNewBlog: " + blogName);
    this.blogService.createArticleForNewBlog(articleMarkdown, articleName).subscribe(articleStatus => {
      console.log("articleStatus address: [" + articleStatus.address + "]");

      console.log("upload succeeded - creating pointer blog name [" + blogName + "], address [" + articleStatus.address + "]");
      this.blogService.createPointer(blogName, articleStatus.address).subscribe(pointer => {
        this.router.navigate([this.navigationService.getArticleUrl(pointer.address, this.blogService.getArticleName(articleName))]);
      });
    });
  }
}
