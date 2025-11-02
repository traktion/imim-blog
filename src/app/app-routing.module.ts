import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ArticleComponent} from './article/article.component';
import {BlogComponent} from './blog/blog.component';
import {CommandComponent} from './command/command.component';
import {HomeComponent} from './home/home.component';
import {PublishComponent} from './publish/publish.component';

const routes: Routes = [
  {path: '', component: HomeComponent },
  {path: 'blog/:listXor', component: BlogComponent },
  {path: 'blog/:listXor/article/:articleXor', component: ArticleComponent},
  {path: 'blog/:listXor/status', component: CommandComponent },
  {path: 'blog/:listXor/publish', component: PublishComponent},
  {path: 'blog/:listXor/:path1', component: BlogComponent },
  {path: 'blog/:listXor/:path1/article/:articleXor', component: ArticleComponent},
  {path: 'blog/:listXor/:path1/:path2', component: BlogComponent },
  {path: 'blog/:listXor/:path1/:path2/article/:articleXor', component: ArticleComponent},
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)],
})
export class AppRoutingModule { }
