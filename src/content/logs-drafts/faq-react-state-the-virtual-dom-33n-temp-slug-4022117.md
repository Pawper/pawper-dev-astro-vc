---
title: "FAQ: React Props, State & Portals"
date: "2026.05.22"
kicker: "Tutorial"
tags: ["React", "JavaScript"]
hook: "This is the second in a series of React FAQs. Check out the first one for React Intro, JSX &..."
series:
  name: "React FAQ"
  part: 2
  total: 3
---

This is the second in a series of React FAQs. Check out the first one for [React Intro, JSX & Create-React-App]().

## What is a prop? How do you pass data to a child component?
A prop is a way to pass data down from a parent component to a child component. This allows components to be reused for different data. For example, you might have a Title element. You can use this on different pages, using a prop attribute (in the example below it's `title="My Movie Reviews"`) to pass it the value for the current page.
```jsx
function App() {
  return (
    <div className="App">
      <Title title="My Movie Reviews"/>
    </div>
  );
}
```
In the child component, you can access props as the default argument, accessing the object's properties in correlation to the attribute added in the parent component.
```jsx
const Title = (props) => <h1>{props.title}</h1>
```
You can also destructure props.
```jsx
const Title = ({title}) => <h1>{title}</h1>
```
## What is state in React?
State involves component data which may change over time. In other words, when component data changes, the component changes its state. Changing state is required in order to update any content coming from expressions in curly braces (`{}`).

## What is the virtual DOM?
React organizes components into a tree-like data structure when JSX is compiled. This is the virtual DOM. When there is a change in state React compares the new virtual DOM to the existing virtual DOM. If there is a change it updates the actual DOM of the web page. This is done using JavaScript so a refresh is not required.

## What is the useState hook? How do I change a component's state?
Redefining variables won't change state. For React to re-evaluate your component you'll have to use the `useState` hook (which is a function you can import).
```jsx
import { useState } from 'react';
```
For this example we are creating a modal. Here's our modal component:
```jsx
function Modal({ title }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{title}</h2>
        <button>Close</button>
        <div>Review form will go here!</div>
      </div>
    </div>
  )
}
```
The CSS:
```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: grid;
}

.modal {
  padding: 20px;
  place-self: center;
  background: #fff;
  display: grid;
  grid-template-areas:
    "heading closeBtn"
    "content content";
}

.modal > h2 {
  grid-area: heading;
  margin: 0;
}

.modal > .closeBtn {
  grid-area: closeBtn;
  height: min-content;
  align-self: center;
  justify-self: end;
}

.modal > div {
  grid-area: content;
}
```
We need a variable to store the modal's state; we'll call it `useState`. A modal is either showing (`showModal` is `true`) or not showing (`showModal` is `false`). 

The `useState` hook returns an array of two values:
1. The initial state (in this case we want `showModal` to start as `false`).
2. The formula to call to change the state. We'll call it `setShowModal`.

We'll use destructuring to assign those two values to two variables (`showModal` and `setShowModal`) as follows:
```jsx
const [showModal, setShowModal] = useState(false);
```
The first variable is the actual state value passed to `useState` (e.g., `false`), while the second is a function name you can call to change the state value. When you call the function pass it the new value (e.g., `setShowModal(true)`).

Here's our code so far:
App.js:
```jsx
import "./App.css";
import { useState } from "react";
import Title from "./components/Title";
import Modal from "./components/Modal";

function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="App">
      <Title title="My Movie Reviews"/>
      <button onClick={() => setShowModal(true)}>Add Review</button>
      {showModal && <Modal title="Add New Review" />}
    </div>
  );
}

export default App;
```
Title.js:
```jsx
const title = ({ title }) => <h1>{title}</h1>;

export default title;
```

Modal.js:
```jsx
import "./Modal.css";

function Modal({ title }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{title}</h2>
        <button>Close</button>
        <div>Review form will go here!</div>
      </div>
    </div>
  )
}

export default Modal;
```

## What is a portal? How do I insert a component somewhere outside the parent component that called it?
Sometimes you may want to insert a component somewhere outside the component that it is nested in, such as inserting a modal at the end of the document body. You can do this using a portal. Create a portal using `ReactDOM.createPortal`. The first argument should be your JSX in parentheses. The second argument should be the insertion point. It will be the last node of the specified element.
```jsx
import ReactDOM from 'react-dom';
import "./Modal.css";

function Modal() {
  return ReactDOM.createPortal((
    // JSX goes here
  ), document.body)
}

export default Modal;
```

## How do you change state within a child component?
You can pass functions as a prop. Here's our `handleClose` function to change the state of the modal to `false` (we have this in the App component):
```jsx
const handleClose = () => {
  setShowModal(false);
}
```
In the parent component, when we create the element, we pass a function as a prop:
```jsx
{showModal && <Modal title="Add New Review" handleClose={handleClose}/>}
```
Then in the Modal component we can use the function like with any prop:
```jsx
import ReactDOM from "react-dom";
import "./Modal.css";

function Modal({ title, handleClose }) {
  return ReactDOM.createPortal((
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{title}</h2>
        <button className="closeBtn" onClick={handleClose}>
          Close
        </button>
        <div>Review form will go here!</div>
      </div>
    </div>
  ), document.body)
}

export default Modal;
```

## How do you nest elements within a component? What is the children prop?
You can use opening and closing tags for the component instead of a self-closing tag, and include any elements you need inside. Notice that we have opening and closing Modal tags below, instead of a self-closing tag:
```jsx
{showModal && <Modal title="Add New Review" handleClose={handleClose}>
  Review form will go here!
</Modal>}
```
Then in your component these items can be placed using `props.children`. Here we have destructured it out:
```jsx
import ReactDOM from "react-dom";
import "./Modal.css";

function Modal({ title, handleClose, children }) {
  return ReactDOM.createPortal(
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{title}</h2>
        <button className="closeBtn" onClick={handleClose}>
          Close
        </button>
        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
}
```
App.js so far::
```jsx
import "./App.css";
import { useState } from "react";
import Title from "./components/Title";
import Modal from "./components/Modal";

function App() {
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => {
    setShowModal(false);
  }

  return (
    <div className="App">
      <Title title="My Movie Reviews"/>
      <button onClick={() => setShowModal(true)}>Add Review</button>
      {showModal && <Modal title="Add New Review" handleClose={handleClose}>
         Review form will go here!
      </Modal>}
    </div>
  );
}

export default App;
```

## How do you modify the state of a list? What is a key prop?
Let's add a list of reviews to the page.
First within our App component we have our reviews data and set it up with state:
```jsx
  const [reviews, setReviews] = useState([
    {movieName: 'Rare Exports', rating: 4.5, reviewText: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis debitis dolorum numquam earum unde soluta eveniet, libero molestias sapiente autem."},
    {movieName: 'Tomb Raider', rating: 3.5, reviewText: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis debitis dolorum numquam earum unde soluta eveniet, libero molestias sapiente autem."},
    {movieName: 'Spider-Man: No Way Home', rating: 5, reviewText: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis debitis dolorum numquam earum unde soluta eveniet, libero molestias sapiente autem."}
  ]);
```
Each review will be a component.
```jsx
import "./Review.css";

const Review = ({ review }) => (
  <div className="review">
    <div>
      <span className="review__movieName">{review.movieName}</span> - {review.rating} stars
    </div>
    <p>{review.reviewText}</p>
  </div>
);

export default Review;
```
CSS:
```css
.review {
  text-align: left;
  padding: 10px;
  border: 1px solid black;
  display: grid;
}

.review > p {
  max-width: 60ch;
}

.review__movieName {
  font-weight: bold;
}
```
We'll create a reviews component that will loop through reviews. We need to pass it a prop for the `reviews` object. We map the `reviews` object to create a `<Review />` element for each review, passing the `review` prop. Also note that we're using an arrow function here, just to switch things up. Because JSX blocks are defined inside parentheses (`()`), we are returning that with the arrow function (`review=> ()`).
```jsx
function Reviews({reviews}) {
  return (
    <ul className="reviews">
      {reviews.map(review => (
        <Review review={review}/>
      ))}
  </ul>
  )
}
```
Then we create the reviews component in our app component:
```jsx
<Reviews reviews={reviews} />
```
CSS:
```css
.reviews {
  padding: 0;
  width: fit-content;
  margin: 10px auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
```
Notice that React throws a warning in the console.
![Warning: Each child in a list should have a unique "key" prop.](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/h7ga64n18p80os2ewz0a.png)
 
Unique key props must be used to differentiate array elements iterated over to dynamically create a series of JSX elements (a.k.a. a list of elements). Let's add IDs to the data:
```jsx
const [reviews, setReviews] = useState([
    { movieName: "Rare Exports", rating: 4.5, reviewText: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis debitis dolorum numquam earum unde soluta eveniet, libero molestias sapiente autem.", id: 1 },
    { movieName: "Tomb Raider", rating: 3.5, reviewText: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis debitis dolorum numquam earum unde soluta eveniet, libero molestias sapiente autem.", id: 2 },
    { movieName: "Spider-Man: No Way Home", reviewText: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis debitis dolorum numquam earum unde soluta eveniet, libero molestias sapiente autem.", rating: 5, id: 3 }
]);
```
And add a key prop for the review ID:
```jsx
function Reviews({ reviews }) {
  return (
    <ul className="reviews">
      {reviews.map(review => (
        <Review review={review} key={review.id}} />
      ))}
    </ul>
  );
}
```
Let's add a delete button. First, we'll add a `handleDelete` function to our App component. Because the state of a list can become outdated in the time between when the function is called and is executed, it's suggest to pass a callback function to your state change function in order to access the previous state. In the example below it's `prevReviews => {}`.
```jsx
const handleDelete = id => {
  setReviews(prevReviews => {
    return prevReviews.filter(review => {
      return id !== review.id;
    });
  });
};
```
`handleDelete` needs to be passed to our Reviews component:
```jsx
<Reviews reviews={reviews} handleDelete={handleDelete} />
```
Then passed to each Review:
```jsx
function Reviews({ reviews, handleDelete }) {
  return (
    <div className="reviews">
      {reviews.map(review => (
        <Review review={review} key={review.id} handleDelete={handleDelete} />
      ))}
    </div>
  );
}
```
Within the Review component, we'll have a button call the `handleDelete` function `onClick`.
```jsx
const Review = ({ review, handleDelete }) => (
  <div className="review">
    <div>
      <span className="review__movieName">{review.movieName}</span> - {review.rating} stars
    </div>
    <p>{review.reviewText}</p>
    <button onClick={() => handleDelete(review.id)}>Delete</button>
  </div>
);
```

## What is the useEffect hook? How do I run code when a component first renders or when its state changes?
Let's save our Reviews to local storage so that deletes stick with refreshing, and to prepare for adding new reviews. To do so we are going to use the `useEffect` hook. First we will need to import it.
```jsx
import { useState, useEffect } from "react";
```
Then we'll call the `useEffect` function and pass it a function to execute. If we leave an empty array as the second parameter (a.k.a. the dependency array), it will trigger when the app component first loads and then not again. In this case we want to retrieve our reviews from local storage if they exist there.
```jsx
useEffect(() => {
  if (localStorage.getItem("exampleReviewsData")) {
    setReviews(JSON.parse(localStorage.getItem("exampleReviewsData")));
  }
}, []);
```
Then, every time our reviews state changes, we want to save to local storage. For this we need to include `reviews` in the dependency array.
```jsx
  useEffect(() => {
    localStorage.setItem("exampleReviewsData", JSON.stringify(reviews));
  }, [reviews]);
```
Now delete a review and refresh; it says deleted.

Note that when implementing useEffect you should mind error handling appropriately as well as return a cleanup function (which is just a function returned by the `useEffect` hook). The cleanup function will run if the component unmounts from the DOM. For an example, see our custom `useFetch` hook at the end.

## How should you manage the state of a form?
Let's create an AddReviewForm component. Note that you can't use the `for` attribute in JSX; you need to use `htmlFor`.
```jsx
import { useState } from "react";
import "./AddReviewForm.css";

function AddReviewForm() {
  return (
    <form className="reviewForm">
      <label htmlFor="movieName">
        Movie Name
        <input name="movieName" id="movieName" placeholder="Movie" />
      </label>
      <label htmlFor="movieRating">
        Rating
        <input name="movieRating" id="movieRating" placeholder="Rating 1-5" />
      </label>
      <label htmlFor="reviewText">
        Review Text
        <textarea name="reviewText" id="reviewText" rows="10"}></textarea>
      </label>
      <button>Add Review</button>
    </form>
  );
}

export default AddReviewForm;
```
CSS (here you should use `for` as the attribute):
```css
.reviewForm {
  display: grid;
  grid-template-areas:
    "movieName movieRating"
    "reviewText reviewText"
    "addBtn addBtn";
  gap: 10px;
}

.reviewForm > label {
  display: flex;
  flex-direction: column;
}

.reviewForm > *[for="movieName"] {
  grid-area: movieName;
}

.reviewForm > *[for="movieRating"] {
  grid-area: movieRating;
}

.reviewForm > *[for="reviewText"] {
  grid-area: reviewText;
}

.reviewForm > button {
  grid-area: addBtn;
}
```
Let's add it as the child of the Modal element in our App component:
```jsx
<Modal handleClose={handleClose}>
  <AddReviewForm />
</Modal>
```
Within our AddReviewForm component, let's manage the state of each field. The initial value needs to be an empty string.
```jsx
const [movieName, setMovie] = useState("");
const [rating, setRating] = useState("");
const [reviewText, setReviewText] = useState("");
```
We should set the form fields to use these initial values, making them what are called "controlled inputs." If you don't do this, React will throw an error. Then `onChange` we will call our state change function for the field.
```jsx
<label htmlFor="movieName">
  Movie Name
  <input name="movieName" id="movieName" value={movieName} onChange={e => setMovie(e.target.value)} placeholder="Movie" />
</label>
<label htmlFor="movieRating">
  Rating
  <input name="movieRating" id="movieRating" value={rating} onChange={e => setRating(e.target.value)} placeholder="Rating 1-5" />
</label>
<label htmlFor="reviewText">
  Review Text
  <textarea name="reviewText" id="reviewText" rows="10" value={reviewText} onChange={e => setReviewText(e.target.value)}></textarea>
</label>
```
Next, still within our AddReviewForm component, let's write a handler function called `handleSubmit` for submitting the form. First we need `setReviews` as a prop on the component. In our App component:
```jsx
<Modal handleClose={handleClose}>
  <AddReviewForm setReviews={setReviews} />
</Modal>
```
Back in our AddReviewForm component, we can destructure out that `setReviews` prop. In the `handleSubmit` function:
1. We want to prevent the form's default behavior on submission.
1. We'll call `setReviews` and add a review object to our Reviews state (we're using `Date.now()` to get a unique ID).
1. We also want to clear each field on the form. 
Then we'll refer to `handleSubmit` on our `<form>` element. Here's our final AddReviewForm component:
```jsx
import { useState } from "react";
import "./AddReviewForm.css";

function AddReviewForm({ setReviews }) {
  const [movieName, setMovie] = useState("");
  const [rating, setRating] = useState("");
  const [reviewText, setReviewText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setReviews(prev => prev.concat({ movieName, rating, reviewText, id: Date.now() }));
    setMovie("");
    setRating("");
    setReviewText("");
  }

  return (
    <form onSubmit={handleSubmit} className="reviewForm">
      <label htmlFor="movieName">
        Movie Name
        <input name="movieName" id="movieName" value={movieName} onChange={e => setMovie(e.target.value)} placeholder="Movie" />
      </label>
      <label htmlFor="movieRating">
        Rating
        <input name="movieRating" id="movieRating" value={rating} onChange={e => setRating(e.target.value)} placeholder="Rating 1-5" />
      </label>
      <label htmlFor="reviewText">
        Review Text
        <textarea name="reviewText" id="reviewText" rows="10" value={reviewText} onChange={e => setReviewText(e.target.value)}></textarea>
      </label>
      <button>Add Review</button>
    </form>
  );
}

export default AddReviewForm;
```
Here's our final App.js file:
```jsx
import "./App.css";
import { useState, useEffect } from "react";
import Title from "./components/Title";
import Reviews from "./components/Reviews";
import Modal from "./components/Modal";
import AddReviewForm from "./components/AddReviewForm";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [reviews, setReviews] = useState([
    { movieName: "Rare Exports", rating: 4.5, reviewText: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis debitis dolorum numquam earum unde soluta eveniet, libero molestias sapiente autem.", id: 1 },
    { movieName: "Tomb Raider", rating: 3.5, reviewText: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis debitis dolorum numquam earum unde soluta eveniet, libero molestias sapiente autem.", id: 2 },
    { movieName: "Spider-Man: No Way Home", rating: 5, reviewText: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis debitis dolorum numquam earum unde soluta eveniet, libero molestias sapiente autem.", id: 3 }
  ]);

  useEffect(() => {
    if (localStorage.getItem("exampleReviewsData")) {
      setReviews(JSON.parse(localStorage.getItem("exampleReviewsData")));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("exampleReviewsData", JSON.stringify(reviews));
  }, [reviews]);

  const handleClose = () => {
    setShowModal(false);
  };

  const handleDelete = id => {
    setReviews(prevReviews => {
      return prevReviews.filter(review => {
        return id !== review.id;
      });
    });
  };

  return (
    <div className="App">
      <Title title="My Movie Reviews" />
      <Reviews reviews={reviews} handleDelete={handleDelete} />
      <button onClick={() => setShowModal(true)}>Add Review</button>
      {showModal && (
        <Modal title="Add New Review" handleClose={handleClose}>
          <AddReviewForm setReviews={setReviews} />
        </Modal>
      )}
    </div>
  );
}

export default App;
```

## How do add props to a fragment?
This isn't in the example code above, but it's still important to know. You need to import React and then use a `React.Fragment` component.
```jsx
import React, { useState } from 'react';

function App() {
  ...

  return (
    <div className="App">
      ...
      {showEvents && events.map((event, index) => (
        <React.Fragment key={event.id}>
          <h2>{index} - {event.title}</h2>
          <button onClick={() => handleClick(event.id)}>delete event</button>
        </React.Fragment>
      ))}
    </div>
  );
}
```

> Sources / further study:
> https://www.udemy.com/course/build-web-apps-with-react-firebase/
> https://www.udemy.com/course/react-for-the-rest-of-us/
