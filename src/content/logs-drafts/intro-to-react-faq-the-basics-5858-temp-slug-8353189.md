---
title: "FAQ: React Intro, JSX & Create React App"
date: "2026.05.22"
kicker: "Tutorial"
tags: ["React", "JavaScript"]
hook: "What should I know first before React?    You should thoroughly know HTML, CSS and..."
series:
  name: "React FAQ"
  part: 1
  total: 3
---

## What should I know first before React?
* You should thoroughly know HTML, CSS and JavaScript. For this FAQ, it's also best that you understand JavaScript ESM module syntax and ES6 arrow function syntax, if you are used to older syntax.
* You'll also need an editor, which you probably have already. VS Code is recommended.
* It will soon enough be important for you to know how to use Node.js to install the React NPM packages, but React can also be used via CDN.
* If you want to use Node/NPM - It's beyond the scope of this FAQ to get into how to install/access a terminal, especially on Windows. Without going into detail, I use WSL, which provides an Ubuntu bash shell. It works great with VS Code's integrated terminal. I have Node installed in WSL. VS Code has a feature to develop in WSL remote windows, which I recommend. I do all my dev within WSL and I've done it this way for several years now.

## What is React?
React.js is a popular front-end JavaScript library for building user interfaces. It's an alternative to a vanilla JavaScript DOM-focused approach or data / declarative view approach. Components can be nested and controlled inside a container component for the entire page to create a single page application (SPA). The app reacts to changes in data to re-render only the parts of the DOM who change state.

