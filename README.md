# TypeScript "include" bug demo

Run `npm install && npm test` or take a look at [Travis CI page of this demo](https://travis-ci.org/noomorph/typescript-include-bug).

The demo is using `typescript@next`. The issue reproduces on stable versions too.

### Question

Is this behavior absolutely intended?

- if so, what are the official recommendations for such cases?
- if not, is it a bug or lack of configuration possibilities?

### My issue

I've got a big TypeScript project (1000+ files) using home-grown `filesGlob` hack solution very similar to the Atom's one:

https://github.com/TypeStrong/atom-typescript/blob/master/docs/tsconfig.md#filesglob

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
