import React from 'react';

export default function ErrorPage({error=undefined}) {
  return (<section className="error">
  <header><h1>{(error && error.name?error.name:"Error")} has occured</h1></header>
  <main>{(error && error.message ? error.message : "An error has occured")}</main>
  </section>)
}