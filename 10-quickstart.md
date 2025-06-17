---
title: Quick Start
nav_order: 0
---

## Welcome to MarkPlot!

MarkPlot is a semantic annotation language that extends Markdown to help you keep track of characters, places, events, and relationships in your creative writing. Let's dive in!

---

**Quick Table of Contents**
- [Where to start?](#where-to-start)
- [What is Markdown?](#what-is-markdown)
- [The 5-Minute MarkPlot Basics](#the-5-minute-markplot-basics)
- [What's Next?](#whats-next)
- [Tips](#tips)

---

## Where to start?

MarkPlot is a semantic annotation language, not a standalone tool. As the project is in early development, there are currently no dedicated tools available yet—but your annotated text will be compatible with future utilities as they are released. You can already use MarkPlot in any plain text or Markdown editor.

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

### 1. Annotate Entities (Characters, Places, Events, or whatever)

By default, entities are considered characters. If you want to annotate a place, object, or event, use the standard modifier `.Type`:

```markplot
@@Sherlock examined the crime scene at @@Baker_Street.Type(Place).
```

If you don’t specify a type, MarkPlot assumes it’s a character.

**Result for readers:**
> Sherlock examined the crime scene at Baker Street.

**Behind the scenes:**
MarkPlot-enabled tools can automatically generate entity cards:

```markplot
# Sherlock
- Type: Character
- Appearances: Chapter 1, Chapter 3

# Baker_Street
- Type: Place
- Appearances: Chapter 1
```

### 2. Hide Entities in Final Text

Want to hide the entity name in your text but mark its presence? Add parentheses:

```markplot
@@(Sherlock)He examined the crime scene at @@Baker_Street.
```

**Result for readers:**
> He examined the crime scene at Baker Street.

**Behind the scenes:**
The entity is still tracked, but its name is now hidden in the narrative text.

### 3. Add Visible Details with Modifier Parameters

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

### 4. Modifier Case: Context, Permanent, and Standard Modifiers

Modifier case matters in MarkPlot:

- **Lowercase modifiers** (e.g. `.mood`, `.age`) are for context-specific or temporary information.
- **UPPERCASE modifiers** (e.g. `.BRAVE`, `.MAGICAL`) are for permanent attributes of an entity, defined by you.
- **Capitalized modifiers** (e.g. `.Type`, `.Status`, `.Event`, `.Place`, `.Pov`, `.Object`, `.Todo`, `.Version`, `.Draft`, `.Final`) are standard modifiers defined by MarkPlot or its tools. You can also create your own modifiers, but remember that case is always significant.

For example:

```markplot
@@Arthur.BRAVE.tired entered the room with @@Excalibur.Type(Object).MAGICAL.
```

In this example, Arthur is always brave (`.BRAVE`, permanent) but only tired in this context (`.tired`, temporary). Excalibur is always magical (`.MAGICAL`, permanent) and is explicitly marked as an object using the standard modifier `.Type(Object)`.

### 5. Store Hidden Metadata

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

### 6. Track Timeline and Events

Dates are special entities that help you manage your story's timeline:

```markplot
@@(1891-05-04) It was a foggy London morning when @@(Lestrade) arrived with news.
```

**Result for readers:**
> It was a foggy London morning when arrived with news.

**Behind the scenes:**
MarkPlot-enabled tools can generate chronological timelines:

```markplot
# Timeline
- 1891-05-04: Lestrade arrives with news (Chapter 2)
- 1891-05-05: The investigation begins (Chapter 3)
```

### 7. Indicate Point of View

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
# A Study in Annotation @@.GENRE[mystery]

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
- **Explore Modifiers**: Try `.mood()`, `.Status()`, or create your own.
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
