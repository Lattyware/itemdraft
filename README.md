# Item Draft
Item Draft custom game mode for Dota 2, where skills and items are swapped.

## Status

Development underway.

See [the wiki](https://github.com/Lattyware/itemdraft/wiki/Item-Draft) for plans and implementation detail.

## Running

If you want to try the mod, you are best waiting for an actual release in the workshop. If you can't wait, then grab
a copy and place into your dota directory.

## Developing

If you want to develop, you can do as above, but it makes pushing changes a chore. If you plan to contribute, I 
recommend pulling the repository somewhere, moving the two source folders into your dota directory, then linking the
two directories from the repository again. This allows you to edit and test in-place, without having to exclude 
everything else in your dota directory.

### Tools

Any text editor will do (you'll want syntax highlighting) - [Atom][Atom] is a good choice, but if you want something 
more fully-features, [IntelliJ Community Edition][IntelliJ] has a plugin for Lua and support for XML/JS/CSS, making it a 
very good choice. You will find an IntelliJ project file in the root of the repository.

[Atom]: https://atom.io/
[IntelliJ]: https://www.jetbrains.com/idea/download/

### Code

It would also be nice if this became a good resource for people looking to make their own mods, with good examples of
ways to do certain things, styles and patterns that might be of use. The mod is lots of code and virtually no assets.
