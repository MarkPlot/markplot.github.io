---
title: Cheat Sheet
layout: cheatsheet
---

<table>
    <caption>Entities</caption>
    <tr><th>Description</th><th>Syntax</th></tr>
    <tr><td>Visible</td><td><code>@@Entity</code></td></tr>
    <tr><td>Hidden</td><td><code>@@(Entity)</code></td></tr>
    <tr><td>The <em>Null</em> one</td><td><code>@@.</code></td></tr>
</table>

<table>
    <caption>Modifiers</caption>
    <tr><th>Description</th><th>Syntax</th></tr>
    <tr><td>Local</td><td><code>@@Entity.modifier</code></td></tr>
    <tr><td>Global</td><td><code>@@Entity.MODIFIER</code></td></tr>
    <tr><td>With parameter</td><td><code>@@Entity.modifier[parameter]</code></td></tr>
    <tr><td>With hidden parameter</td><td><code>@@Entity.modifier(parameter)</code></td></tr>
</table>

<table>
    <caption>Standard modifiers</caption>
    <tr><th>Description</th><th>Syntax</th></tr>
    <tr><td>Type of entity</td><td><code>@@Entity.Type(Type_Name)</code></td></tr>
    <tr><td>Point of view</td><td><code>@@Entity.Pov</code></td></tr>
    <tr><td>Remember something to do</td><td><code>@@.Todo(What to do)</code></td></tr>
    <tr><td>Version of document or section</td><td><code>@@.Version(Number)</code></td></tr>
    <tr><td>Status of document or section</td><td><code>@@.Status(StatusName)</code></td></tr>
</table>

<table>
    <caption>Shorthands for standard modifiers</caption>
    <tr><th>Shorthand</th><th>for</th></tr>
    <tr><td><code>@@Entity.Place</code></td><td><code>@@Entity.Type(place)</code></td></tr>
    <tr><td><code>@@Entity.Object</code></td><td><code>@@Entity.Type(object)</code></td></tr>
    <tr><td><code>@@Entity.Event</code></td><td><code>@@Entity.Type(event)</code></td></tr>
    <tr><td><code>@@.Draft</code></td><td><code>@@.Status(draft)</code></td></tr>
    <tr><td><code>@@.Final</code></td><td><code>@@.Status(final)</code></td></tr>
</table>

<table>
  <caption>Entities</caption>
  <tr>
    <th>Syntax</th><th>Description</th><th>Example</th><th>Output</th>
  </tr>
  <tr>
    <td><code>@@Entity</code></td><td>Visible entity</td><td><code>@@Sherlock walked in.</code></td><td><citation>Sherlock walked in.</citation></td>
  </tr>
  <tr>
    <td><code>@@(Entity)</code></td><td>Hidden entity</td><td><code>@@(Holmes)He walked in.</code></td><td>He walked in.</td>
  </tr>
  <tr>
    <td><code>@@Entity.modifier</code></td><td>Entity with modifier</td><td><code>@@Holmes.angry stared.</code></td><td>Holmes stared.</td>
  </tr>
  <tr>
    <td><code>@@Entity.modifier(param)</code></td><td>Modifier with hidden parameter</td><td><code>@@Scene.mood(tense) unfolded.</code></td><td>Scene unfolded.</td>
  </tr>
  <tr>
    <td><code>@@Entity.MODIFIER[param]</code></td><td>Modifier with visible parameter</td><td><code>The @@(Holmes).PROFESSION[detective] arrived.</code></td><td>The detective arrived.</td>
  </tr>
  <tr>
    <td><code>@@.modifier</code></td><td>Null entity modifier</td><td><code># My Story @@.GENRE(mystery)</code></td><td># My Story</td>
  </tr>
</table>

