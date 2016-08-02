# Microservices Dashboard Coding Standards


## Code style

The [Google JavaScript Style Guide](https://google.github.io/styleguide/javascriptguide.xml) is the
basis for our coding style, with additional guidance here where that style guide is not aligned with
ES6 or TypeScript.

## Coding practices

### General

#### Write useful comments
Comments that explain what some block of code does are nice; they can tell you something in less time than it would take to follow through the code itself.

Comments that explain why some block of code exists at all, or does something the way it does, 
are _invaluable_. The "why" is difficult, or sometimes impossible, to track down without seeking out 
the original author. When collaborators are in the same room, this hurts productivity. 
When collaborators are in different timezones, this can be devastating to productivity.

For example, this is a not-very-useful comment:
```ts
// Set default tabindex.
if (!$attrs['tabindex']) {
  $element.attr('tabindex', '-1');
}
```

While this is much more useful:
```ts
// Unless the user specifies so, the calendar should not be a tab stop.
// This is necessary because ngAria might add a tabindex to anything with an ng-model
// (based on whether or not the user has turned that particular feature on/off).
if (!$attrs['tabindex']) {
  $element.attr('tabindex', '-1');
}
```

#### Prefer small, focused modules
Keeping modules to a single responsibility makes the code easier to test, consume, and maintain. 
ES6 modules offer a straightforward way to organize code into logical, granular units. 
Ideally, individual files are 200 - 300 lines of code.

#### Less is more
Once a feature is released, it never goes away. We should avoid adding features that don't offer 
high user value for price we pay both in maintenance, complexity, and payload size. When in doubt, 
leave it out. 

This applies especially so to providing two different APIs to accomplish the same thing. Always 
prefer sticking to a _single_ API for accomplishing something. 

### TypeScript

#### Provide function descriptions
For functions that are more complicated than a simple getter/setter, provide at least a brief 
sentence explaining what the function does and/or _why_ it does something.

### CSS

#### Use lowest specificity possible
Always prioritize lower specificity over other factors. Most style definitions should consist of a 
single element or css selector plus necessary state modifiers. Avoid SCSS nesting for the sake of 
code organization. This will allow users to much more easily override styles.

For example, rather than doing this:
```scss
md-calendar {
  display: block;

  .md-month {
    display: inline-block;

    .md-date.md-selected {
      font-weight: bold;
    }
  }
}
```

do this:
```scss
md-calendar {
  display: block;
}

.md-calendar-month {
  display: inline-block;
}

.md-calendar-date.md-selected {
  font-weight: bold;
}
```

#### Never set a margin on a host element.
The end-user of a component should be the one to decide how much margin a component has around it.

#### Prefer styling the host element vs. elements inside the template (where possible).
This makes it easier to override styles when necessary. For example, rather than 

```scss
:host {
  // ...
  
  .some-child-element {
    color: red;
  }
}
```

you can write
```scss
:host {
  // ...
  color: red;
}
```

The latter is equivalent for the component, but makes it easier override when necessary.

#### Explain what CSS classes are for
When it is not super obvious, include a brief description of what a class represents. For example:
```scss
// The calendar icon button used to open the calendar pane.
.md-datepicker-button { ... }

// Floating pane that contains the calendar at the bottom of the input.
.md-datepicker-calendar-pane { ... }

// Portion of the floating panel that sits, invisibly, on top of the input.
.md-datepicker-input-mask { }
``` 