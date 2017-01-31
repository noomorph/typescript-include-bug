# TypeScript "include" bug demo

This repository is demonstrating the issue [#13739](https://github.com/Microsoft/TypeScript/issues/13739).

Run `npm install && npm test` or take a look at [Travis CI page of this demo](https://travis-ci.org/noomorph/typescript-include-bug).  [![Build Status](https://travis-ci.org/noomorph/typescript-include-bug.svg?branch=master)](https://travis-ci.org/noomorph/typescript-include-bug)

In order to reproduce the issue, `typescript@next` is used, but the issue reproduces on stable versions of TS (`2.0.10`, `2.1.5`) as well.

### Question

Is this behavior absolutely intended?

* If yes, what are the official recommendations for such cases? It is obviously not a documented behavior (examine http://www.typescriptlang.org/docs/handbook/tsconfig-json.html ). Could you explain why does this behavior exist, please?
* If that is not something intended, do you think it is a bug or lack of configuration possibilities? I think I can work on a pull request, but I need more details for that.

### My issue

I've got a big TypeScript project (1000+ files) using hacky `filesGlob` solution from [grunt-ts](https://github.com/TypeStrong/grunt-ts) very similar to the Atom's one:

https://github.com/TypeStrong/atom-typescript/blob/master/docs/tsconfig.md#filesglob

```javascript
{
    "compilerOptions": {
        // ...
    },
    "filesGlob": [
        "app/**/*.ts",
        "!node_modules/**"
    ],
    "files": [
        // autogenerated using special Grunt task
    ]
}
```

I tried to migrate the project to `include` and `exclude` options, my attempt failed due to the following reason.

### Removing wildcard files with lower priority extension

Please take a look at the current code responsible for `include` and `exclude` functionality here in:  [src/compiler/commandLineParser.ts#L1250](https://github.com/Microsoft/TypeScript/blob/9cd7178434ec27e25b488558c4aa3e137e131b04/src/compiler/commandLineParser.ts#L1250).

Here I see that we always exclude files with same names and extensions of lower priority. I don't exactly understand why?..

### Why it doesn't work for me?

In lots of folders (modules) we've got a file with public declarations of the stuff from there, it looks like:

```
├── categories
│   ├── _categories.scss
│   ├── categories.driver.ts
│   ├── categories.spec.ts
│   ├── categories.ts
│   ├── categories.d.ts

```

And the problem is that when `tsc` compiler "expands" the folder it also is excluding the similar-looking files (having the same name but different extension).

In the example above, if `category.d.ts` has critical definitions for `category.ts` or `category.spec.ts`, it does not compile in my case.

I don't see a possibility to disable or configure this kind of exclusion.

That prevents my team from moving forward to `include`/`exclude` properties in `tsconfig.json` and dropping `filesGlob` hack.

### Example in this repo

This example is reproducing this case at a small scale. In `src` folder there are two folders: `different` and `same`. Even if the first one works great for `tsconfig.include.ok.json`, but the second one ignores `.d.ts` file and app compiles with an error using `tsconfig.include.bug.json`.