<table>
  <caption>Entity Annotations</caption>
  <tr>
    <th>Type</th><th>Syntax</th><th>Output</th>
  </tr>
  <tr>
    <td>Visible entity</td><td><code>@@CharacterName</code></td><td>Character name appears in text</td>
  </tr>
  <tr>
    <td>Visible place</td><td><code>@@Location_Name.Place</code></td><td>Location name appears in text</td>
  </tr>
  <tr>
    <td>Hidden entity</td><td><code>@@(CharacterName)</code></td><td>Name not shown, entity tracked</td>
  </tr>
  <tr>
    <td>Hidden place</td><td><code>@@(Location_Name).Place</code></td><td>Place tracked, name not shown</td>
  </tr>
</table>

<table>
  <caption>Content Capture</caption>
  <tr>
    <th>Type</th><th>Syntax</th><th>Captured Text</th>
  </tr>
  <tr>
    <td>Entity captures sentence</td><td><code>@@Jules was walking down the street.</code></td><td>Jules captures: "Jules was walking down the street."</td>
  </tr>
  <tr>
    <td>Hidden entity captures</td><td><code>@@(Marie)She sat on the terrace of a cafe.</code></td><td>Marie captures: "She sat on the terrace of a cafe."</td>
  </tr>
</table>

<table>
  <caption>Hidden Parameters (Metadata)</caption>
  <tr>
    <th>Type</th><th>Syntax</th><th>Description</th>
  </tr>
  <tr>
    <td>Age (hidden)</td><td><code>@@Holmes.age(35)</code></td><td>Age stored as metadata</td>
  </tr>
  <tr>
    <td>Mood (hidden)</td><td><code>@@Watson.mood(angry)</code></td><td>Mood tracked invisibly</td>
  </tr>
  <tr>
    <td>Status (hidden)</td><td><code>@@.Status(draft)</code></td><td>Document status hidden</td>
  </tr>
  <tr>
    <td>Weather (hidden)</td><td><code>@@.weather(rainy)</code></td><td>Weather metadata</td>
  </tr>
</table>

<table>
  <caption>Visible Parameters</caption>
  <tr>
    <th>Type</th><th>Syntax</th><th>Output</th>
  </tr>
  <tr>
    <td>Profession (visible)</td><td><code>@@(Holmes).PROFESSION[detective]</code></td><td>detective</td>
  </tr>
  <tr>
    <td>Mood (visible)</td><td><code>@@(Watson).mood[nervous]</code></td><td>nervous</td>
  </tr>
  <tr>
    <td>Place description</td><td><code>@@(22A_Baker_Street).standing[comfortable apartment]</code></td><td>comfortable apartment</td>
  </tr>
  <tr>
    <td>Genre (visible)</td><td><code>@@.GENRE[mystery]</code></td><td>mystery</td>
  </tr>
</table>

<table>
  <caption>Combining Parameters</caption>
  <tr>
    <th>Type</th><th>Syntax</th><th>Output</th><th>Metadata</th>
  </tr>
  <tr>
    <td>Combine hidden/visible</td><td><code>@@(Holmes).age(35).PROFESSION[consulting detective]</code></td><td>The consulting detective investigated</td><td>Holmes is 35, profession is consulting detective</td>
  </tr>
</table>

<table>
  <caption>Temporal Annotations</caption>
  <tr>
    <th>Type</th><th>Syntax</th><th>Example</th>
  </tr>
  <tr>
    <td>Absolute date (hidden)</td><td><code>@@(1891-05-04)</code></td><td>1891-05-04</td>
  </tr>
  <tr>
    <td>Date (YYYY-MM-DD)</td><td><code>@@(1881-03-04)</code></td><td>1881-03-04</td>
  </tr>
  <tr>
    <td>Abstract time</td><td><code>@@(Day_1)</code></td><td>Day_1</td>
  </tr>
  <tr>
    <td>Narrative time</td><td><code>@@(Chapter_3)</code></td><td>Chapter_3</td>
  </tr>
</table>