## How do I get started with React?
There's 2 ways to get started with React.
  1. The quick beginner-friendly method: Use the [React CDN](https://reactjs.org/docs/cdn-links.html) (You should also grab the [Babel CDN](https://babeljs.io/setup#installation)). CDN scripts should be added in your HTML's `<head>` section.
```html
<head>
  ...
  <script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
```
  2. The more common way: Use the NPM packages. You will need to install Node.js first. NPM packages are installed using your terminal command-line: `npm i react react-dom`. You can then import the NPM packages using ESM syntax:
```js
import React from 'react'
import ReactDOM from 'react-dom'
```

## What is JSX?
JavaScript XML (JSX) is a syntax extension to JavaScript. It is like a templating language, very similar to HTML, but it is actually JavaScript. There's a few rules:
* You must take care not to use reserved words like `class`. In HTML you would usually use this to add classes to an element for styling and selecting. In JSX you have to use `className` instead of `class` for the attribute.
* You can only have one top level (root level) element (often a `<div>` but you should use semantic HTML as appropriate). If you don't want to have a wrapper element, you can use a JSX fragment (`<>...</>`).
* It must be preprocessed by Babel.

You can use JavaScript expressions within JSX by surrounding them in curly braces (`{}`). Note that unlike some other templating languages like EJS, you shouldn't surround the curly braces with quotes when giving a value to an attribute (such as `<a href>` or `<button onClick>`).
```jsx
<>
  <h1 className="special">{title}</h1>
  <p>The current time is {new Date().toLocaleString()}.</p>
  <a href={address}>This a link.</a>
  <button onClick={handleClick}>Click me</button>
  <button onClick={e => console.log(e)}>Click me</button>
</>
```

## How do I use Emmet in VS Code for React?
Make sure you have the language mode set to JavaScript React. You can change this at the bottom of the VS Code window:
![You can change the language mode at the bottom of the VS Code window.](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/fohlzzdtxtt7tk6kcovy.png)

You can alternatively create a `.vscode/settings.json` file within your project, which is a settings file for just the current project. Within that add the following:
```json
{
  "files.associations": {
    "*.js": "javascriptreact"
  }
}
```

## How do I render a component?
In React, you render into selected elements. So, you need to have an element that can be selected, such as a `<div>` or whatever semantic element is appropriate. 

You can render into elements using `ReactDOM.render`:
```jsx
ReactDOM.render(React.createElement("h1", null, "Our Amazing App Header"), document.querySelector("#app"));
```

But usually we pass a component function in as the first parameter of `ReactDOM.render`. The convention is to name this component function using UpperCamelCase. This component function then returns the JSX component to be rendered. 

```jsx
const MyFirstReactComponent = () => {
  const title = 'This Was A Triumph';
  const address = 'http://dev.to'
  const handleClick = e => {
    console.log(e);
  }

  return (
    // JSX goes here
  );
}
```

If you code the JavaScript within a `<script>` tag in HTML, make sure you add the `type="text/babel"` attribute so that Babel processes it (you need the React & Babel CDNs in your `<head>` if done this way).
```html
<script type="text/babel">
  // Component JavaScript goes here

  ReactDOM.render(<MyFirstReactComponent />, document.getElementById('my-first-component'));
</script>
```

In a real-world project, React components are typically written in JavaScript modules instead of in HTML as above.
```jsx
import React from 'react'
 
// Component JavaScript goes here
 
export default MyFirstReactComponent
```

Then in your main JavaScript file you import the function & render it into the HTML element using `ReactDOM.render`:
```jsx
import ReactDOM from 'react-dom'
import MyFirstReactComponent from './modules/MyFirstReactComponent'
 
ReactDOM.render(<MyFirstReactComponent />, document.getElementById('my-first-component'))
```

Components can be nested as well. Here's the full component using the previous code, but with a nested component:
```jsx
import React from 'react'

const MyTitle = () => {
  const title = 'This Was A Triumph';
  return <h1 className="title">{title}</h1>
}

const MyFirstReactComponent = () => {
  const address = 'http://dev.to'
  const handleClick = e => {
    console.log(e);
  }

  return (
    <>
      <MyTitle />
      <p>The current time is {new Date().toLocaleString()}.</p>
      <a href={address}>This a link.</a>
      <button onClick={handleClick}>Click me</button>
      <button onClick={e => console.log(e)}>Click me</button>
</>
  );
}
 
export default MyFirstReactComponent
```
However, components are each usually within their own module files, saved in a `src/components/` directory.

## What is Create React App?
Create React App provides an environment for learning React or building a single page application using React. You will need to use Node.js to install and use it. Just run `npx create-react-app <app-name>`, inserting your app or project name, or `npx create-react-app .` to use the current directory (note that either way, the directory name must be lowercase). It will ask you to confirm, then take a while.

Once done you will have a project structure created for you. You will see the `public/` folder has an `index.html` file with a single `#root` element inserted into by React. Within `src/` there is `index.js` which renders the `App` component (from `App.js`) into that `#root` element.

```jsx
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```

## How do I use styles and images?
To insert them dynamically you can import them like JavaScript modules. Under the hood Create React App uses Webpack to bundle compiled code. You can also place assets directly in the `public/` folder and reference them the usual way.

`src/index.css` is injected by way of `src/index.js`. `src/App.css` is injected by way of `src/App.js`, which is brought in by `src/index.js`. This is how component styles should be handled.

Here is an example of a CSS import:
```jsx
import './App.css';
```

Generally you will have a `src/components` directory with your components. For each component you have both a `.js` and a `.css` file.

You can also apply inline styles. Note the properties use camelCase. Since it is JSX, you can use ternary operators to apply styles conditionally.

```jsx
<div
  className="modal"
  style={{
    border: "4px solid",
    borderColor: isSalesModal ? "#ff4500" : "#555",
    textAlign: "center"
  }}
></div>
```

You can also use CSS Modules to scope styles to a component and prevent them from being applied outside the component. A CSS module has the `.module.css` extension.
```css
.card {
  border: 1px solid #eee;
  box-shadow: 4px 4px 5px rgba(0, 0, 0, 0.05);
  padding: 10px;
  max-width: 400px;
  margin: 20px auto;
  border-radius: 4px;
}
```
Then you can then import the CSS module as an object and assign it to a variable. Each class is a property on the object, e.g. `styles.card`.
```jsx
import styles from "./Card.module.css";

export default function Card() {
  return (
    <div className={styles.card}><h2>Card</h2></div>
  )
}
```
Note that CSS modules will still apply styles globally if you do not scope selectors within the class. So instead of having this in your CSS module:
```css
h2 { color: pink }
```
You should have this:
```css
.card h2 { color: pink }
```
## What is Strict Mode?
[Strict Mode](https://reactjs.org/docs/strict-mode.html) is a component you can wrap another component or JSX in, in order to highlighting potential problems. When using Create React App, `<App />` is automatically wrapped in `<React.StrictMode>`.

## How do I start a live server with Create React App?
Create React App provides several NPM scripts, one of which is `start`. Just run `npm run start` and it will activate. It will open `http://localhost:3000/` in your browser.

## How do I compile React using Webpack?
You don't have to use Webpack with React; this solution is just provided in case you already know and use Webpack. Just as in the other examples, you have to use Babel. `npm i @babel/preset-react --save-dev`

Then in your Webpack configuration, add a rule to use `babel-loader` with `@babel/preset-react`.
```javascript
module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react', '@babel/preset-env']
                    }
                }
            }
        ]
    }
}
```

> Sources / further study:
> https://www.udemy.com/course/build-web-apps-with-react-firebase/
> https://www.udemy.com/course/react-for-the-rest-of-us/
