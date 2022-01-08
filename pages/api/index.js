import { TwitterApi } from 'twitter-api-v2';

// const client = new TwitterApi('AAAAAAAAAAAAAAAAAAAAAO%2BPXwEAAAAAhNUwRDZSFsUPrDoyR%2B8zuwlPJu8%3DhBtMzbXEAwR6iekX3Xy4UeIE1eTsOk4VFg7dzSIHESMTHOWlKs');
// const client = new TwitterApi({ username: 'sonnezeitberlin', password: '!8_EVGEPaitYrATrDABZ6ftrvaH!93Ant.JGbm@-8o6emJsC8z'})

const client = new TwitterApi({
  appKey: 'kK2Xs6ayhzwqyJn0o5FkjaPEs',
  appSecret: 'w8i0kt6futvKNDAnpWsJdbf5lcZr4xJSaHhkAUYfk7xTys1MUp',
  // Following access tokens are not required if you are
  // at part 1 of user-auth process (ask for a request token)
  // or if you want a app-only client (see below)
  accessToken: '1479805238282526721-zOjpYUoACpw3dtiOlbfp2nuShyEBfw',
  accessSecret: '8HpDJSoFKs8nmFlSoAlZ0NC94QWP4BWJ1UgDaLjniEFZR',
});

const rwClient = client.readWrite;
  
async function fetch() {
  return await client.v2.userTimeline('12');
};

async function post() {
  const payload = `Tweet posted at ${Date()}`
  return await client.v2.tweet(payload);
};

export default async function handler(req, res) {
  await post().then( (result) => {
    res.status(200).json(result)
  }).catch( (err) => {
    res.status(500).json(err)
  })
}