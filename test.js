const sdk = require('./index');

require('jest-fetch-mock').enableMocks();

describe("Storage builder tests", () => {
  const INITIAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules() // Clears the cache
    process.env = { ...INITIAL_ENV };
  });

  afterAll(() => {
    process.env = INITIAL_ENV; // Restore initial environment
  });

 test('Test storage url from env.', () => {
    process.env.MONTHLY_CLOUD_STORAGE_URL = 'http://env.test';

    var result = sdk
      .storage()
      .getStorageUrl();

    expect(result).toEqual('http://env.test');
 });

 test('Test if builder generates correct endpoint.', () => {
    var result = sdk
      .storage('http://test')
      .endpoint('contents')
      .id(1)
      .buildUrl();
 
   expect(result).toBe('http://test/contents/1.json');
 });

 test('Test if builder handles "//".', () => {
    var result = sdk
      .storage('http://test')
      .endpoint('contents/')
      .id(1)
      .buildUrl();
 
   expect(result).toBe('http://test/contents/1.json');
 });

 test('Test if builder generates website id.', () => {
    var result = sdk
      .storage('')
      .website(1)
      .endpoint('contents')
      .id(1)
      .buildUrl();
 
   expect(result).toBe('/websites/1/contents/1.json');
 });


 test('Test if builder support root endpoints starting with /.', () => {
    var result = sdk
      .storage('')
      .website(1)
      .endpoint('/contents')
      .id(1)
      .buildUrl();
 
   expect(result).toBe('/contents/1.json');
 });

 test('Test if builder using locales correctly.', () => {
    var result = sdk
      .storage('')
      .website(1)
      .locale('en')
      .endpoint('routes')
      .buildUrl();
 
   expect(result).toBe('/websites/1/routes/en.json');
 });

 test('Test $builder->find();.', () => {
    expect.assertions(1);
    var data = { data: [] };
    fetch.mockResponseOnce(JSON.stringify(data));

    sdk
      .storage('')
      .endpoint('contents')
      .find(1)
      .then(result => expect(result).toEqual(data));
 });

 test('Test flushing. Builder should reset parameters on endpoint() call.', () => {
    var result = sdk
      .storage('')
      .endpoint('routes')
      .id(1)
      .endpoint('menus');

    expect(result).toEqual(expect.not.stringContaining('routes'));
    expect(result).toEqual(expect.not.stringContaining('1'));
 });

 test('Test storage url / trim.', () => {
    var result = sdk
      .storage('http://test///')
      .getStorageUrl();

    expect(result).toEqual('http://test');
 });

 test('Test if builder generates list id and location id.', () => {
    expect.assertions(2);
    var data = { data: [] };
    fetch.mockResponseOnce(JSON.stringify(data));

    var builder = sdk
      .storage('')
      .website(1)
      .list(2);

    builder
      .getLocation(1307024979609764)
      .then(result => {
        expect(result).toEqual(data);
        expect(builder.buildUrl()).toEqual('/websites/1/lists/2/locations/1307024979609764.json');
      });
 });

 test('Test getRoutes method.', () => {
    expect.assertions(2);
    var data = { data: [] };
    fetch.mockResponseOnce(JSON.stringify(data));

    var builder = sdk
      .storage('')
      .website(1);

    builder
      .getRoutes('en')
      .then(result => {
        expect(result).toEqual(data);
        expect(builder.buildUrl()).toEqual('/websites/1/routes/en.json');
      });
 });

 test('Test getMenus method.', () => {
    expect.assertions(2);
    var data = { data: [] };
    fetch.mockResponseOnce(JSON.stringify(data));

    var builder = sdk
      .storage('')
      .website(1);

    builder
      .getMenus('pt')
      .then(result => {
        expect(result).toEqual(data);
        expect(builder.buildUrl()).toEqual('/websites/1/menus/pt.json');
      });
 });

 test('Test content finder.', () => {
    expect.assertions(2);
    var data = { data: [] };
    fetch.mockResponseOnce(JSON.stringify(data));

    var builder = sdk
      .storage('')
      .website(1);

    builder
      .findContent(2)
      .then(result => {
        expect(result).toEqual(data);
        expect(builder.buildUrl()).toEqual('/websites/1/contents/2.json');
      });
 });

 test('Test profile finder.', () => {
    expect.assertions(2);
    var data = { data: [] };
    fetch.mockResponseOnce(JSON.stringify(data));

    var builder = sdk
      .storage('')
      .marketplace(1);

    builder
      .findProfile(2)
      .then(result => {
        expect(result).toEqual(data);
        expect(builder.buildUrl()).toEqual('/marketplaces/1/profiles/2.json');
      });
 });

 test('Test listing finder.', () => {
    expect.assertions(2);
    var data = { data: [] };
    fetch.mockResponseOnce(JSON.stringify(data));

    var builder = sdk
      .storage('')
      .website(1)
      .list(2);

    builder
      .findListing(3)
      .then(result => {
        expect(result).toEqual(data);
        expect(builder.buildUrl()).toEqual('/websites/1/lists/2/listings/3.json');
      });
 });



});
