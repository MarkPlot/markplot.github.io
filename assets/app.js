document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const editor = document.getElementById("markplot-editor");
  const previewOutput = document.getElementById("preview-output");
  const viewMdBtn = document.getElementById("view-md-btn");
  const viewHtmlBtn = document.getElementById("view-html-btn");
  const characterEntitiesContainer =
    document.getElementById("character-entities");
  const otherEntitiesContainer = document.getElementById("other-entities");

  // --- State ---
  const state = {
    viewMode: "html", // 'md' or 'html'
    rawText: "",
    cleanText: "",
    entities: new Map(), // Use a Map to store entities, keyed by name
  };
  const LOCAL_STORAGE_KEY = "markplot-demo-text";

  // --- Parser ---

  /**
   * Extracts a clean, readable text from a MarkPlot string,
   * according to the "Cleanup Parser" rules.
   * This is a simplified parser for the preview feature.
   * @param {string} rawText The text containing MarkPlot annotations.
   * @returns {string} The cleaned-up text for final display.
   */
  function getCleanText(rawText) {
    if (!rawText) return "";

    let text = rawText;

    // 1. First pass: Remove hidden structure annotations like @@.(# Title) specifically
    text = text.replace(/@@\.\([^)]*\)/g, "");

    // 2. Second pass: Remove null entity patterns without visible parameters
    //    - @@. (bare null entity)
    //    - @@.modifier(hidden) patterns
    text = text.replace(/@@\.(?:[\w:!?]+(?:\([^)]*\))?)?(?!\[)/g, "");

    // 3. Third pass: Remove other hidden annotations without visible parameters
    //    - @@(...) without any visible parameters, like @@(Jules) or @@(1957-06-14)
    const hiddenAnnotationRegex = /@@\([^)]+\)(?!\[[^\]]*\])/gu;
    text = text.replace(hiddenAnnotationRegex, "");

    // 4. Fourth pass: Process annotations that are meant to be visible.
    //    This includes:
    //    - @@EntityName
    //    - @@EntityName.modifier[VisibleContent]
    //    - @@(HiddenEntity)[VisibleContent]
    //    - @@.[VisibleContent]
    const visibleAnnotationRegex =
      /@@(?:([\p{L}\p{N}_]+)|\(([^)]+)\)|(\.))((?:\.[\w:!?]+(?:(?:\([^)]*\)|\[[^\]]*\]))?)*)/gu;

    text = text.replace(
      visibleAnnotationRegex,
      (fullMatch, visibleName, hiddenContent, isNullDot, modifiersStr) => {
        // Extract content from visible parameters `[...]` only.
        const visibleParamRegex = /\[([^\]]*)\]/g;
        let visibleParamsOutput = "";
        let match;
        while ((match = visibleParamRegex.exec(modifiersStr)) !== null) {
          visibleParamsOutput += match[1];
        }

        // If it's a visible entity, output its name + visible params.
        if (visibleName) {
          return visibleName.replace(/_/g, " ") + visibleParamsOutput;
        }

        // If it's a hidden entity or null entity with visible parameters, output only the visible parameters.
        if ((hiddenContent || isNullDot) && visibleParamsOutput.length > 0) {
          return visibleParamsOutput;
        }

        // This case should ideally not be reached, as fully hidden ones should be gone.
        // But as a fallback, return empty.
        return "";
      },
    );

    // 5. Final cleanup: Remove any remaining modifier syntax that wasn't part of a match,
    //    e.g. .modifier or .modifier(hidden) that was left over due to partial replacement
    text = text.replace(/\.[\w:!?]+(?:\([^)]*\))?/g, "");

    return text;
  }

  /**
   * Parses the MarkPlot text to extract entities and their metadata.
   * @param {string} rawText The text containing MarkPlot annotations.
   * @returns {{cleanText: string, entities: Map<string, object>}}
   */
  function parseMarkPlot(rawText) {
    const cleanText = getCleanText(rawText);
    const entities = new Map();
    const documentOutline = [];
    const declaredEntities = new Map(); // Track canonical names of declared entities

    // Find hidden markdown headers like @@.(# Title) - they should appear in TOC but not in preview
    const hiddenHeaderRegex = /@@\.\((#+)\s*([^)]*)\)/g;
    let headerMatch;
    while ((headerMatch = hiddenHeaderRegex.exec(rawText)) !== null) {
      documentOutline.push({
        level: headerMatch[1].length,
        text: headerMatch[2].trim(),
        position: headerMatch.index,
      });
    }

    // Find visible markdown headers like # Title
    const visibleHeaderRegex = /^(#+)\s+(.*)$/gm;
    while ((headerMatch = visibleHeaderRegex.exec(rawText)) !== null) {
      // Clean header text from any hidden entity annotations
      let cleanHeaderText = headerMatch[2].trim();

      // Remove hidden entities from header text
      cleanHeaderText = cleanHeaderText.replace(/@@\([^)]+\)/g, "");
      cleanHeaderText = cleanHeaderText.replace(
        /@@\.(?:[\w:!?]+(?:\([^)]*\))?)?(?!\[)/g,
        "",
      );

      // Process visible entities in headers
      cleanHeaderText = cleanHeaderText.replace(
        /@@([\p{L}\p{N}_]+)((?:\.[\w:!?]+(?:(?:\([^)]*\)|\[[^\]]*\]))?)*)/gu,
        (match, entityName, modifiers) => {
          // Extract visible parameters only
          const visibleParams = modifiers.match(/\[([^\]]*)\]/g) || [];
          return (
            entityName.replace(/_/g, " ") +
            visibleParams.join("").replace(/[\[\]]/g, "")
          );
        },
      );

      documentOutline.push({
        level: headerMatch[1].length,
        text: cleanHeaderText,
        position: headerMatch.index,
      });
    }

    // Sort the combined outline by position in the text
    documentOutline.sort((a, b) => a.position - b.position);

    // STEP 1: Parse all @@ annotations to build declared entities list
    const annotationRegex =
      /(@{2,4})(?:([\p{L}\p{N}_]+)|\(([^)]+)\))((?:\.[\w:!?]+(?:(?:\(([^)]*)\)|\[[^\]]*\]))?)*)/gu;

    let match;
    while ((match = annotationRegex.exec(rawText)) !== null) {
      const hierarchyMarkers = match[1]; // @@, @@@, or @@@@
      const hierarchyLevel = hierarchyMarkers.length - 1; // 1=main, 2=secondary, 3=minor
      const rawName = match[2] || match[3];
      const isHidden = !!match[3];
      const entityName = rawName.replace(/_/g, " ");
      const modifiersString = match[4] || "";

      let parsedAbsoluteDate = null;
      let isTemporal = isHidden && /^[0-9@-]/.test(rawName);

      if (isTemporal) {
        const dateToParse = rawName.replace(" ", "T");
        const tempDate = new Date(dateToParse);
        if (!isNaN(tempDate.getTime())) {
          parsedAbsoluteDate = tempDate;
        }
      }

      // Track this as a declared entity (both canonical name and underscore version)
      declaredEntities.set(entityName, rawName);
      if (rawName.includes("_")) {
        declaredEntities.set(rawName, rawName); // Also track underscore version
      }

      if (!entities.has(entityName)) {
        entities.set(entityName, {
          name: entityName,
          type: isTemporal ? "temporal" : "character",
          hierarchyLevel: hierarchyLevel, // 1=main, 2=secondary, 3=minor
          globalInfo: new Map(),
          occurrences: [],
          manuallyExpanded: false,
          contextuallyExpanded: false,
          parsedAbsoluteDate: parsedAbsoluteDate,
        });
      } else {
        // Update hierarchy level - hierarchy markers are persistent
        // Once an entity is marked as secondary (2) or minor (3), it stays that way
        const existingEntity = entities.get(entityName);
        if (hierarchyLevel > existingEntity.hierarchyLevel) {
          existingEntity.hierarchyLevel = hierarchyLevel;
        }
      }

      const entityData = entities.get(entityName);
      const currentOccurrence = {
        position: match.index,
        localInfo: [],
      };

      // Parse modifiers
      const modifierRegex = /\.([\w:!?]+)(?:(?:\(([^)]*)\)|\[([^\]]*)\]))?/g;
      const typeModifiers = ["Character", "Place", "Event", "Object"];
      let modMatch;
      while ((modMatch = modifierRegex.exec(modifiersString)) !== null) {
        const modName = modMatch[1];
        const modValue =
          modMatch[2] !== undefined
            ? modMatch[2]
            : modMatch[3] !== undefined
              ? modMatch[3]
              : null;

        // Handle standard type modifiers
        if (typeModifiers.includes(modName) && !isTemporal) {
          entityData.type = modName.toLowerCase();
        }

        // Handle custom .Type(value) modifier
        if (modName === "Type" && modValue && !isTemporal) {
          entityData.type = modValue.toLowerCase();
        }

        if (
          (modName.toUpperCase() === modName &&
            modName.toLowerCase() !== modName) ||
          (typeModifiers.includes(modName) && !isTemporal)
        ) {
          // Global modifiers are now cumulative - store all occurrences
          if (entityData.globalInfo.has(modName)) {
            const existing = entityData.globalInfo.get(modName);
            existing.occurrences.push({
              value: modValue,
              position: match.index,
            });
          } else {
            entityData.globalInfo.set(modName, {
              occurrences: [
                {
                  value: modValue,
                  position: match.index,
                },
              ],
            });
          }
        } else {
          currentOccurrence.localInfo.push({ name: modName, value: modValue });
        }
      }
      entityData.occurrences.push(currentOccurrence);
    }

    // STEP 2: Find all canonical name occurrences in the text
    // Reset regex index for second pass
    annotationRegex.lastIndex = 0;

    // Create a list of positions where @@ annotations exist to avoid double-counting
    const annotationPositions = new Set();
    while ((match = annotationRegex.exec(rawText)) !== null) {
      // Mark the range of this annotation as occupied
      const start = match.index;
      const end = match.index + match[0].length;
      for (let i = start; i < end; i++) {
        annotationPositions.add(i);
      }
    }

    // Now look for canonical names in the text
    for (const [canonicalName, rawName] of declaredEntities) {
      // Skip temporal entities as they shouldn't be found as bare names
      if (entities.get(canonicalName)?.type === "temporal") {
        continue;
      }

      // Create regex to find this canonical name
      // We need to escape special regex characters and handle both space and underscore versions
      const escapedName = canonicalName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const escapedRawName = rawName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // Look for word boundaries around the name to avoid partial matches
      const nameRegex = new RegExp(
        `\\b(?:${escapedName}|${escapedRawName})\\b`,
        "g",
      );

      let nameMatch;
      while ((nameMatch = nameRegex.exec(rawText)) !== null) {
        const startPos = nameMatch.index;
        const endPos = startPos + nameMatch[0].length;

        // Check if this occurrence is already covered by an @@ annotation
        let isAlreadyAnnotated = false;
        for (let i = startPos; i < endPos; i++) {
          if (annotationPositions.has(i)) {
            isAlreadyAnnotated = true;
            break;
          }
        }

        // If not already annotated, add it as an occurrence
        if (!isAlreadyAnnotated) {
          const entityData = entities.get(canonicalName);
          if (entityData) {
            entityData.occurrences.push({
              position: startPos,
              localInfo: [],
              isImplicit: true, // Mark as implicit reference
            });
          }
        }
      }
    }

    // Sort occurrences by position for each entity
    for (const entityData of entities.values()) {
      entityData.occurrences.sort((a, b) => a.position - b.position);
    }

    return { cleanText, entities, documentOutline };
  }

  // --- Core Application Logic ---

  function updatePreview() {
    if (state.viewMode === "html") {
      // Ensure the 'marked' library is available
      if (typeof marked !== "undefined") {
        previewOutput.innerHTML = marked.parse(state.cleanText, {
          gfm: true,
          breaks: true,
        });
      } else {
        previewOutput.textContent =
          'Erreur: La librairie de rendu Markdown "marked" est introuvable.';
        console.error("Marked.js library not found.");
      }
    } else {
      // For markdown view, display as plain text
      previewOutput.textContent = state.cleanText;
    }
  }

  function processEditorChange() {
    state.rawText = editor.value;

    const oldEntities = state.entities;
    const {
      cleanText,
      entities: newEntities,
      documentOutline,
    } = parseMarkPlot(state.rawText);

    // Preserve the manuallyExpanded state across re-renders
    newEntities.forEach((entity, name) => {
      if (oldEntities.has(name)) {
        entity.manuallyExpanded = oldEntities.get(name).manuallyExpanded;
      }
    });

    state.cleanText = cleanText;
    state.entities = newEntities;
    state.documentOutline = documentOutline;

    updatePreview();
    renderEntities();
    renderDocumentOutline();
    renderTimeline();
    handleEditorSelectionChange(); // Ensure cards are correctly expanded/collapsed
    saveToLocalStorage();
  }

  /**
   * Finds the paragraph at a given cursor position in the text.
   * A paragraph is a block of text separated by double newlines.
   * @param {string} text The full text.
   * @param {number} position The cursor position.
   * @returns {string} The paragraph containing the cursor.
   */
  function getParagraphAt(text, position) {
    if (!text) return "";

    const textBeforeCursor = text.substring(0, position);
    const textAfterCursor = text.substring(position);

    const lastBoundaryBefore = textBeforeCursor.lastIndexOf("\n\n");
    const start = lastBoundaryBefore === -1 ? 0 : lastBoundaryBefore + 2;

    const firstBoundaryAfter = textAfterCursor.indexOf("\n\n");
    const end =
      firstBoundaryAfter === -1 ? text.length : position + firstBoundaryAfter;

    return text.substring(start, end);
  }

  /**
   * Gets the adjacent paragraphs (previous, current, next) at a given position.
   * @param {string} text The full text.
   * @param {number} position The cursor position.
   * @returns {{previous: string, current: string, next: string}}
   */
  function getAdjacentParagraphs(text, position) {
    if (!text) return { previous: "", current: "", next: "" };

    const textBeforeCursor = text.substring(0, position);
    const textAfterCursor = text.substring(position);

    // Find current paragraph boundaries
    const lastBoundaryBefore = textBeforeCursor.lastIndexOf("\n\n");
    const currentStart = lastBoundaryBefore === -1 ? 0 : lastBoundaryBefore + 2;

    const firstBoundaryAfter = textAfterCursor.indexOf("\n\n");
    const currentEnd =
      firstBoundaryAfter === -1 ? text.length : position + firstBoundaryAfter;

    // Get current paragraph
    const current = text.substring(currentStart, currentEnd);

    // Find previous paragraph
    let previous = "";
    if (currentStart > 0) {
      const beforeCurrent = text.substring(0, currentStart - 2);
      const prevBoundaryBefore = beforeCurrent.lastIndexOf("\n\n");
      const prevStart = prevBoundaryBefore === -1 ? 0 : prevBoundaryBefore + 2;
      previous = text.substring(prevStart, currentStart - 2);
    }

    // Find next paragraph
    let next = "";
    if (currentEnd < text.length) {
      const afterCurrent = text.substring(currentEnd + 2);
      const nextBoundaryAfter = afterCurrent.indexOf("\n\n");
      const nextEnd =
        nextBoundaryAfter === -1
          ? text.length
          : currentEnd + 2 + nextBoundaryAfter;
      next = text.substring(currentEnd + 2, nextEnd);
    }

    return { previous, current, next };
  }

  /**
   * Handles editor selection changes to automatically expand/collapse entity cards.
   */
  function handleEditorSelectionChange() {
    const position = editor.selectionStart;
    if (position === null) return;

    const { previous, current, next } = getAdjacentParagraphs(
      state.rawText,
      position,
    );
    const entitiesInContext = new Set();

    // Collect entities from all three paragraphs
    const contextText = [previous, current, next].join(" ");
    const entityRegex = /@@(?:([\p{L}\p{N}_]+)|\(([\p{L}\p{N}_]+)\))/gu;
    let match;
    while ((match = entityRegex.exec(contextText)) !== null) {
      const entityName = (match[1] || match[2]).replace(/_/g, " ");
      entitiesInContext.add(entityName);
    }

    // Update the visual state of each card and pill
    state.entities.forEach((entity, name) => {
      const inContext = entitiesInContext.has(name);
      const shouldBeExpanded = entity.manuallyExpanded || inContext;

      // Handle contextual expansion state
      if (
        inContext &&
        !entity.manuallyExpanded &&
        !entity.contextuallyExpanded
      ) {
        // Just entered context, mark as contextually expanded
        entity.contextuallyExpanded = true;
      } else if (
        !inContext &&
        entity.contextuallyExpanded &&
        !entity.manuallyExpanded
      ) {
        // Left context and was only contextually expanded, collapse it
        entity.contextuallyExpanded = false;
      }

      // Look for entity card first
      const card = document.querySelector(
        `.entity-card[data-entity-name="${name}"]`,
      );

      if (card) {
        if (shouldBeExpanded) {
          card.classList.remove("collapsed");
        } else {
          card.classList.add("collapsed");
        }
      } else if (entity.hierarchyLevel === 3) {
        // Handle minor entities (pills)
        const pill = document.querySelector(
          `.entity-pill[data-entity-name="${name}"]`,
        );

        if (pill && shouldBeExpanded) {
          // Need to show as expanded card - force re-render
          renderEntities();
          return; // Exit early since we're re-rendering
        } else if (!pill && !shouldBeExpanded && entity.contextuallyExpanded) {
          // Was expanded contextually but should collapse back to pill
          entity.contextuallyExpanded = false;
          renderEntities();
          return; // Exit early since we're re-rendering
        }
      }
    });
  }

  // --- View / UI Logic ---

  /**
   * Formats a modifier name for display (e.g., "PROFESSION" -> "Profession").
   * @param {string} name The raw modifier name.
   * @returns {string} The formatted name.
   */
  function formatModifierName(name) {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  /**
   * Scrolls the editor to a specific character position.
   * @param {number} position The character position to scroll to.
   */
  function scrollToPosition(position) {
    editor.focus();

    // Create a temporary div with identical styling to measure real text height
    const measureDiv = document.createElement("div");
    const computedStyle = window.getComputedStyle(editor);

    // Copy all relevant styles from textarea
    measureDiv.style.position = "absolute";
    measureDiv.style.visibility = "hidden";
    measureDiv.style.top = "-9999px";
    measureDiv.style.left = "-9999px";
    measureDiv.style.width = computedStyle.width;
    measureDiv.style.height = "auto";
    measureDiv.style.padding = computedStyle.padding;
    measureDiv.style.border = computedStyle.border;
    measureDiv.style.boxSizing = computedStyle.boxSizing;
    measureDiv.style.font = computedStyle.font;
    measureDiv.style.fontFamily = computedStyle.fontFamily;
    measureDiv.style.fontSize = computedStyle.fontSize;
    measureDiv.style.fontWeight = computedStyle.fontWeight;
    measureDiv.style.lineHeight = computedStyle.lineHeight;
    measureDiv.style.letterSpacing = computedStyle.letterSpacing;
    measureDiv.style.wordSpacing = computedStyle.wordSpacing;
    measureDiv.style.textTransform = computedStyle.textTransform;
    measureDiv.style.whiteSpace = "pre-wrap";
    measureDiv.style.wordWrap = "break-word";
    measureDiv.style.overflowWrap = "break-word";

    document.body.appendChild(measureDiv);

    try {
      // Get text up to target position
      const textBeforePosition = editor.value.substring(0, position);

      // Set the text in our measuring div
      measureDiv.textContent = textBeforePosition;

      // Measure the height - this gives us the real visual position
      const targetHeight = measureDiv.offsetHeight;

      // Calculate context offset
      const lineHeight = parseInt(computedStyle.lineHeight) || 20;
      const contextLines = 4;
      const contextOffset = contextLines * lineHeight;

      // Calculate target scroll position with context
      const targetScrollTop = Math.max(0, targetHeight - contextOffset);

      // Apply scroll
      editor.scrollTop = targetScrollTop;

      // Position cursor
      editor.selectionStart = position;
      editor.selectionEnd = position;
    } finally {
      // Clean up
      document.body.removeChild(measureDiv);
    }
  }

  function renderEntities() {
    // Save current expansion state before clearing
    const expansionState = new Map();
    document.querySelectorAll(".entity-card").forEach((card) => {
      const entityName = card.dataset.entityName;
      const isExpanded = !card.classList.contains("collapsed");
      expansionState.set(entityName, isExpanded);
    });

    characterEntitiesContainer.innerHTML = "";
    const otherEntitiesDiv = document.getElementById("other-entities");
    otherEntitiesDiv.innerHTML = "";

    // Helper function to create entity card
    function createEntityCard(entity) {
      const card = document.createElement("div");
      card.className = "entity-card collapsed";
      card.dataset.entityName = entity.name;

      // Add hierarchy class
      const hierarchyClass =
        entity.hierarchyLevel === 1
          ? "hierarchy-main"
          : entity.hierarchyLevel === 2
            ? "hierarchy-secondary"
            : "hierarchy-minor";
      card.classList.add(hierarchyClass);

      // Card Header
      const header = document.createElement("div");
      header.className = "entity-card-header";
      header.innerHTML = `<span>${entity.name}</span>`;
      header.addEventListener("click", () => {
        entity.manuallyExpanded = !entity.manuallyExpanded;
        // Clear contextual expansion when user manually controls
        entity.contextuallyExpanded = false;
        // For minor entities, force re-render to return to pill state
        if (entity.hierarchyLevel === 3) {
          renderEntities();
        } else {
          handleEditorSelectionChange();
        }
      });
      card.appendChild(header);

      // Card Body
      const body = document.createElement("div");
      body.className = "entity-card-body";

      const typeModifiers = ["Character", "Place", "Event", "Object"];

      // Global Info Section
      const globalInfoItems = [...entity.globalInfo.entries()].filter(
        ([key]) => !typeModifiers.includes(key),
      );

      if (globalInfoItems.length > 0) {
        const title = document.createElement("h5");
        title.textContent = "Global Info";
        body.appendChild(title);
        const ul = document.createElement("ul");
        globalInfoItems.forEach(([key, { occurrences }]) => {
          const formattedKey = formatModifierName(key);

          if (occurrences.length === 1) {
            // Single occurrence - display normally
            const li = document.createElement("li");
            const occurrence = occurrences[0];
            li.innerHTML =
              occurrence.value === null
                ? `<strong>${formattedKey}</strong>`
                : `<strong>${formattedKey}:</strong> ${occurrence.value}`;
            li.addEventListener("click", () =>
              scrollToPosition(occurrence.position),
            );
            ul.appendChild(li);
          } else {
            // Multiple occurrences - display as expandable list
            const mainLi = document.createElement("li");
            mainLi.innerHTML = `<strong>${formattedKey}:</strong>`;
            mainLi.style.fontWeight = "bold";
            ul.appendChild(mainLi);

            const subUl = document.createElement("ul");
            subUl.style.marginLeft = "1rem";
            subUl.style.marginTop = "0.2rem";

            occurrences.forEach((occurrence, index) => {
              const subLi = document.createElement("li");
              subLi.innerHTML = occurrence.value || `(occurrence ${index + 1})`;
              subLi.addEventListener("click", () =>
                scrollToPosition(occurrence.position),
              );
              subLi.style.cursor = "pointer";
              subLi.style.fontSize = "0.9em";
              subUl.appendChild(subLi);
            });

            ul.appendChild(subUl);
          }
        });
        body.appendChild(ul);
      }

      // Occurrences Section - Group by line number
      if (entity.occurrences.length > 0) {
        const title = document.createElement("h5");
        title.textContent = "Occurrences";
        body.appendChild(title);
        const ul = document.createElement("ul");

        // Group occurrences by line number
        const occurrencesByLine = new Map();
        entity.occurrences.forEach((occurrence) => {
          const textUpToPosition = state.rawText.substring(
            0,
            occurrence.position,
          );
          const lineNumber = textUpToPosition.split("\n").length;

          if (!occurrencesByLine.has(lineNumber)) {
            occurrencesByLine.set(lineNumber, {
              lineNumber,
              position: occurrence.position,
              localInfo: [],
              context: null,
            });
          }

          const lineGroup = occurrencesByLine.get(lineNumber);
          lineGroup.localInfo.push(...occurrence.localInfo);

          if (!lineGroup.context) {
            const closestTitle = state.documentOutline
              .filter((title) => title.position <= occurrence.position)
              .pop();
            lineGroup.context = closestTitle ? closestTitle.text : "Start";
          }
        });

        // Render grouped occurrences
        occurrencesByLine.forEach((lineGroup) => {
          const li = document.createElement("li");

          const uniqueModifiers = new Map();
          lineGroup.localInfo.forEach((info) => {
            const key = info.name;
            if (!uniqueModifiers.has(key) || info.value !== null) {
              uniqueModifiers.set(key, info.value);
            }
          });

          const localInfoHTML = Array.from(uniqueModifiers.entries())
            .map(([key, value]) => {
              const formattedKey = formatModifierName(key);
              return value === null
                ? `<strong>${formattedKey}</strong>`
                : `<strong>${formattedKey}:</strong> ${value}`;
            })
            .join(", ");

          li.innerHTML =
            `<em>${lineGroup.context} : ${lineGroup.lineNumber}</em> ${localInfoHTML}`.trim();

          li.addEventListener("click", () =>
            scrollToPosition(lineGroup.position),
          );
          ul.appendChild(li);
        });
        body.appendChild(ul);
      }

      card.appendChild(body);

      // Restore expansion state if it was preserved
      if (
        typeof expansionState !== "undefined" &&
        expansionState.has(entity.name)
      ) {
        const wasExpanded = expansionState.get(entity.name);
        if (wasExpanded) {
          card.classList.remove("collapsed");
        }
      }

      return card;
    }

    // Helper function to create entity pill
    function createEntityPill(entity) {
      const pill = document.createElement("span");
      pill.className = "entity-pill";
      pill.textContent = entity.name;
      pill.dataset.entityName = entity.name;

      if (entity.manuallyExpanded) {
        pill.classList.add("expanded");
      }

      pill.addEventListener("click", () => {
        entity.manuallyExpanded = !entity.manuallyExpanded;
        // Clear contextual expansion when user manually controls
        entity.contextuallyExpanded = false;
        renderEntities(); // Force complete re-render to show expanded card
      });

      return pill;
    }

    // Sort entities by hierarchy (main first), then by name
    const sortedEntities = [...state.entities.values()].sort((a, b) => {
      if (a.hierarchyLevel !== b.hierarchyLevel) {
        return a.hierarchyLevel - b.hierarchyLevel;
      }
      return a.name.localeCompare(b.name);
    });

    // Separate entities by type and hierarchy
    const characterEntities = {
      main: [],
      secondary: [],
      minor: [],
    };
    const otherEntities = {
      main: [],
      secondary: [],
      minor: [],
    };

    sortedEntities.forEach((entity) => {
      if (entity.type === "temporal") {
        return; // Skip temporal entities, they're shown in timeline
      }

      const hierarchyKey =
        entity.hierarchyLevel === 1
          ? "main"
          : entity.hierarchyLevel === 2
            ? "secondary"
            : "minor";

      // Only treat entities as characters if explicitly marked
      if (entity.type === "character") {
        characterEntities[hierarchyKey].push(entity);
      } else {
        otherEntities[hierarchyKey].push(entity);
      }
    });

    // Render character entities
    [...characterEntities.main, ...characterEntities.secondary].forEach(
      (entity) => {
        characterEntitiesContainer.appendChild(createEntityCard(entity));
      },
    );

    // Handle minor character entities - keep them in their own section
    if (characterEntities.minor.length > 0) {
      const pillsSection = document.createElement("div");
      pillsSection.className = "minor-entities-pills";

      // Create containers for expanded cards and pills
      const expandedCardsContainer = document.createElement("div");
      expandedCardsContainer.className = "expanded-cards-container";

      const pillsContainer = document.createElement("div");
      pillsContainer.className = "pills-container";

      characterEntities.minor.forEach((entity) => {
        if (entity.manuallyExpanded || entity.contextuallyExpanded) {
          // Create expanded card but keep it in the minor section
          const expandedCard = createEntityCard(entity);
          expandedCard.classList.remove("collapsed"); // Start expanded
          expandedCardsContainer.appendChild(expandedCard);
        } else {
          // Create pill
          pillsContainer.appendChild(createEntityPill(entity));
        }
      });

      // Add both containers to the section
      if (expandedCardsContainer.children.length > 0) {
        pillsSection.appendChild(expandedCardsContainer);
      }
      if (pillsContainer.children.length > 0) {
        pillsSection.appendChild(pillsContainer);
      }
      characterEntitiesContainer.appendChild(pillsSection);
    }

    // Render other entities grouped by type and hierarchy
    const otherEntitiesByType = new Map();

    // Group all non-temporal, non-character entities by type
    sortedEntities.forEach((entity) => {
      if (entity.type === "temporal" || entity.type === "character") {
        return; // Skip temporal and character entities
      }

      const typeKey = entity.type || "other";
      if (!otherEntitiesByType.has(typeKey)) {
        otherEntitiesByType.set(typeKey, {
          main: [],
          secondary: [],
          minor: [],
        });
      }

      const hierarchyKey =
        entity.hierarchyLevel === 1
          ? "main"
          : entity.hierarchyLevel === 2
            ? "secondary"
            : "minor";
      otherEntitiesByType.get(typeKey)[hierarchyKey].push(entity);
    });

    // Render each type group with hierarchy ordering
    const typeNames = {
      place: "Places",
      event: "Events",
      object: "Objects",

      other: "Other Entities",
    };

    otherEntitiesByType.forEach((hierarchies, type) => {
      // Create type section
      const typeSection = document.createElement("div");
      typeSection.className = "entity-type-section";

      const typeTitle = document.createElement("h3");
      // Capitalize first letter for display
      const displayName =
        typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1);
      typeTitle.textContent = displayName;
      typeTitle.className = "entity-type-title";
      typeSection.appendChild(typeTitle);

      // Add main and secondary entities as full cards
      [...hierarchies.main, ...hierarchies.secondary].forEach((entity) => {
        typeSection.appendChild(createEntityCard(entity));
      });

      // Handle minor entities for this type
      if (hierarchies.minor.length > 0) {
        const minorSection = document.createElement("div");
        minorSection.className = "minor-entities-pills";

        // Create containers for expanded cards and pills
        const expandedCardsContainer = document.createElement("div");
        expandedCardsContainer.className = "expanded-cards-container";

        const pillsContainer = document.createElement("div");
        pillsContainer.className = "pills-container";

        hierarchies.minor.forEach((entity) => {
          if (entity.manuallyExpanded || entity.contextuallyExpanded) {
            const expandedCard = createEntityCard(entity);
            expandedCard.classList.remove("collapsed");
            expandedCardsContainer.appendChild(expandedCard);
          } else {
            pillsContainer.appendChild(createEntityPill(entity));
          }
        });

        // Add containers to minor section
        if (expandedCardsContainer.children.length > 0) {
          minorSection.appendChild(expandedCardsContainer);
        }
        if (pillsContainer.children.length > 0) {
          minorSection.appendChild(pillsContainer);
        }

        typeSection.appendChild(minorSection);
      }

      otherEntitiesDiv.appendChild(typeSection);
    });
  }

  function renderDocumentOutline() {
    const container = document.getElementById("document-outline-area");
    container.innerHTML = "";

    if (!state.documentOutline || state.documentOutline.length === 0) {
      return;
    }

    const title = document.createElement("h5");
    title.className = "panel-title";
    title.textContent = "Document Outline";
    container.appendChild(title);

    const list = document.createElement("ul");
    list.className = "document-outline-list";

    state.documentOutline.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.className = `outline-level-${item.level}`;
      listItem.textContent = item.text;
      listItem.title = `Go to "${item.text}"`;
      listItem.style.paddingLeft = `${(item.level - 1) * 1}rem`;

      listItem.addEventListener("click", () => {
        editor.focus();
        editor.selectionStart = item.position;
        editor.selectionEnd = item.position;

        // Scroll the editor to bring the clicked item to the top.
        const textUpToPosition = editor.value.substring(0, item.position);
        const lineNumber = textUpToPosition.split("\n").length;
        const lineHeight = parseFloat(getComputedStyle(editor).lineHeight);
        editor.scrollTop = (lineNumber - 1) * lineHeight;
      });

      list.appendChild(listItem);
    });

    container.appendChild(list);
  }

  function renderTimeline() {
    const timelineAxis = document.getElementById("timeline-axis");
    timelineAxis.innerHTML = "";

    // Filter temporal entities with valid parsed dates
    const temporalEntities = Array.from(state.entities.values()).filter(
      (entity) => entity.type === "temporal" && entity.parsedAbsoluteDate,
    );

    if (temporalEntities.length === 0) {
      return;
    }

    // Sort entities by date
    temporalEntities.sort(
      (a, b) => a.parsedAbsoluteDate.getTime() - b.parsedAbsoluteDate.getTime(),
    );

    // Calculate timeline bounds
    const minDate = temporalEntities[0].parsedAbsoluteDate.getTime();
    const maxDate =
      temporalEntities[
        temporalEntities.length - 1
      ].parsedAbsoluteDate.getTime();
    const timeRange = maxDate - minDate;

    // Create markers for each temporal entity
    temporalEntities.forEach((entity) => {
      const marker = document.createElement("div");
      marker.className = "timeline-marker";
      marker.dataset.entityName = entity.name;

      // Calculate position (0% to 100%)
      let position = 0;
      if (timeRange > 0) {
        position =
          ((entity.parsedAbsoluteDate.getTime() - minDate) / timeRange) * 100;
      }
      marker.style.left = `${position}%`;

      // Create label
      const label = document.createElement("div");

      // Apply different rotation for labels at extremities to prevent overflow
      if (position <= 10) {
        label.className = "timeline-label timeline-label-left";
      } else if (position >= 90) {
        label.className = "timeline-label timeline-label-right";
      } else {
        label.className = "timeline-label";
      }

      label.textContent = entity.name;

      marker.appendChild(label);
      timelineAxis.appendChild(marker);

      // Add click handler
      marker.addEventListener("click", () => {
        // If entity has multiple occurrences, show selection popup
        if (entity.occurrences.length > 1) {
          showOccurrenceSelector(entity, marker);
        } else if (entity.occurrences.length === 1) {
          scrollToPosition(entity.occurrences[0].position);
        }
      });
    });
  }

  function showOccurrenceSelector(entity, marker) {
    // Remove any existing selector
    const existingSelector = document.querySelector(".occurrence-selector");
    if (existingSelector) {
      existingSelector.remove();
    }

    // Create occurrence selector popup
    const selector = document.createElement("div");
    selector.className = "occurrence-selector";
    selector.style.position = "absolute";
    selector.style.bottom = "70px";
    selector.style.left = marker.style.left;
    selector.style.transform = "translateX(-50%)";
    selector.style.backgroundColor = "var(--color-surface)";
    selector.style.border = "1px solid var(--border-color)";
    selector.style.borderRadius = "4px";
    selector.style.padding = "0.5rem";
    selector.style.zIndex = "1000";
    selector.style.minWidth = "200px";

    const title = document.createElement("div");
    title.textContent = `${entity.name} - Choisir l'occurrence :`;
    title.style.fontWeight = "bold";
    title.style.marginBottom = "0.5rem";
    title.style.color = "var(--color-secondary)";
    selector.appendChild(title);

    entity.occurrences.forEach((occurrence, index) => {
      const option = document.createElement("div");
      option.style.padding = "0.3rem";
      option.style.cursor = "pointer";
      option.style.borderRadius = "3px";
      option.style.transition = "background-color 0.2s";

      // Find context from section title
      const closestTitle = state.documentOutline
        .filter((title) => title.position <= occurrence.position)
        .pop();
      const context = closestTitle ? closestTitle.text : "Début";

      // Find line number
      const textUpToPosition = state.rawText.substring(0, occurrence.position);
      const lineNumber = textUpToPosition.split("\n").length;

      option.textContent = `${context} : ${lineNumber}`;

      option.addEventListener("mouseenter", () => {
        option.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
      });

      option.addEventListener("mouseleave", () => {
        option.style.backgroundColor = "transparent";
      });

      option.addEventListener("click", () => {
        scrollToPosition(occurrence.position);
        selector.remove();
      });

      selector.appendChild(option);
    });

    // Add close button
    const closeButton = document.createElement("div");
    closeButton.textContent = "×";
    closeButton.style.position = "absolute";
    closeButton.style.top = "0.2rem";
    closeButton.style.right = "0.5rem";
    closeButton.style.cursor = "pointer";
    closeButton.style.color = "var(--color-secondary)";
    closeButton.style.fontSize = "1.2rem";
    closeButton.addEventListener("click", () => {
      selector.remove();
    });
    selector.appendChild(closeButton);

    document.getElementById("timeline-axis").appendChild(selector);

    // Close selector when clicking outside
    setTimeout(() => {
      document.addEventListener("click", function closeSelector(e) {
        if (!selector.contains(e.target) && !marker.contains(e.target)) {
          selector.remove();
          document.removeEventListener("click", closeSelector);
        }
      });
    }, 0);
  }

  function setupEventListeners() {
    editor.addEventListener("input", processEditorChange);
    viewMdBtn.addEventListener("click", () => switchViewMode("md"));
    viewHtmlBtn.addEventListener("click", () => switchViewMode("html"));

    // Handle cursor position changes
    editor.addEventListener("keyup", handleEditorSelectionChange);
    editor.addEventListener("click", handleEditorSelectionChange);
    editor.addEventListener("focus", handleEditorSelectionChange);
  }

  function switchViewMode(mode) {
    if (state.viewMode === mode) return; // Do nothing if already in this mode
    state.viewMode = mode;
    viewMdBtn.classList.toggle("active", mode === "md");
    viewHtmlBtn.classList.toggle("active", mode === "html");
    updatePreview();
  }

  function setupResizer() {
    const resizer = document.getElementById("resizer");
    const container = document.getElementById("central-column");
    const topPane = document.getElementById("editor-area");
    const bottomPane = document.getElementById("preview-area");

    const mouseDownHandler = function (e) {
      e.preventDefault();

      // Add styles to the body to improve UX during resize
      document.body.style.userSelect = "none";
      document.body.style.cursor = "row-resize";

      const mouseMoveHandler = function (moveEvent) {
        const containerRect = container.getBoundingClientRect();
        const resizerHeight = resizer.offsetHeight;

        // Calculate the height of the top pane based on the mouse's position
        let topHeight = moveEvent.clientY - containerRect.top;

        // Total height available for the two panes
        const totalPaneHeight = containerRect.height - resizerHeight;

        // Add constraints to prevent panes from becoming too small
        const minHeight = 80; // Corresponds roughly to 5rem
        if (topHeight < minHeight) {
          topHeight = minHeight;
        }
        if (topHeight > totalPaneHeight - minHeight) {
          topHeight = totalPaneHeight - minHeight;
        }

        const bottomHeight = totalPaneHeight - topHeight;

        // Set flex-basis for both panes to ensure consistent behavior
        topPane.style.flexBasis = `${topHeight}px`;
        bottomPane.style.flexBasis = `${bottomHeight}px`;
      };

      const mouseUpHandler = function () {
        // Clean up event listeners and styles
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
        document.body.style.userSelect = "auto";
        document.body.style.cursor = "default";
      };

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    };

    resizer.addEventListener("mousedown", mouseDownHandler);
  }

  function setupHorizontalResizers() {
    const leftResizer = document.getElementById("resizer-left");
    const rightResizer = document.getElementById("resizer-right");
    const mainContainer = document.querySelector(".main-container");
    const centralColumn = document.getElementById("central-column");

    const mouseDownHandler = function (e, resizer) {
      e.preventDefault();

      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";

      const startX = e.clientX;
      const startWidth = centralColumn.offsetWidth;
      const multiplier = resizer.id === "resizer-right" ? 1 : -1;

      const mouseMoveHandler = function (moveEvent) {
        const deltaX = moveEvent.clientX - startX;
        let newWidth = startWidth + 2 * deltaX * multiplier;

        // Add constraints
        const minWidth = 300; // Minimum width of 300px
        if (newWidth < minWidth) {
          newWidth = minWidth;
        }

        // Update grid layout directly
        mainContainer.style.gridTemplateColumns = `1fr 10px ${newWidth}px 10px 1fr`;

        // Save to localStorage
        saveToLocalStorage();
      };

      const mouseUpHandler = function () {
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
        document.body.style.userSelect = "auto";
        document.body.style.cursor = "default";
      };

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    };

    leftResizer.addEventListener("mousedown", (e) =>
      mouseDownHandler(e, leftResizer),
    );
    rightResizer.addEventListener("mousedown", (e) =>
      mouseDownHandler(e, rightResizer),
    );
  }

  function setupScrollSync() {
    const editorPane = document.getElementById("markplot-editor");
    const previewPane = document.getElementById("preview-output");
    let activeScroller = null;
    let scrollTimeout;

    const onScroll = (scrolledElement, targetElement) => {
      // If a scroll event is programmatically triggered on the non-active pane, ignore it.
      if (activeScroller !== null && activeScroller !== scrolledElement) {
        return;
      }

      // Set the current scroller as the active one.
      activeScroller = scrolledElement;

      const sourceScrollHeight =
        scrolledElement.scrollHeight - scrolledElement.clientHeight;
      // Avoid division by zero and unnecessary calculations.
      if (sourceScrollHeight <= 0) {
        return;
      }

      const scrollRatio = scrolledElement.scrollTop / sourceScrollHeight;
      const targetScrollHeight =
        targetElement.scrollHeight - targetElement.clientHeight;

      targetElement.scrollTop = scrollRatio * targetScrollHeight;

      // After a short delay, reset the active scroller.
      // This allows the user to switch which pane they are scrolling.
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        activeScroller = null;
      }, 150);
    };

    editorPane.addEventListener("scroll", () =>
      onScroll(editorPane, previewPane),
    );
    previewPane.addEventListener("scroll", () =>
      onScroll(previewPane, editorPane),
    );
  }

  // --- Persistence ---

  function saveToLocalStorage() {
    try {
      const centralColumn = document.getElementById("central-column");
      const columnWidth = centralColumn.offsetWidth;

      const dataToSave = {
        text: state.rawText,
        columnWidth: columnWidth,
      };

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }

  function loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        // Try to parse as JSON first (new format)
        try {
          const parsedData = JSON.parse(savedData);
          if (parsedData.text) {
            editor.value = parsedData.text;
          }
          if (parsedData.columnWidth) {
            // Restore column width
            const mainContainer = document.querySelector(".main-container");
            mainContainer.style.gridTemplateColumns = `1fr 10px ${parsedData.columnWidth}px 10px 1fr`;
          }
        } catch (parseError) {
          // Fallback to old format (plain text)
          editor.value = savedData;
        }
      } else {
        // No saved data - load default demo text
        editor.value = getDefaultDemoText();
      }
    } catch (e) {
      console.error("Failed to load from localStorage:", e);
      // If localStorage fails, still show demo text
      editor.value = getDefaultDemoText();
    }
  }

  function getDefaultDemoText() {
    return `# The Gift of the Magi
*A MarkPlot Demo - based on O. Henry's classic story*

## Christmas Eve

@@(1905-12-24 12:00) One dollar and eighty-seven cents. That was all. And sixty cents of it was in pennies.

@@Della.DESCRIPTION(young).AGE(20) counted it three times. One dollar and eighty-seven cents. And the next day would be @@Christmas.Event.

Della.emotion(disappointed) flopped down on the shabby little @@@@couch.Object and @@(Della).action[howled]. So the life of Della went out of her and life became a miserable wail.

Della lived in a @@flat.Place.DESCRIPTION(shabby) with @@Jim.OCCUPATION(clerk), her husband. They had only twenty dollars a week, which doesn't go far. Expenses had been greater than expected.

@@.(## The Plan)

Della had been saving every penny she could for months, with this result. Twenty dollars a week doesn't go far. Expenses had been greater than she had calculated.

@@(Della).DESCRIPTION[Her beautiful hair fell about her rippling and shining like a cascade of brown waters. It reached below her knee and made itself almost a garment for her.]

@@(1905-12-24 14:00)
Suddenly @@(Della).emotion(determined)she whirled from the window and stood before the glass.

@@(1905-12-24 14:40)
Within forty minutes her head was covered with tiny, close-lying curls that made her look wonderfully like a truant schoolboy.

"If Jim doesn't kill me," @@(Della)she said to herself, "before he takes a second look at me, he'll say I look like a Coney Island chorus girl"

@@(1905-12-24 19:00) At the end of the day, Jim came home and stepped inside the door. He was thin and very serious. Poor fellow, @@Jim.AGE[he was only twenty-two]--and to be burdened with a family!

## The Exchange

Jim stopped inside the door. His eyes were fixed upon @@(Della), and there was an expression in them that Della could not read, and it terrified her.

"Jim, darling," Della cried, "don't look at me that way."

Jim drew a package from his overcoat pocket and threw it upon the table.

"Don't make any mistake, @@(Della)Dell," @@(Jim)he said, "about me. I don't think there's anything in the way of a haircut or a shave that could make me like my girl any less."

Della opened it. There lay @@the_combs.Object.MATERIAL(ornamental).VALUE(expensive)--the set of combs that @@(Della) had worshipped in a window.

Jim had not yet seen his beautiful @@present.Object. Della held it out to him eagerly upon her open palm. The dull precious metal seemed to flash with a reflection of her bright and ardent spirit.

"Isn't it a dandy, @@Jim? I hunted all over town to find it. You'll have to look at the time a hundred times a day now. Give me your @@watch.Object. I want to see how it looks on it."

Instead of obeying, @@Jim tumbled down on the couch and put his hands under the back of his head and smiled.

"@@(Della)Dell," said he, "let's put our @@Christmas_presents.Object away and keep 'em a while. They're too nice to use just at present."

## The Moral @@.Status(draft)

The magi were wise_men--wonderfully wise men--who brought gifts to the Babe in the manger.Place. They invented the art of giving Christmas presents.

Being wise_men, their gifts were no doubt wise ones, possibly bearing the privilege of exchange in case of duplication.

And here I have lamely related to you the uneventful chronicle of two foolish children in a @@flat.Place who most unwisely sacrificed for each other the greatest treasures of their house.

But in a last word to the wise of these days let it be said that of all who give gifts these two were the wisest.

*This demo showcases MarkPlot's entity tracking, character development, timeline features, and annotation capabilities.*`;
  }

  // --- Initialization ---

  function init() {
    loadFromLocalStorage();
    setupEventListeners();
    setupResizer();
    setupHorizontalResizers();
    setupScrollSync();
    processEditorChange(); // Initial processing of the loaded text
    console.log("MarkPlot Editor initialized.");
  }

  init();
});
