---
title: Cheat Sheet
nav_order: 1
---

A quick reference guide for the MarkPlot semantic annotation language.

## Table of Contents
- [Basic Syntax](#basic-syntax)
- [Entity Annotations](#entity-annotations)
- [Modifier Parameters](#modifier-parameters)
- [Temporal Annotations](#temporal-annotations)
- [Document Structure](#document-structure)
- [Common Patterns](#common-patterns)
- [Hidden Headings](#hidden-headings)

## Basic Syntax

| Syntax | Description | Example | Output for Readers |
|--------|-------------|---------|-------------------|
| `@@Entity` | Visible entity | `@@Sherlock walked in.` | Sherlock walked in. |
| `@@(Entity)` | Hidden entity | `@@(Holmes)He walked in.` | He walked in. |
| `@@Entity.modifier` | Entity with modifier | `@@Holmes.angry stared.` | Holmes stared. |
| `@@Entity.modifier(param)` | Local modifier with hidden parameter | `@@Scene.mood(tense) unfolded.` | Scene unfolded. |
| `@@Entity.MODIFIER[param]` | Global modifier with visible parameter | `The @@(Holmes).PROFESSION[detective] arrived.` | The detective arrived. |
| `@@.modifier` | Null entity modifier | `# My Story @@.GENRE(mystery)` | # My Story |

## Entity Annotations

### Visible Entities
```markplot
@@CharacterName      # Character name appears in text
@@Location_Name.Place      # Location name appears in text
```

### hidden Entities
```markplot
@@(CharacterName)    # Entity tracked but name doesn't appear
@@(Location_Name).Place    # Location tracked but name doesn't appear
```

### Content Capture
All entities capture the complete sentence where they appear:
```markplot
@@Jules was walking down the street.
# Jules captures: "Jules was walking down the street"

@@(Marie)She sat on the terrace of a cafe.
# Marie captures: "She sat on the terrace of a cafe"
```

## Modifier Parameters

### hidden Parameters (Metadata)
```markplot
@@Holmes.age(35)           # Age stored as metadata, not shown
@@Watson.mood(angry)       # Mood tracked invisibly
@@.Status(draft)              # Document status hidden
@@.weather(rainy)        # Weather metadata
```

### Visible Parameters (Appear in Text)
```markplot
@@(Holmes).PROFESSION[detective]    # Shows "detective" in text
@@(Watson).mood[nervous]          # Shows "nervous" in text
@@(22A_Baker_Street).standing[comfortable apartment] # Shows description in text
@@.GENRE[mystery]                      # Shows "mystery" in text
```

### Combining Parameters
```markplot
The @@(Holmes).age(35).PROFESSION[consulting detective] investigated.
# Output: "The consulting detective investigated"
# Metadata: Holmes is 35 years old, profession is consulting detective
```

## Temporal Annotations

```markplot
@@(1891-05-04)                 # Absolute date (hidden)
@@(1881-03-04)                 # YYYY-MM-DD format
@@(Day_1)                      # Abstract time
@@(Chapter_3)                  # Narrative time
```

## Document Structure

```markplot
# Book Title @@.GENRE(mystery)

## Chapter 1 @@(Watson).Pov

@@(London) @@(1891-05-04)
@@Holmes examined the evidence while @@(Watson)I took notes.
```

## Common Patterns

### Character Introduction
```markplot
The @@(Holmes).PROFESSION[consulting detective] entered the room.
# Output: "The consulting detective entered the room"
```

### Scene Setting
```markplot
@@(London) @@(1881-03-04) It was a foggy morning.
# Output: "It was a foggy morning"
# Metadata: Scene set in London on 1881-03-04
```

### Character Description
```markplot
The @@(Watson).age(35).PROFESSION[military doctor] served in Afghanistan.
# Output: "The military doctor served in Afghanistan"
# Metadata: Watson is 35, profession is military doctor
```

### Point of View
```markplot
## Chapter 1 @@(Watson).Pov

I had not seen @@Holmes for several days.
# Chapter is from Watson's POV, Holmes appears visibly
```

### Document Metadata
```markplot
# A Study in Annotation @@.GENRE[mystery] @@.status(draft)
# Output: "# A Study in Annotation mystery"
# Metadata: Genre is mystery, status is draft
```

### Dialogue and Actions
```markplot
"You have been in Afghanistan, I perceive," @@(Holmes).manner(confidently) said to @@Watson.
# Output: "You have been in Afghanistan, I perceive," said to Watson.
# Metadata: Holmes spoke confidently
```

### Mixed Visibility
```markplot
@@Jules met her@@(Marie).action[reading] at the @@library.Place.
# Output: "Jules met reading at the library"
# Tracks: Jules (visible), Marie (hidden with visible action), library (visible)
```

## Hidden Headings

You can hide a Markdown heading in the final output while keeping it in your source file for structure and organization:

```markplot
@@.(# Act One)
@@.(## Chapter 3)
```
*The heading is present in your source text, but will not appear in the version for readers. This allows you to organize your manuscript without displaying certain headings.*

**Note:** Hidden headings use the null entity (`@@.`) and are not considered MarkPlot narrative entities.

## Tips

- **Use hidden entities** `@@(Entity)` when you want to track without showing the name
- **Use visible parameters** `[param]` when you want description to appear in text
- **Use hidden parameters** `(param)` for metadata that shouldn't appear
- **Combine both** for rich annotation: `@@(Holmes).age(35).PROFESSION[detective]`
- **Keep it simple** - start with basic annotations and add complexity as needed

Remember that MarkPlot annotations help you organize your narrative and can be processed by MarkPlot-aware tools, while keeping your text readable for regular readers.
