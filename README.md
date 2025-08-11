# I Am IMMUTABLE client

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.12.

## Background

_I Am Immutable_ is a blog application which is native to the Safe Network. It allows a blog's articles to be
persisted to the network and accessible _in perpetuity_. Once the native Safe Network browser is available,
_I Am Immutable_ will automatically switch to access the same data without needing a gateway application.

You will not be mutable. Neither will your data.

This client should be used with the **sn_httpd** application. This provides an HTTP gateway to the Safe Network
where required. The sn_httpd application also hosts the static application files directly for convenience, but these could also
live on the Safe Network too (in a future release).

The sn_httpd application can be run locally or remotely. It just needs to be pointed to a Safe Network node to
retrieve Safe Network data. This prevents censorship of the data, even if the website hosting the client becomes
unavailable.

## Adding Content

Articles should be created using Markdown (like this README.md file). These are easy to write
with a simple syntax and editors are available too. The application will convert these Markdown
files to HTML on the fly.

The articles can also have links to images defined, using Safe URLs. These will be redirected by
the application to retrieve them via the sn_httpd gateway automatically.

Once the articles have been written, they can be uploaded to the Safe Network using the CLI. Remember
to upload any images linked to the article:

```
$ safe files upload "Safe Network Awakens.md" -p
"Safe Network Awakens.md" 5caa08a4ed242440b8321d881121bf61cea4f734044781d8963c0eef6d3c5247

$ safe files upload "Clean, green, immutable dream.md" -p 
"Clean, green, immutable dream.md" 926a4e83b45d4dac7f669bc6029abdce76065eb80dee23efcb5ab10554294c03

$ safe files put 1_dH5Ce6neTHIfEkAbmsr1BQ.jpeg -p
FilesContainer created at: "safe://hyryyrbppafifr5apujw3kjaxyhje4jpgqwbnb3cgwrt6tc74hi4hu53gsynra"
+  1_dH5Ce6neTHIfEkAbmsr1BQ.jpeg  safe://hygoygyq3eyyawhnjms9ziwaa1sadf5hnronymh3h3eiibapuxgt7tpjc3c
...
$ safe files put 1_DOuipmOec4q8Neer_95qQA.jpeg -p
FilesContainer created at: "safe://hyryyrbeg81nt9xrz81t4qot4zj47ydfckshkx166j9ojpfy8zpurcz3dzynra"
+  1_DOuipmOec4q8Neer_95qQA.jpeg  safe://hygoygymhpekj9o3363pwgntybotaz8kp3kpfkndw3m4boqi9ty5uig91oc
```

Create an index file, containing the list of Safe URLs created as above.

```
echo "{
	"name": "Traktion Blog",
	"urls": [
		"safe://5caa08a4ed242440b8321d881121bf61cea4f734044781d8963c0eef6d3c5247",
		"safe://926a4e83b45d4dac7f669bc6029abdce76065eb80dee23efcb5ab10554294c03"
	],
	"assets": []
}" > imim-conf.json
```

Upload this index to the network too:

```
$ safe files upload imim-conf.json -p
"imim-conf.json" fb31a105d47179338dcad8fe76dd0cbffcc378543ad2464e856a282d5d325d6f
```

It is recommended that an NRS URL is created to point to this index file. This prevents aggressive
caching and allows it to be updated dynamically with new/updated articles.

```
$ safe nrs create -l safe://hyfey4yj17m73on3rsdwg7uqei4gf9egqma7yisoza8yg3daof1e5apw1pe safeblog
New NRS Map for "safe://safeblog" created at: "safe://hyryygbptdnwk5y5m14eqxgd8x1cxjs8kudpj9g4rcz1zjyz6d4z9zddddcn7a"
+  safeblog  safe://hyfey4yj17m73on3rsdwg7uqei4gf9egqma7yisoza8yg3daof1e5apw1pe
```

Conversely, articles, images and other content benefit from using an XOR URL. These can then be 
aggressively cached for an optimal user experience.

If changes to an article are required, upload the new content, then replace the old XOR URL with the
new XOR URL.

```
$ safe files upload "Safe Network Awakens2.md" -p
"Safe Network Awakens2.md" 1e14d2eac95faf5a2f09d84962ab773576d0e4c60ed6bcf91f51951010e14fed
```

```
echo "{
	"name": "Traktion Blog",
	"urls": [
		"safe://1e14d2eac95faf5a2f09d84962ab773576d0e4c60ed6bcf91f51951010e14fed",
		"safe://926a4e83b45d4dac7f669bc6029abdce76065eb80dee23efcb5ab10554294c03"
	],
	"assets": []
}" > imim-conf2.json
```

```
$ safe files upload imim-conf2.json -p 
"imim-conf2.json" 56a1dff0606d724b55f552c2b9972810dee4c102aebd975f640cb43d490b6f2e
```

```
$ safe nrs add -l safe://hyfey4ymsjxbk585jr17bup89w1ydrdxfhht1u3ic4aguafs5shkcze5c6o safeblog
```

## Writing Tips

Use the following format for the header title, which will allow it to be linked to the article URL when it renders:

```
# Article Title #
```

## Viewing Blog

The blog URLs are used to derive the location of the blog and article data. The format is:

```
/blog/<blog-index-safe-url>/article/<article-safe-url>
```

## Development server

Run `ng serve --serve-path /gimim/` for a dev server. Navigate to `http://localhost:4200/gimim/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

For creating a gateway IMIM build:

`ng build --configuration production --base-href /gimim/ --deploy-url /gimim/`

For creating a proxy IMIM build:

`ng build --configuration production --base-href / --deploy-url /`

Then copy `/src/app-conf.json` to `dist/i-am-immutable-client/app-conf.json`, before uploading.

Then build tarchive:

`cd i-am-immutable-client/; tar -cf ../archive.tar ./; cd ..; python3 ~/dev/tarindexer/tarindexer.py -i archive.tar archive.tar.idx; tar -rf archive.tar archive.tar.idx;`

Then upload to Autonomi:

`ant file upload -p archive.tar`

Then update pointer for `imim` (proxy) or `gimim` (gateway) to use the latest content address of archive.tar.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
