import sheetIdFromUrl from '../../util/util';

describe('Function utils', () => {
  test('gets the Google Sheet ID from a URL', () => {
    expect(sheetIdFromUrl('docs.google.com/spreadsheets/d/foo')).toEqual('foo');
    expect(sheetIdFromUrl('docs.google.com/spreadsheets/d/foo/edit#gid=123')).toEqual(
      'foo'
    );
    expect(sheetIdFromUrl('http://docs.google.com/spreadsheets/d/foo')).toEqual('foo');
    expect(
      sheetIdFromUrl('http://docs.google.com/spreadsheets/d/foo/edit#gid=123')
    ).toEqual('foo');
    expect(sheetIdFromUrl('https://docs.google.com/spreadsheets/d/foo')).toEqual('foo');
    expect(
      sheetIdFromUrl('https://docs.google.com/spreadsheets/d/foo/edit#gid=123')
    ).toEqual('foo');
  });
});
