import admin from 'firebase-admin';
import express from 'express';
import bodyParser from 'body-parser';
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://project-2-8bc22.firebaseio.com"
});

const db = admin.firestore();
const app = express();
app.use(bodyParser.json())

type Song = {
  name: string;
  artist: string;
  rating: number;
}

type SongWithID = Song & {
  id?: string;
}

const songsCollection = db.collection('songs');

// create song
app.post('/createSong', (req, res) => {
  const song: Song = req.body;
  const myDoc = songsCollection.doc();
  myDoc.set(song);
  res.send(myDoc.id);
});

// get songs
app.get('/getSongs', async (req, res) => {
  const sortedSongs = await songsCollection
    .orderBy('name', 'asc').get();
  const songs: SongWithID[] = [];
  for (const doc of sortedSongs.docs) {
    let song: SongWithID = doc.data() as SongWithID;
    song.id = doc.id;
    songs.push(song);
  }
  res.send(songs);
});

// update rating
app.post('/updateRating', async (req, res) => {
  const id: string = req.body.id;
  const newSong: SongWithID = req.body;
  delete newSong.id;
  try {
    await songsCollection.doc(id).update(newSong);
    res.send(`song with id ${id} was updated.`);
  }
  catch (e) {
    res.end('id not found');
  }
});

// delete song
app.delete('/deleteSong', async (req, res) => {
  const id = req.query.id;
  if (id != undefined) {
    await songsCollection.doc(id.toString()).delete();
    res.send(`song with id ${id} was deleted.`);
  } else {
    res.end("no id was provided.")
  }
});

app.listen(8080, () => console.log(`Server started`));