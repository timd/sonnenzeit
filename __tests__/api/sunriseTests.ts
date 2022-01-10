import sunrise from '../../pages/api/sunrise';

test('sunrise call returns correct result', () => {
  
  const req = {}

  const json = jest.fn();

  const status = jest.fn(() => {
    return {
      json
    }
  })

  const res = {
    status
  }

  sunrise(req, res);

  const resultsJson = json.mock.calls[0][0];
  expect(resultsJson.result).toEqual("ok");

});