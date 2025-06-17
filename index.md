---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---
> A lightweight annotation language for writers

## TL;DR

MarkPlot is a lightweight semantic annotation language that allows writers to organize their creative work directly within their text. It offers a simple syntax to track characters, locations, plot elements and their relationships, without interrupting the writing flow. Compatible with standard text editors and Markdown, MarkPlot naturally integrates into the creative process while providing a structured view of the work. The annotations remain optional and human-readable, enabling authors to focus on their content while maintaining clear organization when needed.

If you are a writer, you might want to read the [Quick Start Guide](#quick-start-guide) first.

**MarkPlot is in early development.**
While dedicated tools are coming soon, you can already use MarkPlot in any text or Markdown editor.
Want to help shape the project or ask questions?
Join our community on [GitHub Discussions](https://github.com/MarkPlot/markplot.github.io/discussions)!

---
## Table of Contents

- [Why MarkPlot?](#why-markplot)
- [What is MarkPlot?](#what-is-markplot)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [How Does It Work?](#how-does-it-work)
  - [Annotations](#annotations)
  - [Entities](#entities)
  - [Modifiers](#modifiers)
  - [Null Entity](#null-entity)
  - [Parameters for Modifiers](#parameters-for-modifiers)
- [Modifier Summary Table](#modifier-summary-table)
- [What's Next?](#whats-next)
  - [For Writers](#for-writers)
  - [For Developers](#for-developers)
- [Join the Community](#join-the-community)

---

## Why MarkPlot?

The story below, in MarkPlot!

```markplot
## Why @@MarkPlot? @@(me).Pov

As a @@(me).HOBBY[writer], I found myself drowning in character sheets, timeline,
documents, and location descriptions scattered across multiple files and tools.

Every time I needed to check a detail about a character, a specific place, or
an event, I had to break my writing flow to search through my notes.
When and where did @@Jules and @@Isabelle meet for the first time?

I needed a way to keep track of all these elements right within my manuscript,
something that wouldn't force me to leave my text editor or interrupt my
creative process.

That's how @@(MarkPlot).CONCEPT[the idea of a simple, inline annotation system]
was born - not as another writing tool, but as a natural extension of the
writing process itself.

As a @@(me).JOB[coder], I would now be able to write tools that could understand
my narrative elements, analyze my story structure, and help me visualize my
characters' relationships.
I could even generate character sheets, timelines, and world documentation
automatically from my text.

The possibilities are endless.
```

## What is MarkPlot?

MarkPlot is a simple yet powerful annotation language that helps writers organize their story elements directly within their text. No more switching between multiple documents or breaking your writing flow to check character details or plot points. With MarkPlot, you write normally while adding semantic annotations that tools can understand.

```markplot
@@Jules smiled at @@Marie.age(25) while she was reading.
```

## Key Features

- **Write naturally**: Add annotations without leaving your text editor
- **Track everything**: Characters, locations, events, and their relationships
- **Stay focused**: All your notes right where you need them
- **Keep control**: Your text remains plain text, readable anywhere
- **Build tools**: Structured annotations enable powerful analysis tools
- **Markdown compatible**: Works alongside standard Markdown format
- **Highly customizable**: Create your own modifiers and entity types

## Getting Started

- [Quick Start Guide](quickstart.html) - Start using MarkPlot in 5 minutes

## How Does It Work?

### Annotations

As you write, MarkPlot allows you to annotate your text with semantic or narrative cues. These annotations will be removed from the text intended for your readers or modified according to precise rules that we will see later. Your annotated text is called the _original text_ or _source text_. The text intended for your readers is called the _final text_.

In our documents, we will present the source text of this using code blocks like this:

```markplot
@@Holmes looked at @@Watson.
```

and the final text as quotes, like this:

> Holmes looked at Watson.

### Entities

At the core of MarkPlot is the concept of _entity_. Entities refer to characters, places, objects, events, or whatever you want to reference.

MarkPlot uses a simple syntax based on `@@` symbols to annotate entities in your text.

#### Visible entities

```markplot
@@Holmes walked into the room.
```

> Holmes walked into the room.

By default, entities are _characters_. But it can be whatever you want, using the standard modifier `Type` (more about modifiers below):

```markplot
@@Arthur holds @@Excalibur.Type(object).
```

> Arthur holds Excalibur.

In fact, `@@Arthur` is a shorthand for `@@Arthur.Type(character)`.

#### Hidden entities

Often, entities don't appear by name. You can still indicate them in your text, but they won't appear in the final version. These are called _hidden_ entities. To do this, simply surround the entity's name with parentheses :

```
@@(Arthur)The king holds @@Excalibur.Type(object).
```

> The king holds Excalibur.

### Modifiers

Entities can be supplemented with _modifiers_. These allow you to add information about them. A modifier is added to an entity by following it with a period, then the modifier. Modifiers _never_ appear in the final text.

```
@@Holmes.sad thought deeply.
```

> Holmes thought deeply.

Capitalization is significant. You are completely free to use lowercase or UPPERCASE modifiers, with one difference in usage: lowercase modifiers represent context-specific annotation, while UPPERCASE modifiers represent permanent information about the entity.

```
@@Holmes.SMART.sad thought deeply.
```

> Holmes thought deeply.

In this example, Holmes is annotated as ALWAYS smart and sad at this time.

Uppercase modifiers are standard, provided by MarkPlot itself or by tools that extend it. Some standard modifiers are `.Type`, `.Status`, `.Event`, `.Place`., `.Pov`., `.Object`, `.Todo`, `.Version`., `.Draft`, `.Final`.

#### Null entity

If you read the list of standard modifiers carefully, you might wonder what some of them mean. What does "@@Homes.Draft" mean? Nothing, indeed. Some modifiers are only used to annotate the entire text or part of it. They don't apply to any particular entity in the text. For these, MarkPlot provides the _Null Entity_. How do you use it? Simply don't write any entity between the two at signs and the dot:
```
@@.Draft
```

Null entity annotations are always removed from the final text.

If you apply a null entity annotation to a Markdown title, it should apply only to this section:

```
## The Day after @@.Todo(Check the facts)
```

> ## The Day after

#### Parameters for modifiers

You can add parameters to a modifier either to specify the information carried by the modifier, or when using the modifier to categorize the information carried by the parameter.

For example:

```markplot
## The Day after @@.Todo(Check the facts)
```
Here, `Check the facts` is the parameter for the `.Todo` modifier. It complements the information in the "todo" annotation by indicating the task to be performed.

Another example:

```markplot
@@Holmes.mood(sad) was staring into the fire burning in the hearth.
[...]
As a new idea crossed his mind, @@(Holmes).mood(galvanized)he got up abruptly and rushed to @@Watson to wake him.
```
> Holmes was staring into the fire burning in the hearth. [...] As a new idea crossed his mind, he got up abruptly and rushed to Watson to wake him.

Here, `sad` and `galvanized` are parameters of the `.mood` modifier at different times. So you can use the `.mood` modifier to track how your characters' moods change over the course of the story.

As for entities, parameters should be visible or hidden in the final text. Use brackets to make them visible, parentheses to make them invisible.

```markplot
He was so @@(Holmes).mood[sad].vitality(tired) that a tear rolled down his eye.
```

> He was so sad that a tear rolled down his eye.

Here, `sad` is a visible parameter of the `.mood` modifier and `tired` a hidden parameter of the `.vitality` modifier.


## What's Next?

MarkPlot opens up new possibilities for both writers and developers. Here’s how you can take your next steps:

### For Writers

- **Use your favorite editor**: MarkPlot is designed to work seamlessly with any plain text or Markdown editor—no special software required.
- **Stay tuned for tools**: While dedicated MarkPlot tools are still in development, your annotations are future-proof and will be compatible with upcoming utilities for character sheets, timelines, and more.
- **Experiment in your workflow**: Try annotating a scene or chapter in your current project and experience how MarkPlot helps you stay organized without breaking your writing flow.
- **Shape the future**: Share your needs and feedback—your input will help guide the development of MarkPlot tools and features.

### For Developers

- **Read the specifications**: Dive into the [technical documentation](specifications.html) to understand MarkPlot’s structure and syntax.
- **Build the first tools**: Be among the pioneers—create parsers, visualizations, or plugins to bring MarkPlot’s potential to life.
- **Extend the language**: Propose new modifiers or entity types to address specific creative or analytical needs.
- **Join the community**: Contribute to open-source projects, share your work, and collaborate with others interested in narrative annotation.

**Ready to shape the future of creative writing?**
Start using MarkPlot today—and help build the ecosystem that will empower writers everywhere!

## Join the Community

Have questions, ideas, or feedback?
Join the discussion on [GitHub Discussions](https://github.com/MarkPlot/markplot.github.io/discussions) and help shape the future of MarkPlot with us!
