const {empty} = require('./helpers.js');

/**
 * Storage builder.
 */
class StorageBuilder {
  /**
   * Constructor.
   * @param  {string} storageUrl
   */
  constructor(storageUrl) {
    this._extension = 'json';
    this._locale = 'en';
    this._storageUrl = storageUrl || process.env.MONTHLY_CLOUD_STORAGE_URL;
  }

  /**
   * Set endpoint.
   *
   * Ex.: endpoint("menus"), endpoint("contents/").
   *
   * If endpoint starts with "/" it will skip auto-inserted website id.
   *
   * Ex. endpoint("/marketplaces")
   *
   * @param {string} endpoint
   *
   * @return {StorageBuilder}
   */
  endpoint(endpoint) {
    this.flush();
    this._endpoint = endpoint;

    return this;
  }

  /**
   * Get routes for locale. Locale is auto-detected by default.
   *
   * @param {string} locale
   *
   * @return {object}
   */
  getRoutes(locale) {
    this.endpoint('routes');

    if (!empty(locale)) {
      this.locale(locale);
    }

    return this.get();
  }

  /**
   * Find content by id.
   *
   * @param {int} contentId
   *
   * @return {object}
   */
  findContent(contentId) {
    return this.endpoint('contents').find(contentId);
  }

  /**
   * Find listing.
   *
   * @param {number} id
   *
   * @return {object}
   */
  findListing(id) {
    const listId = this.getList();

    if (empty(listId)) {
      throw new Error('Please set list id.');
    }

    return this.endpoint('lists/'+listId+'/listings').find(id);
  }

  /**
   * Get location using cloud geocode.
   *
   * @param {number} geocode
   *
   * @return {object}
   */
  getLocation(geocode) {
    const listId = this.getList();

    if (empty(listId)) {
      throw new Error('Please set list id.');
    }

    return this.endpoint('lists/'+listId+'/locations').find(geocode);
  }

  /**
   * Set list id.
   *
   * @param {number} listId
   *
   * @return {StorageBuilder}
   */
  list(listId) {
    this._listId = listId;

    return this;
  }

  /**
   * Get current list id.
   *
   * @return {number}
   */
  getList() {
    return this._listId;
  }

  /**
   * Find profile by id.
   *
   * @param {number} profileId
   *
   * @return {object}
   */
  findProfile(profileId) {
    const marketplaceId = this.getMarketplace();

    if (empty(marketplaceId)) {
      throw new Error('Missing marketplace id.');
    }

    return this.endpoint('/marketplaces/'+marketplaceId+'/profiles')
        .find(profileId);
  }

  /**
   * Check if endpoint should access root path.
   *
   * @return {bool}
   */
  hasRootPathEndpoint() {
    return this.getEndpoint().indexOf('/') == 0;
  }

  /**
   * Build url.
   *
   * @return {string}
   */
  buildUrl() {
    let url = '';
    let websiteId;
    let endpoint;
    let id;

    if (!this.hasRootPathEndpoint()) {
      if (websiteId = this.getWebsite()) {
        url += '/websites/'+websiteId;
      }
    }

    if (endpoint = this.getEndpoint()) {
      url += (this.hasRootPathEndpoint() ? '' : '/') + endpoint;
    }

    if (id = this.getId()) {
      url += '/'+id;
    } else {
      url += '/'+this.getLocale();
    }

    url += '.'+this.getExtension();

    url = url.replace('//', '/');

    return this.getStorageUrl()+url;
  }

  /**
   * Get headers used in curl calls.
   *
   * @return {object}
   */
  getHeaders() {
    return {
      'Accept': 'application/json',
    };
  }

  /**
   * Make a GET request and respond with json or array.
   *
   * @param {string} url
   *
   * @return {Promise}
   */
  httpGetRequest(url) {
    return fetch(url, {'headers': this.getHeaders()})
        .then((response) => response.json());
  }

  /**
   * Find entitiy.
   *
   * @param {number} id
   *
   * @return {object}
   */
  find(id) {
    this.id(id);

    return this.httpGetRequest(this.buildUrl());
  }

  /**
   * Call get request.
   *
   * @return {Promise}
   */
  get() {
    return this.httpGetRequest(this.buildUrl());
  }

  /**
   * Throw 404 exception.
   */
  resourceNotFound() {
    throw new Error('Resource not found');
  }

  /**
   * @return {string}
   */
  getEndpoint() {
    return this._endpoint;
  }

  /**
   * @return {number}
   */
  getId() {
    return this._id;
  }

  /**
   * Set locale.
   *
   * @param {string} locale
   *
   * @return {StorageBuilder}
   */
  locale(locale) {
    this._locale = locale;

    return this;
  }

  /**
   * Get current locale.
   *
   * @return {string}
   */
  getLocale() {
    return this._locale;
  }

  /**
   * Set website id.
   *
   * @param {number} websiteId
   *
   * @return {StorageBuilder}
   */
  website(websiteId) {
    this._websiteId = websiteId;

    return this;
  }

  /**
   * Get current website id.
   *
   * @return {string}
   */
  getWebsite() {
    return this._websiteId;
  }

  /**
   * Set marketplace id.
   *
   * @param {number} marketplaceId
   *
   * @return {StorageBuilder}
   */
  marketplace(marketplaceId) {
    this._marketplaceId = marketplaceId;

    return this;
  }

  /**
   * Get current marketplace id.
   *
   * @return {string}|int
   */
  getMarketplace() {
    return this._marketplaceId;
  }

  /**
   * Get extension.
   *
   * @return {string}
   */
  getExtension() {
    return this._extension;
  }

  /**
   * @param {number} id
   *
   * @return {StorageBuilder}
   */
  id(id) {
    this._id = id;

    return this;
  }

  /**
   * Return storage url without '/' at the end.
   *
   * @return {string}
   */
  getStorageUrl() {
    if (empty(this._storageUrl)) {
      return '';
    }

    return this._storageUrl.replace(new RegExp('[/]+$'), '');
  }

  /**
   * Set storage url.
   *
   * @param {string} storageUrl
   *
   * @return {StorageBuilder}
   */
  setStorageUrl(storageUrl) {
    this._storageUrl = storageUrl;

    return this;
  }

  /**
   * Unset all call parameters.
   */
  flush() {
    this._id = null;
    this._endpoint = null;
  }
}


const storage = (url) => {
  return new StorageBuilder(url);
};

module.exports = {
  storage,
};
