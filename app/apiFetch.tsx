import apiFetch from '@wordpress/api-fetch';

export const setRoot = ( url: string ) => {
  apiFetch.use( apiFetch.createRootURLMiddleware( `${url}/wp-json/` ) );
}

export default apiFetch;