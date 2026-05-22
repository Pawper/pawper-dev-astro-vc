---
title: "FAQ: React Hooks"
date: "2026.05.22"
kicker: "Tutorial"
tags: ["React", "JavaScript"]
hook: "What is the useRef hook?   Refs are a way to get a reference to a raw DOM element, like a..."
series:
  name: "React FAQ"
  part: 3
  total: 3
---

## What is the useRef hook?
Refs are a way to get a reference to a raw DOM element, like a query selector. For example, you can use a ref to get or modify the value of an input, like you would with vanilla JavaScript using `querySelector()`. There are situations where you can use refs instead of state.

First import `useRef`:
```jsx
import { useRef } from "react";
```
Then instantiate the refs within your component:
```jsx
const title = useRef();
const date = useRef();
```
Then in the component's JSX, you can add the `ref` attribute.
```jsx
<input type="text" ref={title} />
<input type="date" ref={date} />
```
You get access elements using refs.
```jsx
const event = {
  title: title.current.value,
  date: date.current.value,
  id: Math.floor(Math.random() * 10000)
};
```
You can modify elements by using refs as well.
```jsx
const resetForm = () => {
  title.current.value = "";
  date.current.value = "";
};
```

## What is the useCallback hook? What if a dependency for useEffect is a function?
Every time a component is ran functions gain a different reference in memory. Therefor, functions within the dependency array of `useEffect()` will cause it to fire every time. To fix this we use the `useCallback` hook. First import it:
```jsx
import { useState, useEffect, useCallback } from "react";
```
Then wrap your function definition with it:
```jsx
export default function TripList() {
  const [trips, setTrips] = useState([]);
  const [url, setUrl] = useState("http://localhost:3000/trips");

  const fetchTrips = useCallback(async () => {
    const response = await fetch(url);
    const json = await response.json();
    setTrips(json);
  }, [url]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  console.log(trips);
  return (
    // JSX goes here
  )
```

## How do I create a custom hook?
First create a `src/hooks` directory. Within this directory, you can create hooks; the filenames/functions must start with `use` in order for React to recognize them as hooks. For this example we create a `useFetch` hook. Note that when we return the `data` object, since we would give the property the same name as its reference we can just pass the reference. Also note a component can be unmounted while the fetch request is pending. We need to instantiate an AbortController, associate it with the fetch request, and have `useEffect` return a cleanup function which calls the `abort()` method.
```jsx
import { useState, useEffect } from "react";

export const useFetch = url => {
  const [data, setData] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setIsPending(true);

      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        const json = await res.json();

        setIsPending(false);
        setData(json);
        setError(null);
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("the fetch was aborted");
        } else {
          setIsPending(false);
          setError("Could not fetch the data");
          console.log(err.message);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [url]);

  return { data, isPending, error };
};
```
Then you can import & use the hook in your React components. Note that we are changing the name of the destructured `data` object to `trips`.
```jsx
import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import "./TripList.css";

export default function TripList() {
  const [url, setUrl] = useState("http://localhost:3000/trips");
  const { data: trips } = useFetch(url);

  return (
    <ul className="trip-list">
      {trips &&
        trips.map(trip => (
          <li key={trip.id}>
            <h3>{trip.title}</h3>
            <p>{trip.price}</p>
          </li>
        ))}
    </ul>
  );
}
```

> Sources / further study:
> https://www.udemy.com/course/build-web-apps-with-react-firebase/
> https://www.udemy.com/course/react-for-the-rest-of-us/
