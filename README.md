# MarkPlot

> A lightweight semantic annotation language for writers

## TL;DR

MarkPlot is a lightweight semantic annotation language that allows writers to organize their creative work directly within their text. It offers a simple syntax to track characters, locations, plot elements and their relationships, without interrupting the writing flow. Compatible with standard text editors and Markdown, MarkPlot naturally integrates into the creative process while providing a structured view of the work. The annotations remain optional and human-readable, enabling authors to focus on their content while maintaining clear organization when needed.

## Getting Started

For a comprehensive introduction, documentation and guides, please visit the **[MarkPlot official website](https://markplot.github.io)**.

## Quick Example

```markplot
@@Jules(smiled) at @@Marie(25 years old) while she was reading.
```

In this example, "Jules" is annotated with a simple, unqualified note ("smiled") and "Marie" is annotated with an age ("25 years old")—both using the most basic MarkPlot annotation syntax. Readers simply see:

> Jules at Marie while she was reading.

You can also attach notes to entities, either locally or globally:

```markplot
@@Marie(25 years old) smiled.      # Local note (same as @@Marie.Note(25 years old))
@@Marie_(red hair)                 # Global note (same as @@Marie.GNote(red hair))
@@Marie went to the market.        # "red hair" is shown for Marie here
@@Marie(30 years old) danced.      # "30 years old" overrides the global note here
```

- `@@Entity(note)` is a shortcut for `@@Entity.Note(note)` (local note).
- `@@Entity_(note)` is a shortcut for `@@Entity.GNote(note)` (global note).

You can also use more advanced forms, for example:

```markplot
@@Jules smiled at @@(Marie).age(25)her while she was reading.
```

Here, "Jules" is a visible entity and "Marie" is a hidden entity with a modifier (`age`) and a hidden parameter (`25`), while readers simply see:

> Jules smiled at her while she was reading.

## Key Features

- **Write naturally**: Add annotations without leaving your text editor
- **Track everything**: Characters, locations, events, and their relationships
- **Stay focused**: All your notes right where you need them
- **Keep control**: Your text remains plain text, readable anywhere
- **Build tools**: Structured annotations enable powerful analysis tools

## Documentation

- [Quick Start Guide](https://markplot.github.io/quickstart.html) - Start using MarkPlot in 5 minutes
- [Complete Specifications](https://markplot.github.io/specifications.html) - For developers and advanced users

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
