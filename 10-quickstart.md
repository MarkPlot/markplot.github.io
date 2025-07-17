---
title: Quick Start
layout: page_with_toc
---

## Welcome to MarkPlot!

MarkPlot is a semantic annotation language that extends Markdown to help you keep track of characters, places, events, and relationships in your creative writing. Let's dive in!

## Where to start?

MarkPlot is not a standalone tool. As the project is in early development, there are currently no dedicated tools available yet—but your annotated text will be compatible with future utilities as they are released. You can already use MarkPlot in any plain text or Markdown editor.

Want to help shape the project, ask questions, or get updates?
Join our community on [GitHub Discussions](https://github.com/MarkPlot/markplot.github.io/discussions)!

If you are also a coder, you may want to implement MarkPlot in an existing tool or create a new one. In this case, please have a look at [the complete specifications](specifications.html).

## What is Markdown?

Markdown is a lightweight markup language that you probably already know. It uses simple symbols to format text:

```markdown
# Heading
**Bold text**
*Italic text*
[Link](https://example.com)
```

If you're new to Markdown, you can check out the [Markdown Guide](https://www.markdownguide.org/basic-syntax/) for the basics. But this is not a requirement to start using MarkPlot right now.

## The 5-Minute MarkPlot Basics

### Mark Entities

The simpliest way to start using MarkPlot is to use our special marker `@@` before a character name :
```markplot
@@Character
```

For example:

```
@@Holmes looks tired.
```

**Result for reader:**

> Holmes looks tired.

This is enough for MarkPlot to collect data about Holmes. When this character appears again, continue to use the `@@` marker:

```marplot
@@Holmes asked @@Watson to tell the truth.
```

**Result for reader:**

> Holmes asked Watson to tell the truth.

OK, you don't always want to use an unique name for your characters. Holmes may appears as Sherlock ou just the "he" pronoun. We have a syntax for that too:
```markplot
@@(Holmes)Sherlock looked deeply at @@(Lestrade)him.
```
**Result for reader:**

> Sherlock looked deeply at him.

But, what have we done ? In fact, the `@@` marker is an _entity_ marker. What is that?

**An entity is a meaningful element in your story—like a character, place, or object—that is described, referred to repeatedly, and helps structure the narrative.**

### Types of entities

So, by default, entities are characters. How to mark some entitiesother things ? Use _modifiers_.

For example, mark a place:

```
@@London.Place was foggy yesterday.
```

or an object:

```
@@Arthur hold @@Excalibur.Object.
```

or en event:

```
@@Christmas.Event was the day after.
```

or, if you need nothing we did not think about:

```
The @@Spirit.Type(idea) was @@Hegel.
```

Those modifiers are removed for the readers :

> London was foggy yesterday.
> Arthur hold Excalibur.
> Christmas was the day after.
> The Spirit was Hegel.

But those modifiers helps MarkPlot tools to classify your entities and make your documentation clearer. You just to have use those once: when MarkPlot learnt that London is a place, you don't have to tell it twice.

This is only a special and powerful use of modifiers. You will learn more about them below.

### Annotate Entities

You may annotate an entity at any time easily:

```markplot
@@Entity(parameter)
```

For example:

```markplot
@@Anne(25 years old) smiled at @@Paul(friend).
```

**Result for readers:**
> Anne smiled at Paul.

**Behind the scenes:**
MarkPlot-enabled tools will attach "25 years old" to Anne and "friend" to Paul as information you can see on their entity cards.

#### Local and Global Notes

You can attach a note to an entity for just one occurrence (local note), or for all its appearances (global note):

```markplot
@@Marie(25 years old) smiled.      # Local note
@@Marie_(red hair)                 # Global note
```

- Use `@@Entity(note)` for a local note (applies only at this point in the text).
- Use `@@Entity_(note)` for a global note (applies everywhere the entity appears, unless a local note is present).

### Add Visible Details with Modifier Parameters

Want to show additional information about an entity in the text? Use square brackets:

```markplot
The @@(Watson).PROFESSION[Doctor] assisted with the investigation.
```

**Result for readers:**
> The Doctor assisted with the investigation.

**Behind the scenes:**
The information is stored in Watson's entity card:

```markplot
# Watson
- Type: Character
- Profession: Doctor
- Appearances: Chapter 1
```

### Modifier Case: Context, Permanent, and Standard Modifiers

Modifier case matters in MarkPlot:

- **Lowercase modifiers** (e.g. `.mood`, `.age`) are for context-specific or temporary information.
- **UPPERCASE modifiers** (e.g. `.BRAVE`, `.MAGICAL`) are for permanent attributes of an entity, defined by you.
- **Capitalized modifiers** (e.g. `.Type`, `.Status`, `.Event`, `.Place`, `.Pov`, `.Object`, `.Todo`, `.Version`, `.Draft`, `.Final`) are standard modifiers defined by MarkPlot or its tools. You can also create your own modifiers, but remember that case is always significant.

For example:

```markplot
@@Arthur.BRAVE.tired entered the room with @@Excalibur.Object.MAGICAL.
```

In this example, Arthur is always brave (`.BRAVE`, permanent) but only tired in this context (`.tired`, temporary). Excalibur is always magical (`.MAGICAL`, permanent) and is explicitly marked as an object using the standard modifier `.Object`.

### Store Hidden Metadata

Use parentheses to store information that doesn't appear in the text:

```markplot
The @@(Watson).age(35).PROFESSION[military doctor] served in Afghanistan.
```

**Result for readers:**
> The military doctor served in Afghanistan.

**Behind the scenes:**
```markplot
# Watson
- Type: Character
- Age: 35
- Profession: military doctor
- Appearances: Chapter 1
```

### Track Timeline and Events

Dates are special entities that help you manage your story's timeline:

```markplot
@@(1891-05-04) It was a foggy London morning when @@Lestrade arrived with news.
```

**Result for readers:**
> It was a foggy London morning when Lestrade arrived with news.

**Behind the scenes:**
MarkPlot-enabled tools can generate chronological timelines:

```markplot
# Timeline
- 1891-05-04: Lestrade arrives with news (Chapter 2)
- 1891-05-05: The investigation begins (Chapter 3)
```

### Indicate Point of View

Use modifiers to show whose perspective a scene is from:

```markplot
## Chapter 1 @@(Watson).Pov

I had not seen @@Holmes for several days...
```

**Result for readers:**
> ## Chapter 1
>
> I had not seen Holmes for several days...

**Behind the scenes:**
MarkPlot-enabled tools track narrative structure:

```markplot
# Narrative Structure
- Chapter 1: Watson's POV
```


## A Complete Example

```markplot
# A Study in Annotation @@.GENRE(mystery)

## Chapter 1 @@(Watson).Pov

@@(London) @@(1881-03-04)

I had just returned from @@Afghanistan when I met a
@@(Holmes).PROFESSION[consulting detective] through a mutual acquaintance.
He was looking for someone to share his lodgings
at a @@(221B_Baker_Street).Place[comfortable apartment].

"You have been in @@Afghanistan.Place, I perceive," were his first words to me,
leaving me quite astonished at his insight.
```

**Result for readers:**
> # A Study in Annotation
>
> ## Chapter 1
>
> I had just returned from Afghanistan when I met a consulting detective through a mutual acquaintance. He was looking for someone to share his lodgings at a comfortable apartment.
>
> "You have been in Afghanistan, I perceive," were his first words to me, leaving me quite astonished at his insight.

**Behind the scenes:**
MarkPlot-enabled tools would generate:
- Entity cards for Watson, Holmes, London, Afghanistan, and 221B Baker Street
- A timeline entry for March 4, 1881
- Genre categorization for the document
- POV tracking for chapters

## What's Next?

- **Combine with Markdown**: Use all standard Markdown features alongside MarkPlot annotations.
- **Explore Modifiers**: Try `.mood()`, `.Status(draft)`, or create your own.
- **Build Your World**: Create a consistent set of characters, places, and events.
- **Structure Your Narrative**: Use annotations to track plot arcs and themes.
- **Stay tuned for tools**: While dedicated MarkPlot tools are still in development, your annotations are future-proof and will be compatible with upcoming editors and visualization utilities.
- **Join the community**: Share your feedback, ideas, or questions on [GitHub Discussions](https://github.com/MarkPlot/markplot.github.io/discussions)!
- **Future-proof**: Any text you annotate with MarkPlot today will remain compatible with future tools and workflows.

## Tips

- Develop a consistent annotation style for your project.
- Use annotations sparingly at first—you can always add more later.
- Consider creating a simple legend of your most-used annotations.
- Remember that MarkPlot annotations can be completely hidden from your final reader.
- Use visible parameters `[]` when you want the information to appear in your text.
- Use invisible parameters `()` when you want to store metadata only.
- You can combine multiple modifiers of different types on the same entity.
- The default entity type is character, but you can specify others with `.Type(...)`.
- The distinction between lowercase, UPPERCASE, and Capitalized modifiers helps you organize context, permanent, and standard information.

Ready to organize your narrative world?
Happy writing with MarkPlot!
