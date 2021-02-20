# React Template

### Pre - Installation

You will be asked to provide a MongoURI, a Google Secret / Client ID, an SSL fullchain.pem and privkey.pem as well as a session secret.

This is because the app / server combination has google setup as a default oauth provider, and MongoDB as the default user Database.

You can either provide fake strings or just remove the prompts for them in `scripts/setup.ts` and then run `node scripts/buildScripts.js` to update all of the scripts.

---

### Installation :

1. Run `yarn install` from the project root.

---

### Features

Styling and Theming is handled through EmotionJS. </br>
The Project supports `jsx` as well as `tsx`.
