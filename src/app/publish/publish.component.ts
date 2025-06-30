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
import {interval, Observable, takeUntil, timer, repeat, filter, take, takeWhile} from 'rxjs';
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
  articleStatus$!: Observable<ArticleStatus>;
  statusTimer$!: Observable<number>;
  pointerAddress: string;
  registerAddress: string;
  listXor: string;
  isSubmitting: boolean;

  articleMarkdown: string;
  targetBlog: string;
  blogName: string;
  articleName: string;
  sourceAddress: string;
  blogAddress: string;
  blogAddressType: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navigationService: NavigationService,
    private locationStrategy: LocationStrategy,
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
    if (this.isSubmitting) {return; }
    this.isSubmitting = true;
    this.articleMarkdown = new TurndownService({ headingStyle: 'atx' }).turndown(this.articleForm.get('html').value);
    console.warn("form markdown: " + this.articleMarkdown);

    this.targetBlog = this.articleForm.get('targetBlog').value
    this.blogName = this.articleForm.get('blogName').value;
    this.articleName = this.articleForm.get('articleName').value;
    this.sourceAddress = this.listXor;
    this.blogAddress = this.listXor;
    this.blogAddressType = 'immutable';
    if (this.blogService.isImmutable(this.listXor)) {
      this.createArticle();
    } else {
      this.blogService.getPointer(this.listXor).subscribe(pointer => {
        console.log("pointer: " + pointer.content);
        if (pointer.content) {
          this.sourceAddress = this.listXor;
          this.blogAddress = pointer.content;
          this.blogAddressType = 'pointer';
          this.createArticle();
        } else {
          this.blogService.getRegister(this.listXor).subscribe(register => {
            if (!register.content) {
              this.sourceAddress = this.listXor;
              this.blogAddress = register.content;
              this.blogAddressType = 'register';
              this.createArticle();
            }
          });
        }
      });
    }
  }

  createArticle() {
    if (this.targetBlog == "existingBlog" ) {
      console.log("createArticleForExistingBlog: " + this.blogAddress);
      this.blogService.createArticleForExistingBlog(this.blogAddress, this.articleMarkdown, this.articleName).subscribe(articleStatus => {
        console.log("articleStatus id: [" + articleStatus.id + "], status: [" + articleStatus.status + "], address: [" + articleStatus.address + "]");

        let status = "";
        timer(0, 5000)
          .pipe(
            takeWhile(() => status != "failed" && status != "succeeded"),
          )
          .subscribe(() => {
            this.articleStatus$ = this.blogService.getArticleStatus(articleStatus.id);
            this.articleStatus$.subscribe(result => {
              status = result.status;
              if (result.status == 'succeeded' && this.blogAddressType == 'pointer') {
                // set pointer to new address
                console.log("upload succeeded - updating pointer [" + this.sourceAddress + "], blog name [" + this.blogName + "], address [" + result.address + "]");
                this.blogService.setPointer(this.sourceAddress, this.blogName, result.address).subscribe(pointer => this.pointerAddress = pointer.address);
              } else if (result.status == 'succeeded' && this.blogAddressType == 'register') {
                // set register to new address
                console.log("upload succeeded - updating register [" + this.sourceAddress + "], blog name [" + this.blogName + "], address [" + result.address + "]");
                this.blogService.setRegister(this.sourceAddress, this.blogName, result.address).subscribe(register => this.registerAddress = register.address);;
              } else if (result.status == 'succeeded') {
                console.log("upload succeeded - creating pointer blog name [" + this.blogName + "], address [" + result.address + "]");
                this.blogService.createPointer(this.blogName, result.address).subscribe(pointer => this.pointerAddress = pointer.address);
              } else if (result.status == 'failed') {
                this.isSubmitting = false;
              }
            });
          });
      });
    } else {
      console.log("createArticleForNewBlog: " + this.blogAddress);
      this.blogService.createArticleForNewBlog(this.articleMarkdown, this.articleName).subscribe(articleStatus => {
        console.log("articleStatus id: [" + articleStatus.id + "], status: [" + articleStatus.status + "], address: [" + articleStatus.address + "]");

        let status = "";
        timer(0, 5000)
          .pipe(
            takeWhile(() => status != "failed" && status != "succeeded"),
          )
          .subscribe(() => {
            this.articleStatus$ = this.blogService.getArticleStatus(articleStatus.id);
            this.articleStatus$.subscribe(result => {
              status = result.status;
              if (result.status == 'succeeded') {
                console.log("upload succeeded - creating pointer blog name [" + this.blogName + "], address [" + result.address + "]");
                this.blogService.createPointer(this.blogName, result.address).subscribe(pointer => this.pointerAddress = pointer.address);
              } else if (result.status == 'failed') {
                this.isSubmitting = false;
              }
            });
          });
      });
    }
  }

  onSuccess() {
    // stop getArticleStatus
  }
}
