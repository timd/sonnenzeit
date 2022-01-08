import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi('AAAAAAAAAAAAAAAAAAAAAO%2BPXwEAAAAAhNUwRDZSFsUPrDoyR%2B8zuwlPJu8%3DhBtMzbXEAwR6iekX3Xy4UeIE1eTsOk4VFg7dzSIHESMTHOWlKs');
  const rwClient = client.readWrite;
  
  //const homeTimeline = await client.v1.homeTimeline();
  //console.log(homeTimeline.tweets.length, 'fetched.');

  async function hello() {
    return await Promise.resolve(
      {
        message: 'Hello, world!',
      }
    );
  };
  
  async function fetch() {
    return await client.v2.userTimeline('12');
  };

export default async function handler(req, res) {

  //await runMiddleware(req, res)
  await fetch().then( (result) => {
    res.status(200).json(result)
  }).catch( (err) => {
    res.status(500).json(err.message)
  })
}