<table>
  <caption>Document Structure</caption>
  <tr>
    <th>Type</th><th>Syntax</th><th>Example</th>
  </tr>
  <tr>
    <td>Book title & genre</td><td><code># Book Title @@.GENRE(mystery)</code></td><td># Book Title mystery</td>
  </tr>
  <tr>
    <td>Chapter POV</td><td><code>## Chapter 1 @@(Watson).Pov</code></td><td>Chapter 1 (Watson's POV)</td>
  </tr>
  <tr>
    <td>Scene setting</td><td><code>@@(London) @@(1891-05-04)</code></td><td>Scene in London, 1891-05-04</td>
  </tr>
  <tr>
    <td>Multiple entities</td><td><code>@@Holmes examined the evidence while @@(Watson)I took notes.</code></td><td>Holmes visible, Watson hidden</td>
  </tr>
</table>

<table>
  <caption>Common Patterns</caption>
  <tr>
    <th>Pattern</th><th>Syntax</th><th>Output/Note</th>
  </tr>
  <tr>
    <td>Character intro</td><td><code>The @@(Holmes).PROFESSION[consulting detective] entered the room.</code></td><td>The consulting detective entered the room</td>
  </tr>
  <tr>
    <td>Scene setting</td><td><code>@@(London) @@(1881-03-04) It was a foggy morning.</code></td><td>It was a foggy morning (metadata: London, 1881-03-04)</td>
  </tr>
  <tr>
    <td>Character description</td><td><code>The @@(Watson).age(35).PROFESSION[military doctor] served in Afghanistan.</code></td><td>The military doctor served in Afghanistan (metadata: Watson is 35, profession is military doctor)</td>
  </tr>
  <tr>
    <td>Point of view</td><td><code>## Chapter 1 @@(Watson).Pov</code><br><code>I had not seen @@Holmes for several days.</code></td><td>Chapter is from Watson's POV, Holmes appears visibly</td>
  </tr>
  <tr>
    <td>Document metadata</td><td><code># A Study in Annotation @@.GENRE[mystery] @@.status(draft)</code></td><td># A Study in Annotation mystery (metadata: genre, status)</td>
  </tr>
  <tr>
    <td>Dialogue & actions</td><td><code>"You have been in Afghanistan, I perceive," @@(Holmes).manner(confidently) said to @@Watson.</code></td><td>"You have been in Afghanistan, I perceive," said to Watson. (metadata: Holmes spoke confidently)</td>
  </tr>
  <tr>
    <td>Mixed visibility</td><td><code>@@Jules met her@@(Marie).action[reading] at the @@library.Place.</code></td><td>Jules met reading at the library (tracks: Jules visible, Marie hidden/action visible, library visible)</td>
  </tr>
</table>

<table>
  <caption>Hidden Headings</caption>
  <tr>
    <th>Type</th><th>Syntax</th><th>Note</th>
  </tr>
  <tr>
    <td>Hide heading</td><td><code>@@.(# Act One)</code></td><td>Heading present in source, hidden for readers</td>
  </tr>
  <tr>
    <td>Hide subheading</td><td><code>@@.(## Chapter 3)</code></td><td>Subheading present in source, hidden for readers</td>
  </tr>
  <tr>
    <td><em>Note</em></td><td colspan="2">Hidden headings use the null entity (<code>@@.</code>) and are not considered MarkPlot narrative entities.</td>
  </tr>
</table>

<table>
  <caption>Tips</caption>
  <tr>
    <th>Tip</th>
  </tr>
  <tr>
    <td>Use hidden entities <code>@@(Entity)</code> to track without showing the name</td>
  </tr>
  <tr>
    <td>Use visible parameters <code>[param]</code> for descriptions in text</td>
  </tr>
  <tr>
    <td>Use hidden parameters <code>(param)</code> for metadata only</td>
  </tr>
  <tr>
    <td>Combine both for rich annotation: <code>@@(Holmes).age(35).PROFESSION[detective]</code></td>
  </tr>
  <tr>
    <td>Start simple, add complexity as needed</td>
  </tr>
  <tr>
    <td>MarkPlot annotations help organize narrative and can be processed by tools, while keeping text readable for regular readers.</td>
  </tr>
</table>
