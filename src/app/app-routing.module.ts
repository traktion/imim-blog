import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ArticleComponent } from './article/article.component';
import { BlogComponent } from './blog/blog.component';
import { PublishComponent } from './publish/publish.component';

const routes: Routes = [
  {path: '', component: HomeComponent },
  {path: 'blog/:listXor', component: BlogComponent },
  {path: 'blog/:listXor/article/:articleXor', component: ArticleComponent},
  {path: 'blog/:listXor/publish', component: PublishComponent},
  {path: 'blog/:listXor/:path1', component: BlogComponent },
  {path: 'blog/:listXor/:path1/article/:articleXor', component: ArticleComponent},
  {path: 'blog/:listXor/:path1/:path2', component: BlogComponent },
  {path: 'blog/:listXor/:path1/:path2/article/:articleXor', component: ArticleComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
