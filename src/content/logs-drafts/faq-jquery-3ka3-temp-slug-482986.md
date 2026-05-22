---
title: "FAQ: JQuery"
date: "2026.05.22"
kicker: "Tutorial"
tags: ["JavaScript"]
hook: "How do I import JQuery?      import $ from 'jquery';        Enter fullscreen mode           ..."
---

## How do I import JQuery?
```js
import $ from 'jquery';
```

## How do I select an element in JQuery?
```js
$(".search-overlay");
```

## How do I add an event listener in JQuery?
Use the `.on()` method on the element. The first argument is the event type, the second argument is the function to call.
```js
openButton.on("click", openOverlay);
$(document).on("keyup", keyPressDispatcher);
```

## How do I add and remove classes in JQuery?
Use the `.addClass()` and `.removeClass()` methods on the element.

## How do I change the HTML of an element using JQuery?
Use the `.html()` method on the element.
```js
element.html("This is the new HTML");
```
You can use `.append()` to add HTML to an element instead of replacing its HTML.

## How do I get the value of an input element?
Use the `.val()` method on the element.
```js
searchField.val();
```

## How do I check if an input is focused?
Use the `.is()` method on the element.
```js
$("input, textarea").is(":focus");
```

## How do I fetch JSON with JQuery?
Use the `$.getJSON()` method. The first argument is the URL for the JSON. The second argument is for a handler function.

## How do I execute asynchronous code in JQuery?
Use the `$.when().then()` syntax. You can pass `$.when()` any number of asynchronous functions.
