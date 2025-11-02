import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MarkdownModule, MARKED_OPTIONS } from 'ngx-markdown';
import { QuillModule } from 'ngx-quill';
import { QuillConfigModule } from 'ngx-quill/config';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ArticleComponent } from './article/article.component';
import { BlogComponent } from './blog/blog.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { PublishComponent } from './publish/publish.component';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    ArticleComponent,
    BlogComponent,
    PublishComponent,
  ], imports: [BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgbModule,
    MarkdownModule.forRoot({
      // loader: HttpClient, // optional, only if you use [src] attribute
      markedOptions: {
        provide: MARKED_OPTIONS,
        useValue: {
          breaks: false,
          gfm: true,
          pedantic: false,
        },
      },
    }),
    NgxSpinnerModule,
    QuillModule.forRoot(),
    QuillConfigModule.forRoot({
      modules: {
        syntax: false,
        toolbar: [
          ['bold', 'italic'],        // toggled buttons
          ['blockquote'],

          [{header: 1}, {header: 2}],               // custom button values
          [{list: 'ordered'}, {list: 'bullet'}],

          [{header: [1, 2, 3, 4, 5, 6, false]}],

          ['link', 'image', 'video'],
        ],
      },
    }),
  ], providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class AppModule { }
