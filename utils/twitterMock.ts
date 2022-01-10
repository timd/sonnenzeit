import { buildMatchMemberExpression } from '@babel/types';
import axios, { AxiosResponse } from 'axios';
import { TwitterApi } from 'twitter-api-v2';

type TweetV2PostTweetResult = DataV2<{ id: string, text: string }>;

interface InlineErrorV2 {
  value?: string;
  detail: string;
  title: string;
  resource_type?: string;
  parameter?: string;
  resource_id?: string;
  reason?: string;
  type: string;
}

type DataV2<D> = { data: D, errors?: InlineErrorV2[] };

interface ErrorV2 {
  detail: string;
  title: string;
  type: string;
  errors: {
    message: string;
    parameters?: { [parameterName: string]: string[] };
  }[];
}

class TwitterMock {

  throwError: Boolean = false;

  public tweet(payload: any): Promise<TweetV2PostTweetResult> {
    let result = {
      data: {
        id: "1234",
        text: payload
      },
      errors: null
    }

    return new Promise( (resolve, reject) => {
      if (this.throwError == false) {
        resolve(result)
      } else {
        reject({
          errors: {
              "type": "response",
              "code": 403,
              "error": "{\n  \"title\": \"Unsupported Authentication\",\n  \"detail\": \"Authenticating with Unknown is forbidden for this endpoint.  Supported authentication types are [OAuth 1.0a User Context, OAuth 2.0 User Context].\",\n  \"type\": \"https://api.twitter.com/2/problems/unsupported-authentication\",\n  \"status\": 403\n}",
              "headers": {
                "content-type": "application/problem+json",
                "cache-control": "no-cache, no-store, max-age=0",
                "content-length": "297",
                "x-response-time": "100",
                "x-connection-hash": "9999",
                "date": "Mon, 10 Jan 2022 09:00:00 GMT",
                "server": "tsa_o",
                "connection": "close"
            }
          }
        })
      }
    })
    
  }

}
  
export { TwitterMock }


